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

-- Coupons.  email = NULL means valid for everyone;
-- set to an email means valid for that customer ONLY.
-- (The admin site assigns per-customer coupons.)
create table if not exists coupons (
  code text primary key,
  percent_off int not null,
  email text,
  active boolean default true
);

alter table coupons add column if not exists email text;

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

-- Tracking timestamps for the status timeline
alter table orders add column if not exists accepted_at timestamptz;
alter table orders add column if not exists packed_at timestamptz;
alter table orders add column if not exists shipped_at timestamptz;
alter table orders add column if not exists delivered_at timestamptz;

-- ============================================
-- Address book — an address must be APPROVED by
-- the admin before it can be used at checkout.
-- (Swaram does its own delivery, so the admin
-- verifies the pincode/address first.)
-- ============================================
create table if not exists addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  label text default 'Home',
  name text,
  phone text,
  address text,
  pincode text,
  approved boolean default false,
  created_at timestamptz default now()
);

-- ============================================
-- Pincodes Swaram delivers to (admin maintains).
-- Checkout does a live "we deliver here / not yet".
-- ============================================
create table if not exists service_pincodes (
  pincode text primary key,
  area text default '',
  created_at timestamptz default now()
);

-- ============================================
-- Product-level reviews (one per oil) + avg rating
-- ============================================
create table if not exists product_reviews (
  id uuid primary key default gen_random_uuid(),
  oil text,
  user_id uuid,
  name text,
  rating int check (rating between 1 and 5),
  text text,
  created_at timestamptz default now()
);

-- ============================================
-- Cart sync: save the cart to the account so it
-- follows the user across devices.
-- ============================================
create table if not exists carts (
  user_id uuid primary key,
  items jsonb default '[]',
  updated_at timestamptz default now()
);

-- ============================================
-- Wishlist
-- ============================================
create table if not exists wishlist (
  user_id uuid not null,
  oil text not null,
  created_at timestamptz default now(),
  primary key (user_id, oil)
);

-- The admin app manages these with the anon key too
-- (same architecture as the existing admin tables),
-- so keep row level security disabled for them.
alter table addresses       disable row level security;
alter table service_pincodes disable row level security;
alter table product_reviews disable row level security;
alter table carts           disable row level security;
alter table wishlist        disable row level security;

-- Note: the admin dashboard (built separately) will need its own
-- service-role connection to read/update ALL orders — that's normal,
-- the service role key bypasses RLS and must never be used in the
-- customer-facing site's public code.