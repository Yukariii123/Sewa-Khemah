import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabaseClient'

export default function Revenue() {
  const [rows, setRows] = useState([])
  const [totals, setTotals] = useState({ paid: 0, value: 0, orders: 0 })

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data } = await supabase.from('revenue_summary').select('*').limit(30)
    setRows(data || [])
    const paid = data?.reduce((s, r) => s + Number(r.revenue_paid || 0), 0) || 0
    const value = data?.reduce((s, r) => s + Number(r.total_value || 0), 0) || 0
    const orders = data?.reduce((s, r) => s + Number(r.total_orders || 0), 0) || 0
    setTotals({ paid, value, orders })
  }

  const maxVal = Math.max(...rows.map((r) => Number(r.total_value || 0)), 1)

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-brand-800 mb-6">Revenue</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Jumlah Dibayar" value={`RM${totals.paid.toFixed(2)}`} />
        <StatCard label="Jumlah Nilai Tempahan" value={`RM${totals.value.toFixed(2)}`} />
        <StatCard label="Bilangan Tempahan" value={totals.orders} />
      </div>

      <div className="bg-white/80 backdrop-blur rounded-2xl border border-brand-100 p-5">
        <h2 className="font-display font-bold text-brand-800 mb-4">30 Hari Terkini</h2>
        <div className="flex items-end gap-1.5 h-48">
          {rows.slice().reverse().map((r, idx) => (
            <motion.div
              key={r.day}
              initial={{ height: 0 }}
              animate={{ height: `${(Number(r.total_value) / maxVal) * 100}%` }}
              transition={{ delay: idx * 0.02 }}
              title={`${new Date(r.day).toLocaleDateString('ms-MY')}: RM${Number(r.total_value).toFixed(2)}`}
              className="flex-1 bg-brand-400 rounded-t-md hover:bg-brand-500 min-h-[4px]"
            />
          ))}
          {rows.length === 0 && <p className="text-brand-400 text-sm">Tiada data lagi.</p>}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur rounded-2xl border border-brand-100 p-5"
    >
      <p className="text-2xl font-display font-extrabold text-brand-800">{value}</p>
      <p className="text-xs text-brand-400 font-semibold">{label}</p>
    </motion.div>
  )
}
