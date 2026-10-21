import mongoose from 'mongoose'
import { DuplicateKeyError } from './index.js'

const { Schema } = mongoose

const money = { type: Number, required: true, min: 0, validate: Number.isInteger }

const orderSchema = new Schema(
  {
    number: { type: String, required: true },
    idempotencyKey: { type: String, required: true },
    requestHash: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ['pending_confirmation', 'awaiting_payment', 'confirmed', 'dispatched', 'delivered', 'cancelled'],
    },
    payment: {
      method: { type: String, required: true, enum: ['cod', 'razorpay'] },
      status: { type: String, required: true, enum: ['cod_due', 'pending', 'paid', 'failed', 'amount_mismatch'] },
      razorpayOrderId: String,
      razorpayPaymentId: String,
      paidAt: Date,
      via: String,
      lastError: String,
    },
    items: [
      {
        _id: false,
        sku: { type: String, required: true },
        name: String,
        size: String,
        unitPrice: money,
        qty: { type: Number, required: true, min: 1 },
        lineTotal: money,
      },
    ],
    subtotal: money,
    shipping: money,
    total: money,
    currency: { type: String, required: true, default: 'INR' },
    customer: { name: String, email: String, phone: String },
    address: { address1: String, address2: String, city: String, state: String, pincode: String },
    notes: String,
    flags: { honeypot: Boolean },
    notifications: { business: String, customer: String },
  },
  { timestamps: true, minimize: false },
)
orderSchema.index({ number: 1 }, { unique: true })
orderSchema.index({ idempotencyKey: 1 }, { unique: true })
orderSchema.index(
  { 'payment.razorpayOrderId': 1 },
  { unique: true, partialFilterExpression: { 'payment.razorpayOrderId': { $type: 'string' } } },
)
orderSchema.index({ createdAt: -1 })

const enquirySchema = new Schema(
  {
    type: { type: String, required: true, enum: ['contact', 'wholesale'] },
    name: String,
    email: String,
    phone: String,
    business: String,
    city: String,
    volume: String,
    message: String,
    flags: { honeypot: Boolean },
    notified: String,
  },
  { timestamps: true },
)
enquirySchema.index({ createdAt: -1 })

const webhookEventSchema = new Schema({
  eventId: { type: String, required: true },
  type: String,
  receivedAt: { type: Date, default: Date.now },
})
webhookEventSchema.index({ eventId: 1 }, { unique: true })
// Razorpay retries for a limited time; keep IDs for 30 days, then let MongoDB delete them.
webhookEventSchema.index({ receivedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 })

const plain = (doc) => (doc ? doc.toObject({ versionKey: false, transform: (_, ret) => { delete ret._id; return ret } }) : null)

function rethrowDuplicate(err) {
  if (err?.code === 11000) {
    const key = Object.keys(err.keyPattern ?? {})[0] ?? 'unknown'
    throw new DuplicateKeyError(key === 'payment.razorpayOrderId' ? 'razorpayOrderId' : key)
  }
  throw err
}

export async function createMongoStore(uri, { serverSelectionTimeoutMS = 5000 } = {}) {
  const conn = mongoose.createConnection(uri, { serverSelectionTimeoutMS })
  await conn.asPromise()
  const Order = conn.model('Order', orderSchema)
  const Enquiry = conn.model('Enquiry', enquirySchema)
  const WebhookEvent = conn.model('WebhookEvent', webhookEventSchema)
  await Promise.all([Order.createIndexes(), Enquiry.createIndexes(), WebhookEvent.createIndexes()])

  return {
    kind: 'mongo',
    async ping() {
      try {
        await conn.db.admin().ping()
        return true
      } catch {
        return false
      }
    },
    close: () => conn.close(),

    orders: {
      async insert(order) {
        try {
          return plain(await Order.create(order))
        } catch (err) {
          return rethrowDuplicate(err)
        }
      },
      findByIdempotencyKey: async (key) => plain(await Order.findOne({ idempotencyKey: String(key) })),
      findByNumber: async (number) => plain(await Order.findOne({ number: String(number) })),
      findByRazorpayOrderId: async (id) => plain(await Order.findOne({ 'payment.razorpayOrderId': String(id) })),
      async update(number, patch) {
        try {
          return plain(await Order.findOneAndUpdate({ number: String(number) }, { $set: patch }, { new: true, runValidators: true }))
        } catch (err) {
          return rethrowDuplicate(err)
        }
      },
      async markPaid(number, payment) {
        // Conditional update: only the first caller flips the order to paid.
        const set = { 'payment.status': 'paid', 'payment.paidAt': new Date(), status: 'pending_confirmation' }
        for (const [k, v] of Object.entries(payment)) set[`payment.${k}`] = v
        const updated = await Order.findOneAndUpdate(
          { number: String(number), 'payment.status': { $ne: 'paid' } },
          { $set: set },
          { new: true },
        )
        if (updated) return { order: plain(updated), changed: true }
        return { order: plain(await Order.findOne({ number: String(number) })), changed: false }
      },
      list: async ({ since, limit = 50 } = {}) =>
        (await Order.find(since ? { createdAt: { $gte: since } } : {}).sort({ createdAt: -1 }).limit(limit)).map(plain),
    },

    enquiries: {
      insert: async (enquiry) => plain(await Enquiry.create(enquiry)),
      count: () => Enquiry.countDocuments(),
    },

    webhookEvents: {
      has: async (id) => Boolean(await WebhookEvent.exists({ eventId: String(id) })),
      async record(id, type) {
        try {
          await WebhookEvent.create({ eventId: String(id), type })
        } catch (err) {
          if (err?.code !== 11000) throw err // already recorded by a concurrent delivery
        }
      },
    },
  }
}
