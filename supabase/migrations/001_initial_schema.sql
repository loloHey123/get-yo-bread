-- Users profile (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  hourly_rate decimal not null default 0,
  expected_hours_per_week decimal not null default 40,
  location text,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "Users can read own data"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own data"
  on public.users for update
  using (auth.uid() = id);

create policy "Users can insert own data"
  on public.users for insert
  with check (auth.uid() = id);

-- Physical NFC bread toys
create table public.breads (
  id uuid default gen_random_uuid() primary key,
  nfc_uid text unique not null,
  user_id uuid references public.users(id) on delete set null,
  linked_at timestamptz
);

alter table public.breads enable row level security;

create policy "Anyone can read breads to check link status"
  on public.breads for select
  using (true);

create policy "Authenticated users can claim unlinked breads"
  on public.breads for update
  using (auth.uid() is not null);

create policy "Allow insert for bread registration"
  on public.breads for insert
  with check (true);

-- Time entries
create table public.time_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  clock_in timestamptz not null default now(),
  clock_out timestamptz,
  earnings decimal
);

alter table public.time_entries enable row level security;

create policy "Users can read own time entries"
  on public.time_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert own time entries"
  on public.time_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update own time entries"
  on public.time_entries for update
  using (auth.uid() = user_id);

-- Preferences
create table public.preferences (
  user_id uuid references public.users(id) on delete cascade primary key,
  bakery_prefs text[] not null default '{}',
  allergies text[] not null default '{}'
);

alter table public.preferences enable row level security;

create policy "Users can read own preferences"
  on public.preferences for select
  using (auth.uid() = user_id);

create policy "Users can upsert own preferences"
  on public.preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update own preferences"
  on public.preferences for update
  using (auth.uid() = user_id);

-- Curated bakery items (admin-managed)
create table public.curated_items (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text not null,
  image_url text,
  tags text[] not null default '{}',
  allergens text[] not null default '{}',
  seasonal boolean not null default false,
  active boolean not null default true
);

alter table public.curated_items enable row level security;

create policy "Anyone can read active curated items"
  on public.curated_items for select
  using (active = true);

-- Recommendations (what users received)
create table public.recommendations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  item_id uuid references public.curated_items(id) on delete cascade not null,
  week_of date not null,
  tried boolean not null default false,
  shelf_position integer,
  created_at timestamptz not null default now(),
  unique(user_id, week_of)
);

alter table public.recommendations enable row level security;

create policy "Users can read own recommendations"
  on public.recommendations for select
  using (auth.uid() = user_id);

create policy "Users can update own recommendations"
  on public.recommendations for update
  using (auth.uid() = user_id);

create policy "System can insert recommendations"
  on public.recommendations for insert
  with check (auth.uid() = user_id);

-- Seed some curated items for development
insert into public.curated_items (name, description, image_url, tags, allergens, seasonal) values
  ('Chocolate Babka', 'A rich, swirled chocolate bread that''s part cake, part heaven. The ultimate Friday treat.', '/placeholder-bread.svg', '{"pastry","chocolate","bread"}', '{"gluten","dairy"}', false),
  ('Almond Croissant', 'Flaky, buttery, with a frangipane filling that makes Monday mornings worth it.', '/placeholder-bread.svg', '{"pastry","croissant","nuts"}', '{"gluten","dairy","nuts"}', false),
  ('Sourdough Loaf', 'Crusty outside, tangy inside. The bread that started a pandemic hobby.', '/placeholder-bread.svg', '{"bread","sourdough"}', '{"gluten"}', false),
  ('Kouign-Amann', 'A Breton pastry that''s basically caramelized butter in bread form. You deserve this.', '/placeholder-bread.svg', '{"pastry","caramel"}', '{"gluten","dairy"}', false),
  ('Cinnamon Roll', 'Soft, gooey, dripping with icing. The hug you earned this week.', '/placeholder-bread.svg', '{"pastry","cinnamon","sweet"}', '{"gluten","dairy"}', false),
  ('Pain au Chocolat', 'Two bars of dark chocolate wrapped in buttery puff pastry. Simple. Perfect.', '/placeholder-bread.svg', '{"pastry","chocolate","croissant"}', '{"gluten","dairy"}', false),
  ('Focaccia', 'Dimpled, olive-oiled, herb-topped flatbread. Savory Friday energy.', '/placeholder-bread.svg', '{"bread","savory","herbs"}', '{"gluten"}', false),
  ('Matcha Mochi Donut', 'Chewy, earthy, coated in glaze. A modern classic.', '/placeholder-bread.svg', '{"donut","matcha","sweet"}', '{"gluten","dairy"}', false),
  ('Cardamom Bun', 'Swedish-style, fragrant with cardamom, knotted with love.', '/placeholder-bread.svg', '{"pastry","cardamom","sweet"}', '{"gluten","dairy"}', false),
  ('Everything Bagel', 'Garlic, onion, sesame, poppy, salt. Everything you need to end the week.', '/placeholder-bread.svg', '{"bread","bagel","savory"}', '{"gluten","sesame"}', false),
  ('Pumpkin Spice Scone', 'Fall in pastry form. Warm spices, tender crumb.', '/placeholder-bread.svg', '{"pastry","pumpkin","sweet"}', '{"gluten","dairy"}', true),
  ('Hot Cross Buns', 'Spiced, fruited, glazed. A spring tradition in bread form.', '/placeholder-bread.svg', '{"bread","sweet","spiced"}', '{"gluten","dairy"}', true);
