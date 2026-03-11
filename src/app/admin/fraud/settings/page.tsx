import { db } from "@/lib/db";
import { fraudSettings } from "@/lib/db/schema";
import { getSiteSettings } from "@/lib/settings";
import { Settings2 } from "lucide-react";
import FraudSettingsForm from "./FraudSettingsForm";

export default async function FraudSettingsPage() {
  const settings = await getSiteSettings();
  const config = await db.query.fraudSettings.findFirst();

  // Defaults if no row yet
  const defaults = {
    dupIpEnabled: true, dupIpMinAccounts: 2,
    speedEnabled: true, speedGraceSeconds: 3, speedAutoWarnAfter: 5,
    speedAutoSuspendAfter: 20, speedAutoBanAfter: 50,
    vpnEnabled: true, vpnAction: "log",
    wdEnabled: true, wdNewAccountHours: 72, wdMultipleWithin24h: 3, wdInactivityDays: 60,
    selfRefEnabled: true,
    deviceEnabled: true, deviceFuzzyThreshold: 8,
    botEnabled: true, botMinWatches: 50, botTimingStdDevThreshold: "2.0", botAutoBanScore: 90,
    mismatchEnabled: true, mismatchTolerancePct: "5.0",
    dormantEnabled: true, dormantThresholdDays: 60, dormantHoldDays: 7, dormantAutoHold: false,
    burstEnabled: true, burstMinAccounts: 5, burstWindowMinutes: 60, burstAutoFreeze: false,
    alertEmailRecipient: "", weeklyReportEnabled: false, weeklyReportRecipient: "",
    logRetentionDays: 90,
  };

  const cfg = config ?? defaults;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[#151d48] flex items-center gap-2">
          <Settings2 size={24} className="text-[#f97316]" />
          Fraud Settings
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Configure all 11 detector thresholds — {settings.site_name}
        </p>
      </div>
      <FraudSettingsForm config={cfg} />
    </div>
  );
}
