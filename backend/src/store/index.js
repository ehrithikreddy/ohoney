// Storage interface used by the services. Two implementations share it:
// memory.js (development and tests) and mongo.js (production).
//
// orders.insert(order)                -> order; throws DuplicateKeyError on number/idempotencyKey/razorpayOrderId
// orders.findByIdempotencyKey(key)    -> order | null
// orders.findByNumber(number)         -> order | null
// orders.findByRazorpayOrderId(id)    -> order | null
// orders.update(number, patch)        -> order | null   (patch keys may be dotted paths)
// orders.markPaid(number, payment)    -> { order, changed }  (changed=false if it was already paid)
// orders.list({ since, limit })       -> order[] newest first
// enquiries.insert(enquiry)           -> enquiry
// webhookEvents.has(id) / record(id, type)
// ping() -> boolean; close()

export class DuplicateKeyError extends Error {
  constructor(field) {
    super(`Duplicate value for ${field}`)
    this.code = 'DUPLICATE_KEY'
    this.field = field
  }
}
