CREATE TABLE "ad_cycle_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"position_id" uuid,
	"cycle_number" integer NOT NULL,
	"base_payout" numeric(15, 4) NOT NULL,
	"spin_bonus_amount" numeric(15, 4) DEFAULT '0',
	"cycle_multiplier_applied" integer DEFAULT 1,
	"total_paid_to_user" numeric(15, 4) NOT NULL,
	"sponsor_bonus_paid" numeric(15, 4) NOT NULL,
	"community_pool_contribution" numeric(15, 4) NOT NULL,
	"auto_rebuy_amount" numeric(15, 4) DEFAULT '0',
	"spin_wheel_used" boolean DEFAULT false,
	"total_spins_used" integer DEFAULT 0,
	"spin_results" jsonb DEFAULT '[]',
	"cycle_started_at" timestamp,
	"days_to_complete" integer,
	"rebuy_created" boolean DEFAULT false,
	"new_position_id" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ad_impressions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ad_id" uuid,
	"user_id" uuid,
	"advertiser_id" uuid,
	"view_duration_seconds" integer,
	"country" text,
	"device_type" text,
	"clicked" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ad_levels" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"price" numeric(15, 2) NOT NULL,
	"member_earning" numeric(15, 3) DEFAULT '0.000' NOT NULL,
	"sponsor_bonus_per_click" numeric(15, 3) DEFAULT '0.000' NOT NULL,
	"platform_fee_per_click" numeric(15, 3) DEFAULT '0.000' NOT NULL,
	"clicks_per_cycle" integer DEFAULT 1 NOT NULL,
	"repurchase_required" boolean DEFAULT true NOT NULL,
	"next_upgrade_level_id" integer,
	"withdrawal_on_completion" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"total_cycle_revenue" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"matching_bonus_on_cycle" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"payouts_enabled" boolean DEFAULT true NOT NULL,
	"min_withdrawal_amount" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"admin_cycle_fee" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"earning_multiplier" numeric(10, 4) DEFAULT '1.0000' NOT NULL,
	"requirement_level_id" integer,
	"threshold_qty" integer DEFAULT 0 NOT NULL,
	"daily_ad_limit" integer DEFAULT 0 NOT NULL,
	"ad_timer_seconds" integer DEFAULT 0 NOT NULL,
	"ad_credit_reward_per_watch" numeric(15, 4) DEFAULT '0.0000' NOT NULL,
	"ad_credits_on_purchase" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"ad_credits_on_cycle" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"ad_submission_cost" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"weekly_service_fee" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"enable_weekly_fee" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ad_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"daily_ads" integer NOT NULL,
	"click_goal" numeric(10, 2) NOT NULL,
	"per_click_value" numeric(10, 4) NOT NULL,
	"cycle_payout" numeric(10, 2) NOT NULL,
	"roi_pct" integer NOT NULL,
	"sponsor_bonus_pct" numeric(5, 2) DEFAULT '15.00' NOT NULL,
	"community_pool_pct" numeric(5, 2) DEFAULT '8.00' NOT NULL,
	"ad_duration_seconds" integer DEFAULT 30 NOT NULL,
	"wait_between_ads_seconds" integer DEFAULT 5 NOT NULL,
	"max_ads_per_day_boosted" integer DEFAULT 32 NOT NULL,
	"color_hex" text DEFAULT '#6366f1',
	"icon_name" text DEFAULT 'Zap',
	"session_reset_type" text DEFAULT 'rolling_24h' NOT NULL,
	"duration_days" integer DEFAULT 30 NOT NULL,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "ad_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"ad_id" uuid NOT NULL,
	"ip_address" text NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ad_watch_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"ad_id" uuid NOT NULL,
	"earned_amount" numeric(10, 4) NOT NULL,
	"locked_balance_before" numeric(15, 4) NOT NULL,
	"locked_balance_after" numeric(15, 4) NOT NULL,
	"cycle_triggered" boolean DEFAULT false,
	"ad_token" text,
	"ad_signature" text,
	"ip_address" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "admin_audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid NOT NULL,
	"admin_username" text NOT NULL,
	"target_user_id" uuid,
	"target_username" text,
	"action" text NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"metadata" jsonb,
	"ip_address" text,
	"user_agent" text,
	"severity" text DEFAULT 'low' NOT NULL,
	"is_reversible" boolean DEFAULT false,
	"reversed_at" timestamp,
	"reversed_by_admin_id" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "admin_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from_admin_id" uuid,
	"to_user_id" uuid NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"channel" text DEFAULT 'platform' NOT NULL,
	"is_read" boolean DEFAULT false,
	"read_at" timestamp,
	"sent_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "admin_user_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"admin_id" uuid NOT NULL,
	"admin_username" text NOT NULL,
	"note" text NOT NULL,
	"is_pinned" boolean DEFAULT false,
	"is_private" boolean DEFAULT false,
	"category" text DEFAULT 'general',
	"color" text DEFAULT '#f97316',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"duration" integer DEFAULT 10 NOT NULL,
	"reward" numeric(20, 4) NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"total_views" integer DEFAULT 0 NOT NULL,
	"daily_limit" integer,
	"global_limit" integer,
	"cooldown" integer DEFAULT 86400 NOT NULL,
	"min_level_id" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon_url" text,
	"category" text NOT NULL,
	"rarity" text DEFAULT 'common',
	"trigger_type" text NOT NULL,
	"trigger_threshold" integer NOT NULL,
	"marketplace_discount_pct" numeric(5, 2) DEFAULT '0.00',
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "chat_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_id" uuid,
	"user_id" uuid,
	"role" text DEFAULT 'member',
	"muted_until" timestamp,
	"last_read_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_id" uuid,
	"user_id" uuid,
	"content" text NOT NULL,
	"is_pinned" boolean DEFAULT false,
	"is_announcement" boolean DEFAULT false,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_reactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_id" uuid,
	"user_id" uuid,
	"emoji" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sponsor_id" uuid,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "community_pool" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"total_locked" numeric(15, 2) DEFAULT '0',
	"payout_time" timestamp,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "community_pool_ledger" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pool_id" uuid,
	"amount" numeric(15, 4) NOT NULL,
	"type" text NOT NULL,
	"bucket" text NOT NULL,
	"reference_id" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contest_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contest_id" uuid,
	"user_id" uuid,
	"score" integer DEFAULT 0,
	"rank" integer,
	"prize_awarded" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"metric" text NOT NULL,
	"prize_type" text NOT NULL,
	"prize_value" numeric(20, 4),
	"prize_item_id" uuid,
	"start_at" timestamp NOT NULL,
	"end_at" timestamp NOT NULL,
	"status" text DEFAULT 'upcoming',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "discount_code_usages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"purchase_id" uuid,
	"discount_applied" numeric(10, 2) NOT NULL,
	"used_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "discount_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"discount_type" text NOT NULL,
	"discount_value" numeric(10, 2) NOT NULL,
	"applicable_item_ids" jsonb,
	"applicable_category_ids" jsonb,
	"max_uses" integer,
	"used_count" integer DEFAULT 0 NOT NULL,
	"max_uses_per_user" integer DEFAULT 1,
	"valid_from" timestamp,
	"valid_until" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "discount_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "flash_sale_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"discount_pct" numeric(5, 2) NOT NULL,
	"applicable_item_ids" jsonb,
	"applicable_category_ids" jsonb,
	"starts_at" timestamp NOT NULL,
	"ends_at" timestamp NOT NULL,
	"banner_text" text,
	"banner_color_hex" text DEFAULT '#ef4444',
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "investment_pools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"amount" numeric(20, 4) NOT NULL,
	"yield_rate" numeric(5, 2) NOT NULL,
	"duration_days" integer NOT NULL,
	"status" text DEFAULT 'active',
	"locked_at" timestamp DEFAULT now(),
	"matures_at" timestamp NOT NULL,
	"payout_amount" numeric(20, 4),
	"paid_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ip_ban_list" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ip_address" text NOT NULL,
	"cidr_range" text,
	"reason" text,
	"banned_by_admin_id" uuid,
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ledger" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"amount" numeric(20, 4) NOT NULL,
	"type" text NOT NULL,
	"reference_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ledger_receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ledger_entry_id" uuid,
	"user_id" uuid NOT NULL,
	"receipt_hash" text NOT NULL,
	"transaction_type" text NOT NULL,
	"amount" numeric(20, 4) NOT NULL,
	"status" text DEFAULT 'valid',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "levels" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"price" numeric(20, 4) NOT NULL,
	"sponsor_bonus" numeric(20, 4) DEFAULT '0' NOT NULL,
	"matching_bonus" numeric(20, 4) DEFAULT '0' NOT NULL,
	"referral_requirement" integer DEFAULT 0 NOT NULL,
	"cycle_size" integer DEFAULT 2 NOT NULL,
	"cycle_reward" numeric(20, 4) DEFAULT '0' NOT NULL,
	"re_entry_fee" numeric(20, 4) DEFAULT '0' NOT NULL,
	"platform_fee_percent" numeric(5, 2) DEFAULT '0.00' NOT NULL,
	"commission_cap" numeric(20, 4) DEFAULT '0' NOT NULL,
	"matrix_type" text DEFAULT 'company_force' NOT NULL,
	"matrix_width" integer DEFAULT 2 NOT NULL,
	"matrix_depth" integer DEFAULT 2 NOT NULL,
	"spillover_priority" text DEFAULT 'left' NOT NULL,
	"min_personal_purchase" numeric(20, 4) DEFAULT '0' NOT NULL,
	"prerequisite_level_id" integer,
	"expiry_days" integer DEFAULT 0 NOT NULL,
	"matching_depth" integer DEFAULT 1 NOT NULL,
	"binary_leg_match" text DEFAULT 'weaker' NOT NULL,
	"rank_multiplier" numeric(5, 2) DEFAULT '1.00' NOT NULL,
	"auto_rebuy" boolean DEFAULT false NOT NULL,
	"ad_credits_reward" integer DEFAULT 0 NOT NULL,
	"ad_cycles_reward" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketing_materials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"type" text DEFAULT 'banner' NOT NULL,
	"media_url" text NOT NULL,
	"target_url" text,
	"dimensions" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketplace_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"icon_emoji" text DEFAULT '🛒' NOT NULL,
	"color_hex" text DEFAULT '#f97316' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "marketplace_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "marketplace_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"tagline" text,
	"description" text,
	"icon_emoji" text DEFAULT '📦' NOT NULL,
	"color_hex" text DEFAULT '#f97316' NOT NULL,
	"badge_text" text,
	"badge_color_hex" text,
	"price" numeric(10, 2) NOT NULL,
	"original_price" numeric(10, 2),
	"currency" text DEFAULT 'USD' NOT NULL,
	"price_label" text,
	"item_type" text NOT NULL,
	"effect_metadata" jsonb DEFAULT '{}' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"stock_limit" integer,
	"stock_remaining" integer,
	"max_per_user" integer,
	"max_per_user_period" text,
	"requires_active_plan" boolean DEFAULT false,
	"required_plan_ids" jsonb,
	"required_rank" text,
	"required_min_cycles" integer,
	"required_min_deposit" numeric(10, 2),
	"available_from" timestamp,
	"available_until" timestamp,
	"is_time_limited" boolean DEFAULT false,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"image_url" text,
	"hover_image_url" text,
	"tags" jsonb DEFAULT '[]',
	"total_purchases" integer DEFAULT 0 NOT NULL,
	"total_revenue" numeric(12, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by_admin_id" uuid,
	CONSTRAINT "marketplace_items_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "marketplace_layout" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section_type" text NOT NULL,
	"section_title" text,
	"section_subtitle" text,
	"content_config" jsonb DEFAULT '{}' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "marketplace_purchases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"position_id" uuid,
	"price_paid" numeric(10, 2) NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"effect_applied" boolean DEFAULT false NOT NULL,
	"effect_applied_at" timestamp,
	"effect_expires_at" timestamp,
	"effect_metadata_snapshot" jsonb,
	"surprise_box_result" jsonb,
	"ledger_entry_id" uuid,
	"purchased_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "matrix_cycle_predictions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"position_id" uuid,
	"predicted_cycle_date" timestamp,
	"fill_rate_used" numeric(10, 4),
	"calculated_at" timestamp DEFAULT now(),
	"actual_cycled_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "matrix_positions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"parent_id" uuid,
	"position" integer,
	"level_id" integer,
	"status" text DEFAULT 'active',
	"cycled_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"content" text NOT NULL,
	"channel_id" text DEFAULT 'public' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"amount" numeric(20, 4),
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pool_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"duration_days" integer NOT NULL,
	"yield_rate" numeric(5, 2) NOT NULL,
	"min_amount" numeric(20, 4) NOT NULL,
	"is_active" boolean DEFAULT true,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "pool_settings_duration_days_unique" UNIQUE("duration_days")
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" integer PRIMARY KEY NOT NULL,
	"site_name" text NOT NULL,
	"primary_color" text NOT NULL,
	"secondary_color" text NOT NULL,
	"nowpayments_api_key" text,
	"withdrawal_fee_percent" numeric(5, 2) DEFAULT '0.00',
	"service_fee_percent" numeric(5, 2) DEFAULT '0.00',
	"seo_title" text DEFAULT 'Earn with the Ultimate Matrix',
	"seo_description" text DEFAULT 'Join the premier PTC and Matrix platform.',
	"telegram_bot_username" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "spin_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"multiplier" numeric(5, 2) DEFAULT '1.00',
	"starts_at" timestamp NOT NULL,
	"ends_at" timestamp NOT NULL,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "spin_wheel_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"base_price" numeric(10, 2) DEFAULT '2.50',
	"free_spins_per_cycle" integer DEFAULT 1,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "spin_wheel_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"slice_id" uuid,
	"is_free" boolean DEFAULT true,
	"price_paid" numeric(10, 2) DEFAULT '0',
	"won_value" numeric(15, 4),
	"outcome_json" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "spin_wheel_slices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"config_id" uuid,
	"label" text NOT NULL,
	"reward_type" text NOT NULL,
	"reward_value" numeric(15, 4),
	"weight" integer DEFAULT 100 NOT NULL,
	"color_hex" text DEFAULT '#ffffff',
	"icon_name" text,
	"is_guaranteed_on_streak" boolean DEFAULT false,
	"streak_threshold" integer
);
--> statement-breakpoint
CREATE TABLE "stress_test_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid,
	"scenario_name" text,
	"withdrawal_pct" numeric(5, 2),
	"pool_withdrawal_pct" numeric(5, 2),
	"revenue_pause_days" integer,
	"total_demand" numeric(20, 4),
	"available_reserves" numeric(20, 4),
	"shortfall" numeric(20, 4),
	"solvency_score" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "telegram_admin_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bot_token" text,
	"bot_username" text,
	"bot_display_name" text,
	"global_cycle_complete" boolean DEFAULT true NOT NULL,
	"global_spin_wheel_ready" boolean DEFAULT true NOT NULL,
	"global_withdrawal_approved" boolean DEFAULT true NOT NULL,
	"global_withdrawal_paid" boolean DEFAULT true NOT NULL,
	"global_withdrawal_rejected" boolean DEFAULT true NOT NULL,
	"global_ads_ready" boolean DEFAULT true NOT NULL,
	"global_referral_joined" boolean DEFAULT true NOT NULL,
	"global_referral_cycled" boolean DEFAULT true NOT NULL,
	"global_spin_bonus_won" boolean DEFAULT true NOT NULL,
	"global_badge_unlocked" boolean DEFAULT true NOT NULL,
	"global_pool_jackpot_won" boolean DEFAULT true NOT NULL,
	"global_pool_distribution" boolean DEFAULT true NOT NULL,
	"global_dead_star_warning" boolean DEFAULT true NOT NULL,
	"global_contest_rank_update" boolean DEFAULT true NOT NULL,
	"global_flash_sale_live" boolean DEFAULT true NOT NULL,
	"global_spin_event_active" boolean DEFAULT true NOT NULL,
	"global_matrix_cycle" boolean DEFAULT true NOT NULL,
	"global_matching_bonus" boolean DEFAULT true NOT NULL,
	"global_system_announcement" boolean DEFAULT true NOT NULL,
	"global_login_streak" boolean DEFAULT false NOT NULL,
	"template_cycle_complete" text,
	"template_spin_wheel_ready" text,
	"template_withdrawal_approved" text,
	"template_withdrawal_paid" text,
	"template_withdrawal_rejected" text,
	"template_ads_ready" text,
	"template_referral_joined" text,
	"template_referral_cycled" text,
	"template_spin_bonus_won" text,
	"template_badge_unlocked" text,
	"template_pool_jackpot_won" text,
	"template_pool_distribution" text,
	"template_dead_star_warning" text,
	"template_contest_rank_update" text,
	"template_flash_sale_live" text,
	"template_spin_event_active" text,
	"template_matrix_cycle" text,
	"template_matching_bonus" text,
	"template_system_announcement" text,
	"template_welcome" text,
	"global_max_per_user_per_hour" integer DEFAULT 10,
	"global_rate_limit_enabled" boolean DEFAULT true,
	"last_broadcast_at" timestamp,
	"broadcast_cooldown_minutes" integer DEFAULT 60,
	"updated_at" timestamp DEFAULT now(),
	"updated_by_admin_id" uuid
);
--> statement-breakpoint
CREATE TABLE "telegram_broadcasts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid,
	"message" text NOT NULL,
	"target_type" text NOT NULL,
	"target_config" jsonb,
	"total_targeted" integer DEFAULT 0,
	"total_sent" integer DEFAULT 0,
	"total_failed" integer DEFAULT 0,
	"status" text DEFAULT 'pending',
	"scheduled_at" timestamp,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "telegram_notification_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"telegram_chat_id" text NOT NULL,
	"event_type" text NOT NULL,
	"message_text" text NOT NULL,
	"telegram_message_id" integer,
	"status" text DEFAULT 'sent' NOT NULL,
	"error_message" text,
	"sent_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ticket_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"content" text NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"subject" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_account_status" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"is_frozen" boolean DEFAULT false NOT NULL,
	"frozen_at" timestamp,
	"frozen_by_admin_id" uuid,
	"frozen_reason" text,
	"frozen_until" timestamp,
	"freeze_type" text,
	"is_banned" boolean DEFAULT false NOT NULL,
	"banned_at" timestamp,
	"banned_by_admin_id" uuid,
	"ban_reason" text,
	"ban_type" text,
	"ban_expires_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"deleted_by_admin_id" uuid,
	"deletion_reason" text,
	"deletion_type" text,
	"hard_delete_scheduled_at" timestamp,
	"withdrawals_enabled" boolean DEFAULT true NOT NULL,
	"withdrawal_hold_until" timestamp,
	"withdrawal_hold_reason" text,
	"max_withdrawal_per_day" numeric,
	"earnings_enabled" boolean DEFAULT true NOT NULL,
	"earnings_multiplier" numeric DEFAULT '1.00',
	"kyc_status" text DEFAULT 'not_required',
	"kyc_approved_at" timestamp,
	"kyc_rejected_reason" text,
	"risk_score" integer DEFAULT 0,
	"fraud_flags" jsonb DEFAULT '[]',
	"is_high_risk" boolean DEFAULT false,
	"requires_manual_review" boolean DEFAULT false,
	"two_fa_enabled" boolean DEFAULT false,
	"two_fa_reset_requested_at" timestamp,
	"updated_at" timestamp DEFAULT now(),
	"updated_by_admin_id" uuid,
	CONSTRAINT "user_account_status_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_ad_levels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"ad_level_id" integer NOT NULL,
	"clicks_completed" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_ad_positions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"ad_plan_id" uuid NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"click_goal_snapshot" numeric(10, 2) NOT NULL,
	"locked_balance" numeric(15, 4) DEFAULT '0',
	"pending_payout_amount" numeric(15, 4) DEFAULT '0',
	"session_earned_today" numeric(15, 4) DEFAULT '0',
	"ads_watched_today" integer DEFAULT 0,
	"last_ad_watched_at" timestamp,
	"next_ads_available_at" timestamp,
	"next_cycle_multiplier" integer DEFAULT 1,
	"boosted_ads_per_day" integer DEFAULT 0,
	"current_streak" integer DEFAULT 0,
	"longest_streak" integer DEFAULT 0,
	"total_cycles" integer DEFAULT 0,
	"last_active_date" timestamp,
	"spin_wheel_available" boolean DEFAULT false,
	"spins_used_this_cycle" integer DEFAULT 0,
	"is_dead_star" boolean DEFAULT false,
	"dead_star_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"badge_id" uuid,
	"earned_at" timestamp DEFAULT now(),
	"is_showcased" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "user_inventory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"purchase_id" uuid,
	"item_type" text NOT NULL,
	"extra_ads_per_day" integer,
	"position_id" uuid,
	"spins_remaining" integer,
	"ap_amount" integer,
	"asset_url" text,
	"asset_id" text,
	"is_equipped" boolean DEFAULT false,
	"bonus_link_code" text,
	"bonus_pct" numeric(5, 2),
	"status" text DEFAULT 'active' NOT NULL,
	"acquired_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"consumed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_levels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"level_id" integer NOT NULL,
	"upline_spot_id" uuid,
	"position" integer,
	"active" boolean DEFAULT true NOT NULL,
	"downline_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_telegram_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"telegram_username" text,
	"telegram_chat_id" text,
	"is_connected" boolean DEFAULT false NOT NULL,
	"connected_at" timestamp,
	"last_message_at" timestamp,
	"notify_cycle_complete" boolean DEFAULT true NOT NULL,
	"notify_spin_wheel_ready" boolean DEFAULT true NOT NULL,
	"notify_withdrawal_submitted" boolean DEFAULT true NOT NULL,
	"notify_withdrawal_approved" boolean DEFAULT true NOT NULL,
	"notify_withdrawal_paid" boolean DEFAULT true NOT NULL,
	"notify_withdrawal_rejected" boolean DEFAULT true NOT NULL,
	"notify_ads_ready" boolean DEFAULT true NOT NULL,
	"notify_referral_joined" boolean DEFAULT true NOT NULL,
	"notify_referral_cycled" boolean DEFAULT true NOT NULL,
	"notify_spin_bonus_won" boolean DEFAULT true NOT NULL,
	"notify_badge_unlocked" boolean DEFAULT true NOT NULL,
	"notify_pool_jackpot_won" boolean DEFAULT true NOT NULL,
	"notify_pool_distribution" boolean DEFAULT true NOT NULL,
	"notify_dead_star_warning" boolean DEFAULT true NOT NULL,
	"notify_contest_rank_update" boolean DEFAULT false NOT NULL,
	"notify_flash_sale_live" boolean DEFAULT false NOT NULL,
	"notify_spin_event_active" boolean DEFAULT false NOT NULL,
	"notify_matrix_cycle" boolean DEFAULT true NOT NULL,
	"notify_matching_bonus" boolean DEFAULT true NOT NULL,
	"notify_login_streak" boolean DEFAULT false NOT NULL,
	"notify_system_announcement" boolean DEFAULT true NOT NULL,
	"quiet_hours_enabled" boolean DEFAULT false NOT NULL,
	"quiet_hours_start" integer,
	"quiet_hours_end" integer,
	"timezone" text DEFAULT 'UTC',
	"max_messages_per_hour" integer DEFAULT 10,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_telegram_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"sponsor_id" uuid,
	"ad_credits" integer DEFAULT 0 NOT NULL,
	"ad_cycles" integer DEFAULT 0 NOT NULL,
	"full_name" text,
	"phone" text,
	"btc_address" text,
	"ltc_address" text,
	"trx_address" text,
	"usdt_trc20_address" text,
	"email" text,
	"email_notifications_enabled" boolean DEFAULT true NOT NULL,
	"rank" text DEFAULT 'Member' NOT NULL,
	"telegram_username" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "withdrawal_schedule_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"schedule_id" uuid,
	"status" text NOT NULL,
	"amount" numeric(20, 4),
	"reason" text,
	"executed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "withdrawal_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"frequency" text NOT NULL,
	"day_of_week" integer,
	"day_of_month" integer,
	"amount_type" text NOT NULL,
	"fixed_amount" numeric(20, 4),
	"min_threshold" numeric(20, 4) DEFAULT '0.00',
	"payout_method_id" uuid,
	"is_active" boolean DEFAULT true,
	"next_run_at" timestamp,
	"last_run_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "withdrawals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"amount" numeric(20, 4) NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"payment_method" text NOT NULL,
	"details" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ad_cycle_history" ADD CONSTRAINT "ad_cycle_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_cycle_history" ADD CONSTRAINT "ad_cycle_history_position_id_user_ad_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."user_ad_positions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_impressions" ADD CONSTRAINT "ad_impressions_ad_id_ads_id_fk" FOREIGN KEY ("ad_id") REFERENCES "public"."ads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_impressions" ADD CONSTRAINT "ad_impressions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_impressions" ADD CONSTRAINT "ad_impressions_advertiser_id_users_id_fk" FOREIGN KEY ("advertiser_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_views" ADD CONSTRAINT "ad_views_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_views" ADD CONSTRAINT "ad_views_ad_id_ads_id_fk" FOREIGN KEY ("ad_id") REFERENCES "public"."ads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_watch_log" ADD CONSTRAINT "ad_watch_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_watch_log" ADD CONSTRAINT "ad_watch_log_ad_id_ads_id_fk" FOREIGN KEY ("ad_id") REFERENCES "public"."ads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_audit_log" ADD CONSTRAINT "admin_audit_log_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_audit_log" ADD CONSTRAINT "admin_audit_log_target_user_id_users_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_messages" ADD CONSTRAINT "admin_messages_from_admin_id_users_id_fk" FOREIGN KEY ("from_admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_messages" ADD CONSTRAINT "admin_messages_to_user_id_users_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_user_notes" ADD CONSTRAINT "admin_user_notes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_user_notes" ADD CONSTRAINT "admin_user_notes_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_members" ADD CONSTRAINT "chat_members_room_id_chat_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."chat_rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_members" ADD CONSTRAINT "chat_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_room_id_chat_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."chat_rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_reactions" ADD CONSTRAINT "chat_reactions_message_id_chat_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."chat_messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_reactions" ADD CONSTRAINT "chat_reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_rooms" ADD CONSTRAINT "chat_rooms_sponsor_id_users_id_fk" FOREIGN KEY ("sponsor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_pool_ledger" ADD CONSTRAINT "community_pool_ledger_pool_id_community_pool_id_fk" FOREIGN KEY ("pool_id") REFERENCES "public"."community_pool"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contest_entries" ADD CONSTRAINT "contest_entries_contest_id_contests_id_fk" FOREIGN KEY ("contest_id") REFERENCES "public"."contests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contest_entries" ADD CONSTRAINT "contest_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_code_usages" ADD CONSTRAINT "discount_code_usages_code_id_discount_codes_id_fk" FOREIGN KEY ("code_id") REFERENCES "public"."discount_codes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_code_usages" ADD CONSTRAINT "discount_code_usages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_code_usages" ADD CONSTRAINT "discount_code_usages_purchase_id_marketplace_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."marketplace_purchases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investment_pools" ADD CONSTRAINT "investment_pools_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ip_ban_list" ADD CONSTRAINT "ip_ban_list_banned_by_admin_id_users_id_fk" FOREIGN KEY ("banned_by_admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger" ADD CONSTRAINT "ledger_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_receipts" ADD CONSTRAINT "ledger_receipts_ledger_entry_id_ledger_id_fk" FOREIGN KEY ("ledger_entry_id") REFERENCES "public"."ledger"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_receipts" ADD CONSTRAINT "ledger_receipts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_items" ADD CONSTRAINT "marketplace_items_category_id_marketplace_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."marketplace_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_items" ADD CONSTRAINT "marketplace_items_created_by_admin_id_users_id_fk" FOREIGN KEY ("created_by_admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_purchases" ADD CONSTRAINT "marketplace_purchases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_purchases" ADD CONSTRAINT "marketplace_purchases_item_id_marketplace_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."marketplace_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matrix_cycle_predictions" ADD CONSTRAINT "matrix_cycle_predictions_position_id_matrix_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."matrix_positions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matrix_positions" ADD CONSTRAINT "matrix_positions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matrix_positions" ADD CONSTRAINT "matrix_positions_level_id_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spin_wheel_results" ADD CONSTRAINT "spin_wheel_results_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spin_wheel_results" ADD CONSTRAINT "spin_wheel_results_slice_id_spin_wheel_slices_id_fk" FOREIGN KEY ("slice_id") REFERENCES "public"."spin_wheel_slices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spin_wheel_slices" ADD CONSTRAINT "spin_wheel_slices_config_id_spin_wheel_configs_id_fk" FOREIGN KEY ("config_id") REFERENCES "public"."spin_wheel_configs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stress_test_snapshots" ADD CONSTRAINT "stress_test_snapshots_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "telegram_admin_settings" ADD CONSTRAINT "telegram_admin_settings_updated_by_admin_id_users_id_fk" FOREIGN KEY ("updated_by_admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "telegram_broadcasts" ADD CONSTRAINT "telegram_broadcasts_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "telegram_notification_log" ADD CONSTRAINT "telegram_notification_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_account_status" ADD CONSTRAINT "user_account_status_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_ad_levels" ADD CONSTRAINT "user_ad_levels_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_ad_levels" ADD CONSTRAINT "user_ad_levels_ad_level_id_ad_levels_id_fk" FOREIGN KEY ("ad_level_id") REFERENCES "public"."ad_levels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_ad_positions" ADD CONSTRAINT "user_ad_positions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_ad_positions" ADD CONSTRAINT "user_ad_positions_ad_plan_id_ad_plans_id_fk" FOREIGN KEY ("ad_plan_id") REFERENCES "public"."ad_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badge_id_badges_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_inventory" ADD CONSTRAINT "user_inventory_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_inventory" ADD CONSTRAINT "user_inventory_item_id_marketplace_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."marketplace_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_inventory" ADD CONSTRAINT "user_inventory_purchase_id_marketplace_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."marketplace_purchases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_levels" ADD CONSTRAINT "user_levels_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_levels" ADD CONSTRAINT "user_levels_level_id_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_telegram_settings" ADD CONSTRAINT "user_telegram_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "withdrawal_schedule_log" ADD CONSTRAINT "withdrawal_schedule_log_schedule_id_withdrawal_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."withdrawal_schedules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "withdrawal_schedules" ADD CONSTRAINT "withdrawal_schedules_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;