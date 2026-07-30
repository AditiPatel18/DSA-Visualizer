create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  username text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.learning_progress (
  user_id uuid references public.profiles(id) on delete cascade,
  algorithm_name text not null,
  category text default 'general',
  completed boolean default false,
  progress_value integer default 0,
  updated_at timestamptz default now(),
  primary key (user_id, algorithm_name)
);

create table if not exists public.favorites (
  user_id uuid references public.profiles(id) on delete cascade,
  item_name text not null,
  item_type text default 'algorithm',
  updated_at timestamptz default now(),
  primary key (user_id, item_name)
);

create table if not exists public.learning_statistics (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  algorithms_learned integer default 0,
  streak integer default 0,
  active_days integer default 0,
  total_hours text default '0h 0m',
  achievements integer default 0,
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.learning_progress enable row level security;
alter table public.favorites enable row level security;
alter table public.learning_statistics enable row level security;
DROP POLICY IF EXISTS profiles_self_select ON public.profiles;
CREATE POLICY profiles_self_select
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS profiles_self_update ON public.profiles;
CREATE POLICY profiles_self_update
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS profiles_self_insert ON public.profiles;
CREATE POLICY profiles_self_insert
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS progress_self_select ON public.learning_progress;
CREATE POLICY progress_self_select
ON public.learning_progress
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS progress_self_insert ON public.learning_progress;
CREATE POLICY progress_self_insert
ON public.learning_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS progress_self_update ON public.learning_progress;
CREATE POLICY progress_self_update
ON public.learning_progress
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS favorites_self_select ON public.favorites;
CREATE POLICY favorites_self_select
ON public.favorites
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS favorites_self_insert ON public.favorites;
CREATE POLICY favorites_self_insert
ON public.favorites
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS favorites_self_update ON public.favorites;
CREATE POLICY favorites_self_update
ON public.favorites
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS stats_self_select ON public.learning_statistics;
CREATE POLICY stats_self_select
ON public.learning_statistics
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS stats_self_insert ON public.learning_statistics;
CREATE POLICY stats_self_insert
ON public.learning_statistics
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS stats_self_update ON public.learning_statistics;
CREATE POLICY stats_self_update
ON public.learning_statistics
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);