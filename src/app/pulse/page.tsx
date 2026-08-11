import type { Metadata } from "next";
import Link from "next/link";
import { getNewsFeed } from "@/lib/news-generator";

export const metadata: Metadata = {
  title: "Cosmic Pulse — Sanctuary",
  description:
    "Real-time cosmic news, astrological transits, lunar cycles, and energetic updates curated for your spiritual journey.",
};

const CATEGORY_COLORS: Record<string, string> = {
  "Astro / Zodiac Season": "border-l-purple-500 bg-purple-500/5",
  "Cosmic Portals & Transits": "border-l-amber-500 bg-amber-500/5",
  "Lunar Cycles": "border-l-blue-400 bg-blue-400/5",
  "Energetic States & Earth Frequency": "border-l-emerald-500 bg-emerald-500/5",
  "Mindfulness & Universal News": "border-l-rose-400 bg-rose-400/5",
};

const CATEGORY_BADGES: Record<string, string> = {
  "Astro / Zodiac Season": "text-purple-400 bg-purple-500/10 border-purple-500/20",
  "Cosmic Portals & Transits": "text-amber-400 bg-amber-500/10 border-amber-500/20",
  "Lunar Cycles": "text-blue-400 bg-blue-400/10 border-blue-400/20",
  "Energetic States & Earth Frequency": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  "Mindfulness & Universal News": "text-rose-400 bg-rose-500/10 border-rose-500/20",
};

export default async function PulsePage() {
  let feed: any[] = [];
  let error: string | null = null;
  let generatedAt: string | null = null;

  try {
    const data = await getNewsFeed();
    feed = data;
    generatedAt = new Date().toISOString();
  } catch (e) {
    error = "Could not load the cosmic pulse right now. The stars are still aligning.";
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 sticky top-0 z-40 bg-background/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-xl font-serif text-primary">
            Sanctuary
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              href="/about"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
            >
              About
            </Link>
            <Link
              href="/guidance"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
            >
              Guidance
            </Link>
            <Link
              href="/privacy"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
            >
              Privacy
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Live Cosmic Feed
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-light tracking-wider text-primary mb-4">
            Cosmic Pulse
          </h1>
          <p className="text-lg text-muted-foreground font-serif italic max-w-xl mx-auto">
            What the universe is whispering right now.
          </p>
        </div>
      </section>

      {/* Feed */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">{error}</p>
            <Link href="/" className="text-primary hover:text-primary/80 underline text-sm mt-4 inline-block">
              Return to Sanctuary
            </Link>
          </div>
        )}

        {!error && feed.length === 0 && (
          <div className="text-center py-16">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
              <span className="text-primary font-serif text-lg">✦</span>
            </div>
            <p className="text-muted-foreground">The cosmic feed is generating...</p>
            <p className="text-xs text-muted-foreground/60 mt-2">This first load may take a moment</p>
          </div>
        )}

        {!error && feed.length > 0 && (
          <div className="space-y-6">
            {/* Active Now section */}
            {feed.filter((item) => item.isActiveNow).length > 0 && (
              <section>
                <h2 className="text-xs uppercase tracking-widest text-primary/70 font-medium mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Active Now
                </h2>
                <div className="space-y-4">
                  {feed
                    .filter((item) => item.isActiveNow)
                    .map((item) => (
                      <NewsCard key={item.id} item={item} />
                    ))}
                </div>
              </section>
            )}

            {/* Upcoming / Seasonal section */}
            {feed.filter((item) => !item.isActiveNow).length > 0 && (
              <section className="pt-6">
                <h2 className="text-xs uppercase tracking-widest text-muted-foreground/60 font-medium mb-4">
                  Upcoming &amp; Seasonal
                </h2>
                <div className="space-y-4">
                  {feed
                    .filter((item) => !item.isActiveNow)
                    .map((item) => (
                      <NewsCard key={item.id} item={item} />
                    ))}
                </div>
              </section>
            )}

            {/* Resources Section */}
            <section className="pt-12 pb-8 border-t border-border/50">
              <h2 className="text-xs uppercase tracking-widest text-primary/60 font-medium mb-6 text-center">
                Explore Further
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl mx-auto">
                <ResourceLink
                  href="https://cafeastrology.com"
                  category="Astro / Zodiac Season"
                  label="Current transits, aspects & daily horoscopes"
                />
                <ResourceLink
                  href="https://www.timeanddate.com/astronomy/"
                  category="Cosmic Portals & Transits"
                  label="Solstices, equinoxes & astronomical events"
                />
                <ResourceLink
                  href="https://www.moongiant.com/phase/today/"
                  category="Lunar Cycles"
                  label="Today's moon phase & lunar calendar"
                />
                <ResourceLink
                  href="https://www.spaceweather.com"
                  category="Energetic States & Earth Frequency"
                  label="Solar flares, aurora & space weather"
                />
                <ResourceLink
                  href="https://www.swpc.noaa.gov"
                  category="Energetic States & Earth Frequency"
                  label="NOAA: Geomagnetic activity & Schumann data"
                />
                <ResourceLink
                  href="https://www.mindful.org"
                  category="Mindfulness & Universal News"
                  label="Mindfulness practices & conscious living"
                />
              </div>
              <p className="text-center text-xs text-muted-foreground/40 mt-6">
                These external resources are independent of Sanctuary and provided for deeper exploration.
              </p>
            </section>

            {/* Footer */}
            <div className="text-center pt-6 pb-4">
              <p className="text-xs text-muted-foreground/40">
                Curated by Sanctuary · Updated throughout the day
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function NewsCard({ item }: { item: any }) {
  const borderColor = CATEGORY_COLORS[item.category] || "border-l-primary bg-primary/5";
  const badgeColor = CATEGORY_BADGES[item.category] || "text-primary bg-primary/10 border-primary/20";

  return (
    <article
      className={`relative border border-border rounded-xl border-l-4 ${borderColor} p-5 md:p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5`}
    >
      {/* Top row: category + date */}
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <span
          className={`inline-block text-[10px] uppercase tracking-wider font-medium px-2.5 py-1 rounded-full border ${badgeColor}`}
        >
          {item.category}
        </span>
        <span className="text-xs text-muted-foreground/60">{item.dateDisplay}</span>
      </div>

      {/* Title */}
      <h3 className="text-lg md:text-xl font-serif text-foreground mb-2 leading-snug">
        {item.title}
      </h3>

      {/* Summary */}
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        {item.summary}
      </p>

      {/* Energetic Impact */}
      <div className="mb-3">
        <h4 className="text-xs uppercase tracking-wider text-muted-foreground/50 font-medium mb-1">
          What You Might Feel
        </h4>
        <p className="text-sm text-muted-foreground/80 leading-relaxed">
          {item.energeticImpact}
        </p>
      </div>

      {/* Suggested Action */}
      <div className="bg-secondary/40 rounded-lg p-3 border border-border/50">
        <h4 className="text-xs uppercase tracking-wider text-primary/60 font-medium mb-1 flex items-center gap-1.5">
          <span className="text-xs">✦</span>
          Ritual Tip
        </h4>
        <p className="text-sm text-foreground/80 leading-relaxed">
          {item.suggestedAction}
        </p>
      </div>
    </article>
  );
}

function ResourceLink({
  href,
  category,
  label,
}: {
  href: string;
  category: string;
  label: string;
}) {
  const badgeColor = CATEGORY_BADGES[category] || "text-primary bg-primary/10 border-primary/20";
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block border border-border rounded-lg p-3 transition-all hover:border-primary/30 hover:bg-secondary/50 hover:shadow-sm"
    >
      <span
        className={`inline-block text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full border mb-2 ${badgeColor}`}
      >
        {category}
      </span>
      <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
        {label}
      </p>
    </a>
  );
}