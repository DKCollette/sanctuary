import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "The Sanctuary Standard — Collettive",
  description: "A public ethical framework that organizations can voluntarily adopt — principles for transparent, accountable, and humane operations.",
};

const STANDARDS = [
  {
    area: "Financial Transparency",
    items: [
      "Publicly disclose revenue, expenses, and owner distributions annually",
      "Explain financial decisions in language an ordinary person can understand",
      "Clearly distinguish between documented and estimated figures",
    ],
  },
  {
    area: "Workforce & Culture",
    items: [
      "Disclose employee count, contractor ratio, and compensation ranges",
      "Publish the ratio between highest and lowest compensation",
      "Report turnover rates and layoff events transparently",
    ],
  },
  {
    area: "Ownership & Influence",
    items: [
      "Disclose founders, owners, major investors, and parent organizations",
      "Reveal significant financial relationships and conflicts of interest",
      "Report political and lobbying activities where relevant",
    ],
  },
  {
    area: "Social Impact",
    items: [
      "Report community contributions, charitable giving, and environmental impact",
      "Disclose privacy practices and customer impact assessments",
      "Acknowledge significant controversies and corrective actions taken",
    ],
  },
  {
    area: "Accountability",
    items: [
      "Maintain a publicly accessible governance structure",
      "Publish a clear process for submitting complaints or challenges",
      "Commit to regular independent verification of disclosures",
    ],
  },
];

const VERIFICATION_LEVELS = [
  {
    level: "Level 1",
    name: "Self Reported",
    description: "The organization has submitted the information itself. No independent verification has occurred.",
    color: "text-amber-400 border-amber-500/20 bg-amber-500/10",
  },
  {
    level: "Level 2",
    name: "Documented",
    description: "The organization has provided supporting documentation that can be reviewed.",
    color: "text-blue-400 border-blue-500/20 bg-blue-500/10",
  },
  {
    level: "Level 3",
    name: "Independently Verified",
    description: "A qualified third party has examined and confirmed the information.",
    color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
  },
];

export default function StandardPage() {
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
          <span className="text-[10px] uppercase tracking-widest text-primary/60 font-medium">The Sanctuary Standard</span>
        </div>
        <h1 className="text-4xl font-serif mb-4">A Framework for Trustworthy Organizations</h1>
        <p className="text-muted-foreground mb-3 leading-relaxed">
          The Sanctuary Standard is a public ethical framework that businesses, nonprofits, and organizations can voluntarily adopt.
          It functions as an open-source covenant for organizational transparency and accountability.
        </p>
        <p className="text-sm text-muted-foreground/70 mb-10 leading-relaxed">
          We are not asking others to meet a standard we are unwilling to meet ourselves.
          Collettive publishes its own information before asking anyone else to do the same.
        </p>

        {/* 10 Principles Summary */}
        <section className="mb-12">
          <h2 className="text-xs uppercase tracking-widest text-primary/70 font-medium mb-4">The Ten Principles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              "Truth Before Image",
              "Transparency Before Secrecy",
              "People Before Exploitation",
              "Stewardship Before Excess",
              "Responsibility Before Blame",
              "Fairness",
              "Service Alongside Profit",
              "Human Dignity",
              "Accountable Power",
              "Repair",
            ].map((principle, i) => (
              <Link
                key={i}
                href="/principles"
                className="border border-border rounded-lg p-3 hover:border-primary/30 transition-colors text-sm text-muted-foreground hover:text-foreground"
              >
                <span className="text-primary/40 font-mono text-xs mr-2">{String(i + 1).padStart(2, "0")}</span>
                {principle}
              </Link>
            ))}
          </div>
        </section>

        {/* Standard Areas */}
        <section className="mb-12">
          <h2 className="text-xs uppercase tracking-widest text-primary/70 font-medium mb-4">Standard Areas</h2>
          <div className="space-y-4">
            {STANDARDS.map((s) => (
              <div key={s.area} className="border border-border rounded-xl p-5">
                <h3 className="text-lg font-serif text-foreground mb-3">{s.area}</h3>
                <ul className="space-y-2">
                  {s.items.map((item, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary/40 mt-0.5">·</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Verification Levels */}
        <section className="mb-12">
          <h2 className="text-xs uppercase tracking-widest text-primary/70 font-medium mb-4">Verification Levels</h2>
          <p className="text-sm text-muted-foreground mb-4">
            The Sanctuary Standard does not assign morality scores. Instead, it provides evidence-based transparency statuses.
            Visitors can see the evidence and draw their own conclusions.
          </p>
          <div className="space-y-3">
            {VERIFICATION_LEVELS.map((vl) => (
              <div key={vl.level} className="border border-border rounded-lg p-4">
                <span className={`inline-block text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full border mb-2 ${vl.color}`}>
                  {vl.level}: {vl.name}
                </span>
                <p className="text-sm text-muted-foreground">{vl.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border border-primary/20 rounded-xl p-6 bg-primary/[0.03] text-center">
          <h2 className="text-lg font-serif text-foreground mb-2">Adopt the Standard</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Organizations interested in adopting the Sanctuary Standard can begin by reviewing the Covenant.
          </p>
          <Link href="/covenant" className="text-primary hover:text-primary/80 underline text-sm">
            View The Sanctuary Covenant →
          </Link>
        </section>
      </main>
    </div>
  );
}