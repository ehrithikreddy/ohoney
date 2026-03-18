import React, { createContext, useContext, useState } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)

  const addItem = (product) => {
    setItems(prev => {
      const exists = prev.find(i => i.id === product.id)
      if (exists) return prev.map(i => i.id === product.id ? {...i, qty: i.qty + 1} : i)
      return [...prev, { ...product, qty: 1 }]
    })
    setOpen(true)
  }

  const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id))

  const updateQty = (id, delta) => {
    setItems(prev =>
      prev.map(i => i.id === id ? {...i, qty: Math.max(1, i.qty + delta)} : i)
    )
  }

  const total = items.reduce((sum, i) => sum + (parseInt(i.price.replace('₹','')) * i.qty), 0)
  const count = items.reduce((sum, i) => sum + i.qty, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, total, count, open, setOpen }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
