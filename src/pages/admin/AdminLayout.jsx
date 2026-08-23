import { NavLink, Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, Boxes, ClipboardList, Receipt, TrendingUp } from 'lucide-react'

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/inventory', label: 'Inventori', icon: Boxes },
  { to: '/admin/orders', label: 'Tempahan', icon: ClipboardList },
  { to: '/admin/revenue', label: 'Revenue', icon: TrendingUp },
  { to: '/admin/receipts', label: 'Resit Lama', icon: Receipt },
]

export default function AdminLayout() {
  return (
    <div className="max-w-7xl mx-auto px-5 py-8 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white/80 backdrop-blur rounded-2xl border border-brand-100 p-3 h-fit sticky top-20"
      >
        <p className="text-xs font-bold text-brand-400 uppercase px-3 py-2">Admin Panel</p>
        <nav className="space-y-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-300/50'
                    : 'text-brand-600 hover:bg-brand-50'
                }`
              }
            >
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
      </motion.aside>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Outlet />
      </motion.div>
    </div>
  )
}
