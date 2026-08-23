-- =========================================================
-- SISTEM SEWA KHEMAH & KERUSI — Supabase Schema
-- Jalankan fail ni dalam Supabase SQL Editor (Project > SQL Editor > New query)
-- =========================================================

-- 1) PROFILES (extends auth.users) — simpan role admin/customer
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  address text,
  role text not null default 'customer' check (role in ('admin','customer')),
  created_at timestamptz default now()
);

-- 2) CATEGORIES (Khemah, Kerusi, Meja, Lain-lain...)
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz default now()
);

-- 3) ITEMS / PACKAGES (khemah, kerusi, dsb — dengan warna, kuantiti, gambar)
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  description text,
  color text,                      -- warna kain/kerusi
  price numeric(10,2) not null default 0,
  unit text default 'unit',        -- 'unit', 'set', 'hari'
  total_quantity int not null default 0,
  available_quantity int not null default 0,
  images text[] default '{}',      -- array URL gambar (Supabase Storage)
  is_package boolean default false,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4) ORDERS (tempahan)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_no text unique not null default ('ORD-' || to_char(now(),'YYYYMMDD') || '-' || substr(gen_random_uuid()::text,1,6)),
  customer_id uuid references public.profiles(id) on delete set null,
  customer_name text not null,
  customer_phone text,
  customer_address text not null,
  event_date date,                 -- tarikh majlis
  delivery_date date,              -- tarikh hantar
  pickup_date date,                -- tarikh ambil balik
  status text not null default 'pending'
    check (status in ('pending','confirmed','delivered','returned','completed','cancelled')),
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid','deposit','paid')),
  subtotal numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  notes text,
  confirmed_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5) ORDER ITEMS (barang dalam setiap tempahan)
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  item_id uuid references public.items(id) on delete set null,
  item_name text not null,         -- snapshot nama masa order dibuat
  color text,
  quantity int not null default 1,
  unit_price numeric(10,2) not null default 0,
  line_total numeric(10,2) not null default 0
);

-- 6) CHAT MESSAGES (chatbox simple)
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.profiles(id) on delete cascade,
  sender text not null check (sender in ('customer','admin','bot')),
  message text not null,
  created_at timestamptz default now()
);

-- =========================================================
-- TRIGGERS: auto update updated_at
-- =========================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_items_updated on public.items;
create trigger trg_items_updated before update on public.items
  for each row execute function public.set_updated_at();

drop trigger if exists trg_orders_updated on public.orders;
create trigger trg_orders_updated before update on public.orders
  for each row execute function public.set_updated_at();

-- Auto create profile on new auth signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), 'customer');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.chat_messages enable row level security;

-- Helper: check if current user is admin
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql stable security definer;

-- PROFILES policies
create policy "profiles: read own or admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles: update own or admin" on public.profiles
  for update using (id = auth.uid() or public.is_admin());
create policy "profiles: insert own" on public.profiles
  for insert with check (id = auth.uid());

-- CATEGORIES policies (public read, admin write)
create policy "categories: public read" on public.categories
  for select using (true);
create policy "categories: admin write" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- ITEMS policies (public read active items, admin full write)
create policy "items: public read active" on public.items
  for select using (is_active = true or public.is_admin());
create policy "items: admin write" on public.items
  for all using (public.is_admin()) with check (public.is_admin());

-- ORDERS policies (customer sees own, admin sees all)
create policy "orders: read own or admin" on public.orders
  for select using (customer_id = auth.uid() or public.is_admin());
create policy "orders: customer create own" on public.orders
  for insert with check (customer_id = auth.uid());
create policy "orders: update own pending or admin" on public.orders
  for update using (
    (customer_id = auth.uid() and status = 'pending') or public.is_admin()
  );

-- ORDER ITEMS policies
create policy "order_items: read via order ownership" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.customer_id = auth.uid() or public.is_admin())
    )
  );
create policy "order_items: insert via order ownership" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.customer_id = auth.uid() or public.is_admin())
    )
  );
create policy "order_items: admin update/delete" on public.order_items
  for all using (public.is_admin()) with check (public.is_admin());

-- CHAT policies
create policy "chat: read own thread or admin" on public.chat_messages
  for select using (customer_id = auth.uid() or public.is_admin());
create policy "chat: insert own thread or admin" on public.chat_messages
  for insert with check (customer_id = auth.uid() or public.is_admin());

-- =========================================================
-- STORAGE bucket untuk gambar item
-- =========================================================
insert into storage.buckets (id, name, public)
values ('item-images','item-images', true)
on conflict (id) do nothing;

create policy "item-images public read" on storage.objects
  for select using (bucket_id = 'item-images');
create policy "item-images admin write" on storage.objects
  for insert with check (bucket_id = 'item-images' and public.is_admin());
create policy "item-images admin update" on storage.objects
  for update using (bucket_id = 'item-images' and public.is_admin());
create policy "item-images admin delete" on storage.objects
  for delete using (bucket_id = 'item-images' and public.is_admin());

-- =========================================================
-- SEED DATA (contoh kategori + item)
-- =========================================================
insert into public.categories (name, slug) values
  ('Khemah', 'khemah'),
  ('Kerusi', 'kerusi'),
  ('Meja', 'meja'),
  ('Pakej Majlis', 'pakej')
on conflict (slug) do nothing;

-- =========================================================
-- VIEW: ringkasan revenue harian (untuk dashboard admin)
-- =========================================================
create or replace view public.revenue_summary as
select
  date_trunc('day', created_at) as day,
  count(*) as total_orders,
  sum(total) filter (where payment_status = 'paid') as revenue_paid,
  sum(total) as total_value
from public.orders
where status <> 'cancelled'
group by 1
order by 1 desc;
