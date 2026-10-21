import { test } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { SHIPPING } from '@ohoney/shared/catalog.js'
import { buildApp, customer, forest, newKey, orderBody, wildflower } from './helpers.js'

const post = (app, body, key = newKey()) => request(app).post('/api/orders').set('Idempotency-Key', key).send(body)

test('places a COD order priced by the server and notifies business and customer', async () => {
  const { app, store, mailer } = buildApp()
  const res = await post(app, orderBody([{ sku: forest.sku, qty: 1 }]))

  assert.equal(res.status, 201)
  const { order } = res.body
  assert.match(order.number, /^OH-\d{6}-[0-9A-HJKMNP-TV-Z]{4}$/)
  assert.equal(order.subtotal, forest.price)
  assert.equal(order.shipping, SHIPPING.flatFee)
  assert.equal(order.total, forest.price + SHIPPING.flatFee)
  assert.equal(order.paymentMethod, 'cod')
  assert.equal(order.confirmationEmailSent, true)
  assert.equal(order.customer.phone, '9876543210')

  const stored = await store.orders.findByNumber(order.number)
  assert.equal(stored.address.city, 'Hyderabad')
  assert.deepEqual(stored.notifications, { business: 'sent', customer: 'sent' })
  assert.deepEqual(mailer.sent.map((m) => m.to).sort(), ['asha.rao@example.com', 'orders@ohoney.test'])
  assert.ok(mailer.sent.find((m) => m.to === 'orders@ohoney.test').subject.includes(order.number))
})

test('requires an idempotency key', async () => {
  const { app } = buildApp()
  const res = await request(app).post('/api/orders').send(orderBody())
  assert.equal(res.status, 400)
  assert.equal(res.body.error.code, 'IDEMPOTENCY_KEY')
})

test('returns field errors for invalid details, including what the old checkout accepted', async () => {
  const { app, store } = buildApp()
  const res = await post(app, orderBody(undefined, { phone: 'abcdefghij', pincode: 'abcdef', state: 'Nowhere' }))
  assert.equal(res.status, 400)
  assert.equal(res.body.error.code, 'VALIDATION')
  assert.deepEqual(Object.keys(res.body.error.fields).sort(), ['phone', 'pincode', 'state'])
  assert.equal((await store.orders.list()).length, 0)
})

test('ignores prices sent by the client and rejects a tampered total', async () => {
  const { app, store } = buildApp()
  const items = [{ sku: wildflower.sku, qty: 2, price: 100 }]
  const tampered = await post(app, orderBody(items, { expectedTotal: 200 }))
  assert.equal(tampered.status, 409)
  assert.equal(tampered.body.error.code, 'TOTAL_CHANGED')
  assert.equal(tampered.body.error.total, wildflower.price * 2)
  assert.equal((await store.orders.list()).length, 0)

  const honest = await post(app, orderBody(items))
  assert.equal(honest.status, 201)
  assert.equal(honest.body.order.subtotal, wildflower.price * 2)
})

test('rejects unknown and unavailable products with CART_CHANGED', async () => {
  const { app } = buildApp()
  const unknown = await post(app, { ...orderBody(), items: [{ sku: 'OH-FAKE', qty: 1 }], expectedTotal: 0 })
  assert.equal(unknown.status, 409)
  assert.equal(unknown.body.error.code, 'CART_CHANGED')

  forest.available = false
  try {
    const unavailable = await post(app, { ...orderBody(), items: [{ sku: forest.sku, qty: 1 }] })
    assert.equal(unavailable.status, 409)
    assert.deepEqual(unavailable.body.error.problems, [{ sku: forest.sku, code: 'UNAVAILABLE' }])
  } finally {
    forest.available = true
  }
})

test('rejects invalid quantities, empty carts and unknown payment methods', async () => {
  const { app } = buildApp()
  for (const qty of [0, 11, 1.5, '1']) {
    const res = await post(app, { ...orderBody(), items: [{ sku: forest.sku, qty }] })
    assert.equal(res.status, 400, `qty ${qty}`)
    assert.equal(res.body.error.code, 'BAD_ITEMS')
  }
  assert.equal((await post(app, { ...orderBody(), items: [] })).body.error.code, 'EMPTY_CART')
  assert.equal((await post(app, orderBody(undefined, { paymentMethod: 'razorpay' }))).body.error.code, 'PAYMENT_METHOD')
})

test('a retried request returns the same order and sends no extra email', async () => {
  const { app, store, mailer } = buildApp()
  const key = newKey()
  const first = await post(app, orderBody(), key)
  const retry = await post(app, orderBody(), key)
  assert.equal(first.status, 201)
  assert.equal(retry.status, 200)
  assert.equal(retry.body.order.number, first.body.order.number)
  assert.equal((await store.orders.list()).length, 1)
  assert.equal(mailer.sent.length, 2)
})

test('reusing a key with different details is refused', async () => {
  const { app } = buildApp()
  const key = newKey()
  await post(app, orderBody(), key)
  const res = await post(app, orderBody(undefined, { address1: '99 Other Street' }), key)
  assert.equal(res.status, 409)
  assert.equal(res.body.error.code, 'IDEMPOTENCY_CONFLICT')
})

test('simultaneous duplicate submissions create exactly one order', async () => {
  const { app, store } = buildApp()
  const key = newKey()
  const responses = await Promise.all(Array.from({ length: 5 }, () => post(app, orderBody(), key)))
  assert.ok(responses.every((r) => r.status === 201 || r.status === 200))
  assert.equal(new Set(responses.map((r) => r.body.order.number)).size, 1)
  assert.equal((await store.orders.list()).length, 1)
})

test('an email outage never loses the order, and logs hold no customer details', async () => {
  const { app, store, logger } = buildApp({ mailerOptions: { fail: true } })
  const res = await post(app, orderBody())
  assert.equal(res.status, 201)
  assert.equal(res.body.order.confirmationEmailSent, false)
  const stored = await store.orders.findByNumber(res.body.order.number)
  assert.deepEqual(stored.notifications, { business: 'failed', customer: 'failed' })
  assert.ok(logger.entries.some((e) => e.level === 'error' && e.msg === 'email failed'))

  const logText = JSON.stringify(logger.entries)
  for (const pii of [customer.name, customer.email, '9876543210', customer.address1]) assert.ok(!logText.includes(pii), `log contains ${pii}`)
})

test('a filled honeypot flags the order and suppresses the customer email', async () => {
  const { app, store, mailer } = buildApp()
  const res = await post(app, orderBody(undefined, { website: 'http://spam.example' }))
  assert.equal(res.status, 201)
  const stored = await store.orders.findByNumber(res.body.order.number)
  assert.equal(stored.flags.honeypot, true)
  assert.deepEqual(mailer.sent.map((m) => m.to), ['orders@ohoney.test'])
  assert.match(mailer.sent[0].subject, /possible spam/)
})

test('customer input is escaped in HTML emails', async () => {
  const { app, mailer } = buildApp()
  await post(app, orderBody(undefined, { name: 'Asha <script>x</script>', notes: '<img src=x onerror=alert(1)>' }))
  const html = mailer.sent.map((m) => m.html).join('')
  assert.ok(!html.includes('<script>') && !html.includes('<img'))
  assert.ok(html.includes('&lt;script&gt;'))
})

test('rate-limits order attempts per IP', async () => {
  const { app } = buildApp()
  const statuses = []
  for (let i = 0; i < 11; i++) statuses.push((await post(app, orderBody())).status)
  assert.deepEqual(statuses.slice(0, 10), Array(10).fill(201))
  assert.equal(statuses[10], 429)
})

test('rejects oversized and malformed bodies with JSON errors', async () => {
  const { app } = buildApp()
  const big = await post(app, orderBody(undefined, { notes: 'x'.repeat(30_000) }))
  assert.equal(big.status, 413)
  const bad = await request(app).post('/api/orders').set('Idempotency-Key', newKey()).set('Content-Type', 'application/json').send('{"oops"')
  assert.equal(bad.status, 400)
  assert.equal(bad.body.error.code, 'BAD_JSON')
})

test('health, config and unknown routes', async () => {
  const { app } = buildApp()
  assert.deepEqual((await request(app).get('/api/health')).body, { status: 'ok', store: 'memory', db: 'up' })
  assert.deepEqual((await request(app).get('/api/config')).body, { payments: { razorpay: { enabled: false } } })
  const missing = await request(app).get('/api/nope')
  assert.equal(missing.status, 404)
  assert.equal(missing.body.error.code, 'NOT_FOUND')
  assert.equal(missing.headers['cache-control'], 'no-store')
})

test('the order form cannot be used to flood one inbox: customer copies stop after 3 a day', async () => {
  const { app, store, mailer } = buildApp()
  const numbers = []
  for (let i = 0; i < 5; i++) numbers.push((await post(app, orderBody(undefined, { email: 'victim@example.com' }))).body.order.number)
  const toVictim = mailer.sent.filter((m) => m.to === 'victim@example.com')
  assert.equal(toVictim.length, 3)
  assert.equal(mailer.sent.filter((m) => m.to === 'orders@ohoney.test').length, 5)
  assert.equal((await store.orders.findByNumber(numbers[4])).notifications.customer, 'skipped')
})

test('failed notifications can be retried later', async () => {
  const failing = buildApp({ mailerOptions: { fail: true } })
  const res = await post(failing.app, orderBody())
  const { createShopService } = await import('../src/services/shop.js')
  const { createMemoryMailer } = await import('../src/services/mailer.js')
  const mailer = createMemoryMailer()
  const shop = createShopService({ store: failing.store, mailer, config: failing.config, logger: failing.logger })
  const retried = await shop.retryNotifications(res.body.order.number)
  assert.deepEqual(retried.notifications, { business: 'sent', customer: 'sent' })
  assert.equal(mailer.sent.length, 2)
  await shop.retryNotifications(res.body.order.number)
  assert.equal(mailer.sent.length, 2, 'nothing re-sent once delivered')
})
