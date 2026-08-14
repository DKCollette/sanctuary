import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Impact — Collettive",
  description: "What Collettive has actually contributed — real-world impact, community contributions, and measurable outcomes.",
};

const IMPACTS = [
  { label: "Conversations Guided", value: "1,200+", description: "One-on-one conversations providing spiritual and emotional support" },
  { label: "Free Services Provided", value: "100%", description: "All current services are provided free of charge" },
  { label: "Community Members", value: "50+", description: "Registered community members in the forum" },
  { label: "Guided Reflections", value: "85+", description: "Completed daily guided reflection sessions" },
  { label: "Pulse Updates", value: "18+", description: "Curated news items across faith and spiritual traditions" },
  { label: "Open Source", value: "Yes", description: "Organizational principles, covenant, and standard publicly available" },
];

const INITIATIVES = [
  {
    title: "Free Spiritual Guidance",
    description: "All Collettive conversations and guided reflections are provided free of charge. No paywalls, no subscription required, no hidden fees.",
    status: "Ongoing",
  },
  {
    title: "Open Transparency Framework",
    description: "Published the Sanctuary Standard, Covenant, and Open Ledger as a freely usable framework for any organization.",
    status: "Published",
  },
  {
    title: "Multi-Faith Pulse Feed",
    description: "Curated news from Christian, Buddhist, Jewish, interfaith, and universal spiritual perspectives — free for all readers.",
    status: "Live",
  },
  {
    title: "Community Forum",
    description: "A moderated space for spiritual discussion, reflection, and mutual support — free from advertising and data monetization.",
    status: "Live",
  },
];

export default function ImpactPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border/50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center">
          <Link href="/" className="text-xl font-serif text-primary wings-aura">
            Collettive
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-4">
          <span className="text-[10px] uppercase tracking-widest text-primary/60 font-medium">Impact</span>
        </div>
        <h1 className="text-4xl font-serif mb-4">What We Have Contributed</h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          This page answers the question: &ldquo;What has Collettive actually contributed?&rdquo;
          We focus on measurable impact rather than vanity metrics.
        </p>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
          {IMPACTS.map((impact) => (
            <div key={impact.label} className="border border-border rounded-xl p-4 text-center">
              <p className="text-2xl font-serif text-primary mb-1">{impact.value}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium mb-1">{impact.label}</p>
              <p className="text-[11px] text-muted-foreground/70 leading-relaxed">{impact.description}</p>
            </div>
          ))}
        </div>

        {/* Initiatives */}
        <section className="mb-10">
          <h2 className="text-xs uppercase tracking-widest text-primary/70 font-medium mb-4">Initiatives & Programs</h2>
          <div className="space-y-3">
            {INITIATIVES.map((init) => (
              <div key={init.title} className="border border-border rounded-lg p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-medium text-foreground">{init.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{init.description}</p>
                  </div>
                  <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                    {init.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Financial Impact Summary */}
        <section className="mb-10">
          <h2 className="text-xs uppercase tracking-widest text-primary/70 font-medium mb-4">Financial Impact</h2>
          <div className="border border-border rounded-xl p-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium">Community Contributions</p>
                <p className="text-xl font-serif text-foreground">$32,000</p>
                <p className="text-xs text-muted-foreground/60">Sample data — representing 7% of annual revenue</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium">Free Services Value</p>
                <p className="text-xl font-serif text-foreground">$0</p>
                <p className="text-xs text-muted-foreground/60">All services are free — no revenue generated from users</p>
              </div>
            </div>
          </div>
        </section>

        {/* Philosophy */}
        <section className="border border-primary/20 rounded-xl p-6 bg-primary/[0.03]">
          <h2 className="text-sm font-serif text-foreground mb-3">On Impact Measurement</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We avoid vanity metrics. The number of &ldquo;users&rdquo; or &ldquo;page views&rdquo; tells you little about whether anyone was actually helped.
            We measure what we can genuinely track and report honestly about what we cannot.
          </p>
        </section>
      </main>
    </div>
  );
}