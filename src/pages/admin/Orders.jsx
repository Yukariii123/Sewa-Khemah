import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabaseClient'

const STATUSES = ['pending', 'confirmed', 'delivered', 'returned', 'completed', 'cancelled']
const PAYMENTS = ['unpaid', 'deposit', 'paid']

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    load()
    const channel = supabase
      .channel('admin_orders_manage')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, load)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  async function load() {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    setOrders(data || [])
  }

  async function updateField(id, field, value) {
    const { error } = await supabase.from('orders').update({ [field]: value }).eq('id', id)
    if (error) return toast.error('Gagal kemaskini: ' + error.message)
    toast.success('Dikemaskini!')
  }

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter)

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-brand-800 mb-4">Tempahan</h1>

      <div className="flex flex-wrap gap-2 mb-5">
        {['all', ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-xs font-bold px-3 py-1.5 rounded-full transition ${
              filter === s ? 'bg-brand-500 text-white' : 'bg-white text-brand-600 border border-brand-100'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((o, idx) => (
          <motion.div
            key={o.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            className="bg-white/80 backdrop-blur rounded-2xl border border-brand-100 p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Link to={`/invoice/${o.id}`} className="font-bold text-brand-800 hover:underline">
                  {o.order_no}
                </Link>
                <p className="text-xs text-brand-400">
                  {o.customer_name} · {o.customer_phone}
                </p>
                <p className="text-xs text-brand-400">{o.customer_address}</p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={o.status}
                  onChange={(e) => updateField(o.id, 'status', e.target.value)}
                  className="text-xs font-bold px-2 py-1.5 rounded-lg bg-brand-50 border border-brand-100"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <select
                  value={o.payment_status}
                  onChange={(e) => updateField(o.id, 'payment_status', e.target.value)}
                  className="text-xs font-bold px-2 py-1.5 rounded-lg bg-brand-50 border border-brand-100"
                >
                  {PAYMENTS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                <span className="font-display font-extrabold text-brand-600">RM{Number(o.total).toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-3 text-xs text-brand-500">
              <span>🎪 Majlis: {o.event_date || '-'}</span>
              <span>🚚 Hantar: {o.delivery_date || '-'}</span>
              <span>📦 Ambil balik: {o.pickup_date || '-'}</span>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && <p className="text-brand-400 text-sm">Tiada tempahan.</p>}
      </div>
    </div>
  )
}
