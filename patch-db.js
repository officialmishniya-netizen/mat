const postgres = require('postgres');
const sql = postgres('postgresql://postgres:postgres@localhost:54322/postgres', { max: 1 });

const statements = [
    `CREATE TABLE "admin_audit_log" (
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
);`,
    `CREATE TABLE "admin_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from_admin_id" uuid,
	"to_user_id" uuid NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"channel" text DEFAULT 'platform' NOT NULL,
	"is_read" boolean DEFAULT false,
	"read_at" timestamp,
	"sent_at" timestamp DEFAULT now()
);`,
    `CREATE TABLE "admin_user_notes" (
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
);`,
    `CREATE TABLE "ip_ban_list" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ip_address" text NOT NULL,
	"cidr_range" text,
	"reason" text,
	"banned_by_admin_id" uuid,
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);`,
    `CREATE TABLE "user_account_status" (
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
);`
];

async function migrate() {
    try {
        for (const stmt of statements) {
            try {
                await sql.unsafe(stmt);
                console.log("Executed successfully:", stmt.substring(0, 50));
            } catch (err) {
                if (err.message.includes('already exists')) {
                    console.log("Table already exists, skipping:", stmt.substring(0, 50));
                } else {
                    console.error("Failed on:", stmt.substring(0, 50), err.message);
                }
            }
        }
        console.log("All missing tables applied.");
    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        process.exit(0);
    }
}
migrate();
