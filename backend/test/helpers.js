import crypto from 'node:crypto'
import { products } from '@ohoney/shared/catalog.js'
import { priceCart } from '@ohoney/shared/pricing.js'
import { loadConfig } from '../src/config.js'
import { createApp } from '../src/app.js'
import { createMemoryStore } from '../src/store/memory.js'
import { createMemoryMailer } from '../src/services/mailer.js'
import { createMemoryLogger } from '../src/logger.js'

export const RZP = { keyId: 'rzp_test_fake', keySecret: 'test_key_secret', webhookSecret: 'test_webhook_secret' }

export function buildApp({ env = {}, mailerOptions, razorpay = null, store = createMemoryStore() } = {}) {
  const config = loadConfig({
    SMTP_HOST: 'smtp.test',
    MAIL_FROM: 'shop@ohoney.test',
    ORDER_NOTIFY_EMAIL: 'orders@ohoney.test',
    SERVE_STATIC: 'false',
    ...(razorpay && {
      PAYMENTS_RAZORPAY_ENABLED: 'true',
      RAZORPAY_KEY_ID: RZP.keyId,
      RAZORPAY_KEY_SECRET: RZP.keySecret,
      RAZORPAY_WEBHOOK_SECRET: RZP.webhookSecret,
    }),
    ...env,
  })
  const mailer = createMemoryMailer(mailerOptions)
  const logger = createMemoryLogger()
  const app = createApp({ config, store, mailer, razorpay, logger })
  return { app, store, mailer, logger, config }
}

export const wildflower = products.find((p) => p.slug === 'wildflower-honey')
export const forest = products.find((p) => p.slug === 'forest-honey')

export const customer = {
  name: 'Asha Rao',
  email: 'asha.rao@example.com',
  phone: '+91 98765 43210',
  address1: '12 MG Road',
  address2: 'Near the park',
  city: 'Hyderabad',
  state: 'Telangana',
  pincode: '500001',
  notes: '',
}

/** A valid COD order body whose expectedTotal matches the server's pricing. */
export function orderBody(items = [{ sku: forest.sku, qty: 1 }], extra = {}) {
  return { ...customer, items, paymentMethod: 'cod', expectedTotal: priceCart(items).total, website: '', ...extra }
}

export const newKey = () => crypto.randomUUID()

export const sign = (secret, data) => crypto.createHmac('sha256', secret).update(data).digest('hex')
