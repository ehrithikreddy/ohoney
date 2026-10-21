// Razorpay integration (off unless PAYMENTS_RAZORPAY_ENABLED=true).
// Docs: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/
//       https://razorpay.com/docs/webhooks/validate-test/

import crypto from 'node:crypto'

function safeEqualHex(expected, received) {
  if (typeof received !== 'string' || !/^[0-9a-f]+$/i.test(received)) return false
  const a = Buffer.from(expected, 'hex')
  const b = Buffer.from(received, 'hex')
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

const hmac = (secret, data) => crypto.createHmac('sha256', secret).update(data).digest('hex')

/** Checkout success: HMAC-SHA256("<our stored razorpay order id>|<payment id>", key secret). */
export function verifyPaymentSignature({ razorpayOrderId, paymentId, signature, keySecret }) {
  if (!razorpayOrderId || typeof paymentId !== 'string' || !paymentId) return false
  return safeEqualHex(hmac(keySecret, `${razorpayOrderId}|${paymentId}`), signature)
}

/** Webhooks: HMAC-SHA256 of the raw request body with the webhook secret. */
export function verifyWebhookSignature({ rawBody, signature, webhookSecret }) {
  if (!Buffer.isBuffer(rawBody)) return false
  return safeEqualHex(hmac(webhookSecret, rawBody), signature)
}

export function createRazorpayClient({ keyId, keySecret, apiBase }, { fetchImpl = fetch } = {}) {
  const auth = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`
  return {
    keyId,
    async createOrder({ amount, receipt, notes }) {
      const res = await fetchImpl(`${apiBase}/orders`, {
        method: 'POST',
        headers: { Authorization: auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency: 'INR', receipt, notes }),
        signal: AbortSignal.timeout(10_000),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.id) {
        const err = new Error(`Razorpay order creation failed (${res.status}): ${data?.error?.description ?? 'no description'}`)
        err.code = 'RAZORPAY'
        throw err
      }
      return data
    },
  }
}
