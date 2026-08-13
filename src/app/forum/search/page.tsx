"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, TrendingUp, HelpCircle, Clock, Heart, ArrowRight } from "lucide-react";
import Link from "next/link";
import ForumPostCard from "@/components/forum/forum-post-card";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<any[]>([]);
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
  const [trending, setTrending] = useState<{ name: string; count: number }[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    // Load trending topics on mount
    fetch("/api/forum/search")
      .then((r) => r.json())
      .then((data) => {
        if (data?.trending) setTrending(data.trending);
      })
      .catch(() => {});

    // Check if there's an initial query
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
      doSearch(q);
    }
  }, []);

  async function doSearch(q: string) {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/forum/search?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      setResults(data?.posts || []);
      setSuggestedTopics(data?.suggestedTopics || []);
      setTotal(data?.total || 0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/forum/search?q=${encodeURIComponent(query.trim())}`);
      doSearch(query);
    }
  }

  const suggestedQuestions = [
    "How do I stop needing other people's approval?",
    "How do I let go of needing validation?",
    "What does surrender actually mean?",
    "How can I become more present?",
    "Why do I keep repeating the same relationship pattern?",
    "How do I forgive someone who hurt me deeply?",
    "What is the spiritual significance of suffering?",
    "How do I quiet my anxious thoughts?",
    "How can I find my purpose?",
    "What happens after death?",
  ];

  return (
    <div>
      {/* Search bar */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the Sanctuary... ask a question, explore a topic"
            className="w-full bg-secondary/30 border border-border rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>
      </form>

      {!searched ? (
        <>
          {/* Trending Topics */}
          {trending.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xs uppercase tracking-widest text-muted-foreground/60 font-medium mb-3 flex items-center gap-2">
                <TrendingUp size={14} />
                Trending in Collettive
              </h2>
              <div className="flex flex-wrap gap-2">
                {trending.map((topic, i) => (
                  <button
                    key={i}
                    onClick={() => { setQuery(topic.name); doSearch(topic.name); }}
                    className="text-xs px-3 py-1.5 rounded-full bg-secondary/60 text-muted-foreground/70 hover:text-foreground hover:bg-secondary border border-border/50 transition-all"
                  >
                    {topic.name}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Suggested questions */}
          <section>
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground/60 font-medium mb-3 flex items-center gap-2">
              <HelpCircle size={14} />
              Ask the Sanctuary
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestedQuestions.map((question, i) => (
                <button
                  key={i}
                  onClick={() => { setQuery(question); doSearch(question); }}
                  className="text-left text-xs text-muted-foreground/70 hover:text-foreground border border-border/50 rounded-lg px-3 py-2.5 hover:border-primary/20 hover:bg-secondary/30 transition-all"
                >
                  &ldquo;{question}&rdquo;
                </button>
              ))}
            </div>
          </section>
        </>
      ) : (
        <>
          {/* Search results */}
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin mx-auto" />
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground/50 mb-4">
                {total} {total === 1 ? "result" : "results"} found
              </p>

              {/* Suggested topics */}
              {suggestedTopics.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider mb-2">Explore related topics:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedTopics.map((topic) => (
                      <button
                        key={topic}
                        onClick={() => { setQuery(topic); doSearch(topic); }}
                        className="text-[10px] px-2.5 py-1 rounded-full bg-primary/5 text-primary/70 border border-primary/10 hover:bg-primary/10 transition-all"
                      >
                        #{topic}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-border/50 rounded-xl">
                  <p className="text-sm text-muted-foreground/60 mb-1">No discussions found for &ldquo;{query}&rdquo;</p>
                  <p className="text-xs text-muted-foreground/50">Try a different search term or browse the categories.</p>
                  <Link
                    href="/forum/create?type=question"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-4"
                  >
                    Ask this as a new question <ArrowRight size={12} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {results.map((post: any) => (
                    <ForumPostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <Link
        href="/forum"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground/50 hover:text-muted-foreground mb-6 transition-colors"
      >
        <ArrowRight size={14} className="rotate-180" />
        Back to Collettive
      </Link>

      <h1 className="text-2xl font-serif mb-2">Discover</h1>
      <p className="text-sm text-muted-foreground/60 mb-8">
        Search discussions, explore topics, or ask a question.
      </p>

      <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
        <SearchContent />
      </Suspense>
    </main>
  );
}