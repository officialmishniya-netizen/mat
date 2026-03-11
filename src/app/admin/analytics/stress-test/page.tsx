import { getSystemFinancials } from "@/lib/ledger";
import StressTestSimulator from "./StressTestSimulator";

export const dynamic = "force-dynamic";

export default async function StressTestPage() {
    const stats = await getSystemFinancials();

    return <StressTestSimulator stats={stats} />;
}
