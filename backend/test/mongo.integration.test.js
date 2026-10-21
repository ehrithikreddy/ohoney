// Runs against a real MongoDB when MONGODB_TEST_URI is set (use a throwaway database):
//   MONGODB_TEST_URI=mongodb://127.0.0.1:27018/ohoney_test npm test
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import mongoose from 'mongoose'
import { createMongoStore } from '../src/store/mongo.js'
import { DuplicateKeyError } from '../src/store/index.js'
import { buildApp, newKey, orderBody } from './helpers.js'

const uri = process.env.MONGODB_TEST_URI
const skip = uri ? false : 'set MONGODB_TEST_URI to run'
let store

before(async () => {
  if (!uri) return
  const conn = await mongoose.createConnection(uri).asPromise()
  await conn.dropDatabase()
  await conn.close()
  store = await createMongoStore(uri)
})
after(() => store?.close())

test('unique indexes enforce one order per idempotency key and per number', { skip }, async () => {
  const base = orderBase()
  await store.orders.insert({ ...base, number: 'OH-000000-AAAA', idempotencyKey: 'key-aaaaaaaaaaaaaaaa' })
  await assert.rejects(store.orders.insert({ ...base, number: 'OH-000000-BBBB', idempotencyKey: 'key-aaaaaaaaaaaaaaaa' }), (e) => e instanceof DuplicateKeyError && e.field === 'idempotencyKey')
  await assert.rejects(store.orders.insert({ ...base, number: 'OH-000000-AAAA', idempotencyKey: 'key-bbbbbbbbbbbbbbbb' }), (e) => e instanceof DuplicateKeyError && e.field === 'number')
})

test('markPaid flips an order exactly once under concurrency', { skip }, async () => {
  await store.orders.insert({ ...orderBase(), number: 'OH-000000-CCCC', idempotencyKey: 'key-cccccccccccccccc' })
  const results = await Promise.all(Array.from({ length: 8 }, () => store.orders.markPaid('OH-000000-CCCC', { razorpayPaymentId: 'pay_1' })))
  assert.equal(results.filter((r) => r.changed).length, 1)
  assert.equal((await store.orders.findByNumber('OH-000000-CCCC')).payment.status, 'paid')
})

test('webhook event IDs are recorded once', { skip }, async () => {
  await Promise.all([store.webhookEvents.record('evt_m1', 'payment.captured'), store.webhookEvents.record('evt_m1', 'payment.captured')])
  assert.equal(await store.webhookEvents.has('evt_m1'), true)
  assert.equal(await store.webhookEvents.has('evt_m2'), false)
})

test('end to end through the API: concurrent duplicate submissions create one stored order', { skip }, async () => {
  const { app } = buildApp({ store })
  const key = newKey()
  const responses = await Promise.all(Array.from({ length: 5 }, () => request(app).post('/api/orders').set('Idempotency-Key', key).send(orderBody())))
  assert.equal(new Set(responses.map((r) => r.body.order?.number)).size, 1, JSON.stringify(responses.map((r) => r.body)))
  const stored = await store.orders.findByIdempotencyKey(key)
  assert.equal(stored.notifications.business, 'sent')
  assert.equal((await request(app).get('/api/health')).body.db, 'up')
})

function orderBase() {
  return {
    requestHash: 'h',
    status: 'awaiting_payment',
    payment: { method: 'razorpay', status: 'pending' },
    items: [{ sku: 'OH-FO-250', name: 'Forest Honey', size: '250 g', unitPrice: 29900, qty: 1, lineTotal: 29900 }],
    subtotal: 29900,
    shipping: 6000,
    total: 35900,
    customer: { name: 'A', email: 'a@example.com', phone: '9876543210' },
    address: { address1: '1 St', address2: '', city: 'X', state: 'Kerala', pincode: '600001' },
    notes: '',
    flags: { honeypot: false },
    notifications: {},
  }
}
