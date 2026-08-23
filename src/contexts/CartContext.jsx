import { createContext, useContext, useEffect, useState } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'sewamajlis_cart'

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  function addItem(item, qty = 1) {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === item.id && p.color === item.color)
      if (existing) {
        return prev.map((p) =>
          p.id === item.id && p.color === item.color ? { ...p, qty: p.qty + qty } : p
        )
      }
      return [...prev, { ...item, qty }]
    })
  }

  function updateQty(id, color, qty) {
    setItems((prev) =>
      prev.map((p) => (p.id === id && p.color === color ? { ...p, qty: Math.max(1, qty) } : p))
    )
  }

  function removeItem(id, color) {
    setItems((prev) => prev.filter((p) => !(p.id === id && p.color === color)))
  }

  function clearCart() {
    setItems([])
  }

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const count = items.reduce((sum, i) => sum + i.qty, 0)

  return (
    <CartContext.Provider
      value={{ items, addItem, updateQty, removeItem, clearCart, total, count }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
