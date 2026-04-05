const postgres = require('postgres');
const sql = postgres('postgresql://postgres:postgres@localhost:54322/postgres', { max: 1 });

const statements = [
    // 1. Add username column without NOT NULL first
    `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username text;`,

    // 2. Set default usernames for existing rows to prevent NOT NULL errors
    `UPDATE public.users SET username = 'admin_' || substr(id::text, 1, 8) WHERE username IS NULL;`,

    // 3. Add constraint and NOT NULL
    `ALTER TABLE public.users ALTER COLUMN username SET NOT NULL;`,
    `DO $$ BEGIN 
   IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_username_key') THEN
     ALTER TABLE public.users ADD CONSTRAINT users_username_key UNIQUE (username);
   END IF;
 END $$;`,

    // 4. Add remaining missing columns
    `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS sponsor_id uuid REFERENCES public.users(id);`,
    `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS ad_credits integer DEFAULT 0 NOT NULL;`,
    `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS ad_cycles integer DEFAULT 0 NOT NULL;`,
    `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone text;`,
    `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS btc_address text;`,
    `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS ltc_address text;`,
    `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS trx_address text;`,
    `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS usdt_trc20_address text;`,
    `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_notifications_enabled boolean DEFAULT true NOT NULL;`,
    `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS rank text DEFAULT 'Member' NOT NULL;`,
    `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS telegram_username text;`,
    `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';`
];

async function migrate() {
    try {
        for (const stmt of statements) {
            try {
                await sql.unsafe(stmt);
                console.log("Executed successfully:", stmt.substring(0, 60));
            } catch (err) {
                console.error("Failed on:", stmt.substring(0, 60), err.message);
            }
        }
        console.log("public.users patched successfully.");
    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        process.exit(0);
    }
}
migrate();
