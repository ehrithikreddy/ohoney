import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import { rateLimit } from 'express-rate-limit'
import { findByLegacyId } from '@ohoney/shared/catalog.js'
import { errorHandler, HttpError } from './http/errors.js'
import { createShopService, publicOrder } from './services/shop.js'

const limitMessage = { error: { code: 'RATE_LIMITED', message: 'Too many attempts. Please wait a few minutes and try again.' } }

/**
 * Builds the Express app. Dependencies are injected so tests can use the
 * in-memory store, a memory mailer and a fake Razorpay client.
 */
export function createApp({ config, store, mailer, razorpay = null, logger }) {
  const app = express()
  const shop = createShopService({ store, mailer, razorpay, config, logger })

  app.disable('x-powered-by')
  app.set('trust proxy', config.trustProxy)
  app.use(compression())

  app.use((req, res, next) => {
    req.id = crypto.randomUUID()
    res.setHeader('X-Request-Id', req.id)
    const start = process.hrtime.bigint()
    res.on('finish', () => {
      if (!req.path.startsWith('/api/')) return
      logger.info('request', {
        requestId: req.id, method: req.method, path: req.path, status: res.statusCode,
        ms: Number((process.hrtime.bigint() - start) / 1_000_000n),
      })
    })
    next()
  })

  const razorpayHosts = config.razorpay.enabled ? ['https://checkout.razorpay.com', 'https://api.razorpay.com'] : []
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          'default-src': ["'self'"],
          'script-src': ["'self'", ...razorpayHosts],
          'style-src': ["'self'"],
          'style-src-attr': ["'unsafe-inline'"], // React style attributes (CSS custom properties only)
          'img-src': ["'self'", 'data:', ...razorpayHosts],
          'font-src': ["'self'"],
          'connect-src': ["'self'", ...razorpayHosts],
          'frame-src': razorpayHosts.length ? razorpayHosts : ["'none'"],
          'form-action': ["'self'"],
          'frame-ancestors': ["'none'"],
          'base-uri': ["'self'"],
          'object-src': ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  )

  const api = express.Router()
  if (config.corsOrigins.length) api.use(cors({ origin: config.corsOrigins, allowedHeaders: ['Content-Type', 'Idempotency-Key'] }))
  api.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store')
    next()
  })

  // Webhooks need the exact bytes Razorpay signed, so this route reads the raw body.
  api.post('/webhooks/razorpay', express.raw({ type: 'application/json', limit: '100kb' }), async (req, res) => {
    const result = await shop.handleWebhook(
      { rawBody: req.body, signature: req.get('x-razorpay-signature'), eventId: req.get('x-razorpay-event-id') },
      { requestId: req.id },
    )
    res.json({ ok: true, ...result })
  })

  api.use(express.json({ limit: '20kb' }))

  const writeLimit = (limit) =>
    // Only successful submissions count, so a customer fixing form errors isn't locked out
    // (many Indian mobile users share an IP behind carrier NAT).
    rateLimit({ windowMs: 15 * 60 * 1000, limit, skipFailedRequests: true, standardHeaders: 'draft-8', legacyHeaders: false, message: limitMessage })

  api.get('/health', async (req, res) => {
    const db = await store.ping()
    res.status(db ? 200 : 503).json({ status: db ? 'ok' : 'degraded', store: store.kind, db: db ? 'up' : 'down' })
  })

  api.get('/config', (req, res) => {
    res.json({ payments: { razorpay: razorpay ? { enabled: true, keyId: razorpay.keyId } : { enabled: false } } })
  })

  api.post('/orders', writeLimit(10), async (req, res) => {
    const result = await shop.createOrder(req.body, req.get('idempotency-key'), { requestId: req.id })
    res.status(result.created ? 201 : 200).json({ order: publicOrder(result.order), ...(result.payment && { payment: result.payment }) })
  })

  api.post('/payments/razorpay/verify', writeLimit(20), async (req, res) => {
    const { order } = await shop.verifyPayment(req.body, { requestId: req.id })
    res.json({ order: publicOrder(order) })
  })

  api.post('/enquiries', writeLimit(5), async (req, res) => {
    res.status(201).json(await shop.createEnquiry(req.body, { requestId: req.id }))
  })

  api.use((req, res, next) => next(new HttpError(404, 'NOT_FOUND', 'No such API endpoint.')))
  api.use(errorHandler(logger))
  app.use('/api', api)

  // Links from the first version of the site.
  app.get('/product/:id', (req, res) => {
    const product = findByLegacyId(req.params.id)
    res.redirect(301, product ? `/shop/${product.slug}` : '/shop')
  })

  if (config.serveStatic) mountStaticSite(app, config.staticDir, logger)
  app.use(errorHandler(logger))
  return app
}

/** Serves the prerendered storefront: /shop -> shop/index.html, unknown paths -> 404.html. */
function mountStaticSite(app, dir, logger) {
  if (!fs.existsSync(path.join(dir, 'index.html'))) {
    logger.warn('static site not found; run npm run build in frontend/', { dir })
    return
  }
  // Fingerprinted assets never change, so browsers may cache them for a year.
  app.use('/assets', express.static(path.join(dir, 'assets'), { immutable: true, maxAge: '1y', index: false, fallthrough: false }))
  app.use(express.static(dir, { index: false, redirect: false, maxAge: '1h' }))

  const htmlHeaders = { 'Cache-Control': 'no-cache', 'Content-Type': 'text/html; charset=utf-8' }
  app.get('/{*path}', (req, res) => {
    const clean = path.posix.normalize(req.path).replace(/\/+$/, '')
    const file = path.join(dir, clean, 'index.html')
    if (file.startsWith(dir + path.sep) || file === path.join(dir, 'index.html')) {
      if (fs.existsSync(file)) return res.set(htmlHeaders).sendFile(file)
    }
    res.status(404).set(htmlHeaders).sendFile(path.join(dir, '404.html'))
  })
}
