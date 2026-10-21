// Runs the API as a serverless function (Vercel: frontend/api/index.js).
// The app is built once per warm instance and reused. If configuration is missing
// (e.g. MONGODB_URI or SMTP not yet set in the host's dashboard), requests get a 503
// with code UNAVAILABLE, and the storefront falls back to ordering over WhatsApp.

import { loadConfig } from './config.js'
import { createLogger } from './logger.js'
import { createApp } from './app.js'
import { createMemoryStore } from './store/memory.js'
import { createMongoStore } from './store/mongo.js'
import { createMailer } from './services/mailer.js'
import { createRazorpayClient } from './services/razorpay.js'

export function createServerlessHandler({ env = process.env, logger = createLogger() } = {}) {
  let ready = null

  async function init() {
    // The host serves the static site itself.
    const config = loadConfig({ ...env, SERVE_STATIC: 'false' })
    const store = config.mongoUri ? await createMongoStore(config.mongoUri) : createMemoryStore()
    const mailer = createMailer(config.mail, logger)
    const razorpay = config.razorpay.enabled ? createRazorpayClient(config.razorpay) : null
    logger.info('api ready (serverless)', { store: store.kind, email: mailer.enabled, razorpay: Boolean(razorpay), trustProxy: config.trustProxy })
    return createApp({ config, store, mailer, razorpay, logger })
  }

  return async function handler(req, res) {
    let app
    try {
      app = await (ready ??= init())
    } catch (err) {
      ready = null // retry on the next request, e.g. after a database blip
      logger.error('api unavailable', { err: { message: err.message, code: err.code } })
      res.statusCode = 503
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.setHeader('Cache-Control', 'no-store')
      res.end(JSON.stringify({ error: { code: 'UNAVAILABLE', message: 'Online ordering is unavailable right now.' } }))
      return
    }
    return app(req, res)
  }
}
