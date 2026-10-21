import { test } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { createServerlessHandler } from '../src/serverless.js'
import { createMemoryLogger } from '../src/logger.js'
import { newKey, orderBody } from './helpers.js'

test('without production configuration the function answers 503 UNAVAILABLE, so the shop falls back to WhatsApp', async () => {
  const logger = createMemoryLogger()
  const handler = createServerlessHandler({ env: { NODE_ENV: 'production' }, logger })
  const res = await request(handler).post('/api/orders').set('Idempotency-Key', newKey()).send(orderBody())
  assert.equal(res.status, 503)
  assert.equal(res.body.error.code, 'UNAVAILABLE')
  assert.equal(res.headers['cache-control'], 'no-store')
  assert.ok(logger.entries.some((e) => e.msg === 'api unavailable'))
  assert.ok(!JSON.stringify(res.body).includes('MONGODB_URI'), 'configuration details are not exposed')
})

test('with configuration it serves the API through the same Express app', async () => {
  const handler = createServerlessHandler({ env: { SMTP_HOST: '', ALLOW_NO_EMAIL: 'true' }, logger: createMemoryLogger() })
  assert.equal((await request(handler).get('/api/health')).status, 200)
  const res = await request(handler).post('/api/orders').set('Idempotency-Key', newKey()).send(orderBody())
  assert.equal(res.status, 201)
  assert.match(res.body.order.number, /^OH-/)
})
