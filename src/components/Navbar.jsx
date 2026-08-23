import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingCart, Tent, LayoutDashboard, LogOut, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'

export default function Navbar() {
  const { user, profile, isAdmin, signOut } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/')
  }

  return (
    <motion.nav
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="sticky top-0 z-40 backdrop-blur-lg bg-white/70 border-b border-brand-100 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-brand-700 text-xl">
          <span className="w-9 h-9 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-300/50">
            <Tent size={20} />
          </span>
          SewaMajlis
        </Link>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-500 px-3 py-2 rounded-xl hover:bg-brand-50 transition"
            >
              <LayoutDashboard size={18} /> Admin
            </Link>
          )}

          {!isAdmin && (
            <Link
              to="/my-orders"
              className="text-sm font-semibold text-brand-700 hover:text-brand-500 px-3 py-2 rounded-xl hover:bg-brand-50 transition"
            >
              Tempahan Saya
            </Link>
          )}

          <Link to="/cart" className="relative p-2.5 rounded-xl hover:bg-brand-50 transition">
            <ShoppingCart size={22} className="text-brand-700" />
            {count > 0 && (
              <motion.span
                key={count}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-accent-pink text-brand-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
              >
                {count}
              </motion.span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-brand-700">
                <User size={16} /> {profile?.full_name || 'Pengguna'}
              </span>
              <button
                onClick={handleLogout}
                className="p-2.5 rounded-xl hover:bg-red-50 text-red-500 transition"
                title="Log keluar"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-sm font-bold text-white bg-brand-500 hover:bg-brand-600 px-4 py-2 rounded-xl transition shadow-md shadow-brand-300/50"
            >
              Log Masuk
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  )
}
