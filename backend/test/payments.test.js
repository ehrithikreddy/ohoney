import { test } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { buildApp, newKey, orderBody, RZP, sign } from './helpers.js'

function fakeRazorpay({ failTimes = 0 } = {}) {
  let n = 0
  const calls = []
  return {
    keyId: RZP.keyId,
    calls,
    async createOrder(args) {
      calls.push(args)
      if (calls.length <= failTimes) throw new Error('Razorpay down')
      return { id: `order_test_${++n}`, amount: args.amount, currency: 'INR' }
    },
  }
}

async function placeOnlineOrder(app, key = newKey()) {
  const res = await request(app).post('/api/orders').set('Idempotency-Key', key).send(orderBody(undefined, { paymentMethod: 'razorpay' }))
  return res
}

function webhook(app, event, { secret = RZP.webhookSecret, eventId = newKey() } = {}) {
  const raw = JSON.stringify(event)
  return request(app)
    .post('/api/webhooks/razorpay')
    .set('Content-Type', 'application/json')
    .set('X-Razorpay-Signature', sign(secret, raw))
    .set('X-Razorpay-Event-Id', eventId)
    .send(raw)
}

const captured = (rpOrderId, amount, paymentId = 'pay_test_1') => ({
  event: 'payment.captured',
  payload: { payment: { entity: { id: paymentId, order_id: rpOrderId, amount, currency: 'INR', status: 'captured' } } },
})

test('creates a Razorpay order for the server-computed amount and waits for payment before emailing', async () => {
  const razorpay = fakeRazorpay()
  const { app, mailer } = buildApp({ razorpay })
  const res = await placeOnlineOrder(app)
  assert.equal(res.status, 201)
  assert.equal(res.body.order.paymentStatus, 'pending')
  assert.equal(res.body.payment.razorpayOrderId, 'order_test_1')
  assert.equal(res.body.payment.amount, res.body.order.total)
  assert.equal(razorpay.calls[0].amount, res.body.order.total)
  assert.equal(razorpay.calls[0].receipt, res.body.order.number)
  assert.equal(mailer.sent.length, 0)
  assert.deepEqual((await request(app).get('/api/config')).body, { payments: { razorpay: { enabled: true, keyId: RZP.keyId } } })
})

test('a valid checkout signature marks the order paid once and sends emails once', async () => {
  const { app, mailer, store } = buildApp({ razorpay: fakeRazorpay() })
  const { body } = await placeOnlineOrder(app)
  const verify = (paymentId, signature) =>
    request(app).post('/api/payments/razorpay/verify').send({ orderNumber: body.order.number, razorpay_payment_id: paymentId, razorpay_signature: signature })

  const sig = sign(RZP.keySecret, `${body.payment.razorpayOrderId}|pay_abc`)
  const first = await verify('pay_abc', sig)
  assert.equal(first.status, 200)
  assert.equal(first.body.order.paymentStatus, 'paid')
  assert.equal((await verify('pay_abc', sig)).status, 200)
  assert.equal(mailer.sent.length, 2)
  assert.equal((await store.orders.findByNumber(body.order.number)).payment.razorpayPaymentId, 'pay_abc')
})

test('rejects forged or mismatched payment signatures', async () => {
  const { app, store } = buildApp({ razorpay: fakeRazorpay() })
  const { body } = await placeOnlineOrder(app)
  const attempts = [
    sign('wrong_secret', `${body.payment.razorpayOrderId}|pay_abc`),
    sign(RZP.keySecret, `order_someone_else|pay_abc`),
    'not-hex',
    undefined,
  ]
  for (const signature of attempts) {
    const res = await request(app).post('/api/payments/razorpay/verify').send({ orderNumber: body.order.number, razorpay_payment_id: 'pay_abc', razorpay_signature: signature })
    assert.equal(res.status, 400)
  }
  assert.equal((await store.orders.findByNumber(body.order.number)).payment.status, 'pending')
})

test('webhook: verifies the signature, marks paid, and ignores duplicate deliveries', async () => {
  const { app, mailer, store } = buildApp({ razorpay: fakeRazorpay() })
  const { body } = await placeOnlineOrder(app)
  const event = captured(body.payment.razorpayOrderId, body.order.total)

  assert.equal((await webhook(app, event, { secret: 'forged' })).status, 400)
  assert.equal((await store.orders.findByNumber(body.order.number)).payment.status, 'pending')

  const eventId = 'evt_1'
  const first = await webhook(app, event, { eventId })
  assert.equal(first.status, 200)
  assert.equal(first.body.processed, true)
  const dup = await webhook(app, event, { eventId })
  assert.equal(dup.body.duplicate, true)
  // A different event for the same payment (e.g. order.paid) must not notify again.
  await webhook(app, event, { eventId: 'evt_2' })

  const stored = await store.orders.findByNumber(body.order.number)
  assert.equal(stored.payment.status, 'paid')
  assert.equal(stored.payment.via, 'webhook')
  assert.equal(mailer.sent.length, 2)
})

test('webhook: an amount that does not match the order is flagged, not accepted', async () => {
  const { app, store, mailer } = buildApp({ razorpay: fakeRazorpay() })
  const { body } = await placeOnlineOrder(app)
  await webhook(app, captured(body.payment.razorpayOrderId, body.order.total - 100))
  const stored = await store.orders.findByNumber(body.order.number)
  assert.equal(stored.payment.status, 'amount_mismatch')
  assert.equal(mailer.sent.length, 0)
})

test('webhook: a failed payment is recorded, but never overrides a paid order', async () => {
  const { app, store } = buildApp({ razorpay: fakeRazorpay() })
  const { body } = await placeOnlineOrder(app)
  const failed = { event: 'payment.failed', payload: { payment: { entity: { id: 'pay_x', order_id: body.payment.razorpayOrderId, error_code: 'BAD_REQUEST_ERROR' } } } }
  await webhook(app, failed)
  assert.equal((await store.orders.findByNumber(body.order.number)).payment.status, 'failed')

  await webhook(app, captured(body.payment.razorpayOrderId, body.order.total))
  await webhook(app, failed)
  assert.equal((await store.orders.findByNumber(body.order.number)).payment.status, 'paid')
})

test('if processing fails, the event is not recorded, so Razorpay can retry', async () => {
  const { app, store } = buildApp({ razorpay: fakeRazorpay() })
  const { body } = await placeOnlineOrder(app)
  const original = store.orders.markPaid
  store.orders.markPaid = async () => { throw new Error('database blip') }
  const res = await webhook(app, captured(body.payment.razorpayOrderId, body.order.total), { eventId: 'evt_retry' })
  assert.equal(res.status, 500)
  assert.equal(await store.webhookEvents.has('evt_retry'), false)

  store.orders.markPaid = original
  const retry = await webhook(app, captured(body.payment.razorpayOrderId, body.order.total), { eventId: 'evt_retry' })
  assert.equal(retry.body.processed, true)
  assert.equal((await store.orders.findByNumber(body.order.number)).payment.status, 'paid')
})

test('if Razorpay is down the customer gets a clear error, and a retry with the same key recovers', async () => {
  const razorpay = fakeRazorpay({ failTimes: 1 })
  const { app, store } = buildApp({ razorpay })
  const key = newKey()
  const first = await placeOnlineOrder(app, key)
  assert.equal(first.status, 502)
  assert.equal(first.body.error.code, 'PAYMENT_UNAVAILABLE')
  const retry = await placeOnlineOrder(app, key)
  assert.equal(retry.status, 200)
  assert.equal(retry.body.payment.razorpayOrderId, 'order_test_1')
  assert.equal(razorpay.calls.length, 2)
  assert.equal((await store.orders.list()).length, 1)
})

test('payment endpoints do not exist while Razorpay is switched off', async () => {
  const { app } = buildApp()
  assert.equal((await request(app).post('/api/payments/razorpay/verify').send({})).status, 404)
  assert.equal((await webhook(app, captured('order_x', 100))).status, 404)
})

test('concurrent retries after a Razorpay outage settle on one Razorpay order ID', async () => {
  const { app, store } = buildApp({ razorpay: fakeRazorpay({ failTimes: 1 }) })
  const key = newKey()
  assert.equal((await placeOnlineOrder(app, key)).status, 502)
  const retries = await Promise.all([placeOnlineOrder(app, key), placeOnlineOrder(app, key), placeOnlineOrder(app, key)])
  const ids = new Set(retries.map((r) => r.body.payment.razorpayOrderId))
  assert.equal(ids.size, 1)
  const [stored] = await store.orders.list()
  assert.equal(stored.payment.razorpayOrderId, [...ids][0])
})

test('a mismatched amount never downgrades a paid order, and a flagged order cannot be verified as paid', async () => {
  const { app, store } = buildApp({ razorpay: fakeRazorpay() })
  const { body } = await placeOnlineOrder(app)
  await webhook(app, captured(body.payment.razorpayOrderId, body.order.total))
  await webhook(app, captured(body.payment.razorpayOrderId, 1, 'pay_other'))
  assert.equal((await store.orders.findByNumber(body.order.number)).payment.status, 'paid')

  const second = (await placeOnlineOrder(app)).body
  await webhook(app, captured(second.payment.razorpayOrderId, 1))
  const res = await request(app).post('/api/payments/razorpay/verify').send({
    orderNumber: second.order.number,
    razorpay_payment_id: 'pay_z',
    razorpay_signature: sign(RZP.keySecret, `${second.payment.razorpayOrderId}|pay_z`),
  })
  assert.equal(res.status, 409)
  assert.equal(res.body.error.code, 'PAYMENT_REVIEW')
})

test('verify gives the same answer for a missing order and a bad signature', async () => {
  const { app } = buildApp({ razorpay: fakeRazorpay() })
  const { body } = await placeOnlineOrder(app)
  const missing = await request(app).post('/api/payments/razorpay/verify').send({ orderNumber: 'OH-000101-AAAA', razorpay_payment_id: 'p', razorpay_signature: 'ab' })
  const wrong = await request(app).post('/api/payments/razorpay/verify').send({ orderNumber: body.order.number, razorpay_payment_id: 'p', razorpay_signature: 'ab' })
  assert.equal(missing.status, wrong.status)
  assert.deepEqual(missing.body, wrong.body)
})

test('a replayed signed body with a forged event ID cannot suppress a different real event', async () => {
  const { app, store } = buildApp({ razorpay: fakeRazorpay() })
  const { body } = await placeOnlineOrder(app)
  const failed = { event: 'payment.failed', payload: { payment: { entity: { id: 'pay_f', order_id: body.payment.razorpayOrderId, error_code: 'X' } } } }
  await webhook(app, failed, { eventId: 'evt_real_capture' }) // attacker replays an old body under the next event's ID
  const real = await webhook(app, captured(body.payment.razorpayOrderId, body.order.total), { eventId: 'evt_real_capture' })
  assert.equal(real.body.processed, true)
  assert.equal((await store.orders.findByNumber(body.order.number)).payment.status, 'paid')
})
