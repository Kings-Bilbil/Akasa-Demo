-- ========================================================
-- Schema Database Supabase untuk Demo Azuraya
-- Silakan *copy-paste* dan *Run* skrip ini di SQL Editor Supabase
-- ========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Tabel customers (Pelanggan)
-- Terikat erat dengan Supabase Auth (auth.users)
create table public.customers (
  id uuid references auth.users(id) primary key,
  full_name text not null,
  email text not null unique,
  phone text,
  accurate_customer_id text, -- Diisi ketika pertama kali checkout (sinkronisasi ke Accurate)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Mengaktifkan Row Level Security (RLS)
alter table public.customers enable row level security;
create policy "Users can view their own data" on public.customers for select using (auth.uid() = id);
create policy "Users can update their own data" on public.customers for update using (auth.uid() = id);

-- 2. Tabel branches_cache (Data Cabang)
create table public.branches_cache (
  id uuid default uuid_generate_v4() primary key,
  accurate_branch_id text not null unique,
  name text not null,
  address text,
  last_synced_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Tabel products_cache (Data Produk)
create table public.products_cache (
  id uuid default uuid_generate_v4() primary key,
  accurate_item_id text not null unique,
  name text not null,
  description text,
  price numeric not null default 0,
  image_url text,
  last_synced_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS untuk tabel publik (bisa dibaca siapa saja, tidak bisa diedit sembarangan)
alter table public.branches_cache enable row level security;
create policy "Anyone can read branches" on public.branches_cache for select using (true);

alter table public.products_cache enable row level security;
create policy "Anyone can read products" on public.products_cache for select using (true);

-- 4. Tabel orders (Pesanan)
create type order_status as enum ('pending_payment', 'paid', 'failed', 'cancelled');

create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  customer_id uuid references public.customers(id) not null,
  branch_id uuid references public.branches_cache(id) not null,
  status order_status default 'pending_payment' not null,
  total_amount numeric not null,
  accurate_sales_order_id text,
  accurate_sales_receipt_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: Pengguna hanya bisa melihat pesanannya sendiri
alter table public.orders enable row level security;
create policy "Users can view their own orders" on public.orders for select using (auth.uid() = customer_id);

-- 5. Tabel order_items (Detail Barang yang Dipesan)
create table public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) not null,
  product_id uuid references public.products_cache(id) not null,
  quantity integer not null,
  unit_price numeric not null
);

alter table public.order_items enable row level security;
-- Supaya user bisa baca isi order_items jika ia pemilik order-nya
create policy "Users can view their own order items" on public.order_items for select using (
  exists (
    select 1 from public.orders
    where orders.id = order_items.order_id
    and orders.customer_id = auth.uid()
  )
);

-- 6. Tabel payments (Transaksi Pembayaran Midtrans)
create table public.payments (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) not null,
  midtrans_transaction_id text,
  status text not null,
  method text,
  raw_notification_ref jsonb,
  proof_pdf_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.payments enable row level security;
create policy "Users can view their own payments" on public.payments for select using (
  exists (
    select 1 from public.orders
    where orders.id = payments.order_id
    and orders.customer_id = auth.uid()
  )
);

-- 7. Tabel sync_logs (Catatan Sinkronisasi Sistem)
-- Digunakan untuk keamanan dan rekam jejak, tidak untuk dibaca pengguna
create table public.sync_logs (
  id uuid default uuid_generate_v4() primary key,
  related_order_id uuid references public.orders(id),
  action text not null,
  status text not null,
  message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.sync_logs enable row level security;
-- Hanya backend (Service Role) yang bisa akses tabel log ini
