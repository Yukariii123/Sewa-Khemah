import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AnimatePresence } from 'framer-motion'
import { TrendingUp, ShoppingBag, PackageCheck, Clock } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'

export default function Dashboard() {
  const [stats, setStats] = useState({ totalOrders: 0, pending: 0, revenue: 0, lowStock: 0 })
  const [recentOrders, setRecentOrders] = useState([])

  useEffect(() => {
    loadStats()

    const channel = supabase
      .channel('admin_orders_feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        loadStats()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  async function loadStats() {
    const { data: orders } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    const { data: items } = await supabase.from('items').select('id, available_quantity').lte('available_quantity', 2)

    const totalOrders = orders?.length || 0
    const pending = orders?.filter((o) => o.status === 'pending').length || 0
    const revenue = orders?.filter((o) => o.payment_status === 'paid').reduce((s, o) => s + Number(o.total), 0) || 0

    setStats({ totalOrders, pending, revenue, lowStock: items?.length || 0 })
    setRecentOrders((orders || []).slice(0, 8))
  }

  const cards = [
    { label: 'Jumlah Tempahan', value: stats.totalOrders, icon: ShoppingBag, color: 'bg-brand-500' },
    { label: 'Menunggu Sahkan', value: stats.pending, icon: Clock, color: 'bg-yellow-500' },
    { label: 'Revenue (Dibayar)', value: `RM${stats.revenue.toFixed(2)}`, icon: TrendingUp, color: 'bg-emerald-500' },
    { label: 'Stok Rendah', value: stats.lowStock, icon: PackageCheck, color: 'bg-red-500' },
  ]

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-brand-800 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c, idx) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.07 }}
            className="bg-white/80 backdrop-blur rounded-2xl p-5 border border-brand-100 shadow-sm"
          >
            <div className={`w-9 h-9 rounded-xl ${c.color} text-white flex items-center justify-center mb-3`}>
              <c.icon size={18} />
            </div>
            <p className="text-2xl font-display font-extrabold text-brand-800">{c.value}</p>
            <p className="text-xs text-brand-400 font-semibold">{c.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-white/80 backdrop-blur rounded-2xl border border-brand-100 p-5">
        <h2 className="font-display font-bold text-brand-800 mb-3">Tempahan Terkini (Realtime)</h2>
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {recentOrders.map((o) => (
              <motion.div
                key={o.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between text-sm px-3 py-2.5 rounded-xl hover:bg-brand-50"
              >
                <span className="font-semibold text-brand-700">{o.order_no}</span>
                <span className="text-brand-500">{o.customer_name}</span>
                <span className="font-bold text-brand-600">RM{Number(o.total).toFixed(2)}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-100 text-brand-700">
                  {o.status}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
          {recentOrders.length === 0 && <p className="text-brand-400 text-sm">Belum ada tempahan.</p>}
        </div>
      </div>
    </div>
  )
}
