-- The Ultimate PTC & Matrix Platform Database Schema
-- Run this in your Supabase SQL Editor

-- 1. Custom Types
CREATE TYPE user_role AS ENUM ('admin', 'user');

-- 2. Users Table (Extends Supabase Auth implicitly through mapping)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  telegram_username TEXT,
  role user_role DEFAULT 'user',
  sponsor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ad_credits INTEGER DEFAULT 0,
  ad_cycles INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active'
);

-- 3. Settings Table (Global Admin Configuration & White-labeling)
CREATE TABLE IF NOT EXISTS public.settings (
  id SERIAL PRIMARY KEY,
  site_name TEXT DEFAULT 'PTC Matrix Platform',
  logo_url TEXT DEFAULT '',
  primary_color TEXT DEFAULT '#ea580c',  -- orange-600
  secondary_color TEXT DEFAULT '#fdba74', -- orange-300
  nowpayments_api_key TEXT DEFAULT '',
  withdrawal_fee_percent NUMERIC(5, 2) DEFAULT 0.00,
  service_fee_percent NUMERIC(5, 2) DEFAULT 0.00,
  seo_title TEXT DEFAULT 'Earn with the Ultimate Matrix',
  seo_description TEXT DEFAULT 'Join the premier PTC and Matrix platform.',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings row
INSERT INTO public.settings (id) VALUES (1) ON CONFLICT DO NOTHING;

-- 4. The Ledger Table (The Source of Truth)
CREATE TABLE IF NOT EXISTS public.ledger (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  amount NUMERIC(15, 2) NOT NULL, -- Core decimal tracking
  type TEXT NOT NULL, -- e.g., 'deposit', 'withdrawal', 'ad_reward', 'matrix_cycle', 'referral_bonus'
  reference_id TEXT, -- e.g., ad_id or level_id causing the transaction
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Matrix Levels Configuration
CREATE TABLE IF NOT EXISTS public.levels (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(15, 2) NOT NULL,
  sponsor_bonus NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  matching_bonus NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  referral_requirement INTEGER DEFAULT 0,
  cycle_size INTEGER DEFAULT 2 NOT NULL, -- Number of filled spots required to cycle
  cycle_reward NUMERIC(15, 2) NOT NULL DEFAULT 0.00, -- The payout for cycling
  matrix_type TEXT DEFAULT 'company_force' NOT NULL, -- 'company_force' or 'personal_force'
  auto_rebuy BOOLEAN DEFAULT FALSE NOT NULL, -- Checkbox to force purchase another position upon cycle completion
  ad_credits_reward INTEGER DEFAULT 0 NOT NULL, -- Number of ad credits given upon purchase
  ad_cycles_reward INTEGER DEFAULT 0 NOT NULL, -- Number of ad cycles given upon purchase
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. User Matrix Positions (The Tree)
CREATE TABLE IF NOT EXISTS public.user_levels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  level_id INTEGER REFERENCES public.levels(id) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  position INTEGER NOT NULL, -- Position in the specific level's tree (BFS ordering)
  parent_id UUID REFERENCES public.user_levels(id), -- Who they are under in the matrix
  downline_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Ads Module
CREATE TABLE IF NOT EXISTS public.ads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  duration INTEGER NOT NULL, -- in seconds
  reward NUMERIC(15, 2) NOT NULL,
  daily_limit INTEGER DEFAULT NULL, -- Max overall views per day (budget)
  global_limit INTEGER DEFAULT NULL, -- Max overall views across the lifetime of the ad before it expires
  cooldown INTEGER DEFAULT 30, -- seconds you must wait before watching another ad
  min_level_id INTEGER DEFAULT 0, -- Minimum user level required to watch
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Ad Views (Tracking completion and preventing double-watching within cooldown)
CREATE TABLE IF NOT EXISTS public.ad_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) NOT NULL,
    ad_id UUID REFERENCES public.ads(id) NOT NULL,
    ip_address TEXT NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, ad_id, completed_at)
);

-- 9. Promotion Center (Marketing Materials)
CREATE TABLE IF NOT EXISTS public.marketing_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'banner' NOT NULL, -- 'banner', 'gif', 'text'
  media_url TEXT NOT NULL,
  target_url TEXT, -- Base URL to append ref to, if applicable
  dimensions TEXT, -- e.g., '468x60', '728x90'
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Ad Levels (PTC Cycle Tiers)
CREATE TABLE IF NOT EXISTS public.ad_levels (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  price NUMERIC(15, 2) NOT NULL,
  member_earning NUMERIC(15, 3) DEFAULT 0.000,
  sponsor_bonus_per_click NUMERIC(15, 3) DEFAULT 0.000,
  platform_fee_per_click NUMERIC(15, 3) DEFAULT 0.000,
  clicks_per_cycle INTEGER DEFAULT 1,
  repurchase_required BOOLEAN DEFAULT TRUE,
  next_upgrade_level_id INTEGER,
  withdrawal_on_completion NUMERIC(15, 2) DEFAULT 0.00,
  total_cycle_revenue NUMERIC(15, 2) DEFAULT 0.00,
  matching_bonus_on_cycle NUMERIC(15, 2) DEFAULT 0.00,
  payouts_enabled BOOLEAN DEFAULT TRUE,
  min_withdrawal_amount NUMERIC(15, 2) DEFAULT 0.00,
  admin_cycle_fee NUMERIC(15, 2) DEFAULT 0.00,
  earning_multiplier NUMERIC(10, 4) DEFAULT 1.0000,
  requirement_level_id INTEGER, -- Linkage to another Ad Level
  threshold_qty INTEGER DEFAULT 0,
  daily_ad_limit INTEGER DEFAULT 0,
  ad_timer_seconds INTEGER DEFAULT 0,
  ad_credit_reward_per_watch NUMERIC(15, 4) DEFAULT 0.0000,
  ad_credits_on_purchase NUMERIC(15, 2) DEFAULT 0.00,
  ad_credits_on_cycle NUMERIC(15, 2) DEFAULT 0.00,
  ad_submission_cost NUMERIC(15, 2) DEFAULT 0.00,
  weekly_service_fee NUMERIC(15, 2) DEFAULT 0.00,
  enable_weekly_fee BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. User Ad Level Progress
CREATE TABLE IF NOT EXISTS public.user_ad_levels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  ad_level_id INTEGER REFERENCES public.ad_levels(id) NOT NULL,
  clicks_completed INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'expired'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Row Level Security Policies
-- (We will define strict policies here in the future if we use client-side supabase access heavily. 
-- For now, most sensitive ledger calculations will be done via server actions.)

-- 13. Withdrawals
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  amount NUMERIC(20, 4) NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  payment_method TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Indexes for performance
CREATE INDEX idx_ledger_user ON public.ledger(user_id);
CREATE INDEX idx_user_levels_level ON public.user_levels(level_id, position);
CREATE INDEX idx_ad_views_user ON public.ad_views(user_id, ad_id);
