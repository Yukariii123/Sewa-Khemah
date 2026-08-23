import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Minus, Plus } from 'lucide-react'
import { useCart } from '../contexts/CartContext'

export default function Cart() {
  const { items, updateQty, removeItem, total } = useCart()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-20 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <h2 className="font-display text-2xl font-bold text-brand-800 mb-2">Troli anda kosong</h2>
        <Link to="/" className="text-brand-500 font-semibold hover:underline">
          ← Pergi tengok produk
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <h1 className="font-display text-3xl font-extrabold text-brand-800 mb-6">Troli Anda</h1>

      <div className="space-y-3">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id + item.color}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-4 bg-white/80 backdrop-blur rounded-2xl p-4 border border-brand-100 shadow-sm"
            >
              <img
                src={item.image || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=200'}
                className="w-16 h-16 rounded-xl object-cover"
                alt=""
              />
              <div className="flex-1">
                <p className="font-bold text-brand-800">{item.name}</p>
                {item.color && <p className="text-xs text-brand-400">Warna: {item.color}</p>}
                <p className="text-brand-600 font-semibold">RM{item.price.toFixed(2)} / {item.unit}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQty(item.id, item.color, item.qty - 1)}
                  className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600"
                >
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center font-bold">{item.qty}</span>
                <button
                  onClick={() => updateQty(item.id, item.color, item.qty + 1)}
                  className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600"
                >
                  <Plus size={14} />
                </button>
              </div>
              <button
                onClick={() => removeItem(item.id, item.color)}
                className="text-red-400 hover:text-red-600 p-2"
              >
                <Trash2 size={18} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-8 flex items-center justify-between bg-brand-500 text-white rounded-2xl px-6 py-5">
        <div>
          <p className="text-sm opacity-80">Jumlah Keseluruhan</p>
          <p className="text-2xl font-display font-extrabold">RM{total.toFixed(2)}</p>
        </div>
        <button
          onClick={() => navigate('/checkout')}
          className="bg-white text-brand-700 font-bold px-6 py-3 rounded-xl hover:bg-brand-50 transition"
        >
          Teruskan Checkout →
        </button>
      </div>
    </div>
  )
}
