import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "The Sanctuary Covenant v1.0 — Collettive",
  description: "A voluntary public commitment for organizations dedicated to transparency, accountability, and ethical operations.",
};

const COVENANT_COMMITMENTS = [
  "Honest reporting of organizational information",
  "Financial transparency including revenue, expenses, and owner distributions",
  "Responsible and fair treatment of all employees and contractors",
  "Respect for individual privacy — maximum organizational transparency, maximum individual privacy",
  "Disclosure of ownership structures and potential conflicts of interest",
  "Ethical use of organizational power and influence",
  "Accountability for mistakes — open acknowledgment and corrective action",
  "Repairing preventable harm when it occurs",
  "Continually improving transparency practices over time",
  "Allowing independent verification of disclosures",
];

const VERSIONS = [
  { version: "v1.0", date: "August 2026", status: "Current", current: true },
];

export default function CovenantPage() {
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
          <span className="text-[10px] uppercase tracking-widest text-primary/60 font-medium">Commitment</span>
        </div>
        <h1 className="text-4xl font-serif mb-2">The Sanctuary Covenant</h1>
        <p className="text-sm text-primary/60 font-mono mb-6">Version 1.0 — August 2026</p>
        <p className="text-muted-foreground mb-3 leading-relaxed">
          The Sanctuary Covenant is a voluntary public commitment. Organizations that adopt it pledge to operate with honesty, transparency, and accountability.
        </p>
        <p className="text-sm text-muted-foreground/70 mb-10 leading-relaxed">
          This Covenant is versioned so it can evolve over time. Historical versions remain publicly accessible.
        </p>

        {/* Preamble */}
        <div className="border border-border rounded-xl p-6 mb-10 bg-card/30">
          <h2 className="text-sm font-serif text-foreground mb-3 italic">Preamble</h2>
          <p className="text-sm text-muted-foreground leading-relaxed italic">
            We believe that spirituality is not only what we profess in private. It is how we behave when entrusted with money, people, influence, and power.
            An organization reveals its values through where its resources flow and how it treats those it touches.
            Transparency does not require perfection. It requires honesty.
            By signing this Covenant, we commit to making our actions visible enough that others may judge us for themselves.
          </p>
        </div>

        {/* Commitments */}
        <h2 className="text-xs uppercase tracking-widest text-primary/70 font-medium mb-4">Commitments</h2>
        <div className="space-y-3 mb-10">
          {COVENANT_COMMITMENTS.map((commitment, i) => (
            <div key={i} className="flex items-start gap-3 border border-border rounded-lg p-4">
              <span className="text-primary/40 font-mono text-xs mt-0.5 shrink-0">{String(i + 1).padStart(2, "0")}</span>
              <p className="text-sm text-muted-foreground">{commitment}</p>
            </div>
          ))}
        </div>

        {/* Versions */}
        <section className="mb-10">
          <h2 className="text-xs uppercase tracking-widest text-primary/70 font-medium mb-4">Versions</h2>
          <div className="space-y-2">
            {VERSIONS.map((v) => (
              <div key={v.version} className="flex items-center justify-between border border-border rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono text-foreground">{v.version}</span>
                  <span className="text-xs text-muted-foreground">{v.date}</span>
                </div>
                {v.current && (
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    Current
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Signatories */}
        <section className="border border-primary/20 rounded-xl p-6 bg-primary/[0.03] text-center">
          <h2 className="text-lg font-serif text-foreground mb-2">Become a Signatory</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Organizations interested in adopting the Covenant can begin the process by contacting us.
            Collettive itself is the first signatory, demonstrating our commitment before asking others to join.
          </p>
          <p className="text-xs text-muted-foreground/60">
            First signatory: <span className="text-foreground font-medium">Collettive</span> — August 2026
          </p>
        </section>
      </main>
    </div>
  );
}