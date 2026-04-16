-- ============================================
-- Helpdesk Ticket System — Supabase SQL Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Users table
create table if not exists users (
  id serial primary key,
  name text not null,
  email text unique not null,
  role text not null default 'user',   -- 'user' or 'admin'
  password_hash text not null,
  created_at timestamp with time zone default now()
);

-- Tickets table
create table if not exists tickets (
  id serial primary key,
  title text not null,
  description text,
  status text not null default 'open',  -- 'open', 'in_progress', 'closed'
  category text,                         -- 'technical', 'billing', 'general', 'hr'
  user_id int references users(id) on delete cascade,
  created_at timestamp with time zone default now()
);

-- Comments table
create table if not exists comments (
  id serial primary key,
  ticket_id int references tickets(id) on delete cascade,
  user_id int references users(id) on delete cascade,
  body text not null,
  created_at timestamp with time zone default now()
);

-- ============================================
-- Row Level Security (optional but recommended)
-- Disable for simplicity if using service key
-- ============================================
-- alter table users enable row level security;
-- alter table tickets enable row level security;
-- alter table comments enable row level security;

-- ============================================
-- Sample data to test locally (optional)
-- ============================================
-- After seeding via POST /api/auth/seed, you can
-- manually add sample tickets here if needed.
