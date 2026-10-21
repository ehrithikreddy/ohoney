import { products, SHIPPING, MAX_QTY_PER_ITEM } from './catalog.js'

/**
 * Prices a cart against the catalogue. Used by the storefront for display and by the
 * API as the authority, so both always agree on totals.
 *
 * @param {{ sku: string, qty: number }[]} lines
 * @returns {{
 *   items: { sku, name, size, unitPrice, qty, lineTotal }[],
 *   subtotal: number, shipping: number, total: number,
 *   problems: { sku: string, code: 'UNKNOWN_SKU' | 'UNAVAILABLE' | 'BAD_QUANTITY' | 'DUPLICATE_SKU' }[]
 * }} amounts in paise
 */
export function priceCart(lines, catalog = products) {
  const items = []
  const problems = []
  const seen = new Set()

  for (const line of Array.isArray(lines) ? lines : []) {
    const sku = typeof line?.sku === 'string' ? line.sku : ''
    const product = catalog.find((p) => p.sku === sku)
    if (!product) {
      problems.push({ sku, code: 'UNKNOWN_SKU' })
      continue
    }
    if (seen.has(sku)) {
      problems.push({ sku, code: 'DUPLICATE_SKU' })
      continue
    }
    seen.add(sku)
    if (!Number.isInteger(line.qty) || line.qty < 1 || line.qty > MAX_QTY_PER_ITEM) {
      problems.push({ sku, code: 'BAD_QUANTITY' })
      continue
    }
    if (!product.available) {
      problems.push({ sku, code: 'UNAVAILABLE' })
      continue
    }
    items.push({
      sku,
      name: product.name,
      size: product.size,
      unitPrice: product.price,
      qty: line.qty,
      lineTotal: product.price * line.qty,
    })
  }

  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0)
  const shipping = subtotal === 0 || subtotal >= SHIPPING.freeFrom ? 0 : SHIPPING.flatFee
  return { items, subtotal, shipping, total: subtotal + shipping, problems }
}

/** Amount still needed for free delivery, in paise (0 once reached). */
export const amountToFreeShipping = (subtotal) => Math.max(0, SHIPPING.freeFrom - subtotal)

const whole = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
const exact = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 })

/** 39900 → "₹399"; 129950 → "₹1,299.50" */
export const formatINR = (paise) => (paise % 100 === 0 ? whole : exact).format(paise / 100)
