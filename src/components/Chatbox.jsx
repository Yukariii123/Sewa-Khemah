import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'

// Jawapan simple berdasarkan kata kunci — boleh tambah sendiri
const FAQ = [
  { keys: ['harga', 'price', 'berapa'], reply: 'Harga sewaan berbeza ikut item & warna. Sila lihat kad produk untuk harga tepat, atau tanya nama item yang anda nak tahu.' },
  { keys: ['hantar', 'penghantaran', 'deliver'], reply: 'Kami hantar & ambil balik ikut tarikh majlis anda. Sila isi tarikh acara semasa checkout, admin akan sahkan slot penghantaran.' },
  { keys: ['bayar', 'payment', 'deposit'], reply: 'Pembayaran boleh dibuat melalui deposit dahulu, baki dibayar semasa penghantaran. Invois penuh akan dijana selepas tempahan disahkan.' },
  { keys: ['batal', 'cancel'], reply: 'Untuk pembatalan tempahan, sila hubungi admin terus melalui chat ini — admin akan proses secepat mungkin.' },
  { keys: ['warna', 'color', 'colour'], reply: 'Anda boleh tapis produk ikut warna kat halaman utama — cuma klik pada pill warna di atas senarai produk.' },
]

function getBotReply(text) {
  const lower = text.toLowerCase()
  const match = FAQ.find((f) => f.keys.some((k) => lower.includes(k)))
  return (
    match?.reply ||
    'Hmm, saya tak pasti jawapan tepat untuk itu 🙏 Admin akan reply mesej ni sebentar lagi ya!'
  )
}

export default function Chatbox() {
  const { user, profile } = useAuth()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!open || !user) return
    loadMessages()
    const channel = supabase
      .channel('chat_' + user.id)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `customer_id=eq.${user.id}` },
        (payload) => setMessages((prev) => [...prev, payload.new])
      )
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [open, user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  async function loadMessages() {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: true })
    setMessages(data || [])
  }

  async function send() {
    if (!text.trim() || !user) return
    const msg = text.trim()
    setText('')

    const optimistic = { id: 'temp-' + Date.now(), sender: 'customer', message: msg, created_at: new Date().toISOString() }
    setMessages((prev) => [...prev, optimistic])

    await supabase.from('chat_messages').insert({ customer_id: user.id, sender: 'customer', message: msg })

    const botReply = getBotReply(msg)
    setTimeout(async () => {
      const botMsg = { id: 'temp-bot-' + Date.now(), sender: 'bot', message: botReply, created_at: new Date().toISOString() }
      setMessages((prev) => [...prev, botMsg])
      await supabase.from('chat_messages').insert({ customer_id: user.id, sender: 'bot', message: botReply })
    }, 600)
  }

  if (!user || profile?.role === 'admin') return null

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-brand-500 text-white shadow-xl shadow-brand-400/50 flex items-center justify-center"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="fixed bottom-24 right-6 z-50 w-80 h-96 bg-white rounded-3xl shadow-2xl border border-brand-100 flex flex-col overflow-hidden"
          >
            <div className="bg-brand-500 text-white px-4 py-3 font-display font-bold">
              💬 Bantuan SewaMajlis
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.length === 0 && (
                <p className="text-sm text-brand-400 text-center mt-8">
                  Tanya apa-apa pasal tempahan anda 🙂
                </p>
              )}
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                    m.sender === 'customer'
                      ? 'ml-auto bg-brand-500 text-white rounded-br-sm'
                      : 'bg-brand-50 text-brand-800 rounded-bl-sm'
                  }`}
                >
                  {m.message}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <div className="p-2 border-t border-brand-100 flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Taip mesej..."
                className="flex-1 text-sm px-3 py-2 rounded-xl bg-brand-50 outline-none"
              />
              <button
                onClick={send}
                className="w-9 h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
