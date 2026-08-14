import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Open Ledger — Collettive",
  description: "Collettive's public financial transparency dashboard. See how every dollar flows through the organization.",
};

// Demo data — clearly marked as sample
const LEDGER_DATA = {
  cashReserves: "$247,000",
  monthlyRevenue: "$38,000",
  annualRevenue: "$456,000",
  operatingExpenses: "$312,000",
  payroll: "$175,000",
  infrastructure: "$68,000",
  aiModelExpenses: "$24,000",
  contractors: "$31,000",
  marketing: "$14,000",
  taxes: "$46,000",
  communityContributions: "$32,000",
  reinvestment: "$68,000",
  ownerDistributions: "$23,000",
  debt: "$0",
  reserves: "$46,000",
};

const BREAKDOWN = [
  { label: "Employees & Contractors", amount: 35, color: "bg-violet-500", description: "Salaries, benefits, and contractor payments for the team building and operating Collettive." },
  { label: "Infrastructure & Technology", amount: 15, color: "bg-blue-500", description: "Servers, hosting, development tools, and software that keeps Collettive running." },
  { label: "Community Initiatives", amount: 10, color: "bg-emerald-500", description: "Free services for those who cannot pay, educational resources, and community projects." },
  { label: "Taxes", amount: 10, color: "bg-amber-500", description: "Federal, state, and local tax obligations." },
  { label: "Business Reinvestment", amount: 15, color: "bg-cyan-500", description: "Product development, research, and improvements to the platform." },
  { label: "Reserves", amount: 10, color: "bg-indigo-500", description: "Financial reserves for stability, unexpected expenses, and future planning." },
  { label: "AI Model Expenses", amount: 5, color: "bg-pink-500", description: "API costs for the AI models that power conversations and guidance." },
  { label: "Founder/Owner Compensation", amount: 5, color: "bg-rose-500", description: "Compensation for organizational leadership and ownership." },
];

export default function LedgerPage() {
  const total = BREAKDOWN.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center">
          <Link href="/" className="text-xl font-serif text-primary wings-aura">
            Collettive
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-4">
          <span className="text-[10px] uppercase tracking-widest text-primary/60 font-medium">Open Ledger</span>
        </div>
        <h1 className="text-4xl font-serif mb-3">Where the Money Goes</h1>
        <p className="text-muted-foreground mb-2 leading-relaxed">
          This page shows how Collettive&apos;s money flows through the organization.
          Our goal is to make organizational finances understandable to an ordinary person.
        </p>
        <p className="text-xs text-amber-500/70 mb-8 border border-amber-500/20 bg-amber-500/5 rounded-lg p-3">
          ⚠ These figures are sample data for demonstration purposes. Real financial data will replace them as Collettive begins operating with actual revenue and expenses.
        </p>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          <SummaryCard label="Cash Reserves" value={LEDGER_DATA.cashReserves} />
          <SummaryCard label="Monthly Revenue" value={LEDGER_DATA.monthlyRevenue} />
          <SummaryCard label="Annual Revenue" value={LEDGER_DATA.annualRevenue} />
          <SummaryCard label="Debt" value={LEDGER_DATA.debt} />
        </div>

        {/* Visual Breakdown: Where does every $100 go? */}
        <section className="mb-10">
          <h2 className="text-xs uppercase tracking-widest text-primary/70 font-medium mb-4">Where Does Every $100 Go?</h2>
          <div className="border border-border rounded-xl p-6">
            {/* Stacked bar */}
            <div className="w-full h-8 rounded-lg overflow-hidden flex mb-6">
              {BREAKDOWN.map((item) => (
                <div
                  key={item.label}
                  className={`${item.color} h-full first:rounded-l-lg last:rounded-r-lg transition-all hover:opacity-80 cursor-default relative group`}
                  style={{ width: `${item.amount}%` }}
                  title={`${item.label}: ${item.amount}%`}
                />
              ))}
            </div>

            {/* Legend */}
            <div className="space-y-4">
              {BREAKDOWN.map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className={`w-3 h-3 rounded-sm mt-1 shrink-0 ${item.color}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground font-medium">{item.label}</span>
                      <span className="text-sm font-mono text-muted-foreground">${item.amount} of $100</span>
                    </div>
                    <p className="text-xs text-muted-foreground/60 mt-0.5">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-border/50 text-right">
              <span className="text-xs text-muted-foreground/40">
                Total: {total}% — {total === 100 ? "Fully accounted" : `${100 - total}% unallocated`}
              </span>
            </div>
          </div>
        </section>

        {/* Detailed Financial Table */}
        <section className="mb-10">
          <h2 className="text-xs uppercase tracking-widest text-primary/70 font-medium mb-4">Annual Summary</h2>
          <div className="border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground/60 font-medium">Category</th>
                  <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground/60 font-medium">Amount</th>
                  <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground/60 font-medium">% of Revenue</th>
                </tr>
              </thead>
              <tbody>
                <TableRow label="Revenue" amount={LEDGER_DATA.annualRevenue} percentage={100} isBold />
                <TableRow label="Payroll" amount={LEDGER_DATA.payroll} percentage={38} />
                <TableRow label="Infrastructure & Technology" amount={LEDGER_DATA.infrastructure} percentage={15} />
                <TableRow label="AI Model Expenses" amount={LEDGER_DATA.aiModelExpenses} percentage={5} />
                <TableRow label="Contractors" amount={LEDGER_DATA.contractors} percentage={7} />
                <TableRow label="Marketing" amount={LEDGER_DATA.marketing} percentage={3} />
                <TableRow label="Community Contributions" amount={LEDGER_DATA.communityContributions} percentage={7} />
                <TableRow label="Taxes" amount={LEDGER_DATA.taxes} percentage={10} />
                <TableRow label="Reinvestment" amount={LEDGER_DATA.reinvestment} percentage={15} />
                <TableRow label="Owner Distributions" amount={LEDGER_DATA.ownerDistributions} percentage={5} />
                <TableRow label="Reserves" amount={LEDGER_DATA.reserves} percentage={10} />
              </tbody>
            </table>
          </div>
        </section>

        {/* Philosophy */}
        <section className="border border-primary/20 rounded-xl p-6 bg-primary/[0.03]">
          <h2 className="text-sm font-serif text-foreground mb-3">Why We Publish This</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            An organization reveals its values through where its resources flow. We publish our finances not because we are required to, but because we believe transparency is foundational to trust.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We are not claiming moral superiority. We are making our actions visible enough that you can judge us for yourself.
          </p>
        </section>
      </main>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border rounded-xl p-4 text-center">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium mb-1">{label}</p>
      <p className="text-xl font-serif text-foreground">{value}</p>
    </div>
  );
}

function TableRow({ label, amount, percentage, isBold }: { label: string; amount: string; percentage: number; isBold?: boolean }) {
  return (
    <tr className={`border-b border-border/50 ${isBold ? "" : "hover:bg-secondary/20"}`}>
      <td className={`px-4 py-2.5 ${isBold ? "font-medium text-foreground" : "text-muted-foreground"}`}>{label}</td>
      <td className={`px-4 py-2.5 text-right font-mono ${isBold ? "text-foreground" : "text-muted-foreground"}`}>{amount}</td>
      <td className={`px-4 py-2.5 text-right font-mono ${isBold ? "text-foreground" : "text-muted-foreground"}`}>{percentage}%</td>
    </tr>
  );
}