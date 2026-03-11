import { supabase } from "@/lib/supabase";
import CohortHeatmap from "./CohortHeatmap";

export const dynamic = "force-dynamic";

type CohortRow = {
    month: string;
    size: number;
    retention: number[];
};

export default async function CohortRetentionPage() {
    // Fetch data server-side to bypass 401 client-side restrictions and improve performance
    const { data: users } = await supabase.from('users').select('id, created_at').order('created_at', { ascending: false });
    const { data: ledger } = await supabase.from('ledger').select('user_id, created_at');

    if (!users || !ledger) {
        return <CohortHeatmap cohorts={[]} />;
    }

    const monthMap: Record<string, string[]> = {};
    users.forEach(u => {
        const date = new Date(u.created_at);
        const monthKey = `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, '0')}`;
        if (!monthMap[monthKey]) monthMap[monthKey] = [];
        monthMap[monthKey].push(u.id);
    });

    const cohorts: CohortRow[] = Object.entries(monthMap).map(([month, userIds]) => {
        const cohortSize = userIds.length;
        const activityWindows = [1, 7, 30, 60, 90];
        const retention = activityWindows.map(days => {
            const activeInWindow = new Set();
            userIds.forEach(uid => {
                const user = users.find(u => u.id === uid);
                if (!user) return;
                const signupDate = new Date(user.created_at).getTime();
                const windowEnd = signupDate + (days * 24 * 60 * 60 * 1000);

                const hasActivity = ledger.some(l =>
                    l.user_id === uid &&
                    new Date(l.created_at).getTime() > signupDate &&
                    new Date(l.created_at).getTime() <= windowEnd
                );
                if (hasActivity) activeInWindow.add(uid);
            });
            return Math.round((activeInWindow.size / cohortSize) * 100);
        });

        return { month, size: cohortSize, retention };
    });

    return <CohortHeatmap cohorts={cohorts} />;
}
