"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const POST_TYPES = [
  { value: "question", icon: "❓", label: "Question" },
  { value: "reflection", icon: "🪞", label: "Reflection" },
  { value: "experience", icon: "🌟", label: "Experience" },
  { value: "teaching", icon: "📿", label: "Teaching" },
  { value: "discussion", icon: "💬", label: "Discussion" },
  { value: "journal", icon: "📓", label: "Journal" },
  { value: "resource", icon: "📚", label: "Resource" },
  { value: "poll", icon: "🗳️", label: "Poll" },
  { value: "would-you-rather", icon: "⚖️", label: "Would You Rather" },
];

function CreatePostForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [postType, setPostType] = useState(searchParams.get("type") || "reflection");
  const [categoryId, setCategoryId] = useState(searchParams.get("category") || "");
  const [tags, setTags] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [realization, setRealization] = useState("");
  const [whatChanged, setWhatChanged] = useState("");
  const [practicingNow, setPracticingNow] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Poll state
  const [pollOptions, setPollOptions] = useState<{ id: string; emoji: string; text: string; description: string }[]>([]);
  const [pollReflectionPrompt, setPollReflectionPrompt] = useState("");
  const [pollAllowChange, setPollAllowChange] = useState(true);
  const isPollType = postType === "poll" || postType === "would-you-rather";

  useEffect(() => {
    fetch("/api/forum/categories")
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim() || !categoryId) {
      toast.error("Title, body, and category are required");
      return;
    }

    setSubmitting(true);
    try {
      const tagList = tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0);

      const res = await fetch("/api/forum/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          postType,
          categoryId,
          tags: tagList,
          isAnonymous,
          realization: realization.trim() || undefined,
          whatChanged: whatChanged.trim() || undefined,
          practicingNow: practicingNow.trim() || undefined,
          pollOptions: isPollType ? pollOptions : undefined,
          pollConfig: isPollType ? {
            allowChangeVote: pollAllowChange,
            reflectionPrompt: pollReflectionPrompt.trim() || undefined,
          } : undefined,
        }),
      });

      if (res.ok) {
        const post = await res.json();
        toast.success("Your reflection has been shared");
        router.push(`/forum/post/${post.slug}`);
      } else {
        const err = await res.json();
        toast.error(err.error || "Could not create post");
      }
    } catch {
      toast.error("Could not create post");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Post Type */}
      <div>
        <label className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium block mb-2">
          What kind of post is this?
        </label>
        <div className="flex flex-wrap gap-2">
          {POST_TYPES.map((pt) => (
            <button
              key={pt.value}
              type="button"
              onClick={() => setPostType(pt.value)}
              className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-full border transition-all ${
                postType === pt.value
                  ? "bg-primary/15 border-primary/30 text-primary"
                  : "border-border/60 text-muted-foreground/70 hover:text-muted-foreground hover:border-primary/30"
              }`}
            >
              <span>{pt.icon}</span>
              {pt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium block mb-2">
          Choose a space
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryId(cat.id)}
              className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-full border transition-all ${
                categoryId === cat.id
                  ? "bg-primary/15 border-primary/30 text-primary"
                  : "border-border/60 text-muted-foreground/70 hover:text-muted-foreground hover:border-primary/30"
              }`}
            >
              <span>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium block mb-1">
          Title
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your reflection a title..."
          maxLength={200}
          className="w-full bg-secondary/30 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Body */}
      <div>
        <label className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium block mb-1">
          Your reflection
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share from your experience. Leave room for others to discover their own truth."
          rows={8}
          className="w-full bg-secondary/30 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
        />
        <span className="text-[10px] text-muted-foreground/40 mt-1 block">{body.length} / 50,000</span>
      </div>

      {/* Growth fields (shown for growth/experience posts) */}
      {(postType === "experience" || postType === "journal" || postType === "reflection") && (
        <div className="border border-border/40 rounded-xl p-4 space-y-3 bg-secondary/20">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium">
            Optional: Structure your growth (these appear as highlights)
          </p>
          <div>
            <label className="text-xs text-muted-foreground/60 block mb-1">What I realized</label>
            <input value={realization} onChange={(e) => setRealization(e.target.value)} placeholder="A key insight or breakthrough..." className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground/60 block mb-1">What changed</label>
            <input value={whatChanged} onChange={(e) => setWhatChanged(e.target.value)} placeholder="How your perspective or behavior shifted..." className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground/60 block mb-1">What I&rsquo;m practicing now</label>
            <input value={practicingNow} onChange={(e) => setPracticingNow(e.target.value)} placeholder="Daily practices or habits you've adopted..." className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30" />
          </div>
        </div>
      )}

      {/* Poll options (shown for poll/would-you-rather posts) */}
      {isPollType && (
        <div className="border border-violet-500/20 rounded-xl p-4 space-y-4 bg-violet-500/5">
          <p className="text-[10px] uppercase tracking-wider text-violet-400/70 font-medium flex items-center gap-1.5">
            <span>🗳️</span> Poll Options
          </p>

          {pollOptions.map((opt, idx) => (
            <div key={opt.id} className="space-y-2 p-3 rounded-lg bg-secondary/20 border border-border/40">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground/50 font-medium uppercase">
                  Option {idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => setPollOptions((prev) => prev.filter((o) => o.id !== opt.id))}
                  className="text-[10px] text-destructive/60 hover:text-destructive"
                >
                  Remove
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  value={opt.emoji}
                  onChange={(e) => setPollOptions((prev) => prev.map((o) => o.id === opt.id ? { ...o, emoji: e.target.value } : o))}
                  placeholder="Emoji"
                  maxLength={2}
                  className="w-14 bg-secondary/40 border border-border rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
                <input
                  value={opt.text}
                  onChange={(e) => setPollOptions((prev) => prev.map((o) => o.id === opt.id ? { ...o, text: e.target.value } : o))}
                  placeholder="Option text"
                  className="flex-1 bg-secondary/40 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
              <input
                value={opt.description}
                onChange={(e) => setPollOptions((prev) => prev.map((o) => o.id === opt.id ? { ...o, description: e.target.value } : o))}
                placeholder="Optional short description"
                className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
          ))}

          <button
            type="button"
            onClick={() => {
              if (pollOptions.length >= 10) return;
              const id = String.fromCharCode(97 + pollOptions.length);
              setPollOptions((prev) => [...prev, { id, emoji: "", text: "", description: "" }]);
            }}
            disabled={pollOptions.length >= 10}
            className="text-xs px-4 py-2 rounded-lg border border-dashed border-violet-500/30 text-violet-400 hover:border-violet-400/50 hover:bg-violet-500/10 transition-all w-full disabled:opacity-40"
          >
            + Add Option ({pollOptions.length}/10)
          </button>

          <div className="space-y-2 pt-2 border-t border-border/30">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={pollAllowChange}
                onChange={(e) => setPollAllowChange(e.target.checked)}
                className="rounded border-border bg-secondary/50 text-primary focus:ring-primary/30"
              />
              <span className="text-xs text-muted-foreground/70">Allow changing votes</span>
            </label>
            <input
              value={pollReflectionPrompt}
              onChange={(e) => setPollReflectionPrompt(e.target.value)}
              placeholder="Optional: Ask voters to reflect on their choice (e.g., 'Why did you choose your answer?')"
              className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>
        </div>
      )}

      {/* Tags */}
      <div>
        <label className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium block mb-1">
          Tags (comma-separated)
        </label>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="e.g., meditation, presence, inner peace"
          className="w-full bg-secondary/30 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Anonymous toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
          className="rounded border-border bg-secondary/50 text-primary focus:ring-primary/30"
        />
        <span className="text-xs text-muted-foreground/70">Post anonymously</span>
      </label>

      {/* Subtle guidance */}
      <div className="border border-primary/10 rounded-xl p-4 bg-primary/[0.03]">
        <p className="text-xs text-muted-foreground/60 italic text-center">
          Share from your experience. Leave room for others to discover their own truth.
        </p>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting || !title.trim() || !body.trim() || !categoryId}
          className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-all disabled:opacity-40"
        >
          {submitting ? "Sharing..." : "Share with Collettive"}
        </button>
        <Link href="/forum" className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors">
          Cancel
        </Link>
      </div>
    </form>
  );
}

export default function CreatePostPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <Link
        href="/forum"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground/50 hover:text-muted-foreground mb-6 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Collettive
      </Link>

      <h1 className="text-2xl font-serif mb-8">Share a Reflection</h1>

      <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
        <CreatePostForm />
      </Suspense>
    </main>
  );
}