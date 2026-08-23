import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'

export default function Receipts() {
  const [orders, setOrders] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .in('status', ['completed', 'returned'])
      .order('created_at', { ascending: false })
    setOrders(data || [])
  }

  const filtered = orders.filter(
    (o) =>
      o.order_no.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-brand-800 mb-4">Resit Lama</h1>

      <div className="relative mb-5 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari no. tempahan atau nama..."
          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-brand-100 outline-none focus:ring-2 focus:ring-brand-300"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((o, idx) => (
          <motion.div
            key={o.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: idx * 0.02 }}
          >
            <Link
              to={`/invoice/${o.id}`}
              className="flex items-center justify-between bg-white/80 backdrop-blur rounded-xl px-4 py-3 border border-brand-100 hover:shadow-md transition"
            >
              <span className="font-semibold text-brand-700">{o.order_no}</span>
              <span className="text-brand-500 text-sm">{o.customer_name}</span>
              <span className="text-xs text-brand-400">{new Date(o.created_at).toLocaleDateString('ms-MY')}</span>
              <span className="font-bold text-brand-600">RM{Number(o.total).toFixed(2)}</span>
            </Link>
          </motion.div>
        ))}
        {filtered.length === 0 && <p className="text-brand-400 text-sm">Tiada resit dijumpai.</p>}
      </div>
    </div>
  )
}
