import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'

const STATUS_STYLE = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  delivered: 'bg-purple-100 text-purple-700',
  returned: 'bg-indigo-100 text-indigo-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function MyOrders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [user])

  async function load() {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <h1 className="font-display text-3xl font-extrabold text-brand-800 mb-6">Tempahan Saya</h1>

      {loading ? (
        <p className="text-brand-400">Memuatkan...</p>
      ) : orders.length === 0 ? (
        <p className="text-brand-400">Belum ada tempahan lagi.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o, idx) => (
            <motion.div
              key={o.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link
                to={`/invoice/${o.id}`}
                className="flex items-center justify-between bg-white/80 backdrop-blur rounded-2xl p-4 border border-brand-100 shadow-sm hover:shadow-md transition"
              >
                <div>
                  <p className="font-bold text-brand-800">{o.order_no}</p>
                  <p className="text-xs text-brand-400">
                    {new Date(o.created_at).toLocaleDateString('ms-MY')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display font-extrabold text-brand-600">RM{Number(o.total).toFixed(2)}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[o.status]}`}>
                    {o.status}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
