"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Heart, TrendingUp } from "lucide-react";
import ForumPostCard from "@/components/forum/forum-post-card";

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
  _count: { replies: number; reactions: number; bookmarks: number };
}

export default function ForumCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [category, setCategory] = useState<CategoryData | null>(null);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [activeFilter, setActiveFilter] = useState("latest");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/forum/categories").then((r) => r.json()),
      fetch(`/api/forum/posts?category=${slug}&sort=${activeFilter}&limit=30`).then((r) => r.json()),
    ])
      .then(([cats, postsData]) => {
        const cat = (Array.isArray(cats) ? cats : []).find((c: any) => c.slug === slug);
        setCategory(cat || null);
        setPosts(postsData?.posts || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug, activeFilter]);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        href="/forum"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground/50 hover:text-muted-foreground mb-6 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to The Sanctuary
      </Link>

      {/* Category header */}
      {category && (
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{category.icon}</span>
            <div>
              <h1 className="text-3xl font-serif font-light text-foreground">{category.name}</h1>
              <p className="text-sm text-muted-foreground/70 mt-1">{category.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-xs text-muted-foreground/50">{category._count.posts} discussions</span>
            <Link
              href={`/forum/create?category=${category.id}`}
              className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all"
            >
              + New Post
            </Link>
          </div>
        </div>
      )}

      {/* Sort filters */}
      <div className="flex items-center gap-1 mb-6 border-b border-border/30 pb-3">
        {[
          { key: "latest", label: "Latest", icon: Clock },
          { key: "resonated", label: "Most Resonated", icon: Heart },
          { key: "replies", label: "Most Discussed", icon: TrendingUp },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full transition-all ${
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

      {/* Posts */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin mx-auto" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border/50 rounded-xl">
          <span className="text-4xl block mb-4">{category?.icon || "🌿"}</span>
          <p className="text-sm text-muted-foreground/60 mb-4">
            No discussions in this space yet.
          </p>
          <Link
            href={`/forum/create?category=${category?.id}`}
            className="text-xs px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all"
          >
            Start the first discussion
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <ForumPostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </main>
  );
}