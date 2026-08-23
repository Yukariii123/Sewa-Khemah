import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, X, Upload } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'

const EMPTY = {
  id: null, category_id: '', name: '', description: '', color: '',
  price: '', unit: 'unit', total_quantity: 0, available_quantity: 0,
  images: [], is_active: true,
}

export default function Inventory() {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(null) // null = closed, EMPTY-shaped = open
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const [{ data: it }, { data: cats }] = await Promise.all([
      supabase.from('items').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ])
    setItems(it || [])
    setCategories(cats || [])
  }

  function openNew() {
    setForm({ ...EMPTY, category_id: categories[0]?.id || '' })
  }

  function openEdit(item) {
    setForm({ ...item })
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const path = `${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('item-images').upload(path, file)
    if (error) {
      toast.error('Gagal upload gambar: ' + error.message)
      setUploading(false)
      return
    }
    const { data } = supabase.storage.from('item-images').getPublicUrl(path)
    setForm((f) => ({ ...f, images: [...(f.images || []), data.publicUrl] }))
    setUploading(false)
  }

  function removeImage(url) {
    setForm((f) => ({ ...f, images: f.images.filter((i) => i !== url) }))
  }

  async function handleSave(e) {
    e.preventDefault()
    const payload = {
      category_id: form.category_id || null,
      name: form.name,
      description: form.description,
      color: form.color,
      price: Number(form.price) || 0,
      unit: form.unit,
      total_quantity: Number(form.total_quantity) || 0,
      available_quantity: Number(form.available_quantity) || 0,
      images: form.images || [],
      is_active: form.is_active,
    }

    let error
    if (form.id) {
      ;({ error } = await supabase.from('items').update(payload).eq('id', form.id))
    } else {
      ;({ error } = await supabase.from('items').insert(payload))
    }

    if (error) return toast.error('Gagal simpan: ' + error.message)
    toast.success('Item disimpan!')
    setForm(null)
    load()
  }

  async function handleDelete(id) {
    if (!confirm('Padam item ini?')) return
    const { error } = await supabase.from('items').delete().eq('id', id)
    if (error) return toast.error('Gagal padam: ' + error.message)
    toast.success('Item dipadam.')
    load()
  }

  async function toggleAvailability(item) {
    const newQty = item.available_quantity > 0 ? 0 : item.total_quantity
    await supabase.from('items').update({ available_quantity: newQty }).eq('id', item.id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-extrabold text-brand-800">Inventori</h1>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white font-bold px-4 py-2.5 rounded-xl transition"
        >
          <Plus size={18} /> Tambah Item
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            className="bg-white/80 backdrop-blur rounded-2xl border border-brand-100 shadow-sm overflow-hidden"
          >
            <img
              src={item.images?.[0] || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400'}
              className="w-full h-32 object-cover"
              alt=""
            />
            <div className="p-4">
              <p className="font-bold text-brand-800">{item.name}</p>
              <p className="text-xs text-brand-400">{item.color} · RM{Number(item.price).toFixed(2)}/{item.unit}</p>
              <p className="text-xs mt-1">
                Stok: <b>{item.available_quantity}</b> / {item.total_quantity}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => toggleAvailability(item)}
                  className={`text-xs font-bold px-2.5 py-1.5 rounded-lg ${
                    item.available_quantity > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                  }`}
                >
                  {item.available_quantity > 0 ? 'Tersedia' : 'Habis'}
                </button>
                <button onClick={() => openEdit(item)} className="ml-auto p-2 rounded-lg hover:bg-brand-50 text-brand-500">
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {form && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setForm(null)}
          >
            <motion.form
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleSave}
              className="bg-white rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-xl text-brand-800">
                  {form.id ? 'Kemaskini Item' : 'Item Baru'}
                </h2>
                <button type="button" onClick={() => setForm(null)}><X size={20} /></button>
              </div>

              <div className="space-y-3">
                <Field label="Nama Item" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} required />

                <div>
                  <label className="text-sm font-semibold text-brand-700">Kategori</label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                    className="w-full mt-1 px-4 py-2.5 rounded-xl bg-brand-50 outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <Field label="Warna" value={form.color} onChange={(v) => setForm((f) => ({ ...f, color: v }))} />
                <Field label="Deskripsi" value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} textarea />

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Harga (RM)" type="number" value={form.price} onChange={(v) => setForm((f) => ({ ...f, price: v }))} required />
                  <Field label="Unit" value={form.unit} onChange={(v) => setForm((f) => ({ ...f, unit: v }))} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Kuantiti Total" type="number" value={form.total_quantity} onChange={(v) => setForm((f) => ({ ...f, total_quantity: v }))} />
                  <Field label="Kuantiti Tersedia" type="number" value={form.available_quantity} onChange={(v) => setForm((f) => ({ ...f, available_quantity: v }))} />
                </div>

                <div>
                  <label className="text-sm font-semibold text-brand-700">Gambar</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {(form.images || []).map((url) => (
                      <div key={url} className="relative">
                        <img src={url} className="w-16 h-16 rounded-lg object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(url)}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <label className="w-16 h-16 rounded-lg border-2 border-dashed border-brand-300 flex items-center justify-center cursor-pointer text-brand-400 hover:bg-brand-50">
                      {uploading ? '...' : <Upload size={18} />}
                      <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                    </label>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm font-semibold text-brand-700">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                  />
                  Aktif (dipaparkan di kedai)
                </label>
              </div>

              <button className="w-full mt-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold">
                Simpan Item
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', textarea, required }) {
  return (
    <div>
      <label className="text-sm font-semibold text-brand-700">{label}</label>
      {textarea ? (
        <textarea
          value={value} onChange={(e) => onChange(e.target.value)} rows={2}
          className="w-full mt-1 px-4 py-2.5 rounded-xl bg-brand-50 outline-none"
        />
      ) : (
        <input
          type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full mt-1 px-4 py-2.5 rounded-xl bg-brand-50 outline-none"
        />
      )}
    </div>
  )
}
