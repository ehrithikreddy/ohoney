// The cart lives outside React in localStorage. Components read it with
// useSyncExternalStore, which renders the server snapshot (empty) during
// hydration and then switches to the saved cart without a mismatch.

import { loadCart, saveCart, STORAGE_KEY } from './cart.js'

const EMPTY = []
let lines = null
const listeners = new Set()

const emit = () => listeners.forEach((fn) => fn())

function onStorage(e) {
  if (e.key !== STORAGE_KEY) return
  lines = loadCart()
  emit()
}

export const cartStore = {
  subscribe(listener) {
    if (listeners.size === 0) window.addEventListener('storage', onStorage)
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
      if (listeners.size === 0) window.removeEventListener('storage', onStorage)
    }
  },
  getSnapshot() {
    if (lines === null) lines = loadCart()
    return lines
  },
  getServerSnapshot: () => EMPTY,
  update(fn) {
    lines = fn(cartStore.getSnapshot())
    saveCart(lines)
    emit()
  },
}

const noopSubscribe = () => () => {}
/** For useSyncExternalStore: false while prerendering and hydrating, then true. */
export const hydration = {
  subscribe: noopSubscribe,
  getSnapshot: () => true,
  getServerSnapshot: () => false,
}
