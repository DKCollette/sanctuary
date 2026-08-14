import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Governance — Collettive",
  description: "How Collettive is owned, governed, and held accountable. Transparency about who controls decisions and how power is exercised.",
};

export default function GovernancePage() {
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
          <span className="text-[10px] uppercase tracking-widest text-primary/60 font-medium">Governance</span>
        </div>
        <h1 className="text-4xl font-serif mb-4">How We Are Governed</h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Transparency about governance is not optional — it is foundational. This page explains who controls Collettive, how decisions are made, and how we hold ourselves accountable.
        </p>

        {/* Ownership */}
        <Section title="Ownership & Control">
          <p className="text-sm text-muted-foreground mb-3">
            Collettive is owned and operated by its founder. There are no external investors, venture capital firms, or parent organizations controlling its direction.
          </p>
          <div className="bg-secondary/30 rounded-lg p-4 border border-border/50">
            <div className="text-sm">
              <span className="text-muted-foreground">Founder & Operator:</span>{" "}
              <span className="text-foreground font-medium">Darian Collette</span>
            </div>
            <div className="text-sm mt-1">
              <span className="text-muted-foreground">Ownership Structure:</span>{" "}
              <span className="text-foreground">Sole Proprietorship</span>
            </div>
            <div className="text-sm mt-1">
              <span className="text-muted-foreground">External Investors:</span>{" "}
              <span className="text-emerald-400">None</span>
            </div>
            <div className="text-sm mt-1">
              <span className="text-muted-foreground">Parent Organization:</span>{" "}
              <span className="text-emerald-400">None</span>
            </div>
          </div>
        </Section>

        {/* Decision Making */}
        <Section title="How Decisions Are Made">
          <p className="text-sm text-muted-foreground mb-3">
            Major decisions — including pricing, product direction, partnerships, and financial allocation — are made by the founder in consultation with advisors and the community where appropriate.
          </p>
          <div className="space-y-2">
            <DecisionItem topic="Product & Feature Direction" process="Founder-led with community input through forum discussions and feedback." />
            <DecisionItem topic="Pricing & Financial Decisions" process="Founder-led, published transparently in the Open Ledger." />
            <DecisionItem topic="Policy Changes" process="Proposed changes are published before implementation. Significant changes include a comment period." />
            <DecisionItem topic="Community Standards" process="Developed collaboratively with community moderators and published in the principles." />
          </div>
        </Section>

        {/* Leadership Compensation */}
        <Section title="Leadership Compensation">
          <p className="text-sm text-muted-foreground mb-3">
            Founder compensation is disclosed as part of the Open Ledger. The goal is to provide fair compensation that allows sustainable operation without excess.
          </p>
          <div className="bg-secondary/30 rounded-lg p-4 border border-border/50">
            <p className="text-sm text-muted-foreground">
              Founder compensation range: <span className="text-foreground font-medium">$40,000–$60,000</span>
              {" "}(sample data — will be updated with real figures)
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              This represents the lowest sustainable compensation for full-time organizational leadership in the current operating context.
            </p>
          </div>
        </Section>

        {/* Conflicts of Interest */}
        <Section title="Conflicts of Interest">
          <p className="text-sm text-muted-foreground mb-3">
            Collettive currently has no external investors, board members, or significant financial relationships that could create conflicts of interest. This will be updated if the situation changes.
          </p>
          <div className="bg-secondary/30 rounded-lg p-4 border border-border/50">
            <p className="text-sm text-muted-foreground">
              <span className="text-emerald-400">No known conflicts of interest at this time.</span>
            </p>
          </div>
        </Section>

        {/* Accountability */}
        <Section title="Accountability & Complaints">
          <p className="text-sm text-muted-foreground mb-3">
            We take accountability seriously. If you believe Collettive has failed to meet its stated principles, you can submit a concern.
          </p>
          <div className="bg-secondary/30 rounded-lg p-4 border border-border/50">
            <p className="text-sm text-muted-foreground">
              To submit a concern, complaint, or challenge regarding Collettive&apos;s operations:
            </p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              <li>· Email: <span className="text-foreground">governance@collettive.app</span></li>
              <li>· All concerns are reviewed by the founder</li>
              <li>· Responses are provided within 14 business days</li>
              <li>· Significant concerns and their resolutions may be published (with individual privacy protected)</li>
            </ul>
          </div>
        </Section>

        {/* Policy Changes */}
        <Section title="How Policies Are Changed">
          <p className="text-sm text-muted-foreground">
            Policy changes are announced before they take effect. The version history of the Sanctuary Covenant, Standard, and Principles is maintained publicly so that changes are trackable over time. Significant changes include an explanation of why the change was made.
          </p>
        </Section>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-xs uppercase tracking-widest text-primary/70 font-medium mb-3">{title}</h2>
      <div className="border border-border rounded-xl p-5">
        {children}
      </div>
    </section>
  );
}

function DecisionItem({ topic, process }: { topic: string; process: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-primary/40 mt-0.5">·</span>
      <div>
        <span className="text-sm text-foreground font-medium">{topic}:</span>
        <span className="text-sm text-muted-foreground"> {process}</span>
      </div>
    </div>
  );
}