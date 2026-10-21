import { test } from 'node:test'
import assert from 'node:assert/strict'
import { products, MAX_QTY_PER_ITEM } from '@ohoney/shared/catalog.js'
import { addLine, loadCart, reconcile, removeLine, saveCart, setLineQty, STORAGE_KEY } from '../src/lib/cart.js'

const [a, b] = products

function memoryStorage(initial = {}) {
  const data = { ...initial }
  return {
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => { data[k] = String(v) },
    removeItem: (k) => { delete data[k] },
    data,
  }
}

test('adds, increments, clamps and removes lines', () => {
  let lines = addLine([], a.sku)
  lines = addLine(lines, a.sku, 2)
  assert.deepEqual(lines, [{ sku: a.sku, qty: 3 }])
  lines = addLine(lines, a.sku, 100)
  assert.equal(lines[0].qty, MAX_QTY_PER_ITEM)
  lines = setLineQty(lines, a.sku, 0)
  assert.equal(lines[0].qty, 1)
  lines = removeLine(addLine(lines, b.sku), a.sku)
  assert.deepEqual(lines, [{ sku: b.sku, qty: 1 }])
})

test('survives a reload: save then load returns the same cart', () => {
  const storage = memoryStorage()
  saveCart([{ sku: a.sku, qty: 2 }], storage)
  assert.deepEqual(loadCart(storage), [{ sku: a.sku, qty: 2 }])
})

test('an emptied cart clears storage', () => {
  const storage = memoryStorage()
  saveCart([{ sku: a.sku, qty: 2 }], storage)
  saveCart([], storage)
  assert.equal(storage.getItem(STORAGE_KEY), null)
})

test('discards tampered or outdated stored carts safely', () => {
  assert.deepEqual(loadCart(memoryStorage({ [STORAGE_KEY]: 'not json' })), [])
  assert.deepEqual(loadCart(memoryStorage({ [STORAGE_KEY]: JSON.stringify({ v: 0, lines: [{ sku: a.sku, qty: 1 }] }) })), [])
  const tampered = { v: 1, lines: [{ sku: 'FAKE', qty: 1 }, { sku: a.sku, qty: 999, price: 1 }, { sku: a.sku, qty: 1 }] }
  assert.deepEqual(loadCart(memoryStorage({ [STORAGE_KEY]: JSON.stringify(tampered) })), [{ sku: a.sku, qty: MAX_QTY_PER_ITEM }])
})

test('storage failures never break the cart', () => {
  const throwing = { getItem() { throw new Error('blocked') }, setItem() { throw new Error('full') }, removeItem() {} }
  assert.deepEqual(loadCart(throwing), [])
  assert.doesNotThrow(() => saveCart([{ sku: a.sku, qty: 1 }], throwing))
  assert.deepEqual(reconcile(null), [])
})
