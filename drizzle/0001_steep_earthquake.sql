CREATE TABLE "bounties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"reward_amount" numeric(10, 4) NOT NULL,
	"max_submissions" integer DEFAULT 100,
	"active" boolean DEFAULT true NOT NULL,
	"icon" text DEFAULT 'Star',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bounty_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bounty_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"proof_text" text NOT NULL,
	"proof_image" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "device_fingerprints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_id" text,
	"browser" text,
	"os" text,
	"screen_resolution" text,
	"timezone" text,
	"language" text,
	"fonts_hash" text,
	"user_agent_hash" text,
	"fingerprint_hash" text,
	"ip_address" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "direct_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sender_id" uuid NOT NULL,
	"recipient_id" uuid NOT NULL,
	"content" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email_templates_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "follow_up_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rule_id" uuid NOT NULL,
	"sponsor_id" uuid NOT NULL,
	"target_user_id" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"scheduled_for" timestamp NOT NULL,
	"executed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "follow_up_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"trigger_type" text NOT NULL,
	"action_type" text NOT NULL,
	"delay_hours" integer DEFAULT 0 NOT NULL,
	"template_subject" text,
	"template_body" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fraud_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"detector_type" text NOT NULL,
	"severity" text DEFAULT 'suspicious' NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"involved_user_ids" jsonb DEFAULT '[]',
	"involved_usernames" jsonb DEFAULT '[]',
	"metadata" jsonb DEFAULT '{}',
	"status" text DEFAULT 'new' NOT NULL,
	"reviewed_by_admin_id" uuid,
	"review_note" text,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fraud_settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"dup_ip_enabled" boolean DEFAULT true NOT NULL,
	"dup_ip_min_accounts" integer DEFAULT 2 NOT NULL,
	"speed_enabled" boolean DEFAULT true NOT NULL,
	"speed_grace_seconds" integer DEFAULT 3 NOT NULL,
	"speed_auto_warn_after" integer DEFAULT 5 NOT NULL,
	"speed_auto_suspend_after" integer DEFAULT 20 NOT NULL,
	"speed_auto_ban_after" integer DEFAULT 50 NOT NULL,
	"vpn_enabled" boolean DEFAULT true NOT NULL,
	"vpn_action" text DEFAULT 'log' NOT NULL,
	"wd_enabled" boolean DEFAULT true NOT NULL,
	"wd_new_account_hours" integer DEFAULT 72 NOT NULL,
	"wd_multiple_within_24h" integer DEFAULT 3 NOT NULL,
	"wd_inactivity_days" integer DEFAULT 60 NOT NULL,
	"self_ref_enabled" boolean DEFAULT true NOT NULL,
	"device_enabled" boolean DEFAULT true NOT NULL,
	"device_fuzzy_threshold" integer DEFAULT 8 NOT NULL,
	"bot_enabled" boolean DEFAULT true NOT NULL,
	"bot_min_watches" integer DEFAULT 50 NOT NULL,
	"bot_timing_std_dev_threshold" numeric(5, 2) DEFAULT '2.0' NOT NULL,
	"bot_auto_ban_score" integer DEFAULT 90 NOT NULL,
	"mismatch_enabled" boolean DEFAULT true NOT NULL,
	"mismatch_tolerance_pct" numeric(5, 2) DEFAULT '5.0' NOT NULL,
	"dormant_enabled" boolean DEFAULT true NOT NULL,
	"dormant_threshold_days" integer DEFAULT 60 NOT NULL,
	"dormant_hold_days" integer DEFAULT 7 NOT NULL,
	"dormant_auto_hold" boolean DEFAULT false NOT NULL,
	"burst_enabled" boolean DEFAULT true NOT NULL,
	"burst_min_accounts" integer DEFAULT 5 NOT NULL,
	"burst_window_minutes" integer DEFAULT 60 NOT NULL,
	"burst_auto_freeze" boolean DEFAULT false NOT NULL,
	"alert_email_recipient" text,
	"weekly_report_enabled" boolean DEFAULT false NOT NULL,
	"weekly_report_recipient" text,
	"log_retention_days" integer DEFAULT 90 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fraud_whitelist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"value" text NOT NULL,
	"reason" text NOT NULL,
	"approved_by_admin_id" uuid,
	"approved_by_username" text,
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proof_card_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"template_id" text NOT NULL,
	"amount_displayed" numeric(20, 4) NOT NULL,
	"platform_shared" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "simulation_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"config" jsonb NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"logs" jsonb DEFAULT '[]' NOT NULL,
	"report" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_emails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sender_id" uuid NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"recipient_filter" text DEFAULT 'all' NOT NULL,
	"scheduled_at" timestamp,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tracking_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"destination_url" text NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tracking_links_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "vpn_ip_ranges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cidr" text NOT NULL,
	"provider_name" text,
	"range_type" text DEFAULT 'vpn' NOT NULL,
	"source" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"added_by_admin_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "marketplace_categories" ALTER COLUMN "icon_emoji" SET DEFAULT 'ðŸ›’';--> statement-breakpoint
ALTER TABLE "marketplace_items" ALTER COLUMN "icon_emoji" SET DEFAULT 'ðŸ“¦';--> statement-breakpoint
ALTER TABLE "settings" ALTER COLUMN "seo_title" SET DEFAULT 'MatClick — High-Yield Matrix Engine';--> statement-breakpoint
ALTER TABLE "settings" ALTER COLUMN "seo_description" SET DEFAULT 'Join the premier community-driven matrix platform.';--> statement-breakpoint
ALTER TABLE "settings" ALTER COLUMN "telegram_bot_username" SET DEFAULT 'MatClickBot';--> statement-breakpoint
ALTER TABLE "ad_levels" ADD COLUMN "free_matrix_level_id" integer;--> statement-breakpoint
ALTER TABLE "ad_watch_log" ADD COLUMN "token_issued_at" timestamp;--> statement-breakpoint
ALTER TABLE "levels" ADD COLUMN "free_ad_level_id" integer;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "nowpayments_ipn_secret" text;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "active_payment_gateway" text DEFAULT 'nowpayments' NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "coinpayments_merchant_id" text;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "coinpayments_ipn_secret" text;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "coinbase_api_key" text;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "coinbase_webhook_secret" text;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "mailgun_api_key" text;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "mailgun_domain" text;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "mailgun_from_email" text;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "enable_team_emails" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "enable_direct_messages" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "enable_training_hub" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "launch_date" timestamp;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "withdrawals_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "next_in_line_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "ptc_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "matrix_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "purchases_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "min_withdrawal_amount" numeric(20, 4) DEFAULT '10.00' NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "max_withdrawal_amount" numeric(20, 4) DEFAULT '10000.00' NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "min_deposit_amount" numeric(20, 4) DEFAULT '10.00' NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "max_deposit_amount" numeric(20, 4) DEFAULT '50000.00' NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "nowpayments_sandbox" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "auto_withdrawal_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "accepted_crypto_methods" text DEFAULT 'BTC,ETH,USDT,LTC,TRX';--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "mobile_app_maintenance" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "mobile_min_version" text DEFAULT '1.0.0' NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "mobile_latest_version" text DEFAULT '1.0.0' NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "onesignal_app_id" text;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "onesignal_rest_key" text;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "play_store_url" text;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "app_store_url" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "referral_page_title" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "referral_page_message" text;--> statement-breakpoint
ALTER TABLE "withdrawals" ADD COLUMN "processed_at" timestamp;--> statement-breakpoint
ALTER TABLE "withdrawals" ADD COLUMN "admin_note" text;--> statement-breakpoint
ALTER TABLE "withdrawals" ADD COLUMN "approved_by_admin_id" uuid;--> statement-breakpoint
ALTER TABLE "bounty_submissions" ADD CONSTRAINT "bounty_submissions_bounty_id_bounties_id_fk" FOREIGN KEY ("bounty_id") REFERENCES "public"."bounties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bounty_submissions" ADD CONSTRAINT "bounty_submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device_fingerprints" ADD CONSTRAINT "device_fingerprints_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "direct_messages" ADD CONSTRAINT "direct_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "direct_messages" ADD CONSTRAINT "direct_messages_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_up_logs" ADD CONSTRAINT "follow_up_logs_rule_id_follow_up_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."follow_up_rules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_up_logs" ADD CONSTRAINT "follow_up_logs_sponsor_id_users_id_fk" FOREIGN KEY ("sponsor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_up_logs" ADD CONSTRAINT "follow_up_logs_target_user_id_users_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_up_rules" ADD CONSTRAINT "follow_up_rules_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fraud_alerts" ADD CONSTRAINT "fraud_alerts_reviewed_by_admin_id_users_id_fk" FOREIGN KEY ("reviewed_by_admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fraud_whitelist" ADD CONSTRAINT "fraud_whitelist_approved_by_admin_id_users_id_fk" FOREIGN KEY ("approved_by_admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proof_card_logs" ADD CONSTRAINT "proof_card_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_emails" ADD CONSTRAINT "team_emails_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracking_links" ADD CONSTRAINT "tracking_links_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vpn_ip_ranges" ADD CONSTRAINT "vpn_ip_ranges_added_by_admin_id_users_id_fk" FOREIGN KEY ("added_by_admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "fraud_alerts_status_idx" ON "fraud_alerts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "fraud_alerts_created_at_idx" ON "fraud_alerts" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_approved_by_admin_id_users_id_fk" FOREIGN KEY ("approved_by_admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ad_views_user_id_idx" ON "ad_views" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ad_views_completed_at_idx" ON "ad_views" USING btree ("completed_at");--> statement-breakpoint
CREATE INDEX "ledger_user_id_idx" ON "ledger" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ledger_type_idx" ON "ledger" USING btree ("type");--> statement-breakpoint
CREATE INDEX "ledger_created_at_idx" ON "ledger" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "withdrawals_status_idx" ON "withdrawals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "withdrawals_created_at_idx" ON "withdrawals" USING btree ("created_at");