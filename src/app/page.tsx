import Link from "next/link";
import { getSiteSettings } from "@/lib/settings";
import {
  TrendingUp, MousePointerClick, Users, ShieldCheck,
  Zap, Globe, ChevronRight, ArrowRight, Star,
  DollarSign, Clock, Award, BarChart3, Wallet, Lock,
} from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import AnimatedCounter from "@/components/AnimatedCounter";

export default async function LandingPage() {
  const settings = await getSiteSettings();

  const stats = [
    { value: "6,300", prefix: "", suffix: "", label: "Active Members" },
    { value: "99.9", prefix: "", suffix: "%", label: "Uptime Guaranteed" },
  ];

  const features = [
    {
      icon: MousePointerClick,
      gradient: "from-orange-500 to-red-500",
      title: "Ad Click",
      desc: "Earn real USD every time you view a premium advertisement. Every click is verified, anti-cheat enforced, and credited to your account instantly.",
    },
    {
      icon: Users,
      gradient: "from-blue-500 to-indigo-600",
      title: "Auto-Fill Matrix",
      desc: "Buy a spot in our BFS-powered matrix tree. The algorithm fills your downline automatically — you profit from your entire upline's activity.",
    },
    {
      icon: TrendingUp,
      gradient: "from-emerald-500 to-teal-500",
      title: "Matching Bonuses",
      desc: "When anyone on your team earns, you earn too. Our matching engine triggers automatically across all levels — 100% passive on top of active income.",
    },
    {
      icon: Zap,
      gradient: "from-yellow-500 to-orange-500",
      title: "Instant Compounding",
      desc: "Re-invest earnings into new matrix levels with a single click. Watch your passive income multiply through our fully automated compound engine.",
    },
    {
      icon: Globe,
      gradient: "from-violet-500 to-purple-600",
      title: "Global Reach",
      desc: "Members in 90+ countries. Multilingual support, global payment gateways — earn and withdraw from anywhere on the planet, anytime.",
    },
    {
      icon: Lock,
      gradient: "from-slate-500 to-gray-600",
      title: "Bank-Grade Security",
      desc: "2FA enforced on every withdrawal. Every cent tracked via a cryptographic audit ledger — zero floating-point errors, tamper-proof by design.",
    },
  ];

  const howItWorks = [
    { step: "01", title: "Create Free Account", desc: "Sign up in under 60 seconds. No credit card. Instant access to your dashboard and Ad Click earnings." },
    { step: "02", title: "Click Ads & Earn", desc: "Visit the Ad Click section and click vetted premium ads. Every click credits real USD with no daily limit." },
    { step: "03", title: "Buy a Matrix Level", desc: "Use your Ad Click earnings to buy a matrix position. Our BFS algorithm auto-fills your downline from network overflow." },
    { step: "04", title: "Withdraw Anytime", desc: "Hit the minimum threshold and cash out via crypto or bank. Processed within 48 hours, guaranteed." },
  ];

  const testimonials = [
    { name: "Daniel R.", country: "🇺🇸 United States", avatar: "DR", text: "I was skeptical at first. After 3 months I've withdrawn over $800. The matrix really does auto-fill — my uplines are incredibly active.", stars: 5 },
    { name: "Fatima K.", country: "🇵🇰 Pakistan", avatar: "FK", text: "Finally a platform that actually pays. Every transaction is auditable. Transparent, trustworthy, and the team is very responsive.", stars: 5 },
    { name: "Marcus T.", country: "🇳🇬 Nigeria", avatar: "MT", text: "My team has 200+ members and I earn passively every single day without lifting a finger. The matching bonuses are absolutely insane.", stars: 5 },
  ];

  const plans = [
    { name: "Starter",  price: "$10",  credits: "1,000", perCredit: "$0.01",   cyclePayout: "$20.00",  sponsor: "$2.78",   highlight: false, badge: "" },
    { name: "Basic",    price: "$25",  credits: "2,000", perCredit: "$0.0175", cyclePayout: "$50.00",  sponsor: "$6.94",   highlight: false, badge: "" },
    { name: "Standard", price: "$100", credits: "3,000", perCredit: "$0.033",  cyclePayout: "$200.00", sponsor: "$22.50",  highlight: false, badge: "" },
    { name: "Advanced", price: "$200", credits: "4,000", perCredit: "$0.05",   cyclePayout: "$400.00", sponsor: "$51.00",  highlight: true,  badge: "★ Most Popular" },
    { name: "Pro",      price: "$520", credits: "5,000", perCredit: "$0.104",  cyclePayout: "$1,100.00", sponsor: "$144.30", highlight: false, badge: "Best Value" },
  ];

  const tickerItems = [
    "🟢 Ahmad W. just withdrew $240", "🟢 James K. just joined", "🟢 Priya S. earned $18 in Ad Click today",
    "🟢 Carlos M. just joined from Mexico", "🟢 Sarah L. withdrew $520 via USDT", "🟢 David O. just joined",
    "🟢 Nour A. earned $60 matching bonus", "🟢 Wei C. clicked 80 ads today — +$24",
    "🟢 Ahmad W. just withdrew $240", "🟢 James K. just joined", "🟢 Priya S. earned $18 in Ad Click today",
    "🟢 Carlos M. just joined from Mexico", "🟢 Sarah L. withdrew $520 via USDT", "🟢 David O. just joined",
  ];

  return (
    <div className="min-h-screen bg-[#07070f] text-white selection:bg-orange-500 selection:text-white overflow-x-hidden">

      {/* ══ STICKY NAV ══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#07070f]/80 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center gap-3 animate-fade-in group">
              <img src="/logo.PNG" alt={settings.site_name} className="h-10 w-auto object-contain group-hover:scale-105 transition-transform" />
            </Link>
            <div className="hidden md:flex items-center gap-8 animate-fade-in delay-100">
              {["#features", "#how-it-works", "#plans", "#testimonials"].map((href, i) => (
                <a key={href} href={href} className="text-sm text-white/50 hover:text-white transition-colors capitalize">
                  {href.replace("#", "").replace("-", " ")}
                </a>
              ))}
            </div>
            <div className="flex items-center gap-3 animate-fade-in delay-200">
              <Link href="/admin" className="text-sm font-semibold text-white/60 hover:text-white transition-colors">Admin Panel</Link>
              <Link href="/auth/login" className="text-sm font-semibold text-white/60 hover:text-white transition-colors">Log In</Link>
              <Link href="/auth/register" className="text-sm font-black px-5 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-red-600 animate-gradient hover:scale-105 transition-transform shadow-lg shadow-orange-900/40">
                Join Free →
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">

        {/* Animated blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="animate-blob-1 absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-orange-600/10 blur-[100px]" />
          <div className="animate-blob-2 absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-violet-600/8 blur-[120px]" />
          <div className="animate-float-slow absolute top-16 right-20 w-48 h-48 rounded-full border border-orange-500/10 opacity-30" />
          <div className="animate-spin-slow absolute top-32 right-36 w-24 h-24 rounded-full border border-orange-500/20" />
          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.025]" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.8) 1px,transparent 1px)",
            backgroundSize: "56px 56px"
          }} />
          {/* Radial vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,transparent_40%,#07070f_100%)]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16">
          {/* Live badge */}
          <div className="animate-fade-up inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8 hover:bg-white/8 transition-colors cursor-default">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-white/60 uppercase tracking-[0.15em]">Live & Paying — est. 2026</span>
          </div>

          {/* Headline */}
          <h1 className="animate-fade-up delay-100 text-5xl sm:text-6xl lg:text-[4.5rem] font-black tracking-tight leading-[1.05] mb-6">
            <span className="block text-white mb-2">Earn While You</span>
            <span className="block shimmer-text mb-2">Click. Refer. Sleep.</span>
            <span className="block text-white/70 text-3xl sm:text-4xl lg:text-5xl font-bold mt-2">
              Dual Income. Fully Automated.
            </span>
          </h1>

          <p className="animate-fade-up delay-200 max-w-2xl mx-auto text-lg sm:text-xl text-white/45 leading-relaxed mb-10">
            The world&apos;s most transparent <span className="text-orange-400 font-semibold">MatClick Investment</span> platform.
            Built for long-term stability. Trusted by <span className="text-white/70">6,300</span> members globally.
          </p>

          <div className="animate-fade-up delay-300 flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/auth/register"
              className="group relative inline-flex items-center gap-2 px-10 py-4 rounded-full font-black text-white text-base overflow-hidden bg-gradient-to-r from-orange-500 to-red-600 animate-gradient shadow-2xl shadow-orange-900/50 hover:scale-105 transition-transform"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Earning Free
                <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
              </span>
              {/* Shine sweep */}
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
            </Link>
            <a href="#how-it-works" className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white/60 border border-white/10 hover:bg-white/5 hover:text-white transition-all text-base">
              See How It Works
            </a>
          </div>

          {/* Stats bar */}
          <div className="animate-fade-up delay-400 grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
            {stats.map((s) => (
              <div key={s.label} className="bg-[#07070f] px-6 py-5 text-center group hover:bg-white/[0.03] transition-colors">
                <div className="text-2xl font-black text-white mb-1">
                  <AnimatedCounter value={`${s.prefix || ""}${s.value}${s.suffix || ""}`} />
                </div>
                <div className="text-[11px] text-white/35 uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating decorative cards */}
        <div className="animate-float absolute bottom-20 left-10 hidden lg:block opacity-60">
          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 backdrop-blur-sm text-xs font-mono text-white/50">
            <span className="text-emerald-400">+$0.30</span> Ad Click #291
          </div>
        </div>
        <div className="animate-float delay-300 absolute bottom-36 right-12 hidden lg:block opacity-60">
          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 backdrop-blur-sm text-xs font-mono text-white/50">
            <span className="text-emerald-400">+$25.00</span> Level Cycle L2
          </div>
        </div>
      </section>

      {/* ══ LIVE TICKER ══ */}
      <div className="border-y border-white/5 bg-white/[0.02] py-3 overflow-hidden">
        <div className="flex animate-ticker whitespace-nowrap">
          {tickerItems.map((item, i) => (
            <span key={i} className="inline-flex items-center text-sm text-white/40 px-8">
              {item}
              <span className="mx-8 w-1 h-1 rounded-full bg-white/10 inline-block" />
            </span>
          ))}
        </div>
      </div>

      {/* ══ FEATURES ══ */}
      <section id="features" className="py-28 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <ScrollReveal className="text-center mb-16">
            <span className="text-xs font-black text-orange-400 uppercase tracking-[0.2em]">Why We Win</span>
            <h2 className="mt-3 text-4xl sm:text-5xl font-black text-white leading-tight">
              Six Earning Engines.<br /><span className="text-white/30">One Unstoppable Platform.</span>
            </h2>
            <p className="mt-5 max-w-xl mx-auto text-white/45">
              No fluff, no hype. Six real mechanisms that work together to multiply your income — automatically.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <ScrollReveal key={f.title} delay={i * 80} scale>
                  <div className="glow-card h-full bg-white/[0.03] border border-white/5 rounded-2xl p-7 group cursor-default">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon size={22} className="text-white" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-3 group-hover:text-orange-300 transition-colors">{f.title}</h3>
                    <p className="text-sm text-white/45 leading-relaxed">{f.desc}</p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section id="how-it-works" className="py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-950/8 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <ScrollReveal className="text-center mb-16">
            <span className="text-xs font-black text-orange-400 uppercase tracking-[0.2em]">Zero Complexity</span>
            <h2 className="mt-3 text-4xl sm:text-5xl font-black text-white">
              From Zero to Earning<br /><span className="text-white/30">in 4 Simple Steps</span>
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 relative">
            <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
            {howItWorks.map((step, i) => (
              <ScrollReveal key={step.step} delay={i * 100}>
                <div className="glow-card h-full relative bg-white/[0.03] border border-white/5 rounded-2xl p-7">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/15 to-red-600/15 border border-orange-500/20 flex items-center justify-center mb-5 font-black text-orange-400 text-2xl">
                    {step.step}
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-white/45 leading-relaxed">{step.desc}</p>
                  {i < 3 && (
                    <div className="hidden lg:flex absolute top-10 -right-2.5 z-10 w-5 h-5 rounded-full bg-orange-500/15 border border-orange-500/25 items-center justify-center">
                      <ChevronRight size={10} className="text-orange-400" />
                    </div>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ VERIFIED EARNINGS SECTION (no "ironclad" anywhere) ══ */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden border border-white/5 bg-gradient-to-br from-[#111118] to-[#0c0c14]">
            <div className="absolute inset-0 pointer-events-none">
              <div className="animate-blob-1 absolute -top-20 -left-20 w-80 h-80 bg-orange-600/12 rounded-full blur-[80px]" />
              <div className="animate-blob-2 absolute -bottom-20 -right-20 w-80 h-80 bg-violet-600/8 rounded-full blur-[80px]" />
            </div>

            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center p-10 lg:p-16">
              <ScrollReveal>
                <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-6">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Zero-Error Verified Earnings</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-5">
                  Every Cent Tracked.<br /><span className="text-orange-400">Every Transaction Verified.</span>
                </h2>
                <p className="text-white/45 text-base leading-relaxed mb-4">
                  From a $0.01 ad click to a $500 matrix cycle — every event is recorded on our tamper-proof internal ledger. No rounding. No estimates. No manipulation.
                </p>
                <p className="text-white/45 text-base leading-relaxed mb-8">
                  What you earn is <span className="text-white font-semibold">exactly</span> what you receive. Auditable in real time, always.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/auth/register"
                    className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-black text-white bg-gradient-to-r from-orange-500 to-red-600 animate-gradient hover:scale-105 transition-transform shadow-xl shadow-orange-900/30"
                  >
                    Claim Your Account
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link href="/auth/login" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-bold text-white/50 border border-white/10 hover:bg-white/5 hover:text-white transition-colors">
                    Sign In
                  </Link>
                </div>
              </ScrollReveal>

              {/* Animated Ledger Card */}
              <ScrollReveal scale delay={150} className="flex justify-center lg:justify-end">
                <div className="w-full max-w-sm bg-[#07070f] border border-white/10 rounded-2xl p-6 shadow-2xl hover:border-orange-500/25 transition-all duration-500">
                  <div className="flex justify-between items-center mb-5">
                    <div>
                      <div className="text-[10px] text-white/25 uppercase tracking-[0.15em] font-mono">Live Account Ledger</div>
                      <div className="text-white font-bold text-sm mt-0.5">My Earnings</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs text-white/35">Real-time</span>
                    </div>
                  </div>
                  <div className="space-y-3 font-mono text-xs mb-5">
                    {[
                      { cls: "ledger-row-1", time: "09:14:22", label: "Ad Click #291", amt: "+$0.30", color: "text-emerald-400" },
                      { cls: "ledger-row-2", time: "09:31:05", label: "Matrix Buy L2",  amt: "-$10.00", color: "text-red-400" },
                      { cls: "ledger-row-3", time: "10:02:44", label: "Matching Bonus", amt: "+$5.00",  color: "text-emerald-400" },
                      { cls: "ledger-row-4", time: "10:45:17", label: "Cycle Revenue L1", amt: "+$25.00", color: "text-emerald-400" },
                    ].map((row) => (
                      <div key={row.time} className={`${row.cls} flex justify-between text-white/35`}>
                        <span>[{row.time}] {row.label}</span>
                        <span className={row.color}>{row.amt}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                    <span className="text-white/35 text-[10px] font-mono uppercase tracking-widest">Net Balance</span>
                    <span className="text-orange-400 text-2xl font-black">$20.30</span>
                  </div>
                  {/* Progress to next withdrawal */}
                  <div className="mt-4">
                    <div className="flex justify-between text-[10px] text-white/25 mb-1.5">
                      <span>Progress to Withdrawal</span><span>$20.30 / $25.00</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full w-[81%] bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-gradient" />
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ══ PLANS ══ */}
      <section id="plans" className="py-28 relative overflow-hidden">
        {/* Background atmosphere */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-orange-600/5 rounded-full blur-[140px]" />
          <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-violet-600/5 rounded-full blur-[80px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <ScrollReveal className="text-center mb-16">
            <span className="text-xs font-black text-orange-400 uppercase tracking-[0.2em]">Investment Plans</span>
            <h2 className="mt-3 text-4xl sm:text-5xl font-black text-white">
              Your Money.<br /><span className="text-white/30">Working For You.</span>
            </h2>
            <p className="mt-5 max-w-xl mx-auto text-white/45">
              Buy a position once. Click premium ads. Watch your payout arrive — automatically.
            </p>
          </ScrollReveal>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4 items-end mt-12">
            {plans.map((plan, i) => {
              const accents = [
                { bar: "from-slate-400 to-slate-500",   glow: "rgba(148,163,184,0.15)", ring: "border-slate-500/20" },
                { bar: "from-blue-400 to-blue-600",      glow: "rgba(59,130,246,0.15)", ring: "border-blue-500/20" },
                { bar: "from-violet-400 to-violet-600",  glow: "rgba(139,92,246,0.15)", ring: "border-violet-500/20" },
                { bar: "from-orange-400 to-red-500",     glow: "rgba(249,115,22,0.25)", ring: "border-orange-500/40" },
                { bar: "from-amber-300 to-amber-500",    glow: "rgba(245,158,11,0.2)",  ring: "border-amber-500/30" },
              ];
              const a = accents[i];
              return (
                <ScrollReveal key={plan.name} scale delay={i * 80} className={`${plan.highlight ? 'lg:-translate-y-4' : ''}`}>
                  <div
                    className={`relative rounded-3xl border flex flex-col overflow-hidden transition-all duration-500 group
                      ${plan.highlight
                        ? `${a.ring} bg-gradient-to-b from-[#1c140d] to-[#0a0705] shadow-[0_0_40px_rgba(249,115,22,0.15)] ring-1 ring-orange-500/50`
                        : `${a.ring} bg-white/[0.02] backdrop-blur-xl hover:bg-white/[0.04] hover:-translate-y-2 hover:shadow-2xl`
                      }`}
                  >
                    {/* Animated top accent bar */}
                    <div className={`h-1.5 w-full bg-gradient-to-r ${a.bar} ${plan.highlight ? "animate-gradient" : "opacity-80"}`}
                      style={{ backgroundSize: "200% 100%" }} />

                    {/* Badge */}
                    {plan.badge && (
                      <div className={`absolute top-5 right-5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full
                        ${plan.highlight
                          ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-900/50"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}>
                        {plan.badge}
                      </div>
                    )}

                    <div className="p-8 flex flex-col flex-1">
                      {/* Plan name + entry */}
                      <div className="mb-8">
                        <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">Entry Price</p>
                        <div className="flex items-end gap-2">
                          <span className={`text-4xl font-black tabular-nums tracking-tight ${plan.highlight ? "text-white" : "text-white/90"}`}>
                            {plan.price}
                          </span>
                        </div>
                        <p className={`text-sm font-black mt-2 uppercase tracking-wider ${plan.highlight ? "text-orange-400" : "text-white/50"}`}>
                          {plan.name}
                        </p>
                      </div>

                      {/* HERO — Cycle Payout */}
                      <div className={`rounded-2xl p-5 mb-8 text-center relative overflow-hidden group-hover:scale-[1.02] transition-transform
                        ${plan.highlight
                          ? "bg-gradient-to-b from-emerald-500/10 to-transparent border border-emerald-500/30 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]"
                          : "bg-white/[0.03] border border-white/10"
                        }`}>
                        {plan.highlight && <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />}
                        <p className="relative z-10 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">Total Cycle Payout</p>
                        <p className={`relative z-10 font-black tabular-nums tracking-tight ${plan.highlight ? "text-4xl text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]" : "text-3xl text-emerald-500/90"}`}>
                          {plan.cyclePayout}
                        </p>
                      </div>

                      {/* Stats grid */}
                      <div className="space-y-4 mb-8 flex-1">
                        {[
                          { label: "Ad Credits", value: plan.credits },
                          { label: "Per Credit", value: plan.perCredit },
                          { label: "Sponsor Bonus", value: plan.sponsor, highlight: true },
                        ].map((row) => (
                          <div key={row.label} className="flex justify-between items-center border-b border-white/5 pb-4 last:border-0 last:pb-0">
                            <span className="text-sm font-medium text-white/40">{row.label}</span>
                            <span className={`text-sm font-bold tabular-nums
                              ${row.highlight
                                ? (plan.highlight ? "text-blue-400" : "text-blue-400/80")
                                : "text-white/70"
                              }`}>
                              {row.value}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* CTA */}
                      <Link
                        href="/auth/register"
                        className={`w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-xl text-sm font-black transition-all duration-300
                          ${plan.highlight
                            ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] hover:scale-[1.02] animate-gradient"
                            : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                          }`}
                      >
                        Select Plan <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>

          {/* Bottom note */}
          <ScrollReveal className="mt-10 flex flex-wrap gap-6 justify-center">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-white/30 text-xs">Cycle Payout — total earned when all credits are clicked</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
              <span className="text-white/30 text-xs">Sponsor Bonus — 15% goes to your referrer</span>
            </div>
          </ScrollReveal>
        </div>
      </section>


      {/* ══ PLATFORM EXTRAS ══ */}
      <section className="py-28 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-orange-600/5 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <ScrollReveal className="text-center mb-16">
            <span className="text-xs font-black text-orange-400 uppercase tracking-[0.2em]">Beyond the Matrix</span>
            <h2 className="mt-3 text-4xl sm:text-5xl font-black text-white">
              More Ways to Win.<br /><span className="text-white/30">Every Single Day.</span>
            </h2>
            <p className="mt-5 max-w-xl mx-auto text-white/45">
              Earning doesn&apos;t stop at ads and matrix cycles. Three exclusive platform features turbocharge your daily rewards.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Spin Wheel */}
            <ScrollReveal scale delay={0}>
              <div className="glow-card relative bg-white/[0.03] border border-white/5 rounded-2xl p-8 h-full overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-orange-500/5 blur-[40px] group-hover:bg-orange-500/10 transition-all duration-500" />
                {/* Big emoji icon */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mb-6 text-3xl shadow-lg shadow-orange-900/30 group-hover:scale-110 transition-transform duration-300 animate-float">
                  🎡
                </div>
                <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-3 py-1 mb-4">
                  <span className="text-[10px] font-black text-orange-400 uppercase tracking-wider">Daily Free Spin</span>
                </div>
                <h3 className="text-xl font-black text-white mb-3">Spin the Wheel</h3>
                <p className="text-white/45 text-sm leading-relaxed mb-5">
                  Log in every day and spin our rewards wheel for a chance to win bonus credits, extra ad earnings, matching boosts, or even a free matrix position upgrade.
                </p>
                <ul className="space-y-2.5">
                  {["Free spin every 24 hours", "Win bonus ad credits", "Matrix upgrade drops", "Jackpot cash prizes"].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-white/55">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>

            {/* Boosters */}
            <ScrollReveal scale delay={120}>
              <div className="glow-card relative bg-white/[0.03] border border-white/5 rounded-2xl p-8 h-full overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-violet-500/5 blur-[40px] group-hover:bg-violet-500/10 transition-all duration-500" />
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-6 text-3xl shadow-lg shadow-violet-900/30 group-hover:scale-110 transition-transform duration-300 animate-float delay-200">
                  ⚡
                </div>
                <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1 mb-4">
                  <span className="text-[10px] font-black text-violet-400 uppercase tracking-wider">Multiplier Power</span>
                </div>
                <h3 className="text-xl font-black text-white mb-3">Earning Boosters</h3>
                <p className="text-white/45 text-sm leading-relaxed mb-5">
                  Activate time-limited boosters that multiply your Ad Click earnings, speed up matrix cycles, and amplify matching bonuses — all with a single click from your dashboard.
                </p>
                <ul className="space-y-2.5">
                  {["2× Ad Click value for 24hrs", "Fast-cycle matrix booster", "Matching bonus amplifier", "Team-wide unlock events"].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-white/55">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>

            {/* Marketplace */}
            <ScrollReveal scale delay={240}>
              <div className="glow-card relative bg-white/[0.03] border border-white/5 rounded-2xl p-8 h-full overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-emerald-500/5 blur-[40px] group-hover:bg-emerald-500/10 transition-all duration-500" />
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-6 text-3xl shadow-lg shadow-emerald-900/30 group-hover:scale-110 transition-transform duration-300 animate-float delay-400">
                  🏪
                </div>
                <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 mb-4">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">Member Marketplace</span>
                </div>
                <h3 className="text-xl font-black text-white mb-3">Rewards Marketplace</h3>
                <p className="text-white/45 text-sm leading-relaxed mb-5">
                  Spend earned points in our exclusive marketplace. Redeem for plan upgrades, booster packs, spin wheel extra turns, or even trade credits peer-to-peer with other members.
                </p>
                <ul className="space-y-2.5">
                  {["Redeem points for plan upgrades", "Buy & sell booster packs", "Extra spin wheel turns", "Peer-to-peer credit trading"].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-white/55">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>


      {/* ══ TESTIMONIALS ══ */}
      <section id="testimonials" className="py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-16">
            <span className="text-xs font-black text-orange-400 uppercase tracking-[0.2em]">Real People. Real Money.</span>
            <h2 className="mt-3 text-4xl sm:text-5xl font-black text-white">
              Trusted by <span className="text-white/30">6,300 Members</span>
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <ScrollReveal key={t.name} delay={i * 100} scale>
                <div className="glow-card h-full bg-white/[0.03] border border-white/5 rounded-2xl p-7">
                  <div className="flex gap-0.5 mb-5">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} size={13} className="text-orange-400 fill-orange-400" />
                    ))}
                  </div>
                  <p className="text-white/50 text-sm leading-relaxed mb-6 italic">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-xs font-black shrink-0">
                      {t.avatar}
                    </div>
                    <div>
                      <div className="text-white text-sm font-bold">{t.name}</div>
                      <div className="text-white/30 text-xs">{t.country}</div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal scale>
            <div className="relative rounded-3xl overflow-hidden text-center py-20 px-8">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-red-600 to-pink-700 animate-gradient" style={{ backgroundSize: "300% 300%" }} />
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full bg-white/10 blur-[80px]" />
                <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-white/5 blur-[60px]" />
                {/* Dot grid overlay */}
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
                  backgroundSize: "32px 32px"
                }} />
              </div>
              <div className="relative">
                <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-4 py-1.5 mb-8">
                  <Award size={13} className="text-white" />
                  <span className="text-xs font-bold text-white uppercase tracking-widest">Join 6,300 Members Today</span>
                </div>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-5 leading-tight">
                  Your Next Withdrawal<br />Starts Right Now.
                </h2>
                <p className="max-w-xl mx-auto text-white/75 text-lg mb-10">
                  Stop watching others earn. Join MatClick free today — start building your dual income stream from day one.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/auth/register"
                    className="group inline-flex items-center gap-2 px-10 py-4 rounded-full font-black text-orange-600 bg-white hover:bg-orange-50 shadow-2xl transition-all hover:scale-105 text-base"
                  >
                    Create Free Account
                    <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
                  </Link>
                  <Link href="/auth/login" className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white border-2 border-white/30 hover:bg-white/10 transition-all text-base">
                    Login to Dashboard
                  </Link>
                </div>
                <p className="mt-6 text-white/45 text-sm">
                  Free forever Ad Click access · No credit card required · Cancel anytime
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="border-t border-white/5 bg-[#050509]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main footer grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 py-16">
            <div className="lg:col-span-1">
              <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
                <img src="/logo.PNG" alt={settings.site_name} className="h-12 w-auto object-contain group-hover:scale-105 transition-transform" />
              </Link>
              <p className="text-white/35 text-sm leading-relaxed mb-5">
                The world&apos;s most transparent hybrid MatClick investment platform. Built for long-term digital income.
              </p>
              <div className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-emerald-400" />
                <span className="text-emerald-400 text-xs font-semibold">SSL Secured & Encrypted</span>
              </div>
            </div>

            <div>
              <h4 className="text-white font-black text-xs mb-5 uppercase tracking-widest">Platform</h4>
              <ul className="space-y-3">
                {["How It Works", "Matrix System", "Ad Click Earnings", "Matching Bonuses", "Withdrawal Policy"].map((l) => (
                  <li key={l}><a href="#" className="text-white/35 text-sm hover:text-orange-400 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-black text-xs mb-5 uppercase tracking-widest">Account</h4>
              <ul className="space-y-3">
                {[{ label: "Register", href: "/auth/register" }, { label: "Login", href: "/auth/login" }, { label: "Dashboard", href: "/dashboard" }, { label: "Referral Program", href: "#" }, { label: "Support", href: "#" }].map((l) => (
                  <li key={l.label}><Link href={l.href} className="text-white/35 text-sm hover:text-orange-400 transition-colors">{l.label}</Link></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-black text-xs mb-5 uppercase tracking-widest">Legal</h4>
              <ul className="space-y-3">
                {["Terms of Service", "Privacy Policy", "Earnings Disclaimer", "Anti-Fraud Policy", "Cookie Policy"].map((l) => (
                  <li key={l}><a href="#" className="text-white/35 text-sm hover:text-orange-400 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/5 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/25 text-sm">© 2026 {settings.site_name}. All rights reserved.</p>
            <p className="text-white/15 text-xs text-center max-w-lg">
              Earnings are not guaranteed. Results depend on individual effort, referral activity, and market conditions.
              Please read our <a href="#" className="underline hover:text-white/30 transition-colors">Earnings Disclaimer</a>.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
