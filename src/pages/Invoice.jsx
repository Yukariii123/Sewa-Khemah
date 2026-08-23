import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useParams } from 'react-router-dom'
import { Printer, CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

export default function Invoice() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [orderItems, setOrderItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [id])

  async function load() {
    const [{ data: o }, { data: oi }] = await Promise.all([
      supabase.from('orders').select('*').eq('id', id).single(),
      supabase.from('order_items').select('*').eq('order_id', id),
    ])
    setOrder(o)
    setOrderItems(oi || [])
    setLoading(false)
  }

  if (loading) return <p className="text-center py-20 text-brand-400">Memuatkan invois...</p>
  if (!order) return <p className="text-center py-20 text-brand-400">Tempahan tidak dijumpai.</p>

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-xl border border-brand-100 p-8 print:shadow-none print:border-none"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-brand-800">Invois / Resit</h1>
            <p className="text-brand-400 text-sm">{order.order_no}</p>
          </div>
          <div className="flex items-center gap-1 text-emerald-600 font-bold text-sm">
            <CheckCircle2 size={16} /> {order.status}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          <Info label="Nama Pelanggan" value={order.customer_name} />
          <Info label="No. Telefon" value={order.customer_phone} />
          <Info label="Alamat" value={order.customer_address} full />
          <Info label="Tarikh Majlis" value={order.event_date} />
          <Info label="Tarikh Hantar" value={order.delivery_date} />
          <Info label="Tarikh Ambil Balik" value={order.pickup_date} />
          <Info label="Status Bayaran" value={order.payment_status} />
        </div>

        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="text-left text-brand-400 border-b border-brand-100">
              <th className="py-2">Item</th>
              <th className="py-2">Warna</th>
              <th className="py-2 text-center">Kuantiti</th>
              <th className="py-2 text-right">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {orderItems.map((it) => (
              <tr key={it.id} className="border-b border-brand-50">
                <td className="py-2 font-semibold text-brand-800">{it.item_name}</td>
                <td className="py-2 text-brand-500">{it.color || '-'}</td>
                <td className="py-2 text-center">{it.quantity}</td>
                <td className="py-2 text-right font-semibold">RM{Number(it.line_total).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-8">
          <div className="text-right">
            <p className="text-brand-400 text-sm">Jumlah Keseluruhan</p>
            <p className="font-display text-3xl font-extrabold text-brand-600">
              RM{Number(order.total).toFixed(2)}
            </p>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="print:hidden w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold flex items-center justify-center gap-2"
        >
          <Printer size={18} /> Cetak / Simpan PDF
        </button>
      </motion.div>
    </div>
  )
}

function Info({ label, value, full }) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <p className="text-brand-400 text-xs uppercase font-bold">{label}</p>
      <p className="text-brand-800 font-medium">{value || '-'}</p>
    </div>
  )
}
