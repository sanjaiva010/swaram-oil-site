-- ============================================
-- SWARAM OIL — Supabase database schema
-- Run this once in Supabase: Project → SQL Editor → New query → paste → Run
-- ============================================

-- Orders placed by customers
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  status text default 'placed' check (status in ('placed','packed','shipped','delivered','cancelled')),
  total numeric not null default 0,
  created_at timestamptz default now()
);

-- Individual line items within an order
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade not null,
  oil text not null,
  oil_name text not null,
  size text not null,
  qty int not null,
  price numeric not null
);

-- Coupons (for later use)
create table if not exists coupons (
  code text primary key,
  percent_off int not null,
  active boolean default true
);

-- ---- Row Level Security: customers can only see their own orders ----
alter table orders enable row level security;
alter table order_items enable row level security;

drop policy if exists "Users can view their own orders" on orders;
create policy "Users can view their own orders"
  on orders for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own orders" on orders;
create policy "Users can insert their own orders"
  on orders for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can view items in their own orders" on order_items;
create policy "Users can view items in their own orders"
  on order_items for select
  using (
    order_id in (select id from orders where user_id = auth.uid())
  );

drop policy if exists "Users can insert items into their own orders" on order_items;
create policy "Users can insert items into their own orders"
  on order_items for insert
  with check (
    order_id in (select id from orders where user_id = auth.uid())
  );

-- ============================================
-- Customer profiles (name, phone, address)
-- Collected at login and pre-filled at checkout.
-- ============================================
create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text,
  phone text,
  address text,
  pincode text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;

drop policy if exists "Users can view their own profile" on profiles;
create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own profile" on profiles;
create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own profile" on profiles;
create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = user_id);

-- ============================================
-- Customer reviews (stored in the DB so they
-- persist for everyone, unlike localStorage)
-- ============================================
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rating int not null check (rating between 1 and 5),
  text text not null,
  created_at timestamptz default now()
);

alter table reviews enable row level security;

drop policy if exists "Anyone can read reviews" on reviews;
create policy "Anyone can read reviews"
  on reviews for select
  using (true);

drop policy if exists "Authenticated users can add reviews" on reviews;
create policy "Authenticated users can add reviews"
  on reviews for insert
  with check (auth.role() = 'authenticated');

-- ============================================
-- Delivery details on orders (name, phone,
-- address) so the admin can deliver.
-- ============================================
alter table orders add column if not exists email text;
alter table orders add column if not exists name text;
alter table orders add column if not exists phone text;
alter table orders add column if not exists address text;
alter table orders add column if not exists pincode text;

-- Note: the admin dashboard (built separately) will need its own
-- service-role connection to read/update ALL orders — that's normal,
-- the service role key bypasses RLS and must never be used in the
-- customer-facing site's public code.