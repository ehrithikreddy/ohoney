// Cart state is just [{ sku, qty }]. Names and prices are always read from the
// catalogue, so a stored cart can never carry a stale price.

import { findBySku, MAX_QTY_PER_ITEM } from '@ohoney/shared/catalog.js'

export const STORAGE_KEY = 'ohoney.cart.v1'

const clampQty = (qty) => Math.min(MAX_QTY_PER_ITEM, Math.max(1, Math.trunc(qty) || 1))

/** Drops unknown SKUs and duplicates and clamps quantities. Keeps unavailable items so the customer can see them. */
export function reconcile(lines) {
  const seen = new Set()
  const out = []
  for (const line of Array.isArray(lines) ? lines : []) {
    if (!line || typeof line.sku !== 'string' || seen.has(line.sku) || !findBySku(line.sku)) continue
    seen.add(line.sku)
    out.push({ sku: line.sku, qty: clampQty(line.qty) })
  }
  return out
}

export function loadCart(storage = globalThis.localStorage) {
  try {
    const parsed = JSON.parse(storage?.getItem(STORAGE_KEY) ?? 'null')
    return parsed?.v === 1 ? reconcile(parsed.lines) : []
  } catch {
    return []
  }
}

export function saveCart(lines, storage = globalThis.localStorage) {
  try {
    if (lines.length) storage?.setItem(STORAGE_KEY, JSON.stringify({ v: 1, lines }))
    else storage?.removeItem(STORAGE_KEY)
  } catch {
    // Storage can be full or blocked (private mode); the cart still works for this visit.
  }
}

export function addLine(lines, sku, qty = 1) {
  const existing = lines.find((l) => l.sku === sku)
  if (existing) return lines.map((l) => (l.sku === sku ? { ...l, qty: clampQty(l.qty + qty) } : l))
  return [...lines, { sku, qty: clampQty(qty) }]
}

export const setLineQty = (lines, sku, qty) => lines.map((l) => (l.sku === sku ? { ...l, qty: clampQty(qty) } : l))
export const removeLine = (lines, sku) => lines.filter((l) => l.sku !== sku)
