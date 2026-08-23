import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'

export default function Checkout() {
  const { user, profile } = useAuth()
  const { items, total, clearCart } = useCart()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    customer_name: profile?.full_name || '',
    customer_phone: profile?.phone || '',
    customer_address: profile?.address || '',
    event_date: '',
    delivery_date: '',
    pickup_date: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (items.length === 0) return
    setLoading(true)

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        customer_id: user.id,
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
        customer_address: form.customer_address,
        event_date: form.event_date || null,
        delivery_date: form.delivery_date || null,
        pickup_date: form.pickup_date || null,
        notes: form.notes,
        subtotal: total,
        total: total,
      })
      .select()
      .single()

    if (error) {
      setLoading(false)
      return toast.error('Gagal buat tempahan: ' + error.message)
    }

    const orderItems = items.map((i) => ({
      order_id: order.id,
      item_id: i.id,
      item_name: i.name,
      color: i.color,
      quantity: i.qty,
      unit_price: i.price,
      line_total: i.price * i.qty,
    }))
    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

    setLoading(false)
    if (itemsError) return toast.error('Gagal simpan item tempahan: ' + itemsError.message)

    clearCart()
    toast.success('Tempahan berjaya dihantar!')
    navigate(`/invoice/${order.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <h1 className="font-display text-3xl font-extrabold text-brand-800 mb-6">Checkout</h1>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white/80 backdrop-blur rounded-3xl p-8 shadow-lg border border-brand-100 space-y-4"
      >
        <Field label="Nama Penuh" value={form.customer_name} onChange={(v) => update('customer_name', v)} required />
        <Field label="No. Telefon" value={form.customer_phone} onChange={(v) => update('customer_phone', v)} required />
        <Field label="Alamat Penghantaran" value={form.customer_address} onChange={(v) => update('customer_address', v)} textarea required />

        <div className="grid grid-cols-3 gap-3">
          <Field label="Tarikh Majlis" type="date" value={form.event_date} onChange={(v) => update('event_date', v)} />
          <Field label="Tarikh Hantar" type="date" value={form.delivery_date} onChange={(v) => update('delivery_date', v)} />
          <Field label="Tarikh Ambil" type="date" value={form.pickup_date} onChange={(v) => update('pickup_date', v)} />
        </div>

        <Field label="Nota Tambahan" value={form.notes} onChange={(v) => update('notes', v)} textarea />

        <div className="flex items-center justify-between pt-2 border-t border-brand-100">
          <span className="font-bold text-brand-700">Jumlah Bayar</span>
          <span className="text-2xl font-display font-extrabold text-brand-600">RM{total.toFixed(2)}</span>
        </div>

        <button
          disabled={loading}
          className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold transition disabled:opacity-50"
        >
          {loading ? 'Menghantar tempahan...' : 'Hantar Tempahan'}
        </button>
      </motion.form>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', textarea, required }) {
  return (
    <div>
      <label className="text-sm font-semibold text-brand-700">{label}</label>
      {textarea ? (
        <textarea
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          className="w-full mt-1 px-4 py-2.5 rounded-xl bg-brand-50 outline-none focus:ring-2 focus:ring-brand-300"
        />
      ) : (
        <input
          type={type}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full mt-1 px-4 py-2.5 rounded-xl bg-brand-50 outline-none focus:ring-2 focus:ring-brand-300"
        />
      )}
    </div>
  )
}
