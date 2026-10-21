import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import request from 'supertest'
import { loadConfig } from '../src/config.js'
import { buildApp } from './helpers.js'

function fakeDist() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ohoney-dist-'))
  const write = (rel, body) => {
    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true })
    fs.writeFileSync(path.join(dir, rel), body)
  }
  write('index.html', 'HOME')
  write('shop/index.html', 'SHOP')
  write('shop/forest-honey/index.html', 'FOREST')
  write('404.html', 'NOT FOUND')
  write('assets/index-abc123.js', 'console.log(1)')
  write('robots.txt', 'User-agent: *')
  return dir
}

test('serves prerendered pages, a real 404, and long-lived caching for fingerprinted assets', async () => {
  const { app } = buildApp({ env: { SERVE_STATIC: 'true', STATIC_DIR: fakeDist() } })
  const home = await request(app).get('/')
  assert.equal(home.text, 'HOME')
  assert.equal(home.headers['cache-control'], 'no-cache')
  assert.equal((await request(app).get('/shop')).text, 'SHOP')
  assert.equal((await request(app).get('/shop/forest-honey/')).text, 'FOREST')

  const missing = await request(app).get('/shop/no-such-honey')
  assert.equal(missing.status, 404)
  assert.equal(missing.text, 'NOT FOUND')
  assert.equal((await request(app).get('/..%2f..%2fetc/passwd')).status, 404)

  const asset = await request(app).get('/assets/index-abc123.js')
  assert.match(asset.headers['cache-control'], /max-age=31536000.*immutable/)
  assert.equal((await request(app).get('/assets/missing.js')).status, 404)
  assert.equal((await request(app).get('/robots.txt')).text, 'User-agent: *')
})

test('redirects old product URLs permanently', async () => {
  const { app } = buildApp()
  const res = await request(app).get('/product/p2')
  assert.equal(res.status, 301)
  assert.equal(res.headers.location, '/shop/forest-honey')
  assert.equal((await request(app).get('/product/zzz')).headers.location, '/shop')
})

test('sends security headers with a strict content security policy', async () => {
  const { app } = buildApp()
  const res = await request(app).get('/api/health')
  const csp = res.headers['content-security-policy']
  assert.match(csp, /default-src 'self'/)
  assert.match(csp, /script-src 'self'(;|$)/)
  assert.match(csp, /frame-ancestors 'none'/)
  assert.equal(res.headers['x-content-type-options'], 'nosniff')
  assert.equal(res.headers['x-powered-by'], undefined)
  assert.ok(res.headers['x-request-id'])
})

test('production refuses to start without a database or order email', () => {
  assert.throws(() => loadConfig({ NODE_ENV: 'production' }), /MONGODB_URI is required[\s\S]*SMTP_HOST/)
  assert.doesNotThrow(() =>
    loadConfig({ NODE_ENV: 'production', MONGODB_URI: 'mongodb://x', SMTP_HOST: 'h', MAIL_FROM: 'a@b.co', ORDER_NOTIFY_EMAIL: 'c@d.co' }),
  )
  assert.doesNotThrow(() => loadConfig({ NODE_ENV: 'production', MONGODB_URI: 'mongodb://x', ALLOW_NO_EMAIL: 'true' }))
})

test('Razorpay cannot be switched on without all three secrets', () => {
  assert.throws(() => loadConfig({ PAYMENTS_RAZORPAY_ENABLED: 'true', RAZORPAY_KEY_ID: 'k' }), /RAZORPAY_KEY_SECRET/)
})

test('production trusts one proxy hop by default so rate limits see real client IPs', () => {
  const c = loadConfig({ NODE_ENV: 'production', MONGODB_URI: 'mongodb://x', ALLOW_NO_EMAIL: 'true' })
  assert.equal(c.trustProxy, 1)
  assert.equal(c.serveStatic, true)
})
