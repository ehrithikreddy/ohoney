import { test } from 'node:test'
import assert from 'node:assert/strict'
import { products } from '@ohoney/shared/catalog.js'
import { priceCart } from '@ohoney/shared/pricing.js'
import { isServiceUnavailable, whatsappOrderText } from '../src/lib/whatsapp-order.js'

test('the WhatsApp fallback carries items, totals and delivery details', () => {
  const lines = [{ sku: products[0].sku, qty: 2 }]
  const items = lines.map((l) => ({ ...l, product: products[0] }))
  const text = whatsappOrderText(items, priceCart(lines), {
    name: 'Asha Rao', phone: '9876543210', email: 'a@example.com', address1: '12 MG Road', address2: '', city: 'Hyderabad', state: 'Telangana', pincode: '500001', notes: '',
  })
  assert.match(text, /2 × Wildflower Honey 500 g: ₹798/)
  assert.match(text, /Total: ₹798/)
  assert.match(text, /Address: 12 MG Road, Hyderabad, Telangana, 500001/)
  assert.ok(!text.includes('Notes:'))
})

test('offers WhatsApp only when the order may not have reached the shop', () => {
  assert.equal(isServiceUnavailable({ code: 'UNAVAILABLE', status: 503 }), true)
  assert.equal(isServiceUnavailable({ code: 'NETWORK', status: 0 }), true)
  assert.equal(isServiceUnavailable({ code: 'SERVER', status: 404 }), true)
  assert.equal(isServiceUnavailable({ code: 'TOTAL_CHANGED', status: 409 }), false)
  assert.equal(isServiceUnavailable({ code: 'RATE_LIMITED', status: 429 }), false)
})
