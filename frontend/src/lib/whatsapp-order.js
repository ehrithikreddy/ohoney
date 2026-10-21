// Plain-text order for WhatsApp, used when online ordering is unavailable
// (e.g. before the database and email are configured, or during an outage).
import { formatINR } from '@ohoney/shared/pricing.js'

export function whatsappOrderText(items, totals, v) {
  return [
    'Hi ohoney, I’d like to place an order (cash on delivery):',
    ...items.map(({ qty, product }) => `• ${qty} × ${product.name} ${product.size}: ${formatINR(product.price * qty)}`),
    `Delivery: ${totals.shipping === 0 ? 'Free' : formatINR(totals.shipping)}`,
    `Total: ${formatINR(totals.total)}`,
    '',
    `Name: ${v.name}`,
    `Phone: ${v.phone}`,
    `Email: ${v.email}`,
    `Address: ${[v.address1, v.address2, v.city, v.state, v.pincode].filter(Boolean).join(', ')}`,
    ...(v.notes ? [`Notes: ${v.notes}`] : []),
  ].join('\n')
}

/** Errors where the order may not have reached us, so WhatsApp is a sensible fallback. */
export const isServiceUnavailable = (err) =>
  ['NETWORK', 'SERVER', 'UNAVAILABLE', 'PAYMENT_UNAVAILABLE'].includes(err.code) || err.status === 404 || err.status >= 500
