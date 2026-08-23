import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn({ email, password })
    setLoading(false)
    if (error) return toast.error(error.message)
    toast.success('Berjaya log masuk!')
    navigate('/')
  }

  return (
    <div className="max-w-md mx-auto px-5 py-16">
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white/80 backdrop-blur rounded-3xl p-8 shadow-lg border border-brand-100"
      >
        <h1 className="font-display text-2xl font-extrabold text-brand-800 mb-1">Log Masuk</h1>
        <p className="text-brand-400 text-sm mb-6">Selamat kembali ke SewaMajlis 🎪</p>

        <label className="text-sm font-semibold text-brand-700">Emel</label>
        <input
          type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full mt-1 mb-4 px-4 py-2.5 rounded-xl bg-brand-50 outline-none focus:ring-2 focus:ring-brand-300"
        />

        <label className="text-sm font-semibold text-brand-700">Kata Laluan</label>
        <input
          type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full mt-1 mb-6 px-4 py-2.5 rounded-xl bg-brand-50 outline-none focus:ring-2 focus:ring-brand-300"
        />

        <button
          disabled={loading}
          className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold transition disabled:opacity-50"
        >
          {loading ? 'Sedang log masuk...' : 'Log Masuk'}
        </button>

        <p className="text-sm text-center text-brand-500 mt-4">
          Belum ada akaun? <Link to="/register" className="font-bold text-brand-700">Daftar</Link>
        </p>
      </motion.form>
    </div>
  )
}
