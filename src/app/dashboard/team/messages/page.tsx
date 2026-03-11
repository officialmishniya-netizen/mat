import { requireImpersonationOrAuth } from "@/app/actions/impersonate";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";
import { MessagesClient } from "./MessagesClient";

export const metadata = {
    title: 'Messages | MatClick',
    description: 'Direct messages with your team',
};

export default async function TeamMessagesPage() {
    const effectiveUserId = await requireImpersonationOrAuth();

    // 1. Fetch current user to get their sponsor_id
    const currentUser = await db.select().from(users).where(eq(users.id, effectiveUserId)).limit(1).then(res => res[0]);
    if (!currentUser) return <div>User not found</div>;

    // 2. Contacts: downline + sponsor
    // Fetch users where sponsor_id = effectiveUserId OR id = currentUser.sponsor_id
    const contactsQuery = await db
        .select({
            id: users.id,
            username: users.username,
            fullName: users.full_name,
            role: users.role,
            rank: users.rank,
            avatarUrl: users.username, // placeholder for initials
            status: users.rank // just mock "Online" or something later
        })
        .from(users)
        .where(
            or(
                eq(users.sponsor_id, effectiveUserId),
                currentUser.sponsor_id ? eq(users.id, currentUser.sponsor_id) : undefined
            )
        );

    // Transform contacts to inject "Sponsor" label if needed
    const contacts = contactsQuery.map(c => ({
        ...c,
        isSponsor: c.id === currentUser.sponsor_id,
        isOnline: Math.random() > 0.5 // Mock online status
    }));

    return (
        <div className="h-[calc(100vh-140px)] min-h-[600px] -mx-4 sm:-mx-6 lg:-mx-10 -my-6">
            <MessagesClient 
                currentUser={{ id: effectiveUserId, username: currentUser.username }} 
                initialContacts={contacts} 
            />
        </div>
    );
}
