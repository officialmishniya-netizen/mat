"use client";

import { useState } from "react";
import { Toggle } from "@/components/ui/toggle";
import { Save } from "lucide-react";

type Config = Record<string, unknown>;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
      <h3 className="font-bold text-[#151d48] text-sm mb-4 uppercase tracking-wider border-b border-gray-100 pb-3">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>
    </div>
  );
}

function Field({ label, name, value, type = "number", onChange }: {
  label: string; name: string; value: unknown; type?: string;
  onChange: (name: string, val: unknown) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
      {type === "boolean" ? (
        <button
          onClick={() => onChange(name, !value)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all
            ${value ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-gray-200 text-gray-500"}`}
        >
          <span className={`w-4 h-4 rounded-full ${value ? "bg-green-500" : "bg-gray-300"}`} />
          {value ? "Enabled" : "Disabled"}
        </button>
      ) : type === "select-vpn" ? (
        <select
          name={name}
          defaultValue={value as string}
          onChange={(e) => onChange(name, e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
        >
          <option value="log">Log Only</option>
          <option value="kyc">Require KYC</option>
          <option value="block">Block Withdrawals</option>
          <option value="ban">Ban Account</option>
        </select>
      ) : (
        <input
          type={type === "email" ? "email" : "number"}
          name={name}
          defaultValue={value as string}
          onChange={(e) => onChange(name, type === "email" ? e.target.value : Number(e.target.value))}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
      )}
    </div>
  );
}

export default function FraudSettingsForm({ config }: { config: Config }) {
  const [cfg, setCfg] = useState<Config>(config);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const onChange = (name: string, val: unknown) => setCfg(prev => ({ ...prev, [name]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/fraud/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cfg),
      });
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Section title="Duplicate IP Detector">
        <Field label="Enabled" name="dupIpEnabled" value={cfg.dupIpEnabled} type="boolean" onChange={onChange} />
        <Field label="Min Accounts per IP to Flag" name="dupIpMinAccounts" value={cfg.dupIpMinAccounts} onChange={onChange} />
      </Section>

      <Section title="Speed Violation Detector">
        <Field label="Enabled" name="speedEnabled" value={cfg.speedEnabled} type="boolean" onChange={onChange} />
        <Field label="Grace Margin (seconds)" name="speedGraceSeconds" value={cfg.speedGraceSeconds} onChange={onChange} />
        <Field label="Auto-Warn After N Violations" name="speedAutoWarnAfter" value={cfg.speedAutoWarnAfter} onChange={onChange} />
        <Field label="Auto-Suspend After N Violations" name="speedAutoSuspendAfter" value={cfg.speedAutoSuspendAfter} onChange={onChange} />
        <Field label="Auto-Ban After N Violations" name="speedAutoBanAfter" value={cfg.speedAutoBanAfter} onChange={onChange} />
      </Section>

      <Section title="VPN / Proxy Detector">
        <Field label="Enabled" name="vpnEnabled" value={cfg.vpnEnabled} type="boolean" onChange={onChange} />
        <Field label="Action on Detection" name="vpnAction" value={cfg.vpnAction} type="select-vpn" onChange={onChange} />
      </Section>

      <Section title="Withdrawal Anomaly Detector">
        <Field label="Enabled" name="wdEnabled" value={cfg.wdEnabled} type="boolean" onChange={onChange} />
        <Field label="New Account Window (hours)" name="wdNewAccountHours" value={cfg.wdNewAccountHours} onChange={onChange} />
        <Field label="Max Withdrawals per 24h" name="wdMultipleWithin24h" value={cfg.wdMultipleWithin24h} onChange={onChange} />
        <Field label="Inactivity Threshold (days)" name="wdInactivityDays" value={cfg.wdInactivityDays} onChange={onChange} />
      </Section>

      <Section title="Self-Referral Detector">
        <Field label="Enabled" name="selfRefEnabled" value={cfg.selfRefEnabled} type="boolean" onChange={onChange} />
      </Section>

      <Section title="Device Fingerprint Clustering">
        <Field label="Enabled" name="deviceEnabled" value={cfg.deviceEnabled} type="boolean" onChange={onChange} />
        <Field label="Fuzzy Match Threshold (out of 10)" name="deviceFuzzyThreshold" value={cfg.deviceFuzzyThreshold} onChange={onChange} />
      </Section>

      <Section title="Bot Pattern Detector">
        <Field label="Enabled" name="botEnabled" value={cfg.botEnabled} type="boolean" onChange={onChange} />
        <Field label="Min Watches Before Scoring" name="botMinWatches" value={cfg.botMinWatches} onChange={onChange} />
        <Field label="Timing Std Dev Threshold (sec)" name="botTimingStdDevThreshold" value={cfg.botTimingStdDevThreshold} onChange={onChange} />
        <Field label="Auto-Ban Score Threshold (0-100)" name="botAutoBanScore" value={cfg.botAutoBanScore} onChange={onChange} />
      </Section>

      <Section title="Earnings Mismatch Detector">
        <Field label="Enabled" name="mismatchEnabled" value={cfg.mismatchEnabled} type="boolean" onChange={onChange} />
        <Field label="Tolerance %" name="mismatchTolerancePct" value={cfg.mismatchTolerancePct} onChange={onChange} />
      </Section>

      <Section title="Dormant Account Revival">
        <Field label="Enabled" name="dormantEnabled" value={cfg.dormantEnabled} type="boolean" onChange={onChange} />
        <Field label="Dormancy Threshold (days)" name="dormantThresholdDays" value={cfg.dormantThresholdDays} onChange={onChange} />
        <Field label="Withdrawal Hold Period (days)" name="dormantHoldDays" value={cfg.dormantHoldDays} onChange={onChange} />
        <Field label="Auto-Hold on Revival" name="dormantAutoHold" value={cfg.dormantAutoHold} type="boolean" onChange={onChange} />
      </Section>

      <Section title="Burst Registration Detector">
        <Field label="Enabled" name="burstEnabled" value={cfg.burstEnabled} type="boolean" onChange={onChange} />
        <Field label="Burst Threshold (accounts)" name="burstMinAccounts" value={cfg.burstMinAccounts} onChange={onChange} />
        <Field label="Time Window (minutes)" name="burstWindowMinutes" value={cfg.burstWindowMinutes} onChange={onChange} />
        <Field label="Auto-Freeze Burst Accounts" name="burstAutoFreeze" value={cfg.burstAutoFreeze} type="boolean" onChange={onChange} />
      </Section>

      <Section title="Notifications & Reports">
        <Field label="Critical Alert Email" name="alertEmailRecipient" value={cfg.alertEmailRecipient} type="email" onChange={onChange} />
        <Field label="Weekly Report Enabled" name="weeklyReportEnabled" value={cfg.weeklyReportEnabled} type="boolean" onChange={onChange} />
        <Field label="Weekly Report Email" name="weeklyReportRecipient" value={cfg.weeklyReportRecipient} type="email" onChange={onChange} />
        <Field label="Log Retention (days)" name="logRetentionDays" value={cfg.logRetentionDays} onChange={onChange} />
      </Section>

      <div className="flex justify-end mt-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#f97316] hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? "Savingâ€¦" : saved ? "Saved âœ“" : "Save All Settings"}
        </button>
      </div>
    </div>
  );
}
