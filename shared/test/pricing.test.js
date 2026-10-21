import { test } from 'node:test'
import assert from 'node:assert/strict'
import { priceCart, formatINR, amountToFreeShipping } from '../pricing.js'
import { products, SHIPPING, MAX_QTY_PER_ITEM } from '../catalog.js'

const wildflower = products.find((p) => p.slug === 'wildflower-honey') // ₹399
const forest = products.find((p) => p.slug === 'forest-honey') // ₹299

test('prices lines from the catalogue, not from the input', () => {
  const r = priceCart([{ sku: forest.sku, qty: 1, price: 1 }])
  assert.equal(r.subtotal, forest.price)
  assert.deepEqual(r.problems, [])
})

test('charges delivery below the free threshold', () => {
  const r = priceCart([{ sku: forest.sku, qty: 1 }])
  assert.ok(r.subtotal < SHIPPING.freeFrom)
  assert.equal(r.shipping, SHIPPING.flatFee)
  assert.equal(r.total, r.subtotal + SHIPPING.flatFee)
})

test('delivery is free at exactly the threshold and above', () => {
  const atThreshold = [{ sku: 'X', qty: 1 }]
  const catalog = [{ sku: 'X', name: 'X', size: '1', price: SHIPPING.freeFrom, available: true }]
  assert.equal(priceCart(atThreshold, catalog).shipping, 0)
  assert.equal(priceCart([{ sku: wildflower.sku, qty: 2 }]).shipping, 0)
})

test('an empty cart costs nothing, including delivery', () => {
  assert.deepEqual(
    { subtotal: 0, shipping: 0, total: 0 },
    (({ subtotal, shipping, total }) => ({ subtotal, shipping, total }))(priceCart([])),
  )
})

test('reports unknown, unavailable, duplicate and out-of-range lines and excludes them from totals', () => {
  const catalog = [
    { sku: 'A', name: 'A', size: '1', price: 1000, available: true },
    { sku: 'B', name: 'B', size: '1', price: 1000, available: false },
  ]
  const r = priceCart(
    [
      { sku: 'A', qty: 1 },
      { sku: 'A', qty: 1 },
      { sku: 'B', qty: 1 },
      { sku: 'Z', qty: 1 },
    ],
    catalog,
  )
  assert.equal(r.subtotal, 1000)
  assert.deepEqual(r.problems.map((p) => p.code).sort(), ['DUPLICATE_SKU', 'UNAVAILABLE', 'UNKNOWN_SKU'])

  for (const qty of [0, -1, 1.5, MAX_QTY_PER_ITEM + 1, '2', null]) {
    assert.equal(priceCart([{ sku: wildflower.sku, qty }]).problems[0]?.code, 'BAD_QUANTITY', `qty ${qty}`)
  }
})

test('tolerates malformed input', () => {
  for (const bad of [null, undefined, 'x', {}, [null], [{}], [{ sku: 5, qty: 1 }]]) {
    assert.doesNotThrow(() => priceCart(bad))
  }
})

test('formats rupees for India', () => {
  assert.equal(formatINR(39900), '₹399')
  assert.equal(formatINR(12345600), '₹1,23,456')
  assert.equal(formatINR(129950), '₹1,299.50')
  assert.equal(formatINR(0), '₹0')
})

test('amount to free shipping never goes negative', () => {
  assert.equal(amountToFreeShipping(SHIPPING.freeFrom + 1), 0)
  assert.equal(amountToFreeShipping(SHIPPING.freeFrom - 100), 100)
})

test('catalogue integrity: unique SKUs and slugs, integer prices', () => {
  assert.equal(new Set(products.map((p) => p.sku)).size, products.length)
  assert.equal(new Set(products.map((p) => p.slug)).size, products.length)
  for (const p of products) assert.ok(Number.isInteger(p.price) && p.price > 0, p.sku)
})
