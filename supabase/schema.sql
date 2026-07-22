-- ============================================
-- LingoLive — Supabase (PostgreSQL) Schema
-- ============================================

create extension if not exists "uuid-ossp";

-- 1. USERS (mirrors Firebase-authenticated users)
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  firebase_uid text unique not null,
  email text unique not null,
  display_name text,
  avatar_url text,
  current_level int not null default 1,
  cefr_level text default 'B2',           -- B1, B2, C1, C2 etc.
  streak_days int not null default 0,
  last_active_at timestamptz,
  created_at timestamptz not null default now()
);

-- 2. LEVELS (1–100 metadata)
create table if not exists levels (
  id serial primary key,
  level_number int unique not null check (level_number between 1 and 100),
  title text not null,
  cefr_band text not null,                -- e.g. 'B2', 'C1'
  description text,
  required_vocab_count int default 0,
  required_reading_ids int[] default '{}',
  unlock_score_threshold numeric default 80.0, -- % accuracy to unlock next level
  created_at timestamptz not null default now()
);

-- 3. VOCABULARY (10,000-word bank)
create table if not exists vocabulary (
  id serial primary key,
  word text not null,
  definition text not null,
  example_sentence text,
  cefr_level text not null,               -- word difficulty tag
  level_id int references levels(id),
  part_of_speech text,
  pronunciation_ipa text,
  audio_url text,
  created_at timestamptz not null default now(),
  unique(word, cefr_level)
);
create index if not exists idx_vocabulary_level on vocabulary(level_id);
create index if not exists idx_vocabulary_cefr on vocabulary(cefr_level);

-- 4. READING PASSAGES (30 preset stories)
create table if not exists reading_passages (
  id serial primary key,
  title text not null,
  body text not null,
  cefr_level text not null,
  word_count int,
  level_id int references levels(id),
  created_at timestamptz not null default now()
);

-- 5. USER PROGRESS (levels, vocab, reading completion)
create table if not exists user_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  level_id int references levels(id),
  vocab_learned_ids int[] default '{}',
  reading_completed_ids int[] default '{}',
  quiz_best_score numeric default 0,
  conversation_sessions int default 0,
  is_level_complete boolean default false,
  last_attempted_test_id int default 0,
  quiz_state jsonb default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique(user_id, level_id)
);
create index if not exists idx_progress_user on user_progress(user_id);

-- 6. CONVERSATION SESSIONS (Gemma chat history, for scoring + review)
create table if not exists conversation_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  transcript jsonb not null default '[]', -- [{role, content, corrections}]
  grammar_score numeric,
  vocabulary_score numeric,
  fluency_notes text,
  created_at timestamptz not null default now()
);

-- 7. QUIZ ATTEMPTS (Gemma-generated dynamic tests)
create table if not exists quiz_attempts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  level_id int references levels(id),
  questions jsonb not null,               -- generated MCQs/fill-blank/error-spot
  answers jsonb,
  score numeric,
  created_at timestamptz not null default now()
);

-- 8. ANALYTICS (daily rollups)
create table if not exists analytics (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  activity_date date not null default current_date,
  time_spent_minutes int default 0,
  words_learned int default 0,
  conversation_score numeric,
  quiz_accuracy numeric,
  created_at timestamptz not null default now(),
  unique(user_id, activity_date)
);
create index if not exists idx_analytics_user_date on analytics(user_id, activity_date);

-- Row Level Security (recommended once Firebase UID is passed through
-- a custom JWT claim or a trusted backend service role)
alter table users enable row level security;
alter table user_progress enable row level security;
alter table conversation_sessions enable row level security;
alter table quiz_attempts enable row level security;
alter table analytics enable row level security;
