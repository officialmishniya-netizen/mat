import Link from "next/link";
import { getSiteSettings } from "@/lib/settings";
import {
  TrendingUp, MousePointerClick, Users, ShieldCheck,
  Zap, Globe, ChevronRight, ArrowRight, Star,
  DollarSign, Clock, Award, BarChart3, Wallet, Lock,
  Gamepad2, ShoppingBag,
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
      icon: Gamepad2,
      gradient: "from-pink-500 to-rose-500",
      title: "Interactive Games",
      desc: "Earn while you play. Participate in skill-based games and tournaments to win instant prizes and network rewards.",
    },
    {
      icon: ShoppingBag,
      gradient: "from-cyan-500 to-blue-500",
      title: "Marketplace Hub",
      desc: "A premium hub to buy and sell digital assets, ad space, and exclusive member services with integrated ledger protection.",
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
    { name: "Starter", price: "$10", credits: "1,000", perCredit: "$0.01", cyclePayout: "$20.00", sponsor: "$2.78", highlight: false, badge: "" },
    { name: "Basic", price: "$25", credits: "2,000", perCredit: "$0.0175", cyclePayout: "$50.00", sponsor: "$6.94", highlight: false, badge: "" },
    { name: "Standard", price: "$100", credits: "3,000", perCredit: "$0.033", cyclePayout: "$200.00", sponsor: "$22.50", highlight: false, badge: "" },
    { name: "Advanced", price: "$200", credits: "$4,000", perCredit: "$0.05", cyclePayout: "$400.00", sponsor: "$51.00", highlight: true, badge: "★ Most Popular" },
    { name: "Pro", price: "$520", credits: "5,000", perCredit: "$0.104", cyclePayout: "$1,100.00", sponsor: "$144.30", highlight: false, badge: "Best Value" },
  ];

  const tickerItems = [
    "🟢 Ahmad W. just joined", "🟢 James K. just joined", "🟢 Priya S. just joined",
    "🟢 Carlos M. just joined from Mexico", "🟢 Sarah L. just joined", "🟢 David O. just joined",
    "🟢 Nour A. just joined", "🟢 Wei C. just joined",
    "🟢 Michael R. just joined", "🟢 Emma T. just joined", "🟢 Liam H. just joined",
    "🟢 Sofia G. just joined from Brazil", "🟢 Noah J. just joined", "🟢 Isabella P. just joined",
  ];

  return (
    <div className="min-h-screen bg-[#07070f] text-white selection:bg-orange-500 selection:text-white overflow-x-hidden">

      {/* â•â• STICKY NAV â•â• */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#07070f]/80 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center gap-3 animate-fade-in group">
              <img src="/logo.png" alt={settings.site_name} className="h-[75px] w-auto object-contain group-hover:scale-105 transition-transform" />
            </Link>
            <div className="hidden md:flex items-center gap-8 animate-fade-in delay-100">
              {["#features", "#how-it-works", "#plans", "#testimonials"].map((href, i) => (
                <a key={href} href={href} className="text-sm text-white/50 hover:text-white transition-colors capitalize">
                  {href.replace("#", "").replace("-", " ")}
                </a>
              ))}
            </div>
            <div className="flex items-center gap-3 animate-fade-in delay-200">
              <Link href="/auth/login" className="text-sm font-semibold text-white/60 hover:text-white transition-colors">Log In</Link>
              <Link href="/auth/register" className="text-sm font-black px-5 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-red-600 animate-gradient hover:scale-105 transition-transform shadow-lg shadow-orange-900/40">
                Join Free →
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* â•â• HERO â•â• */}
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
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
            </Link>
            <a href="#how-it-works" className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white/60 border border-white/10 hover:bg-white/5 hover:text-white transition-all text-base">
              See How It Works
            </a>
          </div>

          {/* Stats bar */}
          <div className="animate-fade-up delay-400 grid grid-cols-2 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
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

      {/* â•â• LIVE TICKER â•â• */}
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

      {/* ── FEATURES ── */}
      <section id="features" className="py-28 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <ScrollReveal className="text-center mb-16">
            <span className="text-xs font-black text-orange-400 uppercase tracking-[0.2em]">Why We Win</span>
            <h2 className="mt-3 text-4xl sm:text-5xl font-black text-white leading-tight">
              Eight Earning Engines.<br /><span className="text-white/30">One Unstoppable Platform.</span>
            </h2>
            <p className="mt-5 max-w-xl mx-auto text-white/45">
              No fluff, no hype. Eight real mechanisms that work together to multiply your income — automatically.
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

      {/* ── HOW IT WORKS ── */}
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

      {/* ── VERIFIED EARNINGS ── */}
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
                  From a $0.01 ad click to a $500 matrix cycle — every event is recorded on our tamper-proof internal ledger.
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
                <div className="w-full max-w-sm bg-[#07070f] border border-white/10 rounded-2xl p-6 shadow-2xl">
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
                      { time: "09:14:22", label: "Ad Click #291", amt: "+$0.30", color: "text-emerald-400" },
                      { time: "09:31:05", label: "Matrix Buy L2", amt: "-$10.00", color: "text-red-400" },
                      { time: "10:02:44", label: "Matching Bonus", amt: "+$5.00", color: "text-emerald-400" },
                    ].map((row) => (
                      <div key={row.time} className="flex justify-between text-white/35">
                        <span>[{row.time}] {row.label}</span>
                        <span className={row.color}>{row.amt}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                    <span className="text-white/35 text-[10px] font-mono uppercase tracking-widest">Net Balance</span>
                    <span className="text-orange-400 text-2xl font-black">$20.30</span>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── PLANS ── */}
      <section id="plans" className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-orange-600/5 rounded-full blur-[140px]" />
        </div>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative">
          <ScrollReveal className="text-center mb-16">
            <span className="text-xs font-black text-orange-400 uppercase tracking-[0.2em]">Investment Plans</span>
            <h2 className="mt-3 text-4xl sm:text-5xl font-black text-white">
              Your Money.<br /><span className="text-white/30">Working For You.</span>
            </h2>
            <p className="mt-5 max-w-xl mx-auto text-white/45">
              Buy a position once. Click premium ads. Watch your payout arrive — automatically.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mt-12">
            {plans.map((plan, i) => {
              const isPopular = plan.highlight;
              return (
                <ScrollReveal key={plan.name} scale delay={i * 80}>
                  <div
                    className={`h-full flex flex-col border-2 transition-all duration-300 group overflow-hidden
                      ${isPopular
                        ? "bg-white border-[#f97316] shadow-[8px_8px_0px_0px_rgba(249,115,22,1)]"
                        : "bg-white border-black/5 hover:border-black/20"
                      }`}
                  >
                    {/* Badge */}
                    {plan.badge && (
                      <div className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 text-center
                        ${isPopular ? "bg-[#f97316] text-white" : "bg-black/5 text-black/40"}`}>
                        {plan.badge}
                      </div>
                    )}

                    <div className="p-8 flex flex-col flex-1">
                      <div className="mb-8">
                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${isPopular ? "text-[#f97316]" : "text-black/30"}`}>
                          {plan.name} Package
                        </p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-5xl font-black text-black tracking-tighter">
                            {plan.price}
                          </span>
                        </div>
                      </div>

                      {/* ROI Display */}
                      <div className={`p-4 mb-8 border-l-4 ${isPopular ? "border-[#f97316] bg-orange-50" : "border-black/10 bg-gray-50"}`}>
                        <p className="text-[9px] font-black text-black/40 uppercase tracking-widest mb-1">Engine ROI Payout</p>
                        <p className={`text-2xl font-black ${isPopular ? "text-[#f97316]" : "text-black/80"}`}>
                          {plan.cyclePayout}
                        </p>
                      </div>

                      {/* Features */}
                      <div className="space-y-4 mb-10 flex-1">
                        {[
                          { label: "Ad Credits", value: plan.credits },
                          { label: "Per Click", value: plan.perCredit },
                          { label: "Sponsor Bonus", value: plan.sponsor },
                        ].map((row) => (
                          <div key={row.label} className="flex justify-between items-center text-xs">
                            <span className="font-bold text-black/30 uppercase tracking-wider">{row.label}</span>
                            <span className="font-black text-black">{row.value}</span>
                          </div>
                        ))}
                      </div>

                      {/* CTA */}
                      <Link
                        href="/auth/register"
                        className={`w-full py-4 text-center text-xs font-black uppercase tracking-widest transition-all
                          ${isPopular
                            ? "bg-[#f97316] text-white hover:bg-black"
                            : "bg-black text-white hover:bg-[#f97316]"
                          }`}
                      >
                        Enter Plan
                      </Link>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>

          <div className="mt-12 flex flex-wrap gap-8 justify-center border-t border-black/5 pt-8">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 bg-[#f97316]" />
              <span className="text-black/40 text-[10px] font-bold uppercase tracking-wider">Cycle Payout — Total ROI</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 bg-black" />
              <span className="text-black/40 text-[10px] font-bold uppercase tracking-wider">Sponsor Bonus — Referral Share</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 bg-[#050509]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 py-16">
            <div className="md:col-span-2">
              <Link href="/" className="inline-flex items-center gap-3 mb-6">
                <img src="/logo.png" alt={settings.site_name} className="h-20 w-auto object-contain" />
              </Link>
              <p className="text-white/35 text-sm leading-relaxed mb-5 max-w-sm">The world&apos;s most transparent MatClick investment platform. Built for long-term digital income.</p>
              <div className="flex items-center gap-2"><ShieldCheck size={15} className="text-emerald-400" /><span className="text-emerald-400 text-xs font-semibold">SSL Secured & Encrypted</span></div>
            </div>
            <div>
              <h4 className="text-white font-black text-xs mb-5 uppercase tracking-widest">Platform</h4>
              <ul className="space-y-3">{["Plans", "Matrix System", "Ad Click", "Matching Bonus"].map(l => (<li key={l}><a href="#" className="text-white/35 text-sm hover:text-orange-400 transition-colors">{l}</a></li>))}</ul>
            </div>
            <div>
              <h4 className="text-white font-black text-xs mb-5 uppercase tracking-widest">Legal</h4>
              <ul className="space-y-3">{["Terms", "Privacy", "Disclaimer"].map(l => (<li key={l}><a href="#" className="text-white/35 text-sm hover:text-orange-400 transition-colors">{l}</a></li>))}</ul>
            </div>
          </div>
          <div className="border-t border-white/5 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/25 text-sm">© 2026 MatClick. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
