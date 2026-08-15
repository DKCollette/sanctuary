"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Sparkles, Moon, TrendingUp, Clock, Heart, MessageCircleMore, Search } from "lucide-react";
import DreamShareCard from "@/components/dreamshare/dreamshare-card";
import { EXPERIENCE_TYPES } from "@/lib/dreamshare-constants";

interface EntryData {
  id: string;
  title: string;
  body: string;
  experienceType: string;
  emotions: string[];
  symbols: { emoji: string; label: string }[];
  resonateCount: number;
  reflectionCount: number;
  viewCount: number;
  createdAt: string;
  author: { id: string; displayName: string };
}

export default function DreamShareHomePage() {
  const [entries, setEntries] = useState<EntryData[]>([]);
  const [featuredEntry, setFeaturedEntry] = useState<EntryData | null>(null);
  const [activeFilter, setActiveFilter] = useState("newest");
  const [activeType, setActiveType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("sort", activeFilter);
    params.set("limit", "20");
    if (activeType) params.set("type", activeType);

    fetch(`/api/dreamshare?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        const list = data?.entries || [];
        setEntries(list);

        // Pick the first featured entry or most resonated
        const featured = list.find((e: EntryData) => e.resonateCount > 0) || list[0] || null;
        setFeaturedEntry(featured);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeFilter, activeType]);

  const filters = [
    { value: "newest", icon: <Clock size={14} />, label: "Newest" },
    { value: "resonated", icon: <Heart size={14} />, label: "Most Resonated" },
    { value: "discussed", icon: <MessageCircleMore size={14} />, label: "Most Discussed" },
  ];

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      {/* ─── Hero ─── */}
      <section className="text-center mb-12 animate-sacred-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Moon size={28} className="text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-light text-primary mb-3 sacred-glow inline-block">
          DreamShare
        </h1>
        <p className="text-base md:text-lg text-muted-foreground font-serif italic max-w-xl mx-auto leading-relaxed">
          Some experiences disappear when we wake. Others stay with us for a reason.
        </p>
        <p className="text-xs text-muted-foreground/50 mt-2 max-w-md mx-auto">
          A place to remember, share, and explore the dreams, visions, and experiences that move us.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <Link
            href="/dreamshare/create"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all text-sm font-medium shadow-lg shadow-primary/20"
          >
            <Plus size={16} />
            Share a Dream
          </Link>
          <Link
            href="/dreamshare/create"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all text-sm font-medium"
          >
            <Sparkles size={16} />
            Share a Vision
          </Link>
          <Link
            href="/dreamshare/create?type=STORY"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-primary/5 hover:bg-primary/15 text-muted-foreground hover:text-primary border border-border/50 transition-all text-sm"
          >
            Share Your Story
          </Link>
          <Link
            href="#explore"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-primary/5 hover:bg-primary/15 text-muted-foreground hover:text-primary border border-border/50 transition-all text-sm"
          >
            Explore DreamShare
          </Link>
        </div>
      </section>

      {/* ─── Featured / Dream of the Day ─── */}
      {featuredEntry && !activeType && (
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={14} className="text-amber-400" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium">
              Featured Experience
            </span>
          </div>
          <Link href={`/dreamshare/${featuredEntry.id}`} className="block relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-transparent to-amber-600/5 p-6 md:p-8 hover:border-amber-400/30 transition-all group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400/40 via-primary/30 to-transparent" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🌙</span>
                <span className="text-[10px] uppercase tracking-wider text-amber-400/70 font-medium">
                  Dream of the Moment
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-serif font-medium text-foreground group-hover:text-primary transition-colors mb-3">
                &ldquo;{featuredEntry.title}&rdquo;
              </h2>
              <p className="text-sm text-muted-foreground/80 line-clamp-3 leading-relaxed font-serif italic max-w-2xl">
                {featuredEntry.body.replace(/<[^>]*>/g, "").slice(0, 280)}...
              </p>
              <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground/60">
                <span>{featuredEntry.author.displayName}</span>
                <span className="flex items-center gap-1">
                  <Heart size={12} className="text-rose-400/70" />
                  {featuredEntry.resonateCount}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircleMore size={12} />
                  {featuredEntry.reflectionCount}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-xs text-primary/70 mt-4 group-hover:gap-2 transition-all">
                Enter This Dream <span className="text-sm">→</span>
              </span>
            </div>
          </Link>
        </section>
      )}

      {/* ─── Search ─── */}
      <section className="mb-8">
        <div className="relative max-w-md mx-auto">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dreams, symbols, or experiences..."
            className="w-full bg-secondary/30 border border-border/60 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 placeholder:text-muted-foreground/50 transition-all"
          />
        </div>
      </section>

      {/* ─── Experience Type Filters ─── */}
      <section className="flex flex-wrap items-center justify-center gap-2 mb-8" id="explore">
        <button
          onClick={() => setActiveType("")}
          className={`text-xs px-3.5 py-1.5 rounded-full border transition-all ${
            !activeType
              ? "bg-primary/15 border-primary/30 text-primary"
              : "border-border/60 text-muted-foreground/70 hover:text-muted-foreground hover:border-primary/30"
          }`}
        >
          All
        </button>
        {EXPERIENCE_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => setActiveType(activeType === type.value ? "" : type.value)}
            className={`flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-full border transition-all ${
              activeType === type.value
                ? "bg-primary/15 border-primary/30 text-primary"
                : "border-border/60 text-muted-foreground/70 hover:text-muted-foreground hover:border-primary/30"
            }`}
          >
            <span>{type.icon}</span>
            {type.label}
          </button>
        ))}
      </section>

      {/* ─── Sort Filters ─── */}
      <section className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all ${
                activeFilter === f.value
                  ? "bg-primary/10 border-primary/20 text-primary"
                  : "border-transparent text-muted-foreground/60 hover:text-muted-foreground"
              }`}
            >
              {f.icon}
              {f.label}
            </button>
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground/40">
          {entries.length} {entries.length === 1 ? "experience" : "experiences"}
        </span>
      </section>

      {/* ─── Dream Cards Grid ─── */}
      <section>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border border-border/50 rounded-2xl p-5 animate-pulse">
                <div className="h-4 w-20 bg-secondary/60 rounded-full mb-3" />
                <div className="h-5 w-3/4 bg-secondary/60 rounded mb-2" />
                <div className="h-4 w-full bg-secondary/40 rounded mb-1" />
                <div className="h-4 w-2/3 bg-secondary/40 rounded mb-3" />
                <div className="flex gap-2 mb-3">
                  <div className="h-5 w-12 bg-secondary/40 rounded-full" />
                  <div className="h-5 w-12 bg-secondary/40 rounded-full" />
                </div>
                <div className="h-3 w-1/2 bg-secondary/40 rounded" />
              </div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">🌙</div>
            <h3 className="text-lg font-serif text-muted-foreground mb-2">No experiences yet</h3>
            <p className="text-sm text-muted-foreground/60 max-w-sm mx-auto mb-6">
              Be the first to share a dream, vision, or story with the community.
            </p>
            <Link
              href="/dreamshare/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all text-sm"
            >
              <Plus size={16} />
              Share Your Experience
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {entries.map((entry) => (
              <DreamShareCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </section>

      {/* ─── Symbol Exploration Section ─── */}
      <section className="mt-16 pt-8 border-t border-border/30">
        <div className="text-center mb-6">
          <h3 className="text-lg font-serif text-foreground/80 mb-1">Explore by Symbol</h3>
          <p className="text-xs text-muted-foreground/60">
            Discover experiences that share common symbols and themes
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { emoji: "🌊", label: "Water" },
            { emoji: "🐍", label: "Snake" },
            { emoji: "🌙", label: "Moon" },
            { emoji: "🔥", label: "Fire" },
            { emoji: "🌳", label: "Forest" },
            { emoji: "✨", label: "Light" },
            { emoji: "🕊️", label: "Bird" },
            { emoji: "🚪", label: "Door" },
          ].map((sym) => (
            <button
              key={sym.label}
              onClick={() => setActiveType("")}
              className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-full border border-border/50 hover:border-primary/30 hover:bg-secondary/30 transition-all text-muted-foreground/70 hover:text-foreground"
              title={`Browse ${sym.label} experiences`}
            >
              {sym.emoji}
              <span className="text-xs">{sym.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ─── Footer ─── */}
      <section className="mt-12 text-center py-6">
        <div className="inline-flex items-center gap-2 text-xs text-muted-foreground/40">
          <Moon size={12} />
          <span>DreamShare is a sanctuary for the experiences that shape us</span>
          <Moon size={12} />
        </div>
      </section>
    </main>
  );
}