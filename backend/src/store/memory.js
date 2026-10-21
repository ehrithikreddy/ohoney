import { DuplicateKeyError } from './index.js'

const clone = (v) => (v == null ? v : structuredClone(v))

function setPath(obj, dotted, value) {
  const keys = dotted.split('.')
  let target = obj
  for (const k of keys.slice(0, -1)) target = target[k] ??= {}
  target[keys.at(-1)] = value
}

/** In-memory store. Data is lost on restart: development and tests only. */
export function createMemoryStore() {
  const orders = new Map()
  const enquiries = []
  const events = new Map()

  const find = (pred) => clone([...orders.values()].find(pred) ?? null)

  return {
    kind: 'memory',
    async ping() { return true },
    async close() {},

    orders: {
      async insert(order) {
        for (const existing of orders.values()) {
          if (existing.idempotencyKey === order.idempotencyKey) throw new DuplicateKeyError('idempotencyKey')
          if (existing.number === order.number) throw new DuplicateKeyError('number')
        }
        const now = new Date()
        const stored = { ...clone(order), createdAt: now, updatedAt: now }
        orders.set(order.number, stored)
        return clone(stored)
      },
      async findByIdempotencyKey(key) { return find((o) => o.idempotencyKey === key) },
      async findByNumber(number) { return clone(orders.get(number) ?? null) },
      async findByRazorpayOrderId(id) { return find((o) => o.payment?.razorpayOrderId === id) },
      async update(number, patch) {
        const order = orders.get(number)
        if (!order) return null
        if (patch['payment.razorpayOrderId']) {
          for (const o of orders.values()) {
            if (o !== order && o.payment?.razorpayOrderId === patch['payment.razorpayOrderId']) throw new DuplicateKeyError('razorpayOrderId')
          }
        }
        for (const [k, v] of Object.entries(patch)) setPath(order, k, clone(v))
        order.updatedAt = new Date()
        return clone(order)
      },
      async markPaid(number, payment) {
        const order = orders.get(number)
        if (!order) return { order: null, changed: false }
        if (order.payment.status === 'paid') return { order: clone(order), changed: false }
        Object.assign(order.payment, { status: 'paid', paidAt: new Date(), ...payment })
        order.status = 'pending_confirmation'
        order.updatedAt = new Date()
        return { order: clone(order), changed: true }
      },
      async list({ since, limit = 50 } = {}) {
        return [...orders.values()]
          .filter((o) => !since || o.createdAt >= since)
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, limit)
          .map(clone)
      },
    },

    enquiries: {
      async insert(enquiry) {
        const stored = { ...clone(enquiry), createdAt: new Date() }
        enquiries.push(stored)
        return clone(stored)
      },
      async count() { return enquiries.length },
    },

    webhookEvents: {
      async has(id) { return events.has(id) },
      async record(id, type) { events.set(id, { type, receivedAt: new Date() }) },
    },
  }
}
