import { motion } from 'framer-motion'

export default function CategoryFilter({
  categories,
  activeCategory,
  onCategory,
  colors,
  activeColor,
  onColor,
}) {
  return (
    <div className="flex flex-col gap-3 mb-8">
      <div className="flex flex-wrap gap-2">
        <FilterPill
          label="Semua Kategori"
          active={!activeCategory}
          onClick={() => onCategory(null)}
        />
        {categories.map((c) => (
          <FilterPill
            key={c.id}
            label={c.name}
            active={activeCategory === c.id}
            onClick={() => onCategory(c.id)}
          />
        ))}
      </div>

      {colors.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-brand-400 uppercase tracking-wide mr-1">
            Warna:
          </span>
          <FilterPill label="Semua" active={!activeColor} onClick={() => onColor(null)} small />
          {colors.map((color) => (
            <FilterPill
              key={color}
              label={color}
              active={activeColor === color}
              onClick={() => onColor(color)}
              small
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FilterPill({ label, active, onClick, small }) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className={`${small ? 'text-xs px-3 py-1.5' : 'text-sm px-4 py-2'} rounded-full font-semibold transition ${
        active
          ? 'bg-brand-500 text-white shadow-md shadow-brand-300/50'
          : 'bg-white text-brand-600 border border-brand-100 hover:border-brand-300'
      }`}
    >
      {label}
    </motion.button>
  )
}
