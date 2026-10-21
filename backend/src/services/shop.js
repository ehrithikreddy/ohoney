// Order placement, payment confirmation, Razorpay webhooks and enquiries.
//
// Invariants:
// - Prices, totals and availability come from the shared catalogue, never the client.
// - One Idempotency-Key creates at most one order; a retry returns the same order.
// - The order is saved before any email is attempted; an email failure never loses an order.
// - An order is marked paid at most once, whichever of checkout or webhook arrives first.

import crypto from 'node:crypto'
import { priceCart, formatINR } from '@ohoney/shared/pricing.js'
import { validateCheckout, validateEnquiry } from '@ohoney/shared/validation.js'
import { badRequest, conflict, HttpError, notFound } from '../http/errors.js'
import { DuplicateKeyError } from '../store/index.js'
import { verifyPaymentSignature, verifyWebhookSignature } from './razorpay.js'
import { businessEnquiryEmail, businessOrderEmail, customerOrderEmail } from './emails.js'

export const IDEMPOTENCY_KEY = /^[A-Za-z0-9_-]{16,100}$/
export const ORDER_NUMBER = /^OH-\d{6}-[0-9A-HJKMNP-TV-Z]{4}$/
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ' // Crockford base32: no I, L, O or U
const MAX_LINES = 20
const EMAIL_TIMEOUT_MS = 15_000

/** e.g. OH-261021-7KQ2: the date in India, then 4 random characters. */
export function newOrderNumber(now = new Date()) {
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000)
  const date = ist.toISOString().slice(2, 10).replace(/-/g, '')
  const suffix = Array.from({ length: 4 }, () => ALPHABET[crypto.randomInt(ALPHABET.length)]).join('')
  return `OH-${date}-${suffix}`
}

function hashRequest(values, items, method) {
  const canonical = JSON.stringify({
    values: Object.fromEntries(Object.entries(values).sort()),
    items: items.map((i) => [i.sku, i.qty]).sort(),
    method,
  })
  return crypto.createHash('sha256').update(canonical).digest('hex')
}

/** What the customer's browser receives. */
export function publicOrder(order) {
  return {
    number: order.number,
    status: order.status,
    paymentMethod: order.payment.method,
    paymentStatus: order.payment.status,
    items: order.items,
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
    customer: order.customer,
    createdAt: order.createdAt,
    confirmationEmailSent: order.notifications?.customer === 'sent',
  }
}

const withTimeout = (promise, ms) =>
  Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error(`timed out after ${ms} ms`)), ms).unref?.())])

export function createShopService({ store, mailer, razorpay = null, config, logger }) {
  async function sendSafely(kind, ref, message) {
    try {
      return await withTimeout(mailer.send(message), EMAIL_TIMEOUT_MS)
    } catch (err) {
      // Recipient addresses are deliberately not logged.
      logger.error('email failed', { kind, ref, err: { message: err.message } })
      return 'failed'
    }
  }

  async function notifyOrder(order, requestId) {
    const [business, customer] = await Promise.all([
      sendSafely('order-business', order.number, { to: config.mail.notify, ...businessOrderEmail(order) }),
      // A flagged (likely bot) order must not be used to send mail to a third party.
      order.flags?.honeypot
        ? 'skipped'
        : sendSafely('order-customer', order.number, {
            to: order.customer.email,
            replyTo: config.mail.notify, // "Reply to this email" reaches the business inbox
            ...customerOrderEmail(order, { siteUrl: config.siteUrl }),
          }),
    ])
    logger.info('order notifications', { requestId, order: order.number, business, customer })
    return store.orders.update(order.number, { 'notifications.business': business, 'notifications.customer': customer })
  }

  function paymentInfo(order) {
    return {
      provider: 'razorpay',
      keyId: razorpay.keyId,
      razorpayOrderId: order.payment.razorpayOrderId,
      amount: order.total,
      currency: 'INR',
    }
  }

  async function ensureRazorpayOrder(order, requestId) {
    if (order.payment.razorpayOrderId) return order
    try {
      const rp = await razorpay.createOrder({ amount: order.total, receipt: order.number, notes: { orderNumber: order.number } })
      return await store.orders.update(order.number, { 'payment.razorpayOrderId': rp.id, 'payment.status': 'pending' })
    } catch (err) {
      logger.error('razorpay order creation failed', { requestId, order: order.number, err })
      await store.orders.update(order.number, { 'payment.status': 'failed', 'payment.lastError': 'order_creation_failed' })
      throw new HttpError(502, 'PAYMENT_UNAVAILABLE', 'Online payment isn’t available right now. Choose cash on delivery, or try again in a few minutes.')
    }
  }

  async function replay(existing, requestHash, requestId) {
    if (existing.requestHash !== requestHash) {
      throw conflict('IDEMPOTENCY_CONFLICT', 'This order was already submitted with different details. Refresh the page and try again.')
    }
    logger.info('order replayed', { requestId, order: existing.number })
    if (existing.payment.method === 'razorpay' && existing.payment.status !== 'paid') {
      const order = await ensureRazorpayOrder(existing, requestId)
      return { created: false, order, payment: paymentInfo(order) }
    }
    return { created: false, order: existing }
  }

  async function createOrder(body, idempotencyKey, { requestId } = {}) {
    if (!IDEMPOTENCY_KEY.test(idempotencyKey ?? '')) {
      throw badRequest('IDEMPOTENCY_KEY', 'Missing or invalid Idempotency-Key header.')
    }
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw badRequest('BAD_REQUEST', 'Expected a JSON object.')

    const { values, errors } = validateCheckout(body)
    if (Object.keys(errors).length) throw badRequest('VALIDATION', 'Some details need correcting.', { fields: errors })

    const method = body.paymentMethod
    if (method !== 'cod' && !(method === 'razorpay' && razorpay)) {
      throw badRequest('PAYMENT_METHOD', 'That payment method isn’t available. Choose cash on delivery.')
    }

    if (!Array.isArray(body.items) || body.items.length === 0) throw badRequest('EMPTY_CART', 'Your cart is empty.')
    if (body.items.length > MAX_LINES) throw badRequest('BAD_ITEMS', 'Your cart has too many lines.')
    const priced = priceCart(body.items.map((l) => ({ sku: l?.sku, qty: l?.qty })))
    const malformed = priced.problems.filter((p) => p.code === 'BAD_QUANTITY' || p.code === 'DUPLICATE_SKU')
    if (malformed.length) throw badRequest('BAD_ITEMS', 'Some items in your cart have an invalid quantity.', { problems: malformed })
    const gone = priced.problems.filter((p) => p.code === 'UNKNOWN_SKU' || p.code === 'UNAVAILABLE')
    if (gone.length) {
      throw conflict('CART_CHANGED', 'Some items in your cart are no longer available. Remove them and try again.', { problems: gone })
    }
    if (body.expectedTotal !== priced.total) {
      throw conflict(
        'TOTAL_CHANGED',
        `Our prices have changed since this page loaded. The total is now ${formatINR(priced.total)}. Refresh the page to see the latest prices.`,
        { total: priced.total },
      )
    }

    const requestHash = hashRequest(values, priced.items, method)
    const existing = await store.orders.findByIdempotencyKey(idempotencyKey)
    if (existing) return replay(existing, requestHash, requestId)

    const draft = {
      idempotencyKey,
      requestHash,
      status: method === 'cod' ? 'pending_confirmation' : 'awaiting_payment',
      payment: { method, status: method === 'cod' ? 'cod_due' : 'pending' },
      items: priced.items,
      subtotal: priced.subtotal,
      shipping: priced.shipping,
      total: priced.total,
      currency: 'INR',
      customer: { name: values.name, email: values.email, phone: values.phone },
      address: { address1: values.address1, address2: values.address2, city: values.city, state: values.state, pincode: values.pincode },
      notes: values.notes,
      flags: { honeypot: typeof body.website === 'string' && body.website.trim() !== '' },
      notifications: {},
    }

    let order = null
    for (let attempt = 1; !order; attempt++) {
      try {
        order = await store.orders.insert({ ...draft, number: newOrderNumber() })
      } catch (err) {
        if (err instanceof DuplicateKeyError && err.field === 'idempotencyKey') {
          // Two identical requests raced; the other one won.
          return replay(await store.orders.findByIdempotencyKey(idempotencyKey), requestHash, requestId)
        }
        if (err instanceof DuplicateKeyError && err.field === 'number' && attempt < 5) continue
        throw err
      }
    }
    logger.info('order created', {
      requestId, order: order.number, total: order.total, lines: order.items.length, method, flagged: order.flags.honeypot,
    })

    if (method === 'razorpay') {
      order = await ensureRazorpayOrder(order, requestId)
      return { created: true, order, payment: paymentInfo(order) }
    }
    return { created: true, order: await notifyOrder(order, requestId) }
  }

  async function verifyPayment(body, { requestId } = {}) {
    if (!razorpay) throw notFound()
    const number = body?.orderNumber
    if (typeof number !== 'string' || !ORDER_NUMBER.test(number)) throw badRequest('BAD_REQUEST', 'Invalid order number.')
    const order = await store.orders.findByNumber(number)
    if (!order || order.payment.method !== 'razorpay' || !order.payment.razorpayOrderId) throw notFound('Order not found.')

    const valid = verifyPaymentSignature({
      razorpayOrderId: order.payment.razorpayOrderId,
      paymentId: body.razorpay_payment_id,
      signature: body.razorpay_signature,
      keySecret: config.razorpay.keySecret,
    })
    if (!valid) {
      logger.warn('payment signature invalid', { requestId, order: number })
      throw badRequest('SIGNATURE_INVALID', 'We couldn’t verify that payment. If money has left your account, contact us with your order number.')
    }
    let { order: paid, changed } = await store.orders.markPaid(number, { razorpayPaymentId: body.razorpay_payment_id, via: 'checkout' })
    if (changed) paid = await notifyOrder(paid, requestId)
    return { order: paid }
  }

  async function handleWebhook({ rawBody, signature, eventId }, { requestId } = {}) {
    if (!razorpay) throw notFound()
    if (!verifyWebhookSignature({ rawBody, signature, webhookSecret: config.razorpay.webhookSecret })) {
      logger.warn('webhook signature invalid', { requestId })
      throw badRequest('SIGNATURE_INVALID', 'Invalid signature.')
    }
    if (eventId && (await store.webhookEvents.has(eventId))) return { duplicate: true }

    let event
    try {
      event = JSON.parse(rawBody.toString('utf8'))
    } catch {
      throw badRequest('BAD_JSON', 'Invalid JSON.')
    }
    const payment = event?.payload?.payment?.entity
    const rpOrderId = payment?.order_id ?? event?.payload?.order?.entity?.id
    const order = typeof rpOrderId === 'string' ? await store.orders.findByRazorpayOrderId(rpOrderId) : null

    switch (event?.event) {
      case 'payment.captured':
      case 'order.paid': {
        if (!order) {
          logger.warn('webhook for unknown order', { requestId, type: event.event })
          break
        }
        const amount = payment?.amount ?? event.payload?.order?.entity?.amount_paid
        const currency = payment?.currency ?? event.payload?.order?.entity?.currency
        if (amount !== order.total || currency !== 'INR') {
          logger.error('payment amount mismatch', { requestId, order: order.number, expected: order.total, received: amount, currency })
          await store.orders.update(order.number, { 'payment.status': 'amount_mismatch', 'payment.lastError': `received ${amount} ${currency}` })
          break
        }
        const { order: paid, changed } = await store.orders.markPaid(order.number, { razorpayPaymentId: payment?.id, via: 'webhook' })
        if (changed) await notifyOrder(paid, requestId)
        break
      }
      case 'payment.failed':
        if (order && order.payment.status !== 'paid') {
          await store.orders.update(order.number, { 'payment.status': 'failed', 'payment.lastError': String(payment?.error_code ?? 'failed') })
        }
        break
      default:
        logger.info('webhook ignored', { requestId, type: event?.event })
    }
    // Recorded only after successful processing, so a failure lets Razorpay retry.
    if (eventId) await store.webhookEvents.record(eventId, event?.event)
    return { processed: true }
  }

  async function createEnquiry(body, { requestId } = {}) {
    const { values, errors } = validateEnquiry(body ?? {})
    if (Object.keys(errors).length) throw badRequest('VALIDATION', 'Some details need correcting.', { fields: errors })
    const flagged = typeof body.website === 'string' && body.website.trim() !== ''
    await store.enquiries.insert({ ...values, flags: { honeypot: flagged } })
    const notified = flagged ? 'skipped' : await sendSafely(`enquiry-${values.type}`, null, { to: config.mail.notify, ...businessEnquiryEmail(values) })
    logger.info('enquiry received', { requestId, type: values.type, flagged, notified })
    return { ok: true }
  }

  return { createOrder, verifyPayment, handleWebhook, createEnquiry }
}
