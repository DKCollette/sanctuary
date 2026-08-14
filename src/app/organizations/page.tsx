import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Organizations — Sanctuary Standard",
  description: "Organizations participating in the Sanctuary Standard transparency framework.",
};

const ORGANIZATIONS = [
  {
    name: "Collettive",
    slug: "collettive",
    description: "The spiritual guidance platform and transparency initiative. First signatory of the Sanctuary Covenant.",
    status: "Self Reported",
    statusColor: "text-amber-400 border-amber-500/20 bg-amber-500/10",
    isSanctuary: true,
  },
];

export default function OrganizationsPage() {
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
          <span className="text-[10px] uppercase tracking-widest text-primary/60 font-medium">Directory</span>
        </div>
        <h1 className="text-4xl font-serif mb-4">Participating Organizations</h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Organizations that have adopted the Sanctuary Standard and made their operations transparent.
          Collettive publishes its own information before asking others to do the same.
        </p>

        {ORGANIZATIONS.length === 0 ? (
          <div className="text-center py-16 border border-border rounded-xl">
            <p className="text-muted-foreground">No participating organizations yet.</p>
            <p className="text-sm text-muted-foreground/60 mt-2">
              Collettive is the first signatory. Its profile is available below.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {ORGANIZATIONS.map((org) => (
              <Link
                key={org.slug}
                href={`/organizations/${org.slug}`}
                className="block border border-border rounded-xl p-5 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-serif text-foreground mb-1">{org.name}</h2>
                    <p className="text-sm text-muted-foreground">{org.description}</p>
                  </div>
                  <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${org.statusColor}`}>
                    {org.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}