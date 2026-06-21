-- ============================================================
-- TABLES
-- ============================================================

-- Profiles
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  plan text default 'free', -- 'free' | 'pro'
  tabs_limit integer default 50,
  collections_limit integer default 50,
  is_ordered boolean default false,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Collections
create table collections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  name text not null,
  color text default '#6366f1',
  created_at timestamp with time zone default timezone('utc', now())
);

-- Tabs
create table tabs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  collection_id uuid references collections(id) on delete set null,
  url text not null,
  title text,
  summary text,
  tags text[] default '{}',
  favicon_url text,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Orders
create table orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  cashfree_order_id text unique not null,
  amount integer not null,
  currency text default 'INR',
  status text default 'pending', -- 'pending' | 'paid' | 'failed'
  created_at timestamp with time zone default timezone('utc', now())
);


-- ============================================================
-- INDEXES
-- ============================================================

create index tabs_user_id_idx on tabs(user_id);
create index tabs_tags_idx on tabs using gin(tags);
create index tabs_collection_id_idx on tabs(collection_id);
create index collections_user_id_idx on collections(user_id);
create index orders_user_id_idx on orders(user_id);
create index orders_cashfree_order_id_idx on orders(cashfree_order_id);


-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles enable row level security;
alter table tabs enable row level security;
alter table collections enable row level security;
alter table orders enable row level security;

-- Profiles
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

CREATE POLICY "Users can update own public profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND plan = (SELECT plan FROM profiles WHERE id = auth.uid())
    AND tabs_limit = (SELECT tabs_limit FROM profiles WHERE id = auth.uid())
    AND collections_limit = (SELECT collections_limit FROM profiles WHERE id = auth.uid())
    AND is_ordered = (SELECT is_ordered FROM profiles WHERE id = auth.uid())
  );

-- Tabs
create policy "Users can view own tabs"
  on tabs for select using (auth.uid() = user_id);

create policy "Users can insert own tabs"
  on tabs for insert with check (auth.uid() = user_id);

create policy "Users can update own tabs"
  on tabs for update using (auth.uid() = user_id);

create policy "Users can delete own tabs"
  on tabs for delete using (auth.uid() = user_id);

-- Collections
create policy "Users can view own collections"
  on collections for select using (auth.uid() = user_id);

create policy "Users can insert own collections"
  on collections for insert with check (auth.uid() = user_id);

create policy "Users can update own collections"
  on collections for update using (auth.uid() = user_id);

create policy "Users can delete own collections"
  on collections for delete using (auth.uid() = user_id);

-- Orders
create policy "Users can view own orders"
  on orders for select using (auth.uid() = user_id);


-- ============================================================
-- FOREIGN KEY CASCADE VERIFICATION
-- ============================================================

-- Ensure tabs cascade correctly if collection is deleted
alter table tabs
  drop constraint if exists tabs_collection_id_fkey,
  add constraint tabs_collection_id_fkey
    foreign key (collection_id)
    references collections(id)
    on delete set null;

-- Ensure tabs cascade correctly if user is deleted
alter table tabs
  drop constraint if exists tabs_user_id_fkey,
  add constraint tabs_user_id_fkey
    foreign key (user_id)
    references profiles(id)
    on delete cascade;

-- Ensure collections cascade correctly if user is deleted
alter table collections
  drop constraint if exists collections_user_id_fkey,
  add constraint collections_user_id_fkey
    foreign key (user_id)
    references profiles(id)
    on delete cascade;

-- Ensure orders cascade correctly if user is deleted
alter table orders
  drop constraint if exists orders_user_id_fkey,
  add constraint orders_user_id_fkey
    foreign key (user_id)
    references profiles(id)
    on delete cascade;


-- ============================================================
-- CLEANUP (optional — run weekly to remove abandoned orders)
-- ============================================================

-- delete from orders
--   where status = 'pending'
--   and created_at < now() - interval '1 day';
