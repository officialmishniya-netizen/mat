import { db } from "@/lib/db";
import { users, userAccountStatus } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import UsersClient from "./UsersClient";

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
    // Fast initial load using raw SQL aggregates
    const usersData = await db
        .select({
            id: users.id,
            username: users.username,
            email: users.email,
            role: users.role,
            created_at: users.created_at,
            status: userAccountStatus.status,
            isFrozen: userAccountStatus.isFrozen,
            isBanned: userAccountStatus.isBanned,
            isDeleted: userAccountStatus.isDeleted,
            riskScore: userAccountStatus.riskScore,
            // Subquery for balance logic (total sum of ledger)
            balance: sql<number>`COALESCE((SELECT SUM(amount) FROM ledger WHERE user_id = users.id), 0)`,
        })
        .from(users)
        .leftJoin(userAccountStatus, eq(users.id, userAccountStatus.userId))
        .orderBy(desc(users.created_at));

    // Get active plan per user using another query (avoids complex nested joins for now)
    const activePositions = await db.execute(sql`
        SELECT uap.user_id as "userId", ap.name as "planName"
        FROM user_ad_positions uap
        JOIN ad_plans ap ON uap.ad_plan_id = ap.id
        WHERE uap.status = 'active'
    `);

    const planMap = new Map();
    for (const row of activePositions) {
        planMap.set((row as any).userId, (row as any).planName);
    }

    const compiledUsers = usersData.map(u => {
        let displayStatus = 'Active';
        if (u.isDeleted) displayStatus = 'Deleted';
        else if (u.isBanned) displayStatus = 'Banned';
        else if (u.isFrozen) displayStatus = 'Frozen';
        else if (u.status === 'pending_review') displayStatus = 'Pending';

        return {
            id: u.id,
            username: u.username,
            email: u.email ?? '',
            role: u.role,
            createdAt: u.created_at?.toISOString() || '',
            status: displayStatus,
            riskScore: u.riskScore || 0,
            balance: Number(u.balance || 0).toFixed(2),
            plan: planMap.get(u.id) || 'None',
        };
    });

    return <UsersClient initialUsers={compiledUsers} />;
}
