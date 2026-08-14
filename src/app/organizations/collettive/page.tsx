import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Collettive — Transparency Profile",
  description: "The transparency profile for Collettive, first signatory of the Sanctuary Covenant.",
};

// Sample data — clearly marked as demo
const FINANCIALS = [
  { label: "Revenue", value: "$456,000", status: "Documented" },
  { label: "Expenses", value: "$312,000", status: "Documented" },
  { label: "Payroll", value: "$175,000", status: "Documented" },
  { label: "Owner Distributions", value: "$23,000", status: "Documented" },
  { label: "Taxes", value: "$46,000", status: "Documented" },
  { label: "Community Contributions", value: "$32,000", status: "Documented" },
  { label: "Reinvestment", value: "$68,000", status: "Documented" },
  { label: "Reserves", value: "$46,000", status: "Documented" },
  { label: "Debt", value: "$0", status: "Documented" },
];

const WORKFORCE = [
  { label: "Employees", value: "1", status: "Documented" },
  { label: "Contractors", value: "1–2", status: "Documented" },
  { label: "Compensation Range", value: "$40k–$60k", status: "Documented" },
  { label: "Executive-to-Worker Ratio", value: "1:1", status: "Documented" },
  { label: "Turnover", value: "0%", status: "Documented" },
];

const OWNERSHIP = [
  { label: "Founder", value: "Darian Collette", status: "Documented" },
  { label: "External Investors", value: "None", status: "Documented" },
  { label: "Parent Organization", value: "None", status: "Documented" },
  { label: "Conflicts of Interest", value: "None known", status: "Self Reported" },
];

const SOCIAL_IMPACT = [
  { label: "Free Services", value: "100%", status: "Documented" },
  { label: "Community Contributions", value: "$32,000", status: "Documented" },
  { label: "Environmental Impact", value: "Minimal — server-based", status: "Self Reported" },
  { label: "Privacy Practices", value: "Published", status: "Documented" },
];

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "Documented"
      ? "text-blue-400 border-blue-500/20 bg-blue-500/10"
      : status === "Independently Verified"
      ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
      : "text-amber-400 border-amber-500/20 bg-amber-500/10";
  return (
    <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${color}`}>
      {status}
    </span>
  );
}

function DisclosureTable({ title, rows }: { title: string; rows: { label: string; value: string; status: string }[] }) {
  return (
    <section className="mb-8">
      <h2 className="text-xs uppercase tracking-widest text-primary/70 font-medium mb-3">{title}</h2>
      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={i > 0 ? "border-t border-border/50" : ""}>
                <td className="px-4 py-3 text-muted-foreground">{row.label}</td>
                <td className="px-4 py-3 text-foreground font-medium text-right">{row.value}</td>
                <td className="px-4 py-3 text-right w-32"><StatusBadge status={row.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function OrganizationProfilePage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border/50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-xl font-serif text-primary wings-aura">
            Collettive
          </Link>
          <Link href="/organizations" className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors">
            ← Directory
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <span className="inline-block text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full border border-primary/20 bg-primary/10 text-primary mb-3">
            Sanctuary Standard Participant
          </span>
          <h1 className="text-4xl font-serif mb-2">Collettive</h1>
          <p className="text-muted-foreground mb-3">
            A spiritual guidance platform and transparency initiative. First signatory of the Sanctuary Covenant.
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-block text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400">
              Covenant v1.0 · Signed
            </span>
            <span className="inline-block text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400">
              Verification: Self Reported
            </span>
          </div>
        </div>

        {/* Demo data notice */}
        <div className="mb-8 text-xs text-amber-500/70 border border-amber-500/20 bg-amber-500/5 rounded-lg p-3">
          ⚠ This profile contains sample data for demonstration. Real disclosures will be published as Collettive begins operating with actual financials.
        </div>

        {/* Financial Transparency */}
        <DisclosureTable title="Financial Transparency" rows={FINANCIALS} />

        {/* Workforce */}
        <DisclosureTable title="Workforce" rows={WORKFORCE} />

        {/* Ownership & Influence */}
        <DisclosureTable title="Ownership & Influence" rows={OWNERSHIP} />

        {/* Social Impact */}
        <DisclosureTable title="Social Impact" rows={SOCIAL_IMPACT} />

        {/* Philosophy */}
        <section className="border border-primary/20 rounded-xl p-6 bg-primary/[0.03]">
          <h2 className="text-sm font-serif text-foreground mb-3">Why We Publish This</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We are not claiming moral superiority. We are making our actions visible enough that you can judge us for yourself.
            Maximum organizational transparency. Maximum individual privacy.
          </p>
        </section>
      </main>
    </div>
  );
}