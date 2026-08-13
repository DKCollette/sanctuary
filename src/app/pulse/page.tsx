"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

interface NewsItem {
  id: string;
  title: string;
  category: string;
  newsType: string;
  religion: string;
  isActiveNow: boolean;
  dateDisplay: string;
  summary: string;
  source: string;
  url: string;
  eventType: string;
  isRealtimeEvent: boolean;
  energeticImpact: string;
  suggestedAction: string;
  createdAt: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  "Astro / Zodiac Season": "border-l-purple-500 bg-purple-500/5",
  "Cosmic Portals & Transits": "border-l-amber-500 bg-amber-500/5",
  "Lunar Cycles": "border-l-blue-400 bg-blue-400/5",
  "Energetic States & Earth Frequency": "border-l-emerald-500 bg-emerald-500/5",
  "Mindfulness & Universal News": "border-l-rose-400 bg-rose-400/5",
  "Human Interest": "border-l-teal-400 bg-teal-400/5",
  "Global Kindness": "border-l-green-400 bg-green-400/5",
  "Breakthroughs": "border-l-cyan-400 bg-cyan-400/5",
  "Community & Connection": "border-l-sky-400 bg-sky-400/5",
  "Interfaith Wisdom & Universal Spirituality": "border-l-yellow-500 bg-yellow-500/5",
};

const CATEGORY_BADGES: Record<string, string> = {
  "Astro / Zodiac Season": "text-purple-400 bg-purple-500/10 border-purple-500/20",
  "Cosmic Portals & Transits": "text-amber-400 bg-amber-500/10 border-amber-500/20",
  "Lunar Cycles": "text-blue-400 bg-blue-400/10 border-blue-400/20",
  "Energetic States & Earth Frequency": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  "Mindfulness & Universal News": "text-rose-400 bg-rose-500/10 border-rose-500/20",
  "Human Interest": "text-teal-400 bg-teal-400/10 border-teal-400/20",
  "Global Kindness": "text-green-400 bg-green-400/10 border-green-400/20",
  "Breakthroughs": "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  "Community & Connection": "text-sky-400 bg-sky-400/10 border-sky-400/20",
  "Interfaith Wisdom & Universal Spirituality": "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
};

const NEWS_TYPES = [
  { id: "all", label: "All News" },
  { id: "spiritual", label: "Cosmic & Spiritual" },
  { id: "uplifting", label: "Uplifting & Positive" },
  { id: "general", label: "Interfaith & Universal" },
] as const;

const RELIGIONS = [
  { id: "all", label: "All Faiths", icon: "☯" },
  { id: "general", label: "Spiritual (No Religion)", icon: "✨" },
  { id: "interfaith", label: "Interfaith / Universal", icon: "🕊" },
  { id: "christian", label: "Christian", icon: "✝" },
  { id: "islamic", label: "Islamic", icon: "☪" },
  { id: "jewish", label: "Jewish", icon: "✡" },
  { id: "hindu", label: "Hindu", icon: "🕉" },
  { id: "buddhist", label: "Buddhist", icon: "☸" },
] as const;

const STORAGE_KEY = "collettive-faith-preference";

export default function PulsePage() {
  const [feed, setFeed] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeNewsType, setActiveNewsType] = useState("all");
  const [activeReligion, setActiveReligion] = useState("all");
  const [showReligionMenu, setShowReligionMenu] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load feed from API
  useEffect(() => {
    setMounted(true);
    async function load() {
      try {
        const res = await fetch("/api/pulse");
        if (!res.ok) throw new Error("Feed unavailable");
        const data = await res.json();
        setFeed(data.feed || []);
      } catch {
        setError("Could not load the cosmic pulse right now. The stars are still aligning.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Restore faith preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && RELIGIONS.some((r) => r.id === saved)) {
      setActiveReligion(saved);
    }
  }, []);

  // Save faith preference
  const handleReligionChange = (religion: string) => {
    setActiveReligion(religion);
    setShowReligionMenu(false);
    try {
      localStorage.setItem(STORAGE_KEY, religion);
    } catch {}
  };

  // Filtered feed
  const filteredFeed = useMemo(() => {
    return feed.filter((item) => {
      // Filter by news type
      if (activeNewsType !== "all" && item.newsType !== activeNewsType) return false;
      // Filter by religion
      if (activeReligion !== "all" && item.religion !== activeReligion) return false;
      return true;
    });
  }, [feed, activeNewsType, activeReligion]);

  const activeNow = useMemo(() => filteredFeed.filter((i) => i.isActiveNow), [filteredFeed]);
  const upcoming = useMemo(() => filteredFeed.filter((i) => !i.isActiveNow), [filteredFeed]);
  const activeReligionLabel = RELIGIONS.find((r) => r.id === activeReligion);

  if (!mounted) return null;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 sticky top-0 z-40 bg-background/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-xl font-serif text-primary">
            Collettive
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/forum" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-all">🌿 Forum</Link>
            <Link href="/pulse" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary rounded-full">✨ Pulse</Link>
            <Link href="/profile" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-all">🧭 Sanctuary</Link>
            <span className="w-px h-4 bg-border mx-1.5" />
            <Link href="/about" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-all">About</Link>
            <Link href="/guidance" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-all">Guidance</Link>
            <Link href="/privacy" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-all">Privacy</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-10 md:py-14 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Live Feed
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-light tracking-wider text-primary mb-4">
            Cosmic Pulse
          </h1>
          <p className="text-lg text-muted-foreground font-serif italic max-w-xl mx-auto">
            What the universe is whispering right now.
          </p>
        </div>
      </section>

      {/* Filters */}
      <div className="sticky top-14 z-30 border-b border-border/50 bg-background/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-3 space-y-3">
          {/* News Type Tabs */}
          <div className="flex items-center gap-1">
            {NEWS_TYPES.map((nt) => (
              <button
                key={nt.id}
                onClick={() => setActiveNewsType(nt.id)}
                className={`px-3 py-1.5 text-xs rounded-full transition-all font-medium ${
                  activeNewsType === nt.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground/70 hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                {nt.label}
              </button>
            ))}
          </div>

          {/* Religion Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium">Faith:</span>
            {RELIGIONS.slice(0, 4).map((r) => (
              <button
                key={r.id}
                onClick={() => handleReligionChange(r.id)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full transition-all ${
                  activeReligion === r.id
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "text-muted-foreground/60 hover:text-foreground border border-border/50 hover:border-border"
                }`}
              >
                <span>{r.icon}</span>
                {r.label}
              </button>
            ))}
            <div className="relative">
              <button
                onClick={() => setShowReligionMenu(!showReligionMenu)}
                className="px-2.5 py-1 text-xs rounded-full border border-border/50 text-muted-foreground/60 hover:text-foreground transition-all"
              >
                +{RELIGIONS.length - 4} more
              </button>
              {showReligionMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowReligionMenu(false)} />
                  <div className="absolute top-full mt-1 right-0 z-20 bg-card border border-border rounded-lg shadow-lg p-1.5 w-52 animate-slide-up">
                    {RELIGIONS.slice(4).map((r) => (
                      <button
                        key={r.id}
                        onClick={() => handleReligionChange(r.id)}
                        className={`w-full text-left flex items-center gap-2 px-3 py-2 text-xs rounded-md transition-all ${
                          activeReligion === r.id
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                        }`}
                      >
                        <span>{r.icon}</span>
                        {r.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Feed */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">{error}</p>
            <Link href="/" className="text-primary hover:text-primary/80 underline text-sm mt-4 inline-block">Return to Collettive</Link>
          </div>
        )}

        {loading && (
          <div className="text-center py-16">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
              <span className="text-primary font-serif text-lg">✦</span>
            </div>
            <p className="text-muted-foreground">The cosmic feed is generating...</p>
            <p className="text-xs text-muted-foreground/60 mt-2">First load may take a moment</p>
          </div>
        )}

        {!error && !loading && filteredFeed.length === 0 && (
          <div className="text-center py-16 max-w-md mx-auto">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-secondary/50 flex items-center justify-center">
              <span className="text-2xl">🔭</span>
            </div>
            <p className="text-muted-foreground font-medium mb-1">No stories match these filters</p>
            <p className="text-xs text-muted-foreground/60 mb-4">Try a different news type or faith perspective</p>
            <button
              onClick={() => { setActiveNewsType("all"); setActiveReligion("all"); }}
              className="text-xs text-primary hover:text-primary/80 underline"
            >
              Clear all filters
            </button>
          </div>
        )}

        {!error && !loading && filteredFeed.length > 0 && (
          <div className="space-y-6">
            {/* Active Now */}
            {activeNow.length > 0 && (
              <section>
                <h2 className="text-xs uppercase tracking-widest text-primary/70 font-medium mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Active Now
                </h2>
                <div className="space-y-4">
                  {activeNow.map((item) => (
                    <NewsCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming */}
            {upcoming.length > 0 && (
              <section className={activeNow.length > 0 ? "pt-6" : ""}>
                <h2 className="text-xs uppercase tracking-widest text-muted-foreground/60 font-medium mb-4">
                  Upcoming & Seasonal
                </h2>
                <div className="space-y-4">
                  {upcoming.map((item) => (
                    <NewsCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}

            {/* Resources */}
            <section className="pt-12 pb-8 border-t border-border/50">
              <h2 className="text-xs uppercase tracking-widest text-primary/60 font-medium mb-6 text-center">Explore Further</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl mx-auto">
                <ResourceLink href="https://cafeastrology.com" category="Astro / Zodiac Season" label="Current transits, aspects & daily horoscopes" />
                <ResourceLink href="https://www.timeanddate.com/astronomy/" category="Cosmic Portals & Transits" label="Solstices, equinoxes & astronomical events" />
                <ResourceLink href="https://www.moongiant.com/phase/today/" category="Lunar Cycles" label="Today's moon phase & lunar calendar" />
                <ResourceLink href="https://www.spaceweather.com" category="Energetic States & Earth Frequency" label="Solar flares, aurora & space weather" />
                <ResourceLink href="https://www.swpc.noaa.gov" category="Energetic States & Earth Frequency" label="NOAA: Geomagnetic activity & Schumann data" />
                <ResourceLink href="https://www.mindful.org" category="Mindfulness & Universal News" label="Mindfulness practices & conscious living" />
              </div>
              <p className="text-center text-xs text-muted-foreground/40 mt-6">These external resources are independent of Collettive and provided for deeper exploration.</p>
            </section>

            <div className="text-center pt-6 pb-4">
              <p className="text-xs text-muted-foreground/40">Curated by Collettive · Updated throughout the day</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  const borderColor = CATEGORY_COLORS[item.category] || "border-l-primary bg-primary/5";
  const badgeColor = CATEGORY_BADGES[item.category] || "text-primary bg-primary/10 border-primary/20";
  const hasLink = !!item.url;

  const cardContent = (
    <>
      {/* Top row */}
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-block text-[10px] uppercase tracking-wider font-medium px-2.5 py-1 rounded-full border ${badgeColor}`}>
            {item.category}
          </span>
          {/* News type badge */}
          <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${
            item.newsType === "spiritual" ? "text-violet-400 bg-violet-500/10 border-violet-500/20" :
            item.newsType === "uplifting" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
            "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
          }`}>
            {item.newsType}
          </span>
          {/* Religion badge */}
          {item.religion && item.religion !== "general" && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/5 text-primary/60 border border-primary/10">
              {item.religion}
            </span>
          )}
          {/* Event type badge */}
          {item.eventType && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/5 text-blue-400/60 border border-blue-500/10">
              {item.eventType}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {item.source && (
            <span className="text-[9px] text-muted-foreground/40">{item.source}</span>
          )}
          <span className="text-xs text-muted-foreground/60">{item.dateDisplay}</span>
        </div>
      </div>

      <h3 className="text-lg md:text-xl font-serif text-foreground mb-2 leading-snug">{item.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{item.summary}</p>

      {item.energeticImpact && (
        <div className="mb-3">
          <h4 className="text-xs uppercase tracking-wider text-muted-foreground/50 font-medium mb-1">What You Might Feel</h4>
          <p className="text-sm text-muted-foreground/80 leading-relaxed">{item.energeticImpact}</p>
        </div>
      )}

      {item.suggestedAction && (
        <div className="bg-secondary/40 rounded-lg p-3 border border-border/50">
          <h4 className="text-xs uppercase tracking-wider text-primary/60 font-medium mb-1 flex items-center gap-1.5">
            <span className="text-xs">✦</span>
            Ritual Tip
          </h4>
          <p className="text-sm text-foreground/80 leading-relaxed">{item.suggestedAction}</p>
        </div>
      )}

      {hasLink && (
        <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between">
          <span className="text-[10px] text-primary/60 group-hover:text-primary transition-colors">
            Read full article →
          </span>
          <span className="text-[9px] text-muted-foreground/30">Open in new tab</span>
        </div>
      )}
    </>
  );

  if (hasLink) {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`group block relative border border-border rounded-xl border-l-4 ${borderColor} p-5 md:p-6 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 cursor-pointer`}
      >
        {cardContent}
      </a>
    );
  }

  return (
    <article className={`relative border border-border rounded-xl border-l-4 ${borderColor} p-5 md:p-6`}>
      {cardContent}
    </article>
  );
}

function ResourceLink({ href, category, label }: { href: string; category: string; label: string }) {
  const badgeColor = CATEGORY_BADGES[category] || "text-primary bg-primary/10 border-primary/20";
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="group block border border-border rounded-lg p-3 transition-all hover:border-primary/30 hover:bg-secondary/50 hover:shadow-sm">
      <span className={`inline-block text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full border mb-2 ${badgeColor}`}>{category}</span>
      <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">{label}</p>
    </a>
  );
}