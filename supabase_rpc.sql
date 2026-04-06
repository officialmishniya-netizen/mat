-- Run this in Supabase SQL Editor AFTER schema.sql
-- This contains the highly concurrent transactional logic for the Matrix System

-- 1. Auto-Fill Matrix Logic (BFS Placement)
CREATE OR REPLACE FUNCTION place_in_matrix(p_user_id UUID, p_level_id INTEGER)
RETURNS UUID AS $$
DECLARE
  v_parent_id UUID;
  v_new_id UUID;
  v_position INTEGER;
BEGIN
  -- Find the oldest active spot in this level that has less than 2 downlines (2x matrix)
  -- FOR UPDATE locks the row to prevent double-placement race conditions.
  SELECT id INTO v_parent_id
  FROM public.user_levels
  WHERE level_id = p_level_id
    AND active = TRUE
    AND downline_count < 2
  ORDER BY created_at ASC
  LIMIT 1
  FOR UPDATE;

  -- Get the next global position number for this level
  SELECT COALESCE(MAX(position), 0) + 1 INTO v_position
  FROM public.user_levels
  WHERE level_id = p_level_id;

  -- Insert the new spot under the found parent
  INSERT INTO public.user_levels (user_id, level_id, position, parent_id, active, downline_count)
  VALUES (p_user_id, p_level_id, v_position, v_parent_id, TRUE, 0)
  RETURNING id INTO v_new_id;

  -- Increment the parent's downline count
  IF v_parent_id IS NOT NULL THEN
    UPDATE public.user_levels
    SET downline_count = downline_count + 1
    WHERE id = v_parent_id;
  END IF;

  RETURN v_new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Process Matrix Purchase and Bonuses (Transaction Safe)
CREATE OR REPLACE FUNCTION buy_matrix_level(p_user_id UUID, p_level_id INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  v_price NUMERIC;
  v_sponsor_bonus NUMERIC;
  v_sponsor_id UUID;
  v_free_ad_level_id INTEGER;
  v_purchases_enabled BOOLEAN;
  v_ad_credits_reward INTEGER;
  v_ad_cycles_reward INTEGER;
BEGIN
  -- 0. Check Global Toggle
  SELECT purchases_enabled INTO v_purchases_enabled FROM public.settings LIMIT 1;
  IF v_purchases_enabled = FALSE THEN
    RAISE EXCEPTION 'Global Level Purchases are currently disabled.';
  END IF;

  -- Get Level Info
  SELECT price, sponsor_bonus, ad_credits_reward, ad_cycles_reward 
  INTO v_price, v_sponsor_bonus, v_ad_credits_reward, v_ad_cycles_reward
  FROM public.levels
  WHERE id = p_level_id;

  -- Read sponsor_id
  SELECT sponsor_id INTO v_sponsor_id
  FROM public.users
  WHERE id = p_user_id;

  -- 1. Deduct cost from Ledger (Balance check is usually done in app before calling this, 
  --    but here we log the deduction).
  INSERT INTO public.ledger (user_id, amount, type, reference_id)
  VALUES (p_user_id, -v_price, 'matrix_purchase', p_level_id::TEXT);

  -- 5. Give Free PTC Level if configured
  SELECT free_ad_level_id INTO v_free_ad_level_id FROM public.levels WHERE id = p_level_id;
  IF v_free_ad_level_id IS NOT NULL THEN
      INSERT INTO public.user_ad_levels (user_id, ad_level_id)
      VALUES (p_user_id, v_free_ad_level_id);
  END IF;

  -- 6. Trigger Matrix Placement
  PERFORM public.place_in_matrix(p_user_id, p_level_id);

  -- 3. Pay Sponsor Bonus
  IF v_sponsor_id IS NOT NULL AND v_sponsor_bonus > 0 THEN
    INSERT INTO public.ledger (user_id, amount, type, reference_id)
    VALUES (v_sponsor_id, v_sponsor_bonus, 'referral_bonus', p_user_id::TEXT);
  END IF;

  -- 4. Award Ad Credits and Ad Cycles to the user
  IF v_ad_credits_reward > 0 OR v_ad_cycles_reward > 0 THEN
    UPDATE public.users 
    SET ad_credits = ad_credits + v_ad_credits_reward,
        ad_cycles = ad_cycles + v_ad_cycles_reward
    WHERE id = p_user_id;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Get Top Recruiters
CREATE OR REPLACE FUNCTION get_top_recruiters_v2()
RETURNS TABLE (
  id UUID,
  username TEXT,
  referral_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id, 
    u.username, 
    COUNT(r.id)::BIGINT as referral_count
  FROM public.users u
  LEFT JOIN public.users r ON r.sponsor_id = u.id
  GROUP BY u.id, u.username
  HAVING COUNT(r.id) > 0
  ORDER BY referral_count DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
