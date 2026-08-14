import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Principles — Collettive",
  description: "The foundational principles that guide Collettive — a commitment to truth, transparency, fairness, and human dignity.",
};

const PRINCIPLES = [
  {
    number: 1,
    title: "Truth Before Image",
    description: "We prioritize truthful disclosure over protecting appearances. When faced with a choice between how something looks and what is真实的, we choose what is真实的.",
    quote: "The truth may be uncomfortable, but it is never destructive. Only the concealment of truth causes harm.",
  },
  {
    number: 2,
    title: "Transparency Before Secrecy",
    description: "Information affecting stakeholders should be visible unless there is a legitimate privacy, security, or legal reason not to disclose it. We default to openness and justify secrecy, not the reverse.",
  },
  {
    number: 3,
    title: "People Before Exploitation",
    description: "We do not build success through unnecessary harm or exploitation of workers, customers, communities, or vulnerable people. The dignity of people always precedes financial gain.",
  },
  {
    number: 4,
    title: "Stewardship Before Excess",
    description: "Money, influence, natural resources, and organizational power are responsibilities, not possessions. We steward what we are entrusted with rather than consuming it excessively.",
  },
  {
    number: 5,
    title: "Responsibility Before Blame",
    description: "When something goes wrong, we acknowledge mistakes openly and take corrective action. The goal is learning and repair, not deflection or scapegoating.",
  },
  {
    number: 6,
    title: "Fairness",
    description: "Compensation, opportunity, policies, and treatment should be reasonably equitable and explainable. We are willing to justify how resources and opportunities are distributed.",
  },
  {
    number: 7,
    title: "Service Alongside Profit",
    description: "Profit is not inherently wrong. But we identify what value we return to people and society alongside whatever financial return we generate. Profit is a means, not the purpose.",
  },
  {
    number: 8,
    title: "Human Dignity",
    description: "People are never reduced simply to labor, customers, metrics, or sources of revenue. Every person carries inherent worth that no organizational objective can override.",
  },
  {
    number: 9,
    title: "Accountable Power",
    description: "The more authority someone holds, the more accountability and transparency should be expected of them. Power without accountability is a failure of integrity.",
  },
  {
    number: 10,
    title: "Repair",
    description: "When we create harm, we acknowledge it, explain what happened, and communicate how we intend to repair or prevent recurrence. Apology without action is incomplete.",
  },
];

export default function PrinciplesPage() {
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
          <span className="text-[10px] uppercase tracking-widest text-primary/60 font-medium">Foundation</span>
        </div>
        <h1 className="text-4xl font-serif mb-4">Our Principles</h1>
        <p className="text-muted-foreground mb-3 leading-relaxed">
          These principles guide how Collettive operates. They are not aspirations — they are commitments.
          We publish them so that anyone can hold us accountable to them.
        </p>
        <p className="text-sm text-muted-foreground/70 mb-10 leading-relaxed">
          Spirituality is not only what we believe. It is how we behave when entrusted with money, people, influence, and power.
        </p>

        <div className="space-y-6">
          {PRINCIPLES.map((p) => (
            <div
              key={p.number}
              className="border border-border rounded-xl p-6 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl font-serif text-primary/40 font-light shrink-0 w-8">
                  {String(p.number).padStart(2, "0")}
                </span>
                <div>
                  <h2 className="text-xl font-serif text-foreground mb-2">{p.title}</h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">{p.description}</p>
                  {p.quote && (
                    <p className="text-sm italic text-primary/70 border-l-2 border-primary/20 pl-4">
                      {p.quote}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <section className="mt-12 pt-6 border-t border-border text-center">
          <Link href="/standard" className="text-primary hover:text-primary/80 underline text-sm">
            Explore The Sanctuary Standard →
          </Link>
        </section>
      </main>
    </div>
  );
}