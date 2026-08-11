"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, TrendingUp, Clock, Heart, HelpCircle, ArrowRight, Sparkles } from "lucide-react";
import ForumPostCard from "@/components/forum/forum-post-card";
import CommunityPulse from "@/components/forum/community-pulse";
import DailyReflection from "@/components/forum/daily-reflection";

interface CategoryData {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  _count: { posts: number };
}

interface PostData {
  id: string;
  title: string;
  slug: string;
  body: string;
  postType: string;
  tags: string[];
  createdAt: string;
  isAnonymous: boolean;
  author: { id: string; displayName: string };
  category: { slug: string; name: string; icon: string; color: string };
  reactionCounts?: Record<string, number>;
  _count: { replies: number; reactions: number; bookmarks: number };
}

export default function ForumHomePage() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [activeFilter, setActiveFilter] = useState("latest");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/forum/categories").then((r) => r.json()),
      fetch(`/api/forum/posts?sort=${activeFilter}&limit=10`).then((r) => r.json()),
    ])
      .then(([cats, postsData]) => {
        setCategories(Array.isArray(cats) ? cats : []);
        setPosts(postsData?.posts || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeFilter]);

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      {/* Hero */}
      <section className="text-center mb-10 animate-sacred-in">
        <h1 className="text-4xl md:text-5xl font-serif font-light text-primary mb-3 sacred-glow inline-block">
          The Sanctuary
        </h1>
        <p className="text-base md:text-lg text-muted-foreground font-serif italic max-w-xl mx-auto">
          A space to question, reflect, learn, and grow together.
        </p>
        <p className="text-xs text-muted-foreground/50 mt-2">
          Thousands of paths. One shared search for understanding.
        </p>

        <Link
          href="/forum/create"
          className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all text-sm font-medium"
        >
          <Plus size={16} />
          Share a Reflection
        </Link>
      </section>

      {/* Daily Reflection */}
      <section className="mb-10">
        <DailyReflection />
      </section>

      {/* Community Pulse */}
      <section className="mb-10">
        <CommunityPulse />
      </section>

      {/* Continue Your Journey - Categories Grid */}
      <section className="mb-10">
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground/60 font-medium mb-4 flex items-center gap-2">
          <Sparkles size={14} />
          Continue Your Journey
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/forum/${cat.slug}`}
              className="group border border-border/60 rounded-xl p-4 hover:border-primary/20 hover:bg-secondary/30 transition-all duration-300"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{cat.icon}</span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors mb-0.5">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-muted-foreground/70 line-clamp-1">{cat.description}</p>
                  <span className="text-[10px] text-muted-foreground/50 mt-1 block">{cat._count.posts} discussions</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Discussions Feed */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground/60 font-medium">
            {activeFilter === "latest" ? "Newest Discussions" : activeFilter === "resonated" ? "Most Resonated" : "Trending"}
          </h2>
          <div className="flex items-center gap-1">
            {[
              { key: "latest", label: "Latest", icon: Clock },
              { key: "resonated", label: "Resonated", icon: Heart },
              { key: "replies", label: "Trending", icon: TrendingUp },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full transition-all ${
                  activeFilter === key
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground/50 hover:text-muted-foreground"
                }`}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin mx-auto" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border/50 rounded-xl">
              <p className="text-sm text-muted-foreground/60">
                No discussions yet. Be the first to share a reflection.
              </p>
            </div>
          ) : (
            posts.map((post) => <ForumPostCard key={post.id} post={post} />)
          )}
        </div>

        {posts.length > 0 && (
          <div className="text-center mt-6">
            <Link
              href="/forum/search"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground/60 hover:text-primary transition-colors"
            >
              View all discussions <ArrowRight size={12} />
            </Link>
          </div>
        )}
      </section>

      {/* Ask the Sanctuary CTA */}
      <section className="border border-primary/10 rounded-xl p-6 bg-gradient-to-br from-primary/[0.04] to-transparent text-center mb-10">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
          <HelpCircle size={24} className="text-primary" />
        </div>
        <h3 className="text-lg font-serif font-medium mb-1">Have a Question?</h3>
        <p className="text-sm text-muted-foreground/80 mb-4 max-w-md mx-auto">
          Ask the Sanctuary anonymously — questions about life, consciousness, relationships, or your inner world.
        </p>
        <Link
          href="/forum/create?type=question"
          className="text-sm px-5 py-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all inline-flex items-center gap-2"
        >
          Ask a Question
          <ArrowRight size={14} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 pt-8 pb-4 text-center">
        <p className="text-xs text-muted-foreground/40 max-w-lg mx-auto leading-relaxed">
          The Sanctuary is a space for exploration, not dogma. Share from your experience.
          Leave room for others to discover their own truth.
        </p>
        <div className="flex items-center justify-center gap-4 mt-4">
          <Link href="/forum/principles" className="text-[10px] text-muted-foreground/40 hover:text-muted-foreground transition-colors">
            Sanctuary Principles
          </Link>
          <Link href="/privacy" className="text-[10px] text-muted-foreground/40 hover:text-muted-foreground transition-colors">
            Privacy
          </Link>
        </div>
      </footer>
    </main>
  );
}