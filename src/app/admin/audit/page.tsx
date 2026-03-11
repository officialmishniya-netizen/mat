import { db } from "@/lib/db";
import { adminAuditLog } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import AuditClient from "./AuditClient";

export const dynamic = 'force-dynamic';

export default async function AdminAuditPage() {
    // Fetch last 500 audit logs
    const logs = await db.query.adminAuditLog.findMany({
        orderBy: [desc(adminAuditLog.createdAt)],
        limit: 500
    });

    // Format for client
    const formattedLogs = logs.map(l => ({
        id: l.id,
        adminId: l.adminId,
        adminUsername: l.adminUsername,
        targetUserId: l.targetUserId,
        targetUsername: l.targetUsername,
        action: l.action,
        category: l.category,
        description: l.description,
        severity: l.severity,
        ipAddress: l.ipAddress,
        createdAt: l.createdAt?.toISOString() || '',
    }));

    return <AuditClient initialLogs={formattedLogs} />;
}
