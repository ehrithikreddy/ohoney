import { useCallback, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { findBySku, MAX_QTY_PER_ITEM } from '@ohoney/shared/catalog.js'
import { priceCart } from '@ohoney/shared/pricing.js'
import { addLine, removeLine, setLineQty } from '../lib/cart.js'
import { cartStore, hydration } from '../lib/cart-store.js'
import { CartContext } from './cart-context.js'

export function CartProvider({ children }) {
  const lines = useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot, cartStore.getServerSnapshot)
  const loaded = useSyncExternalStore(hydration.subscribe, hydration.getSnapshot, hydration.getServerSnapshot)
  const [isOpen, setOpen] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const announceCount = useRef(0)

  const announce = useCallback((message) => {
    // Alternating an invisible suffix makes a repeated message announce again.
    announceCount.current += 1
    setAnnouncement(`${message}${'​'.repeat(announceCount.current % 2)}`)
  }, [])

  const add = useCallback((sku, qty = 1) => {
    const product = findBySku(sku)
    if (!product?.available) return
    cartStore.update((prev) => addLine(prev, sku, qty))
    announce(`Added ${qty > 1 ? `${qty} × ` : ''}${product.name} to your cart.`)
    setOpen(true)
  }, [announce])

  const setQty = useCallback((sku, qty) => cartStore.update((prev) => setLineQty(prev, sku, qty)), [])

  const remove = useCallback((sku) => {
    cartStore.update((prev) => removeLine(prev, sku))
    announce(`Removed ${findBySku(sku)?.name ?? 'item'} from your cart.`)
  }, [announce])

  const clear = useCallback(() => cartStore.update(() => []), [])

  const value = useMemo(() => {
    const items = lines.map((l) => ({ ...l, product: findBySku(l.sku) }))
    return {
      lines,
      items,
      totals: priceCart(lines),
      count: lines.reduce((n, l) => n + l.qty, 0),
      hasUnavailable: items.some((i) => !i.product.available),
      maxQty: MAX_QTY_PER_ITEM,
      loaded,
      isOpen,
      open: () => setOpen(true),
      close: () => setOpen(false),
      add,
      setQty,
      remove,
      clear,
      announcement,
    }
  }, [lines, loaded, isOpen, add, setQty, remove, clear, announcement])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
