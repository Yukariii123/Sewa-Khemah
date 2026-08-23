import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[SewaMajlis] Supabase belum dikonfigurasi. Sila isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY dalam fail .env — lihat .env.example'
  )
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')
