// Reads configuration from environment variables (see .env.example) and fails fast
// on settings that would lose orders or weaken security in production.

import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))

const bool = (v, fallback = false) => (v === undefined || v === '' ? fallback : ['1', 'true', 'yes'].includes(String(v).toLowerCase()))
const list = (v) => (v ? v.split(',').map((s) => s.trim()).filter(Boolean) : [])

export function loadConfig(env = process.env) {
  const production = env.NODE_ENV === 'production'
  const config = {
    production,
    port: Number(env.PORT) || 8787,
    siteUrl: (env.SITE_URL || (production ? 'https://www.ohoney.in' : 'http://localhost:5173')).replace(/\/$/, ''),
    mongoUri: env.MONGODB_URI || '',
    corsOrigins: list(env.CORS_ORIGINS),
    // Number of reverse proxies in front of the app, so rate limits see the real client IP.
    trustProxy: env.TRUST_PROXY !== undefined && env.TRUST_PROXY !== '' ? Number(env.TRUST_PROXY) : production ? 1 : 0,
    serveStatic: bool(env.SERVE_STATIC, production),
    staticDir: path.resolve(env.STATIC_DIR || path.join(here, '../../frontend/dist')),
    mail: {
      host: env.SMTP_HOST || '',
      port: Number(env.SMTP_PORT) || 587,
      secure: bool(env.SMTP_SECURE, Number(env.SMTP_PORT) === 465),
      user: env.SMTP_USER || '',
      pass: env.SMTP_PASS || '',
      from: env.MAIL_FROM || '',
      notify: env.ORDER_NOTIFY_EMAIL || '',
      // Refuse to send over an unencrypted connection if the server doesn't offer STARTTLS.
      requireTLS: bool(env.SMTP_REQUIRE_TLS, production),
    },
    razorpay: {
      enabled: bool(env.PAYMENTS_RAZORPAY_ENABLED),
      keyId: env.RAZORPAY_KEY_ID || '',
      keySecret: env.RAZORPAY_KEY_SECRET || '',
      webhookSecret: env.RAZORPAY_WEBHOOK_SECRET || '',
      apiBase: env.RAZORPAY_API_BASE || 'https://api.razorpay.com/v1',
    },
    allowNoEmail: bool(env.ALLOW_NO_EMAIL),
  }

  const problems = []
  if (!Number.isInteger(config.trustProxy) || config.trustProxy < 0) {
    problems.push('TRUST_PROXY must be a whole number of proxy hops (0 if nothing sits in front of the app, usually 1 on Render, Railway or Fly).')
  }
  if (production && !config.mongoUri) problems.push('MONGODB_URI is required in production (orders would otherwise live only in memory).')
  const mailConfigured = config.mail.host && config.mail.from && config.mail.notify
  if (production && !mailConfigured && !config.allowNoEmail) {
    problems.push('SMTP_HOST, MAIL_FROM and ORDER_NOTIFY_EMAIL are required in production so the business hears about every order. Set ALLOW_NO_EMAIL=true only for a private staging site.')
  }
  if (config.razorpay.enabled && !(config.razorpay.keyId && config.razorpay.keySecret && config.razorpay.webhookSecret)) {
    problems.push('PAYMENTS_RAZORPAY_ENABLED needs RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET and RAZORPAY_WEBHOOK_SECRET.')
  }
  if (problems.length) {
    const err = new Error(`Invalid configuration:\n- ${problems.join('\n- ')}`)
    err.code = 'CONFIG'
    throw err
  }
  config.mail.enabled = Boolean(mailConfigured)
  return config
}
