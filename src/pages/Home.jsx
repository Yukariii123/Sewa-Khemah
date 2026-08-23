import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabaseClient'
import { useCart } from '../contexts/CartContext'
import ProductCard from '../components/ProductCard'
import CategoryFilter from '../components/CategoryFilter'

export default function Home() {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState(null)
  const [activeColor, setActiveColor] = useState(null)
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const [{ data: cats }, { data: prods }] = await Promise.all([
      supabase.from('categories').select('*').order('name'),
      supabase.from('items').select('*').eq('is_active', true).order('created_at', { ascending: false }),
    ])
    setCategories(cats || [])
    setItems(prods || [])
    setLoading(false)
  }

  const colors = useMemo(
    () => [...new Set(items.map((i) => i.color).filter(Boolean))],
    [items]
  )

  const filtered = items.filter((i) => {
    if (activeCategory && i.category_id !== activeCategory) return false
    if (activeColor && i.color !== activeColor) return false
    return true
  })

  function handleAdd(item) {
    addItem(
      { id: item.id, name: item.name, price: item.price, color: item.color, unit: item.unit, image: item.images?.[0] },
      1
    )
    toast.success(`${item.name} ditambah ke troli!`)
  }

  return (
    <div className="max-w-7xl mx-auto px-5 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h1 className="font-display text-4xl md:text-5xl font-extrabold text-brand-800 mb-3">
          Sewa Khemah &amp; Kerusi <span className="text-accent-pink">Untuk Majlis Anda</span> 🎪
        </h1>
        <p className="text-brand-500 max-w-xl mx-auto">
          Pilih pakej, tapis ikut kategori & warna, tempah terus — mudah &amp; pantas.
        </p>
      </motion.div>

      <CategoryFilter
        categories={categories}
        activeCategory={activeCategory}
        onCategory={setActiveCategory}
        colors={colors}
        activeColor={activeColor}
        onColor={setActiveColor}
      />

      {loading ? (
        <div className="text-center py-20 text-brand-400">Memuatkan produk...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-brand-400">Tiada item dijumpai.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map((item, idx) => (
            <ProductCard key={item.id} item={item} index={idx} onAdd={handleAdd} />
          ))}
        </div>
      )}
    </div>
  )
}
