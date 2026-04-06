import { pgTable, serial, text, timestamp, boolean, uuid, integer, decimal, jsonb, numeric, index } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").primaryKey(),
    username: text("username").notNull().unique(),
    role: text("role").default("user").notNull(), // user | admin | advertiser
    sponsor_id: uuid("sponsor_id"),
    ad_credits: integer("ad_credits").default(0).notNull(),
    ad_cycles: integer("ad_cycles").default(0).notNull(),
    full_name: text("full_name"),
    phone: text("phone"),
    btc_address: text("btc_address"),
    ltc_address: text("ltc_address"),
    trx_address: text("trx_address"),
    usdt_trc20_address: text("usdt_trc20_address"),
    email: text("email"),
    email_notifications_enabled: boolean("email_notifications_enabled").default(true).notNull(),
    rank: text("rank").default("Member").notNull(), // Member | Active Member | Leader | Senior Leader | Executive | Top Earner
    telegramUsername: text("telegram_username"),
    referral_page_title: text("referral_page_title"),
    referral_page_message: text("referral_page_message"),
    created_at: timestamp("created_at").defaultNow().notNull()
}, (table) => {
    return {
        roleIdx: index("users_role_idx").on(table.role),
        createdAtIdx: index("users_created_at_idx").on(table.created_at),
    };
});

export const settings = pgTable("settings", {
    id: integer("id").primaryKey(),
    site_name: text("site_name").notNull(),
    primary_color: text("primary_color").notNull(),
    secondary_color: text("secondary_color").notNull(),
    nowpayments_api_key: text("nowpayments_api_key"),
    nowpayments_ipn_secret: text("nowpayments_ipn_secret"),
    active_payment_gateway: text("active_payment_gateway").default("nowpayments").notNull(),
    coinpayments_merchant_id: text("coinpayments_merchant_id"),
    coinpayments_ipn_secret: text("coinpayments_ipn_secret"),
    coinbase_api_key: text("coinbase_api_key"),
    coinbase_webhook_secret: text("coinbase_webhook_secret"),
    withdrawal_fee_percent: decimal("withdrawal_fee_percent", { precision: 5, scale: 2 }).default("0.00"),
    service_fee_percent: decimal("service_fee_percent", { precision: 5, scale: 2 }).default("0.00"),
    seo_title: text("seo_title").default("MatClick — High-Yield Matrix Engine"),
    seo_description: text("seo_description").default("Join the premier community-driven matrix platform."),
    telegram_bot_username: text("telegram_bot_username").default("MatClickBot"),
    mailgun_api_key: text("mailgun_api_key"),
    mailgun_domain: text("mailgun_domain"),
    mailgun_from_email: text("mailgun_from_email"),
    enable_team_emails: boolean("enable_team_emails").default(true).notNull(),
    enable_direct_messages: boolean("enable_direct_messages").default(true).notNull(),
    enable_training_hub: boolean("enable_training_hub").default(true).notNull(),
    launch_date: timestamp("launch_date"),
    withdrawals_enabled: boolean("withdrawals_enabled").default(true).notNull(),
    next_in_line_enabled: boolean("next_in_line_enabled").default(true).notNull(),
    ptc_enabled: boolean("ptc_enabled").default(true).notNull(),
    matrix_enabled: boolean("matrix_enabled").default(true).notNull(),
    purchases_enabled: boolean("purchases_enabled").default(true).notNull(),

    // Comprehensive Payment Settings
    min_withdrawal_amount: decimal("min_withdrawal_amount", { precision: 20, scale: 4 }).default("10.00").notNull(),
    max_withdrawal_amount: decimal("max_withdrawal_amount", { precision: 20, scale: 4 }).default("10000.00").notNull(),
    min_deposit_amount: decimal("min_deposit_amount", { precision: 20, scale: 4 }).default("10.00").notNull(),
    max_deposit_amount: decimal("max_deposit_amount", { precision: 20, scale: 4 }).default("50000.00").notNull(),
    nowpayments_sandbox: boolean("nowpayments_sandbox").default(false).notNull(),
    auto_withdrawal_enabled: boolean("auto_withdrawal_enabled").default(false).notNull(),
    accepted_crypto_methods: text("accepted_crypto_methods").default("BTC,ETH,USDT,LTC,TRX"),

    // Mobile App Configurations
    mobile_app_maintenance: boolean("mobile_app_maintenance").default(false).notNull(),
    mobile_min_version: text("mobile_min_version").default("1.0.0").notNull(),
    mobile_latest_version: text("mobile_latest_version").default("1.0.0").notNull(),
    onesignal_app_id: text("onesignal_app_id"),
    onesignal_rest_key: text("onesignal_rest_key"),
    play_store_url: text("play_store_url"),
    app_store_url: text("app_store_url"),

    updated_at: timestamp("updated_at").defaultNow().notNull()
});

export const emailTemplates = pgTable("email_templates", {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(), // welcome, cycle_complete, etc.
    subject: text("subject").notNull(),
    body: text("body").notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull()
});

export const ledger = pgTable("ledger", {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: uuid("user_id").notNull().references(() => users.id),
    amount: decimal("amount", { precision: 20, scale: 4 }).notNull(),
    type: text("type").notNull(),
    reference_id: text("reference_id"),
    created_at: timestamp("created_at").defaultNow().notNull()
}, (table) => {
    return {
        userIdIdx: index("ledger_user_id_idx").on(table.user_id),
        typeIdx: index("ledger_type_idx").on(table.type),
        createdAtIdx: index("ledger_created_at_idx").on(table.created_at),
    };
});

export const levels = pgTable("levels", {
    id: integer("id").primaryKey(),
    name: text("name").notNull(),
    price: decimal("price", { precision: 20, scale: 4 }).notNull(),
    sponsor_bonus: decimal("sponsor_bonus", { precision: 20, scale: 4 }).default("0").notNull(),
    matching_bonus: decimal("matching_bonus", { precision: 20, scale: 4 }).default("0").notNull(),
    referral_requirement: integer("referral_requirement").default(0).notNull(),
    cycle_size: integer("cycle_size").default(2).notNull(),
    cycle_reward: decimal("cycle_reward", { precision: 20, scale: 4 }).default("0").notNull(),
    re_entry_fee: decimal("re_entry_fee", { precision: 20, scale: 4 }).default("0").notNull(),
    platform_fee_percent: decimal("platform_fee_percent", { precision: 5, scale: 2 }).default("0.00").notNull(),
    commission_cap: decimal("commission_cap", { precision: 20, scale: 4 }).default("0").notNull(),
    matrix_type: text("matrix_type").default("company_force").notNull(), // company_force | sponsor_force | weakest_leg
    matrix_width: integer("matrix_width").default(2).notNull(),
    matrix_depth: integer("matrix_depth").default(2).notNull(),
    spillover_priority: text("spillover_priority").default("left").notNull(), // left | right | weak
    min_personal_purchase: decimal("min_personal_purchase", { precision: 20, scale: 4 }).default("0").notNull(),
    prerequisite_level_id: integer("prerequisite_level_id"),
    expiry_days: integer("expiry_days").default(0).notNull(), // 0 = never
    matching_depth: integer("matching_depth").default(1).notNull(),
    binary_leg_match: text("binary_leg_match").default("weaker").notNull(), // weaker | stronger | both
    rank_multiplier: decimal("rank_multiplier", { precision: 5, scale: 2 }).default("1.00").notNull(),
    auto_rebuy: boolean("auto_rebuy").default(false).notNull(),
    ad_credits_reward: integer("ad_credits_reward").default(0).notNull(),
    ad_cycles_reward: integer("ad_cycles_reward").default(0).notNull(),
    free_ad_level_id: integer("free_ad_level_id"), // Free entry to this PTC level
    created_at: timestamp("created_at").defaultNow().notNull()
});

export const userLevels = pgTable("user_levels", {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: uuid("user_id").notNull().references(() => users.id),
    level_id: integer("level_id").notNull().references(() => levels.id),
    upline_spot_id: uuid("upline_spot_id"),
    position: integer("position"),
    active: boolean("active").default(true).notNull(),
    downline_count: integer("downline_count").default(0).notNull(),
    created_at: timestamp("created_at").defaultNow().notNull()
});

export const ads = pgTable("ads", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    url: text("url").notNull(),
    duration: integer("duration").default(10).notNull(),
    reward: decimal("reward", { precision: 20, scale: 4 }).notNull(),
    active: boolean("active").default(true).notNull(),
    total_views: integer("total_views").default(0).notNull(),
    daily_limit: integer("daily_limit"),
    global_limit: integer("global_limit"),
    cooldown: integer("cooldown").default(86400).notNull(),
    min_level_id: integer("min_level_id").default(0).notNull(),
    created_at: timestamp("created_at").defaultNow().notNull()
});

export const adViews = pgTable("ad_views", {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: uuid("user_id").notNull().references(() => users.id),
    ad_id: uuid("ad_id").notNull().references(() => ads.id),
    ip_address: text("ip_address").notNull(),
    completed_at: timestamp("completed_at").defaultNow().notNull()
}, (table) => {
    return {
        userIdIdx: index("ad_views_user_id_idx").on(table.user_id),
        completedAtIdx: index("ad_views_completed_at_idx").on(table.completed_at),
    };
});

export const messages = pgTable("messages", {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: uuid("user_id").notNull().references(() => users.id),
    content: text("content").notNull(),
    channel_id: text("channel_id").default("public").notNull(),
    created_at: timestamp("created_at").defaultNow().notNull()
});

export const marketingMaterials = pgTable("marketing_materials", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    type: text("type").default("banner").notNull(),
    media_url: text("media_url").notNull(),
    target_url: text("target_url"),
    dimensions: text("dimensions"),
    active: boolean("active").default(true).notNull(),
    created_at: timestamp("created_at").defaultNow().notNull()
});

export const adLevels = pgTable("ad_levels", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    active: boolean("active").default(true).notNull(),
    price: decimal("price", { precision: 15, scale: 2 }).notNull(),
    member_earning: decimal("member_earning", { precision: 15, scale: 3 }).default("0.000").notNull(),
    sponsor_bonus_per_click: decimal("sponsor_bonus_per_click", { precision: 15, scale: 3 }).default("0.000").notNull(),
    platform_fee_per_click: decimal("platform_fee_per_click", { precision: 15, scale: 3 }).default("0.000").notNull(),
    clicks_per_cycle: integer("clicks_per_cycle").default(1).notNull(),
    repurchase_required: boolean("repurchase_required").default(true).notNull(),
    next_upgrade_level_id: integer("next_upgrade_level_id"),
    withdrawal_on_completion: decimal("withdrawal_on_completion", { precision: 15, scale: 2 }).default("0.00").notNull(),
    total_cycle_revenue: decimal("total_cycle_revenue", { precision: 15, scale: 2 }).default("0.00").notNull(),
    matching_bonus_on_cycle: decimal("matching_bonus_on_cycle", { precision: 15, scale: 2 }).default("0.00").notNull(),
    payouts_enabled: boolean("payouts_enabled").default(true).notNull(),
    min_withdrawal_amount: decimal("min_withdrawal_amount", { precision: 15, scale: 2 }).default("0.00").notNull(),
    admin_cycle_fee: decimal("admin_cycle_fee", { precision: 15, scale: 2 }).default("0.00").notNull(),
    earning_multiplier: decimal("earning_multiplier", { precision: 10, scale: 4 }).default("1.0000").notNull(),
    requirement_level_id: integer("requirement_level_id"),
    threshold_qty: integer("threshold_qty").default(0).notNull(),
    daily_ad_limit: integer("daily_ad_limit").default(0).notNull(),
    ad_timer_seconds: integer("ad_timer_seconds").default(0).notNull(),
    ad_credit_reward_per_watch: decimal("ad_credit_reward_per_watch", { precision: 15, scale: 4 }).default("0.0000").notNull(),
    ad_credits_on_purchase: decimal("ad_credits_on_purchase", { precision: 15, scale: 2 }).default("0.00").notNull(),
    ad_credits_on_cycle: decimal("ad_credits_on_cycle", { precision: 15, scale: 2 }).default("0.00").notNull(),
    ad_submission_cost: decimal("ad_submission_cost", { precision: 15, scale: 2 }).default("0.00").notNull(),
    weekly_service_fee: decimal("weekly_service_fee", { precision: 15, scale: 2 }).default("0.00").notNull(),
    enable_weekly_fee: boolean("enable_weekly_fee").default(false).notNull(),
    free_matrix_level_id: integer("free_matrix_level_id"), // Free entry to this Matrix level
    created_at: timestamp("created_at").defaultNow().notNull()
});

export const userAdLevels = pgTable("user_ad_levels", {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: uuid("user_id").references(() => users.id).notNull(),
    ad_level_id: integer("ad_level_id").references(() => adLevels.id).notNull(),
    clicks_completed: integer("clicks_completed").default(0).notNull(),
    status: text("status").default("active").notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull()
});

export const tickets = pgTable("tickets", {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: uuid("user_id").notNull().references(() => users.id),
    subject: text("subject").notNull(),
    status: text("status").default("open").notNull(), // open, answered, closed
    priority: text("priority").default("medium").notNull(), // low, medium, high
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull()
});

export const ticketMessages = pgTable("ticket_messages", {
    id: uuid("id").defaultRandom().primaryKey(),
    ticket_id: uuid("ticket_id").notNull().references(() => tickets.id),
    user_id: uuid("user_id").notNull().references(() => users.id),
    content: text("content").notNull(),
    is_admin: boolean("is_admin").default(false).notNull(),
    created_at: timestamp("created_at").defaultNow().notNull()
});

export const withdrawals = pgTable("withdrawals", {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: uuid("user_id").notNull().references(() => users.id),
    amount: decimal("amount", { precision: 20, scale: 4 }).notNull(),
    status: text("status").default("pending").notNull(), // pending, approved, rejected
    payment_method: text("payment_method").notNull(),
    details: text("details"), // e.g. wallet address
    processed_at: timestamp("processed_at"),
    admin_note: text("admin_note"),
    approved_by_admin_id: uuid("approved_by_admin_id").references(() => users.id),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull()
}, (table) => {
    return {
        statusIdx: index("withdrawals_status_idx").on(table.status),
        createdAtIdx: index("withdrawals_created_at_idx").on(table.created_at),
    };
});

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// MARKETPLACE CATEGORIES (admin creates/edits/reorders)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const marketplaceCategories = pgTable('marketplace_categories', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),                    // "Watch Boosters", "Cycle Tools" etc.
    slug: text('slug').notNull().unique(),            // "watch-boosters"
    description: text('description'),
    iconEmoji: text('icon_emoji').notNull().default('ðŸ›’'),
    colorHex: text('color_hex').notNull().default('#f97316'),
    sortOrder: integer('sort_order').notNull().default(0),
    isActive: boolean('is_active').notNull().default(true),
    isVisible: boolean('is_visible').notNull().default(true), // hide without deactivating
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// MARKETPLACE ITEMS (fully dynamic, every field editable)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const marketplaceItems = pgTable('marketplace_items', {
    id: uuid('id').primaryKey().defaultRandom(),
    categoryId: uuid('category_id').notNull().references(() => marketplaceCategories.id),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    tagline: text('tagline'),                        // short marketing line
    description: text('description'),               // full description shown in modal
    iconEmoji: text('icon_emoji').notNull().default('ðŸ“¦'),
    colorHex: text('color_hex').notNull().default('#f97316'),
    badgeText: text('badge_text'),                  // "POPULAR", "NEW", "LIMITED" etc.
    badgeColorHex: text('badge_color_hex'),

    // â”€â”€ PRICING â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    price: numeric('price', { precision: 10, scale: 2 }).notNull(),
    originalPrice: numeric('original_price', { precision: 10, scale: 2 }),
    // if set, shows strikethrough + discount %
    currency: text('currency').notNull().default('USD'),
    priceLabel: text('price_label'),                // override display e.g. "Free with Pro"

    // â”€â”€ ITEM TYPE (controls what effect it has) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    itemType: text('item_type').notNull(),

    // â”€â”€ EFFECT CONFIGURATION (dynamic per itemType) â”€â”€â”€â”€â”€â”€
    effectMetadata: jsonb('effect_metadata').notNull().default('{}'),

    // â”€â”€ AVAILABILITY & LIMITS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    isActive: boolean('is_active').notNull().default(true),
    isVisible: boolean('is_visible').notNull().default(true),
    isFeatured: boolean('is_featured').notNull().default(false),
    stockLimit: integer('stock_limit'),              // null = unlimited
    stockRemaining: integer('stock_remaining'),      // null = unlimited
    maxPerUser: integer('max_per_user'),             // null = unlimited
    maxPerUserPeriod: text('max_per_user_period'),   // 'day' | 'week' | 'month' | 'lifetime'

    // â”€â”€ PURCHASE REQUIREMENTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    requiresActivePlan: boolean('requires_active_plan').default(false),
    requiredPlanIds: jsonb('required_plan_ids'),     // [] = any active plan
    requiredRank: text('required_rank'),             // min rank to purchase
    requiredMinCycles: integer('required_min_cycles'), // must have cycled X times
    requiredMinDeposit: numeric('required_min_deposit', { precision: 10, scale: 2 }),

    // â”€â”€ SCHEDULING â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    availableFrom: timestamp('available_from'),      // null = always available
    availableUntil: timestamp('available_until'),    // null = no expiry
    isTimeLimited: boolean('is_time_limited').default(false),

    // â”€â”€ DISPLAY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    sortOrder: integer('sort_order').notNull().default(0),
    imageUrl: text('image_url'),
    hoverImageUrl: text('hover_image_url'),          // image swap on hover
    tags: jsonb('tags').default('[]'),               // ["popular", "limited", "new"]

    // â”€â”€ STATS (auto-updated) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    totalPurchases: integer('total_purchases').notNull().default(0),
    totalRevenue: numeric('total_revenue', { precision: 12, scale: 2 }).default('0'),

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
    createdByAdminId: uuid('created_by_admin_id').references(() => users.id),
});

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// USER PURCHASES (every purchase recorded here)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const marketplacePurchases = pgTable('marketplace_purchases', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id),
    itemId: uuid('item_id').notNull().references(() => marketplaceItems.id),
    positionId: uuid('position_id'), // applies to a position if relevant
    pricePaid: numeric('price_paid', { precision: 10, scale: 2 }).notNull(),
    quantity: integer('quantity').notNull().default(1),
    status: text('status').notNull().default('active'),
    // active | consumed | expired | refunded | pending

    effectApplied: boolean('effect_applied').notNull().default(false),
    effectAppliedAt: timestamp('effect_applied_at'),
    effectExpiresAt: timestamp('effect_expires_at'),
    effectMetadataSnapshot: jsonb('effect_metadata_snapshot'),
    surpriseBoxResult: jsonb('surprise_box_result'),

    ledgerEntryId: uuid('ledger_entry_id'),          // ref to ledger debit entry
    purchasedAt: timestamp('purchased_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// USER INVENTORY (items that persist in user's account)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const userInventory = pgTable('user_inventory', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id),
    itemId: uuid('item_id').notNull().references(() => marketplaceItems.id),
    purchaseId: uuid('purchase_id').references(() => marketplacePurchases.id),
    itemType: text('item_type').notNull(),

    // For watch boosters
    extraAdsPerDay: integer('extra_ads_per_day'),
    positionId: uuid('position_id'),

    // For spin tokens
    spinsRemaining: integer('spins_remaining'),

    // For AP bundles
    apAmount: integer('ap_amount'),

    // For cosmetics
    assetUrl: text('asset_url'),
    assetId: text('asset_id'),
    isEquipped: boolean('is_equipped').default(false),

    // For referral tools
    bonusLinkCode: text('bonus_link_code'),
    bonusPct: numeric('bonus_pct', { precision: 5, scale: 2 }),

    // General
    status: text('status').notNull().default('active'),
    // active | expired | consumed | equipped
    acquiredAt: timestamp('acquired_at').defaultNow(),
    expiresAt: timestamp('expires_at'),
    consumedAt: timestamp('consumed_at'),
});

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// DISCOUNT CODES (admin creates, users apply)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const discountCodes = pgTable('discount_codes', {
    id: uuid('id').primaryKey().defaultRandom(),
    code: text('code').notNull().unique(),
    description: text('description'),
    discountType: text('discount_type').notNull(),   // pct | fixed
    discountValue: numeric('discount_value', { precision: 10, scale: 2 }).notNull(),
    applicableItemIds: jsonb('applicable_item_ids'), // null = all items
    applicableCategoryIds: jsonb('applicable_category_ids'),
    maxUses: integer('max_uses'),                    // null = unlimited
    usedCount: integer('used_count').notNull().default(0),
    maxUsesPerUser: integer('max_uses_per_user').default(1),
    validFrom: timestamp('valid_from'),
    validUntil: timestamp('valid_until'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').defaultNow(),
});

export const discountCodeUsages = pgTable('discount_code_usages', {
    id: uuid('id').primaryKey().defaultRandom(),
    codeId: uuid('code_id').notNull().references(() => discountCodes.id),
    userId: uuid('user_id').notNull().references(() => users.id),
    purchaseId: uuid('purchase_id').references(() => marketplacePurchases.id),
    discountApplied: numeric('discount_applied', { precision: 10, scale: 2 }).notNull(),
    usedAt: timestamp('used_at').defaultNow(),
});

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// FLASH SALE EVENTS (time-limited price overrides)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const flashSaleEvents = pgTable('flash_sale_events', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    discountPct: numeric('discount_pct', { precision: 5, scale: 2 }).notNull(),
    applicableItemIds: jsonb('applicable_item_ids'), // null = all items
    applicableCategoryIds: jsonb('applicable_category_ids'),
    startsAt: timestamp('starts_at').notNull(),
    endsAt: timestamp('ends_at').notNull(),
    bannerText: text('banner_text'),                 // "âš¡ FLASH SALE â€” 30% OFF!"
    bannerColorHex: text('banner_color_hex').default('#ef4444'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').defaultNow(),
});

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// MARKETPLACE HOMEPAGE LAYOUT (admin drag-and-drop)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const marketplaceLayout = pgTable('marketplace_layout', {
    id: uuid('id').primaryKey().defaultRandom(),
    sectionType: text('section_type').notNull(),
    sectionTitle: text('section_title'),
    sectionSubtitle: text('section_subtitle'),
    contentConfig: jsonb('content_config').notNull().default('{}'),
    sortOrder: integer('sort_order').notNull().default(0),
    isActive: boolean('is_active').notNull().default(true),
    updatedAt: timestamp('updated_at').defaultNow(),
});


// FEATURE 1: Matrix Trees
export const matrixPositions = pgTable('matrix_positions', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id),
    parentId: uuid('parent_id'), // self-referential
    position: integer('position'), // 1 = left, 2 = right (binary) or 1-3 for ternary
    levelId: integer('level_id').references(() => levels.id),
    status: text('status').default('active'), // active | cycled | empty
    cycledAt: timestamp('cycled_at'),
    createdAt: timestamp('created_at').defaultNow(),
});

// FEATURE 2: Matrix Cycling Predictions
export const matrixCyclePredictions = pgTable('matrix_cycle_predictions', {
    id: uuid('id').primaryKey().defaultRandom(),
    positionId: uuid('position_id').references(() => matrixPositions.id),
    predictedCycleDate: timestamp('predicted_cycle_date'),
    fillRateUsed: decimal('fill_rate_used', { precision: 10, scale: 4 }), // fills/day at time of calculation
    calculatedAt: timestamp('calculated_at').defaultNow(),
    actualCycledAt: timestamp('actual_cycled_at'), // filled retroactively for accuracy tracking
});

// FEATURE 3: Micro-Investment Pools
export const investmentPools = pgTable('investment_pools', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id),
    amount: decimal('amount', { precision: 20, scale: 4 }).notNull(),
    yieldRate: decimal('yield_rate', { precision: 5, scale: 2 }).notNull(),
    durationDays: integer('duration_days').notNull(),
    status: text('status').default('active'), // active | matured | withdrawn_early
    lockedAt: timestamp('locked_at').defaultNow(),
    maturesAt: timestamp('matures_at').notNull(),
    payoutAmount: decimal('payout_amount', { precision: 20, scale: 4 }),
    paidAt: timestamp('paid_at'),
});

export const poolSettings = pgTable('pool_settings', {
    id: uuid('id').primaryKey().defaultRandom(),
    durationDays: integer('duration_days').unique().notNull(),
    yieldRate: decimal('yield_rate', { precision: 5, scale: 2 }).notNull(),
    minAmount: decimal('min_amount', { precision: 20, scale: 4 }).notNull(),
    isActive: boolean('is_active').default(true),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// FEATURE 4: Ledger Receipts
export const ledgerReceipts = pgTable('ledger_receipts', {
    id: uuid('id').primaryKey().defaultRandom(),
    ledgerEntryId: uuid('ledger_entry_id').references(() => ledger.id),
    userId: uuid('user_id').notNull().references(() => users.id),
    receiptHash: text('receipt_hash').notNull(),
    transactionType: text('transaction_type').notNull(),
    amount: decimal('amount', { precision: 20, scale: 4 }).notNull(),
    status: text('status').default('valid'), // valid | void
    createdAt: timestamp('created_at').defaultNow(),
});

// FEATURE 5: Withdrawal Scheduling
export const withdrawalSchedules = pgTable('withdrawal_schedules', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id),
    frequency: text('frequency').notNull(), // weekly | biweekly | monthly
    dayOfWeek: integer('day_of_week'), // 0-6, null if monthly
    dayOfMonth: integer('day_of_month'), // 1-31, null if weekly
    amountType: text('amount_type').notNull(), // fixed | all
    fixedAmount: decimal('fixed_amount', { precision: 20, scale: 4 }),
    minThreshold: decimal('min_threshold', { precision: 20, scale: 4 }).default('0.00'),
    payoutMethodId: uuid('payout_method_id'), // placeholder for extension
    isActive: boolean('is_active').default(true),
    nextRunAt: timestamp('next_run_at'),
    lastRunAt: timestamp('last_run_at'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const withdrawalScheduleLog = pgTable('withdrawal_schedule_log', {
    id: uuid('id').primaryKey().defaultRandom(),
    scheduleId: uuid('schedule_id').references(() => withdrawalSchedules.id),
    status: text('status').notNull(), // executed | skipped | failed
    amount: decimal('amount', { precision: 20, scale: 4 }),
    reason: text('reason'), // e.g., "balance below threshold"
    executedAt: timestamp('executed_at').defaultNow(),
});

// FEATURE 7: Liability Stress Test Simulator
export const stressTestSnapshots = pgTable('stress_test_snapshots', {
    id: uuid('id').primaryKey().defaultRandom(),
    adminId: uuid('admin_id').references(() => users.id),
    scenarioName: text('scenario_name'),
    withdrawalPct: decimal('withdrawal_pct', { precision: 5, scale: 2 }),
    poolWithdrawalPct: decimal('pool_withdrawal_pct', { precision: 5, scale: 2 }),
    revenuePauseDays: integer('revenue_pause_days'),
    totalDemand: decimal('total_demand', { precision: 20, scale: 4 }),
    availableReserves: decimal('available_reserves', { precision: 20, scale: 4 }),
    shortfall: decimal('shortfall', { precision: 20, scale: 4 }),
    solvencyScore: integer('solvency_score'),
    createdAt: timestamp('created_at').defaultNow(),
});

// FEATURE 8: Advertiser ROI
export const adImpressions = pgTable('ad_impressions', {
    id: uuid('id').primaryKey().defaultRandom(),
    adId: uuid('ad_id').references(() => ads.id),
    userId: uuid('user_id').references(() => users.id), // viewer
    advertiserId: uuid('advertiser_id').references(() => users.id),
    viewDurationSeconds: integer('view_duration_seconds'),
    country: text('country'),
    deviceType: text('device_type'), // mobile | desktop | tablet
    clicked: boolean('clicked').default(false),
    createdAt: timestamp('created_at').defaultNow(),
});

// FEATURE 9: Referral Contests
export const contests = pgTable('contests', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    description: text('description'),
    metric: text('metric').notNull(), // referrals | clicks | cycles
    prizeType: text('prize_type').notNull(), // balance | multiplier | item
    prizeValue: decimal('prize_value', { precision: 20, scale: 4 }),
    prizeItemId: uuid('prize_item_id'), // if type = item
    startAt: timestamp('start_at').notNull(),
    endAt: timestamp('end_at').notNull(),
    status: text('status').default('upcoming'), // upcoming | active | ended
    createdAt: timestamp('created_at').defaultNow(),
});

export const contestEntries = pgTable('contest_entries', {
    id: uuid('id').primaryKey().defaultRandom(),
    contestId: uuid('contest_id').references(() => contests.id),
    userId: uuid('user_id').references(() => users.id),
    score: integer('score').default(0),
    rank: integer('rank'),
    prizeAwarded: boolean('prize_awarded').default(false),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// FEATURE 10: Achievement System
export const badges = pgTable('badges', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    description: text('description'),
    iconUrl: text('icon_url'),
    category: text('category').notNull(),
    rarity: text('rarity').default('common'), // common | rare | legendary
    triggerType: text('trigger_type').notNull(),
    triggerThreshold: integer('trigger_threshold').notNull(),
    marketplaceDiscountPct: decimal('marketplace_discount_pct', { precision: 5, scale: 2 }).default('0.00'),
    isActive: boolean('is_active').default(true),
});

export const userBadges = pgTable('user_badges', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id),
    badgeId: uuid('badge_id').references(() => badges.id),
    earnedAt: timestamp('earned_at').defaultNow(),
    isShowcased: boolean('is_showcased').default(false),
});

// FEATURE 11: Team Chat
export const chatRooms = pgTable('chat_rooms', {
    id: uuid('id').primaryKey().defaultRandom(),
    sponsorId: uuid('sponsor_id').references(() => users.id),
    name: text('name').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});

export const chatMessages = pgTable('chat_messages', {
    id: uuid('id').primaryKey().defaultRandom(),
    roomId: uuid('room_id').references(() => chatRooms.id),
    userId: uuid('user_id').references(() => users.id),
    content: text('content').notNull(),
    isPinned: boolean('is_pinned').default(false),
    isAnnouncement: boolean('is_announcement').default(false),
    deletedAt: timestamp('deleted_at'), // soft delete
    createdAt: timestamp('created_at').defaultNow(),
});

export const chatReactions = pgTable('chat_reactions', {
    id: uuid('id').primaryKey().defaultRandom(),
    messageId: uuid('message_id').references(() => chatMessages.id),
    userId: uuid('user_id').references(() => users.id),
    emoji: text('emoji').notNull(),
});

export const chatMembers = pgTable('chat_members', {
    id: uuid('id').primaryKey().defaultRandom(),
    roomId: uuid('room_id').references(() => chatRooms.id),
    userId: uuid('user_id').references(() => users.id),
    role: text('role').default('member'), // sponsor | member
    mutedUntil: timestamp('muted_until'),
    lastReadAt: timestamp('last_read_at'),
});

// PHASE 23: Real-Time Notifications
export const notifications = pgTable('notifications', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id),
    type: text('type').notNull(), // 'earning' | 'cycle' | 'credit' | 'system' | 'withdrawal' | 'deposit'
    title: text('title').notNull(),
    description: text('description').notNull(),
    amount: decimal('amount', { precision: 20, scale: 4 }),
    isRead: boolean('is_read').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// AD POSITIONS (for PTC / Watch Boosters)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const adPlans = pgTable('ad_plans', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    price: numeric('price', { precision: 10, scale: 2 }).notNull(),
    dailyAds: integer('daily_ads').notNull(),
    clickGoal: numeric('click_goal', { precision: 10, scale: 2 }).notNull(), // = price
    perClickValue: numeric('per_click_value', { precision: 10, scale: 4 }).notNull(),
    cyclePayout: numeric('cycle_payout', { precision: 10, scale: 2 }).notNull(), // e.g. 185% of price
    roiPct: integer('roi_pct').notNull(),
    sponsorBonusPct: decimal('sponsor_bonus_pct', { precision: 5, scale: 2 }).default('15.00').notNull(),
    communityPoolPct: decimal('community_pool_pct', { precision: 5, scale: 2 }).default('8.00').notNull(),
    adDurationSeconds: integer('ad_duration_seconds').default(30).notNull(),
    waitBetweenAdsSeconds: integer('wait_between_ads_seconds').default(5).notNull(),
    maxAdsPerDayWithBoosters: integer('max_ads_per_day_boosted').default(32).notNull(),
    colorHex: text('color_hex').default('#6366f1'),
    iconName: text('icon_name').default('Zap'),
    sessionResetType: text('session_reset_type').default('rolling_24h').notNull(), // 'rolling_24h' | 'fixed_midnight'
    durationDays: integer('duration_days').notNull().default(30),
    isActive: boolean('is_active').default(true),
});

export const userAdPositions = pgTable('user_ad_positions', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id),
    adPlanId: uuid('ad_plan_id').notNull().references(() => adPlans.id),
    status: text('status').notNull().default('active'), // active | cycled | expired
    clickGoalSnapshot: numeric('click_goal_snapshot', { precision: 10, scale: 2 }).notNull(),
    lockedBalance: numeric('locked_balance', { precision: 15, scale: 4 }).default('0'),
    pendingPayoutAmount: numeric('pending_payout_amount', { precision: 15, scale: 4 }).default('0'),
    sessionEarnedToday: numeric('session_earned_today', { precision: 15, scale: 4 }).default('0'),
    adsWatchedToday: integer('ads_watched_today').default(0),
    lastAdWatchedAt: timestamp('last_ad_watched_at'),
    nextAdsAvailableAt: timestamp('next_ads_available_at'),
    nextCycleMultiplier: integer('next_cycle_multiplier').default(1),
    boostedAdsPerDay: integer('boosted_ads_per_day').default(0),
    currentStreak: integer('current_streak').default(0),
    longestStreak: integer('longest_streak').default(0),
    totalCycles: integer('total_cycles').default(0),
    lastActiveDate: timestamp('last_active_date'),
    spinWheelAvailable: boolean('spin_wheel_available').default(false),
    spinsUsedThisCycle: integer('spins_used_this_cycle').default(0),
    isDeadStar: boolean('is_dead_star').default(false),
    deadStarAt: timestamp('dead_star_at'),
    expiresAt: timestamp('expires_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// COMMUNITY POOL
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const communityPool = pgTable('community_pool', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    totalLocked: numeric('total_locked', { precision: 15, scale: 2 }).default('0'),
    payoutTime: timestamp('payout_time'),
    isActive: boolean('is_active').default(true),
});

export const communityPoolLedger = pgTable('community_pool_ledger', {
    id: uuid('id').primaryKey().defaultRandom(),
    poolId: uuid('pool_id').references(() => communityPool.id),
    amount: numeric('amount', { precision: 15, scale: 4 }).notNull(),
    type: text('type').notNull(), // 'contribution' | 'distribution'
    bucket: text('bucket').notNull(), // 'loyalty' | 'jackpot' | 'top_clickers' | 'referral_champs' | 'hardship'
    referenceId: text('reference_id'),
    createdAt: timestamp('created_at').defaultNow(),
});

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// AD WATCH LOG & HISTORY
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const adWatchLog = pgTable('ad_watch_log', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id),
    adId: uuid('ad_id').notNull().references(() => ads.id),
    earnedAmount: numeric('earned_amount', { precision: 10, scale: 4 }).notNull(),
    lockedBalanceBefore: numeric('locked_balance_before', { precision: 15, scale: 4 }).notNull(),
    lockedBalanceAfter: numeric('locked_balance_after', { precision: 15, scale: 4 }).notNull(),
    cycleTriggered: boolean('cycle_triggered').default(false),
    adToken: text('ad_token'),
    adSignature: text('ad_signature'),
    ipAddress: text('ip_address'),
    tokenIssuedAt: timestamp('token_issued_at'), // nullable â€” only populated for new watches
    createdAt: timestamp('created_at').defaultNow(),
});

export const adCycleHistory = pgTable('ad_cycle_history', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id),
    positionId: uuid('position_id').references(() => userAdPositions.id),
    cycleNumber: integer('cycle_number').notNull(),
    basePayout: numeric('base_payout', { precision: 15, scale: 4 }).notNull(),
    spinBonusAmount: numeric('spin_bonus_amount', { precision: 15, scale: 4 }).default('0'),
    cycleMultiplierApplied: integer('cycle_multiplier_applied').default(1),
    totalPaidToUser: numeric('total_paid_to_user', { precision: 15, scale: 4 }).notNull(),
    sponsorBonusPaid: numeric('sponsor_bonus_paid', { precision: 15, scale: 4 }).notNull(),
    communityPoolContribution: numeric('community_pool_contribution', { precision: 15, scale: 4 }).notNull(),
    autoRebuyAmount: numeric('auto_rebuy_amount', { precision: 15, scale: 4 }).default('0'),
    spinWheelUsed: boolean('spin_wheel_used').default(false),
    totalSpinsUsed: integer('total_spins_used').default(0),
    spinResults: jsonb('spin_results').default('[]'),
    cycleStartedAt: timestamp('cycle_started_at'),
    daysToComplete: integer('days_to_complete'),
    rebuyCreated: boolean('rebuy_created').default(false),
    newPositionId: uuid('new_position_id'),
    createdAt: timestamp('created_at').defaultNow(),
});

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// SPIN WHEEL SYSTEM
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const spinWheelConfigs = pgTable('spin_wheel_configs', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(), // 'Standard Wheel' | 'VIP Wheel'
    basePrice: numeric('base_price', { precision: 10, scale: 2 }).default('2.50'),
    freeSpinsPerCycle: integer('free_spins_per_cycle').default(1),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
});

export const spinWheelSlices = pgTable('spin_wheel_slices', {
    id: uuid('id').primaryKey().defaultRandom(),
    configId: uuid('config_id').references(() => spinWheelConfigs.id),
    label: text('label').notNull(), // 'Double Next Cycle' | '$5 Bonus'
    rewardType: text('reward_type').notNull(), // 'cash' | 'multiplier' | 'booster' | 'ap_bonus' | 'nothing'
    rewardValue: numeric('reward_value', { precision: 15, scale: 4 }),
    weight: integer('weight').notNull().default(100), // higher = more likely
    colorHex: text('color_hex').default('#ffffff'),
    iconName: text('icon_name'),
    isGuaranteedOnStreak: boolean('is_guaranteed_on_streak').default(false),
    streakThreshold: integer('streak_threshold'),
});

export const spinWheelResults = pgTable('spin_wheel_results', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id),
    sliceId: uuid('slice_id').references(() => spinWheelSlices.id),
    isFree: boolean('is_free').default(true),
    pricePaid: numeric('price_paid', { precision: 10, scale: 2 }).default('0'),
    wonValue: numeric('won_value', { precision: 15, scale: 4 }),
    outcomeJson: jsonb('outcome_json').default('{}'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const spinEvents = pgTable('spin_events', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(), // 'Golden Hour' | 'Weekend Mega'
    multiplier: decimal('multiplier', { precision: 5, scale: 2 }).default('1.00'),
    startsAt: timestamp('starts_at').notNull(),
    endsAt: timestamp('ends_at').notNull(),
    isActive: boolean('is_active').default(true),
});

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// TELEGRAM USER SETTINGS (per user)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const userTelegramSettings = pgTable('user_telegram_settings', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().unique().references(() => users.id),

    // Connection
    telegramUsername: text('telegram_username'),
    // Entered at signup e.g. "@ahmad" or "ahmad" (store without @)
    telegramChatId: text('telegram_chat_id'),
    // Set automatically when user sends /start to bot
    // null = not yet connected (username given but bot not messaged yet)
    isConnected: boolean('is_connected').notNull().default(false),
    connectedAt: timestamp('connected_at'),
    lastMessageAt: timestamp('last_message_at'),

    // Notification toggles (user controls these)
    notifyCycleComplete: boolean('notify_cycle_complete').notNull().default(true),
    notifySpinWheelReady: boolean('notify_spin_wheel_ready').notNull().default(true),
    notifyWithdrawalSubmitted: boolean('notify_withdrawal_submitted').notNull().default(true),
    notifyWithdrawalApproved: boolean('notify_withdrawal_approved').notNull().default(true),
    notifyWithdrawalPaid: boolean('notify_withdrawal_paid').notNull().default(true),
    notifyWithdrawalRejected: boolean('notify_withdrawal_rejected').notNull().default(true),
    notifyAdsReady: boolean('notify_ads_ready').notNull().default(true),
    notifyReferralJoined: boolean('notify_referral_joined').notNull().default(true),
    notifyReferralCycled: boolean('notify_referral_cycled').notNull().default(true),
    notifySpinBonusWon: boolean('notify_spin_bonus_won').notNull().default(true),
    notifyBadgeUnlocked: boolean('notify_badge_unlocked').notNull().default(true),
    notifyPoolJackpotWon: boolean('notify_pool_jackpot_won').notNull().default(true),
    notifyPoolDistribution: boolean('notify_pool_distribution').notNull().default(true),
    notifyDeadStarWarning: boolean('notify_dead_star_warning').notNull().default(true),
    notifyContestRankUpdate: boolean('notify_contest_rank_update').notNull().default(false),
    notifyFlashSaleLive: boolean('notify_flash_sale_live').notNull().default(false),
    notifySpinEventActive: boolean('notify_spin_event_active').notNull().default(false),
    notifyMatrixCycle: boolean('notify_matrix_cycle').notNull().default(true),
    notifyMatchingBonus: boolean('notify_matching_bonus').notNull().default(true),
    notifyLoginStreak: boolean('notify_login_streak').notNull().default(false),
    notifySystemAnnouncement: boolean('notify_system_announcement').notNull().default(true),

    // Quiet hours (user sets their timezone + quiet window)
    quietHoursEnabled: boolean('quiet_hours_enabled').notNull().default(false),
    quietHoursStart: integer('quiet_hours_start'),  // 0-23 hour
    quietHoursEnd: integer('quiet_hours_end'),      // 0-23 hour
    timezone: text('timezone').default('UTC'),

    // Message frequency limits
    maxMessagesPerHour: integer('max_messages_per_hour').default(10),
    // Prevents spam if many events fire at once

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// TELEGRAM NOTIFICATION LOG (every message sent)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const telegramNotificationLog = pgTable('telegram_notification_log', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id),
    // null for broadcast messages
    telegramChatId: text('telegram_chat_id').notNull(),
    eventType: text('event_type').notNull(),
    // cycle_complete | spin_ready | withdrawal_approved | etc.
    messageText: text('message_text').notNull(),
    telegramMessageId: integer('telegram_message_id'),
    // returned by Telegram API after successful send
    status: text('status').notNull().default('sent'),
    // sent | failed | blocked | rate_limited
    errorMessage: text('error_message'),
    sentAt: timestamp('sent_at').defaultNow(),
});

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// ADMIN TELEGRAM NOTIFICATION SETTINGS (global controls)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const telegramAdminSettings = pgTable('telegram_admin_settings', {
    id: uuid('id').primaryKey().defaultRandom(),

    // Bot identity (read from here, not hardcoded)
    botToken: text('bot_token'),
    // Encrypted in DB. Falls back to TELEGRAM_BOT_TOKEN env var.
    botUsername: text('bot_username'),    // e.g. "MatClickBot" â€” editable
    botDisplayName: text('bot_display_name'), // shown in messages header

    // Global on/off switches per event type
    globalCycleComplete: boolean('global_cycle_complete').notNull().default(true),
    globalSpinWheelReady: boolean('global_spin_wheel_ready').notNull().default(true),
    globalWithdrawalApproved: boolean('global_withdrawal_approved').notNull().default(true),
    globalWithdrawalPaid: boolean('global_withdrawal_paid').notNull().default(true),
    globalWithdrawalRejected: boolean('global_withdrawal_rejected').notNull().default(true),
    globalAdsReady: boolean('global_ads_ready').notNull().default(true),
    globalReferralJoined: boolean('global_referral_joined').notNull().default(true),
    globalReferralCycled: boolean('global_referral_cycled').notNull().default(true),
    globalSpinBonusWon: boolean('global_spin_bonus_won').notNull().default(true),
    globalBadgeUnlocked: boolean('global_badge_unlocked').notNull().default(true),
    globalPoolJackpotWon: boolean('global_pool_jackpot_won').notNull().default(true),
    globalPoolDistribution: boolean('global_pool_distribution').notNull().default(true),
    globalDeadStarWarning: boolean('global_dead_star_warning').notNull().default(true),
    globalContestRankUpdate: boolean('global_contest_rank_update').notNull().default(true),
    globalFlashSaleLive: boolean('global_flash_sale_live').notNull().default(true),
    globalSpinEventActive: boolean('global_spin_event_active').notNull().default(true),
    globalMatrixCycle: boolean('global_matrix_cycle').notNull().default(true),
    globalMatchingBonus: boolean('global_matching_bonus').notNull().default(true),
    globalSystemAnnouncement: boolean('global_system_announcement').notNull().default(true),
    globalLoginStreak: boolean('global_login_streak').notNull().default(false),

    // Message templates (fully editable by admin)
    // Each is a template string with {variables} for dynamic data
    templateCycleComplete: text('template_cycle_complete'),
    templateSpinWheelReady: text('template_spin_wheel_ready'),
    templateWithdrawalApproved: text('template_withdrawal_approved'),
    templateWithdrawalPaid: text('template_withdrawal_paid'),
    templateWithdrawalRejected: text('template_withdrawal_rejected'),
    templateAdsReady: text('template_ads_ready'),
    templateReferralJoined: text('template_referral_joined'),
    templateReferralCycled: text('template_referral_cycled'),
    templateSpinBonusWon: text('template_spin_bonus_won'),
    templateBadgeUnlocked: text('template_badge_unlocked'),
    templatePoolJackpotWon: text('template_pool_jackpot_won'),
    templatePoolDistribution: text('template_pool_distribution'),
    templateDeadStarWarning: text('template_dead_star_warning'),
    templateContestRankUpdate: text('template_contest_rank_update'),
    templateFlashSaleLive: text('template_flash_sale_live'),
    templateSpinEventActive: text('template_spin_event_active'),
    templateMatrixCycle: text('template_matrix_cycle'),
    templateMatchingBonus: text('template_matching_bonus'),
    templateSystemAnnouncement: text('template_system_announcement'),
    templateWelcome: text('template_welcome'),
    // Sent when user first connects their Telegram

    // Rate limiting
    globalMaxMessagesPerUserPerHour: integer('global_max_per_user_per_hour').default(10),
    globalRateLimitEnabled: boolean('global_rate_limit_enabled').default(true),

    // Broadcast controls
    lastBroadcastAt: timestamp('last_broadcast_at'),
    broadcastCooldownMinutes: integer('broadcast_cooldown_minutes').default(60),

    updatedAt: timestamp('updated_at').defaultNow(),
    updatedByAdminId: uuid('updated_by_admin_id').references(() => users.id),
});

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// TELEGRAM BROADCAST HISTORY
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const telegramBroadcasts = pgTable('telegram_broadcasts', {
    id: uuid('id').primaryKey().defaultRandom(),
    adminId: uuid('admin_id').references(() => users.id),
    message: text('message').notNull(),
    targetType: text('target_type').notNull(),
    // all | plan_tier | rank | active_only | specific_users
    targetConfig: jsonb('target_config'),
    // { planId: "xxx" } or { rank: "Leader" } or { userIds: [...] }
    totalTargeted: integer('total_targeted').default(0),
    totalSent: integer('total_sent').default(0),
    totalFailed: integer('total_failed').default(0),
    status: text('status').default('pending'),
    // pending | sending | completed | failed
    scheduledAt: timestamp('scheduled_at'),
    // null = send immediately
    startedAt: timestamp('started_at'),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').defaultNow(),
});

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// ADMIN AUDIT LOG (every admin action recorded here)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const adminAuditLog = pgTable('admin_audit_log', {
    id: uuid('id').primaryKey().defaultRandom(),
    adminId: uuid('admin_id').notNull().references(() => users.id),
    adminUsername: text('admin_username').notNull(),
    targetUserId: uuid('target_user_id').references(() => users.id),
    targetUsername: text('target_username'),
    action: text('action').notNull(),
    // user_ban | user_unban | user_freeze | user_unfreeze |
    // user_delete | user_restore | balance_add | balance_deduct |
    // balance_zero | ledger_reversal | withdrawal_approve |
    // withdrawal_reject | withdrawal_force_pay | role_change |
    // password_reset | email_change | impersonate_start |
    // impersonate_end | kyc_approve | kyc_reject |
    // notification_send | note_add | plan_terminate |
    // plan_force_cycle | referral_change | 2fa_reset |
    // session_terminate | ip_ban | device_ban |
    // bulk_action | data_export
    category: text('category').notNull(),
    // account | financial | security | communication | bulk
    description: text('description').notNull(),
    metadata: jsonb('metadata'),
    // before/after values, amounts, reasons etc.
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    severity: text('severity').notNull().default('low'),
    // low | medium | high | critical
    isReversible: boolean('is_reversible').default(false),
    reversedAt: timestamp('reversed_at'),
    reversedByAdminId: uuid('reversed_by_admin_id'),
    createdAt: timestamp('created_at').defaultNow(),
});

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// USER ACCOUNT FLAGS & STATUS
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const userAccountStatus = pgTable('user_account_status', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().unique().references(() => users.id),

    // Account status
    status: text('status').notNull().default('active'),
    // active | frozen | banned | suspended | pending_review |
    // deleted | shadow_banned

    // Freeze
    isFrozen: boolean('is_frozen').notNull().default(false),
    frozenAt: timestamp('frozen_at'),
    frozenByAdminId: uuid('frozen_by_admin_id'),
    frozenReason: text('frozen_reason'),
    frozenUntil: timestamp('frozen_until'),  // null = indefinite
    freezeType: text('freeze_type'),
    // full | withdrawals_only | deposits_only | trading_only

    // Ban
    isBanned: boolean('is_banned').notNull().default(false),
    bannedAt: timestamp('banned_at'),
    bannedByAdminId: uuid('banned_by_admin_id'),
    banReason: text('ban_reason'),
    banType: text('ban_type'),
    // permanent | temporary | shadow
    banExpiresAt: timestamp('ban_expires_at'),  // null = permanent

    // Deletion
    isDeleted: boolean('is_deleted').notNull().default(false),
    deletedAt: timestamp('deleted_at'),
    deletedByAdminId: uuid('deleted_by_admin_id'),
    deletionReason: text('deletion_reason'),
    deletionType: text('deletion_type'),
    // soft | scheduled_hard
    hardDeleteScheduledAt: timestamp('hard_delete_scheduled_at'),

    // Withdrawal controls
    withdrawalsEnabled: boolean('withdrawals_enabled').notNull().default(true),
    withdrawalHoldUntil: timestamp('withdrawal_hold_until'),
    withdrawalHoldReason: text('withdrawal_hold_reason'),
    maxWithdrawalPerDay: numeric('max_withdrawal_per_day'),
    // null = platform default

    // Earning controls
    earningsEnabled: boolean('earnings_enabled').notNull().default(true),
    earningsMultiplier: numeric('earnings_multiplier').default('1.00'),
    // 0 = suspended, 0.5 = half earnings, 1 = normal, 2 = boosted

    // KYC
    kycStatus: text('kyc_status').default('not_required'),
    // not_required | pending | approved | rejected
    kycApprovedAt: timestamp('kyc_approved_at'),
    kycRejectedReason: text('kyc_rejected_reason'),

    // Risk & Fraud
    riskScore: integer('risk_score').default(0),       // 0-100
    fraudFlags: jsonb('fraud_flags').default('[]'),
    // ["duplicate_ip", "vpn_detected", "suspicious_timing"]
    isHighRisk: boolean('is_high_risk').default(false),
    requiresManualReview: boolean('requires_manual_review').default(false),

    // 2FA
    twoFaEnabled: boolean('two_fa_enabled').default(false),
    twoFaResetRequestedAt: timestamp('two_fa_reset_requested_at'),

    updatedAt: timestamp('updated_at').defaultNow(),
    updatedByAdminId: uuid('updated_by_admin_id'),
});

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// ADMIN NOTES (internal notes per user)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const adminUserNotes = pgTable('admin_user_notes', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id),
    adminId: uuid('admin_id').notNull().references(() => users.id),
    adminUsername: text('admin_username').notNull(),
    note: text('note').notNull(),
    isPinned: boolean('is_pinned').default(false),
    isPrivate: boolean('is_private').default(false),
    // private = only visible to that admin
    category: text('category').default('general'),
    // general | fraud | support | financial | vip
    color: text('color').default('#f97316'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
    deletedAt: timestamp('deleted_at'),
});

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// IP BAN LIST
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const ipBanList = pgTable('ip_ban_list', {
    id: uuid('id').primaryKey().defaultRandom(),
    ipAddress: text('ip_address').notNull(),
    cidrRange: text('cidr_range'),  // e.g. "192.168.1.0/24"
    reason: text('reason'),
    bannedByAdminId: uuid('banned_by_admin_id').references(() => users.id),
    expiresAt: timestamp('expires_at'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
});

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// ADMIN MESSAGES (direct message to user)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const adminMessages = pgTable('admin_messages', {
    id: uuid('id').primaryKey().defaultRandom(),
    fromAdminId: uuid('from_admin_id').references(() => users.id),
    toUserId: uuid('to_user_id').notNull().references(() => users.id),
    subject: text('subject').notNull(),
    message: text('message').notNull(),
    channel: text('channel').notNull().default('platform'),
    // platform | email | telegram | all
    isRead: boolean('is_read').default(false),
    readAt: timestamp('read_at'),
    sentAt: timestamp('sent_at').defaultNow(),
});


// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// FRAUD INTELLIGENCE CENTER
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€




export const fraudAlerts = pgTable('fraud_alerts', {
    id: uuid('id').primaryKey().defaultRandom(),
    detectorType: text('detector_type').notNull(),
    // duplicate_ip | speed_violation | vpn | withdrawal_anomaly | self_referral
    // device_cluster | bot_pattern | earnings_mismatch | dormant_revival
    // network_graph | burst_registration
    severity: text('severity').notNull().default('suspicious'),
    // suspicious | high_risk | critical
    title: text('title').notNull(),
    description: text('description').notNull(),
    involvedUserIds: jsonb('involved_user_ids').default('[]'),
    involvedUsernames: jsonb('involved_usernames').default('[]'),
    metadata: jsonb('metadata').default('{}'), // detector-specific data
    status: text('status').notNull().default('new'),
    // new | under_review | resolved | false_positive
    reviewedByAdminId: uuid('reviewed_by_admin_id').references(() => users.id),
    reviewNote: text('review_note'),
    resolvedAt: timestamp('resolved_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
    return {
        statusIdx: index("fraud_alerts_status_idx").on(table.status),
        createdAtIdx: index("fraud_alerts_created_at_idx").on(table.createdAt),
    };
});

export const deviceFingerprints = pgTable('device_fingerprints', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id),
    sessionId: text('session_id'),
    browser: text('browser'),
    os: text('os'),
    screenResolution: text('screen_resolution'), // e.g. "1920x1080"
    timezone: text('timezone'),
    language: text('language'),
    fontsHash: text('fonts_hash'),
    userAgentHash: text('user_agent_hash'),
    fingerprintHash: text('fingerprint_hash'), // combined hash of all signals
    ipAddress: text('ip_address'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const vpnIpRanges = pgTable('vpn_ip_ranges', {
    id: uuid('id').primaryKey().defaultRandom(),
    cidr: text('cidr').notNull(), // e.g. "10.8.0.0/16"
    providerName: text('provider_name'), // e.g. "NordVPN", "Tor Exit"
    rangeType: text('range_type').notNull().default('vpn'),
    // vpn | proxy | tor | datacenter
    source: text('source'), // where the list came from
    isActive: boolean('is_active').notNull().default(true),
    addedByAdminId: uuid('added_by_admin_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const fraudWhitelist = pgTable('fraud_whitelist', {
    id: uuid('id').primaryKey().defaultRandom(),
    type: text('type').notNull(), // 'ip' | 'user'
    value: text('value').notNull(), // IP address or user ID
    reason: text('reason').notNull(),
    approvedByAdminId: uuid('approved_by_admin_id').references(() => users.id),
    approvedByUsername: text('approved_by_username'),
    expiresAt: timestamp('expires_at'), // null = permanent
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const fraudSettings = pgTable('fraud_settings', {
    id: integer('id').primaryKey().default(1), // single-row table
    // Duplicate IP
    dupIpEnabled: boolean('dup_ip_enabled').notNull().default(true),
    dupIpMinAccounts: integer('dup_ip_min_accounts').notNull().default(2),
    // Speed Violations
    speedEnabled: boolean('speed_enabled').notNull().default(true),
    speedGraceSeconds: integer('speed_grace_seconds').notNull().default(3),
    speedAutoWarnAfter: integer('speed_auto_warn_after').notNull().default(5),
    speedAutoSuspendAfter: integer('speed_auto_suspend_after').notNull().default(20),
    speedAutoBanAfter: integer('speed_auto_ban_after').notNull().default(50),
    // VPN
    vpnEnabled: boolean('vpn_enabled').notNull().default(true),
    vpnAction: text('vpn_action').notNull().default('log'), // log | kyc | block | ban
    // Withdrawals
    wdEnabled: boolean('wd_enabled').notNull().default(true),
    wdNewAccountHours: integer('wd_new_account_hours').notNull().default(72),
    wdMultipleWithin24h: integer('wd_multiple_within_24h').notNull().default(3),
    wdInactivityDays: integer('wd_inactivity_days').notNull().default(60),
    // Self Referral
    selfRefEnabled: boolean('self_ref_enabled').notNull().default(true),
    // Device Clusters
    deviceEnabled: boolean('device_enabled').notNull().default(true),
    deviceFuzzyThreshold: integer('device_fuzzy_threshold').notNull().default(8), // out of 10
    // Bot Patterns
    botEnabled: boolean('bot_enabled').notNull().default(true),
    botMinWatches: integer('bot_min_watches').notNull().default(50),
    botTimingStdDevThreshold: numeric('bot_timing_std_dev_threshold', { precision: 5, scale: 2 }).notNull().default('2.0'),
    botAutoBanScore: integer('bot_auto_ban_score').notNull().default(90),
    // Earnings Mismatch
    mismatchEnabled: boolean('mismatch_enabled').notNull().default(true),
    mismatchTolerancePct: numeric('mismatch_tolerance_pct', { precision: 5, scale: 2 }).notNull().default('5.0'),
    // Dormant Revival
    dormantEnabled: boolean('dormant_enabled').notNull().default(true),
    dormantThresholdDays: integer('dormant_threshold_days').notNull().default(60),
    dormantHoldDays: integer('dormant_hold_days').notNull().default(7),
    dormantAutoHold: boolean('dormant_auto_hold').notNull().default(false),
    // Burst Registrations
    burstEnabled: boolean('burst_enabled').notNull().default(true),
    burstMinAccounts: integer('burst_min_accounts').notNull().default(5),
    burstWindowMinutes: integer('burst_window_minutes').notNull().default(60),
    burstAutoFreeze: boolean('burst_auto_freeze').notNull().default(false),
    // Notifications
    alertEmailRecipient: text('alert_email_recipient'),
    weeklyReportEnabled: boolean('weekly_report_enabled').notNull().default(false),
    weeklyReportRecipient: text('weekly_report_recipient'),
    logRetentionDays: integer('log_retention_days').notNull().default(90),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// COMMUNICATION & PROMOTION TOOLS
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const teamEmails = pgTable('team_emails', {
    id: uuid('id').primaryKey().defaultRandom(),
    senderId: uuid('sender_id').notNull().references(() => users.id),
    subject: text('subject').notNull(),
    body: text('body').notNull(),
    status: text('status').notNull().default('draft'), // draft | scheduled | sent
    recipientFilter: text('recipient_filter').notNull().default('all'), // all | active | inactive
    scheduledAt: timestamp('scheduled_at'),
    sentAt: timestamp('sent_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const directMessages = pgTable('direct_messages', {
    id: uuid('id').primaryKey().defaultRandom(),
    senderId: uuid('sender_id').notNull().references(() => users.id),
    recipientId: uuid('recipient_id').notNull().references(() => users.id),
    content: text('content').notNull(),
    isRead: boolean('is_read').notNull().default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const trackingLinks = pgTable('tracking_links', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    destinationUrl: text('destination_url').notNull(),
    clicks: integer('clicks').notNull().default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const followUpRules = pgTable('follow_up_rules', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id),
    name: text('name').notNull(),
    triggerType: text('trigger_type').notNull(),
    actionType: text('action_type').notNull(),
    delayHours: integer('delay_hours').notNull().default(0),
    templateSubject: text('template_subject'),
    templateBody: text('template_body').notNull(),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const followUpLogs = pgTable('follow_up_logs', {
    id: uuid('id').primaryKey().defaultRandom(),
    ruleId: uuid('rule_id').notNull().references(() => followUpRules.id),
    sponsorId: uuid('sponsor_id').notNull().references(() => users.id),
    targetUserId: uuid('target_user_id').notNull().references(() => users.id),
    status: text('status').notNull().default('pending'), // pending | sent | failed | cancelled
    scheduledFor: timestamp('scheduled_for').notNull(),
    executedAt: timestamp('executed_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const proofCardLogs = pgTable('proof_card_logs', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id),
    templateId: text('template_id').notNull(),
    amountDisplayed: numeric('amount_displayed', { precision: 20, scale: 4 }).notNull(),
    platformShared: text('platform_shared'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const simulationRuns = pgTable('simulation_runs', {
    id: uuid('id').primaryKey().defaultRandom(),
    config: jsonb('config').notNull(),
    status: text('status').notNull().default('pending'), // pending | running | completed | failed
    logs: jsonb('logs').notNull().default('[]'),
    report: jsonb('report'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// FEATURE 20: Micro-Jobs / Bounties
export const bounties = pgTable('bounties', {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    rewardAmount: numeric('reward_amount', { precision: 10, scale: 4 }).notNull(),
    maxSubmissions: integer('max_submissions').default(100),
    active: boolean('active').default(true).notNull(),
    icon: text('icon').default('Star'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const bountySubmissions = pgTable('bounty_submissions', {
    id: uuid('id').primaryKey().defaultRandom(),
    bountyId: uuid('bounty_id').notNull().references(() => bounties.id),
    userId: uuid('user_id').notNull().references(() => users.id),
    proofText: text('proof_text').notNull(),
    proofImage: text('proof_image'),
    status: text('status').default('pending').notNull(), // pending | approved | rejected
    reviewedAt: timestamp('reviewed_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
