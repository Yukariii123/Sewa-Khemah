# SewaMajlis — Sistem Sewa Khemah & Kerusi 🎪

Sistem web penuh untuk sewa khemah, kerusi, meja & pakej majlis — ada portal
**pelanggan** (browse, tempah, invois, chatbox) dan portal **admin**
(inventori, tempahan, revenue, resit). Dibina dengan **React + Vite +
Tailwind CSS v4 + Framer Motion + Supabase**.

## ✨ Ciri-ciri

**Pelanggan**
- Browse item ikut kategori & warna, dengan animation scroll-reveal + picture-in-picture hover preview
- Troli, checkout, dapat invois/resit terus (boleh cetak/simpan PDF)
- Lihat sejarah tempahan sendiri
- Chatbox ringkas (jawapan automatik + admin boleh reply terus dalam database)

**Admin**
- Dashboard realtime (tempahan baru masuk terus update tanpa refresh)
- Inventori: tambah/edit/padam item — nama, kategori, warna, harga, kuantiti, gambar (upload ke Supabase Storage), toggle tersedia/habis
- Urus tempahan: tukar status (pending → confirmed → delivered → returned → completed), status bayaran (unpaid/deposit/paid), lihat tarikh majlis/hantar/ambil
- Revenue: jumlah dibayar, jumlah nilai tempahan, graf 30 hari
- Resit lama: cari & lihat balik invois tempahan yang dah selesai

## 🧱 Struktur Projek

```
khemah-rental/
├── supabase/schema.sql      ← jalankan ni dalam Supabase SQL Editor
├── src/
│   ├── lib/supabaseClient.js
│   ├── contexts/            ← AuthContext, CartContext
│   ├── components/          ← Navbar, ProductCard, Chatbox, dll
│   └── pages/
│       ├── Home, Cart, Checkout, Invoice, MyOrders, Login, Register
│       └── admin/           ← Dashboard, Inventory, Orders, Revenue, Receipts
```

## 🚀 Setup (langkah demi langkah)

### 1. Buat projek Supabase
1. Pergi ke supabase.com → **New Project**
2. Bila siap, pergi **Project Settings → API** — salin **Project URL** dan **anon public key**

### 2. Jalankan database schema
1. Dalam Supabase dashboard, buka **SQL Editor → New query**
2. Copy semua isi kandungan `supabase/schema.sql` dalam projek ni, paste, dan **Run**
3. Ni akan buat semua table (profiles, categories, items, orders, order_items, chat_messages), row-level security, storage bucket untuk gambar, dan seed kategori asas (Khemah, Kerusi, Meja, Pakej Majlis)

### 3. Set environment variables
1. Copy `.env.example` → `.env`
2. Isi dengan URL & anon key dari langkah 1:
   ```
   VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxxxxxx
   ```

### 4. Install & run
```bash
npm install
npm run dev
```
Buka `http://localhost:5173`

### 5. Jadikan akaun anda sebagai Admin
1. Daftar akaun biasa dulu melalui halaman **Daftar** dalam web app
2. Dalam Supabase dashboard → **Table Editor → profiles**
3. Cari row dengan email/nama anda, tukar column `role` dari `customer` ke `admin`
4. Log masuk semula — link **Admin** akan muncul di navbar

### 6. Tambah item pertama
1. Log masuk sebagai admin → **Admin → Inventori → Tambah Item**
2. Isi nama, kategori, warna, harga, kuantiti, upload gambar
3. Item akan terus muncul di kedai (halaman utama) untuk pelanggan

## 🎨 Animation

- **Scroll reveal**: kad produk fade-in masa scroll masuk viewport (`whileInView` — Framer Motion)
- **Picture-in-picture hover**: bila hover kad produk, gambar kedua "float" keluar macam PiP kat sudut kad
- **Realtime feed**: dashboard admin ada senarai tempahan yang animate masuk bila ada order baru (guna Supabase Realtime subscription)

## 🔐 Keselamatan (RLS)

Semua table guna Row Level Security:
- Pelanggan cuma boleh baca/tulis order & chat **mereka sendiri**
- Admin (role = 'admin' dalam table `profiles`) boleh baca/tulis semua
- Gambar item disimpan dalam Storage bucket `item-images` (public read, admin-only write)

## 📦 Deploy

Boleh deploy terus ke **Vercel** atau **Netlify**:
1. Push projek ni ke GitHub
2. Import ke Vercel/Netlify
3. Set environment variables yang sama macam `.env` dalam settings platform
4. Deploy — siap!

## 🛠️ Nak tambah/ubah apa-apa?

- Tambah kaedah pembayaran online (Stripe/ToyyibPay/Billplz) → boleh sambungkan pada `Checkout.jsx`
- Chatbox admin-side (untuk admin reply mesej pelanggan) belum ada UI — data dah tersimpan dalam table `chat_messages`, boleh tambah page admin untuk baca & reply
- Nak WhatsApp notification bila order baru masuk → boleh guna Supabase Edge Function + WhatsApp API
