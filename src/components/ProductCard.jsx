import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Palette, PackageCheck, PackageX } from 'lucide-react'

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=60'

export default function ProductCard({ item, onAdd, index = 0 }) {
  const [hover, setHover] = useState(false)
  const img = item.images?.[0] || FALLBACK_IMG
  const inStock = item.available_quantity > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, delay: (index % 8) * 0.05, ease: 'easeOut' }}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      className="relative group bg-white/80 backdrop-blur rounded-3xl overflow-hidden border border-brand-100 shadow-sm hover:shadow-2xl hover:shadow-brand-200/60 transition-shadow"
    >
      <div className="relative h-48 overflow-hidden bg-brand-50">
        <motion.img
          src={img}
          alt={item.name}
          animate={{ scale: hover ? 1.08 : 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full h-full object-cover"
        />

        {/* Picture-in-picture floating detail preview */}
        <AnimatePresence>
          {hover && (
            <motion.div
              initial={{ opacity: 0, scale: 0.6, x: 20, y: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.6, x: 20, y: 20 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="absolute bottom-3 right-3 w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-xl rotate-3"
            >
              <img
                src={item.images?.[1] || img}
                alt=""
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <span
          className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
            inStock ? 'bg-accent-mint text-emerald-800' : 'bg-red-100 text-red-600'
          }`}
        >
          {inStock ? <PackageCheck size={13} /> : <PackageX size={13} />}
          {inStock ? `${item.available_quantity} tersedia` : 'Habis stok'}
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-display font-bold text-brand-900 text-lg leading-tight">
          {item.name}
        </h3>
        {item.color && (
          <div className="flex items-center gap-1.5 mt-1 text-sm text-brand-500">
            <Palette size={14} />
            {item.color}
          </div>
        )}
        <div className="flex items-end justify-between mt-3">
          <div>
            <span className="text-brand-600 font-display font-extrabold text-xl">
              RM{Number(item.price).toFixed(2)}
            </span>
            <span className="text-xs text-brand-400"> / {item.unit}</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            disabled={!inStock}
            onClick={() => onAdd(item)}
            className="text-sm font-bold px-4 py-2 rounded-xl bg-brand-500 text-white disabled:bg-gray-200 disabled:text-gray-400 hover:bg-brand-600 transition"
          >
            + Tambah
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
