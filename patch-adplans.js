const postgres = require('postgres');
const sql = postgres('postgresql://postgres:postgres@localhost:54322/postgres', { max: 1 });

const statements = [
    `CREATE TABLE IF NOT EXISTS "ad_plans" (
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
);`,
    `CREATE TABLE IF NOT EXISTS "user_ad_positions" (
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
);`
];

async function migrate() {
    try {
        for (const stmt of statements) {
            try {
                await sql.unsafe(stmt);
                console.log("Executed successfully:", stmt.substring(0, 50));
            } catch (err) {
                console.error("Failed on:", stmt.substring(0, 50), err.message);
            }
        }
    } finally {
        process.exit(0);
    }
}
migrate();
