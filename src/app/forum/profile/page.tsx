"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, User, Clock, BookOpen, Bookmark, Heart, MessageSquare, Sparkles, Plus } from "lucide-react";
import ForumPostCard from "@/components/forum/forum-post-card";

interface ProfileData {
  user: {
    id: string;
    displayName: string;
    createdAt: string;
    currentStage: string;
  };
  posts: any[];
  bookmarks: { id: string; title: string; slug: string; createdAt: string }[];
  replies: { id: string; body: string; post: { id: string; title: string; slug: string }; createdAt: string }[];
  recognitions: { badge: string; reason: string | null; awardedBy: { displayName: string } | null }[];
  exploring: string[];
}

const BADGE_LABELS: Record<string, string> = {
  helpful_contributor: "Helpful Contributor",
  thoughtful_listener: "Thoughtful Listener",
  community_guide: "Community Guide",
  frequent_reflector: "Frequent Reflector",
};

const BADGE_ICONS: Record<string, string> = {
  helpful_contributor: "🌟",
  thoughtful_listener: "🫂",
  community_guide: "🧭",
  frequent_reflector: "🪞",
};

export default function ForumProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState<"posts" | "bookmarks" | "replies">("posts");
  const [exploringInput, setExploringInput] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await fetch("/api/forum/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setExploringInput(data.exploring?.join(", ") || "");
      }
    } catch {
      // Not logged in
    } finally {
      setLoading(false);
    }
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, passcode }),
      });

      if (!res.ok) {
        const err = await res.json();
        setAuthError(err.error || "Authentication failed");
        return;
      }

      setDisplayName("");
      setPasscode("");
      setShowAuthForm(false);
      await fetchProfile();
    } catch {
      setAuthError("Connection error");
    }
  }

  async function saveExploring() {
    const topics = exploringInput.split(",").map((t) => t.trim()).filter(Boolean);
    try {
      await fetch("/api/forum/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exploring: topics }),
      });
    } catch {}
  }

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin mx-auto" />
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/forum" className="inline-flex items-center gap-1 text-xs text-muted-foreground/50 hover:text-muted-foreground mb-6 transition-colors">
          <ArrowLeft size={14} /> Back to The Sanctuary
        </Link>

        {!showAuthForm ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <User size={28} className="text-primary" />
            </div>
            <h1 className="text-2xl font-serif mb-2">Your Sanctuary Profile</h1>
            <p className="text-sm text-muted-foreground/70 mb-6 max-w-md mx-auto">
              Sign in to create your profile, track your contributions, and save reflections.
            </p>
            <button
              onClick={() => setShowAuthForm(true)}
              className="px-5 py-2 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm transition-all"
            >
              Sign In
            </button>
            <p className="text-xs text-muted-foreground/50 mt-4">
              <Link href="/profile" className="hover:underline">Go to main Sanctuary profile</Link>
            </p>
          </div>
        ) : (
          <div className="max-w-md mx-auto mt-8">
            <div className="text-center mb-6">
              <h1 className="text-xl font-serif mb-1">{isLogin ? "Welcome Back" : "Create Your Profile"}</h1>
              <p className="text-xs text-muted-foreground/60">
                {isLogin ? "Sign in to your Sanctuary account" : "Join the community"}
              </p>
            </div>
            <form onSubmit={handleAuth} className="space-y-4">
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Display Name" className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" required minLength={2} />
              <input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} placeholder="Passcode" className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" required minLength={4} />
              {authError && <p className="text-xs text-destructive">{authError}</p>}
              <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-medium transition-colors">
                {isLogin ? "Sign In" : "Create Profile"}
              </button>
              <p className="text-xs text-muted-foreground text-center">
                {isLogin ? "New here? " : "Already have an account? "}
                <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline">
                  {isLogin ? "Create one" : "Sign in"}
                </button>
              </p>
            </form>
          </div>
        )}
      </main>
    );
  }

  const safePosts = Array.isArray(profile.posts) ? profile.posts : [];
  const safeBookmarks = Array.isArray(profile.bookmarks) ? profile.bookmarks : [];
  const safeReplies = Array.isArray(profile.replies) ? profile.replies : [];
  const safeRecognitions = Array.isArray(profile.recognitions) ? profile.recognitions : [];
  const safeExploring = Array.isArray(profile.exploring) ? profile.exploring : [];

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/forum" className="inline-flex items-center gap-1 text-xs text-muted-foreground/50 hover:text-muted-foreground mb-6 transition-colors">
        <ArrowLeft size={14} /> Back to The Sanctuary
      </Link>

      {/* Profile header */}
      <div className="border border-border/60 rounded-xl p-6 mb-6 animate-fade-in">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0">
            <User size={24} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-serif mb-0.5">{profile.user.displayName}</h1>
            <p className="text-xs text-muted-foreground/60">
              Member since {new Date(profile.user.createdAt).toLocaleDateString()}
            </p>
            <span className="inline-block text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full border border-primary/20 bg-primary/5 text-primary/70 mt-1">
              {profile.user.currentStage}
            </span>
          </div>
        </div>

        {/* Badges/Recognition */}
        {safeRecognitions.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/30">
            <div className="flex flex-wrap gap-2">
              {safeRecognitions.map((rec, i) => (
                <span key={i} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-secondary/80 text-muted-foreground border border-border/40">
                  {BADGE_ICONS[rec.badge] || "🏅"} {BADGE_LABELS[rec.badge] || rec.badge}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Currently Exploring */}
        <div className="mt-4 pt-4 border-t border-border/30">
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium block mb-1">
            Currently Exploring
          </label>
          <div className="flex gap-2">
            <input
              value={exploringInput}
              onChange={(e) => setExploringInput(e.target.value)}
              placeholder="e.g., Presence, Meditation, Non-duality"
              className="flex-1 bg-secondary/30 border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
            <button onClick={saveExploring} className="text-[10px] px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all">
              Save
            </button>
          </div>
          {safeExploring.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {safeExploring.map((topic, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/50 text-muted-foreground/70">
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Posts", value: safePosts.length, icon: MessageSquare },
          { label: "Bookmarks", value: safeBookmarks.length, icon: Bookmark },
          { label: "Reflections", value: safeReplies.length, icon: Heart },
        ].map((stat, i) => (
          <div key={i} className="border border-border/40 rounded-lg p-3 text-center">
            <stat.icon size={16} className="mx-auto mb-1 text-muted-foreground/50" />
            <p className="text-lg font-serif font-medium">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 border-b border-border/30 pb-2">
        {[
          { key: "posts" as const, label: "My Reflections", icon: MessageSquare },
          { key: "bookmarks" as const, label: "Saved", icon: Bookmark },
          { key: "replies" as const, label: "Replies", icon: Heart },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all ${
              activeTab === tab.key
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground/50 hover:text-muted-foreground"
            }`}
          >
            <tab.icon size={12} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "posts" && (
        safePosts.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border/50 rounded-xl">
            <p className="text-sm text-muted-foreground/60">No reflections yet.</p>
            <Link href="/forum/create" className="text-xs text-primary hover:underline mt-2 inline-block">
              Share your first reflection
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {safePosts.map((post: any) => (
              <ForumPostCard key={post.id} post={post} />
            ))}
          </div>
        )
      )}

      {activeTab === "bookmarks" && (
        safeBookmarks.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border/50 rounded-xl">
            <p className="text-sm text-muted-foreground/60">No saved reflections.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {safeBookmarks.map((bookmark) => (
              <Link
                key={bookmark.id}
                href={`/forum/post/${bookmark.slug}`}
                className="block border border-border/50 rounded-lg p-3 hover:bg-secondary/30 transition-all"
              >
                <p className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">{bookmark.title}</p>
                <p className="text-[10px] text-muted-foreground/50 mt-0.5">{new Date(bookmark.createdAt).toLocaleDateString()}</p>
              </Link>
            ))}
          </div>
        )
      )}

      {activeTab === "replies" && (
        safeReplies.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border/50 rounded-xl">
            <p className="text-sm text-muted-foreground/60">No replies yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {safeReplies.map((reply) => (
              <Link
                key={reply.id}
                href={`/forum/post/${reply.post.slug}`}
                className="block border border-border/50 rounded-lg p-3 hover:bg-secondary/30 transition-all"
              >
                <p className="text-sm text-muted-foreground/80 line-clamp-2">{reply.body}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-muted-foreground/50">in {reply.post.title}</span>
                  <span className="text-[10px] text-muted-foreground/30">·</span>
                  <span className="text-[10px] text-muted-foreground/50">{new Date(reply.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )
      )}
    </main>
  );
}