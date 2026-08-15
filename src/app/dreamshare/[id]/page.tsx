"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Heart, MessageCircleMore, Eye, Trash2, Flag, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { EXPERIENCE_TYPE_DISPLAY } from "@/lib/dreamshare-constants";

interface EntryDetail {
  id: string;
  title: string;
  body: string;
  experienceType: string;
  emotions: string[];
  symbols: { emoji: string; label: string }[];
  authorReflection: string | null;
  visibility: string;
  dateLabel: string | null;
  happenedAt: string | null;
  isRecurring: boolean;
  recurringThemeName: string | null;
  resonateCount: number;
  reflectionCount: number;
  viewCount: number;
  createdAt: string;
  author: { id: string; displayName: string; createdAt: string };
  userHasResonated: boolean;
  relates: { id: string; displayName: string }[];
  reflections: any[];
}

export default function DreamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [entry, setEntry] = useState<EntryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [reflectionText, setReflectionText] = useState("");
  const [submittingReflection, setSubmittingReflection] = useState(false);
  const [showAiReflection, setShowAiReflection] = useState(false);
  const [aiReflection, setAiReflection] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/dreamshare/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => setEntry(data))
      .catch(() => router.push("/dreamshare"))
      .finally(() => setLoading(false));
  }, [id, router]);

  async function handleResonate() {
    if (!entry) return;
    try {
      const res = await fetch(`/api/dreamshare/${entry.id}/resonate`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setEntry({
          ...entry,
          userHasResonated: data.resonated,
          resonateCount: entry.resonateCount + (data.resonated ? 1 : -1),
        });
      }
    } catch {
      toast.error("Could not resonate");
    }
  }

  async function handleReflection(e: React.FormEvent) {
    e.preventDefault();
    if (!reflectionText.trim() || !entry) return;
    setSubmittingReflection(true);
    try {
      const res = await fetch(`/api/dreamshare/${entry.id}/reflect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: reflectionText.trim() }),
      });
      if (res.ok) {
        toast.success("Reflection shared");
        setReflectionText("");
        // Reload to see new reflection
        window.location.reload();
      } else {
        const err = await res.json();
        toast.error(err.error || "Could not share reflection");
      }
    } catch {
      toast.error("Could not submit reflection");
    } finally {
      setSubmittingReflection(false);
    }
  }

  async function handleAiReflection() {
    if (!entry) return;
    setAiLoading(true);
    setShowAiReflection(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Please provide a thoughtful AI reflection on this dream/experience for the user who experienced it. Use multiple perspectives (psychological, symbolic, spiritual, personal reflection). Use language like "One way to interpret this is...", "This symbol has been associated with...", "You might reflect on whether..." Do NOT declare absolute meanings. The experience is:\n\nTitle: ${entry.title}\n\nStory: ${entry.body}\n\nEmotions: ${entry.emotions.join(", ")}\n\nSymbols: ${entry.symbols.map(s => `${s.emoji} ${s.label}`).join(", ")}`,
          mode: "deep-reflection",
          isDreamReflection: true,
        }),
      });
      if (res.ok) {
        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response body");
        const decoder = new TextDecoder();
        let content = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split("\n")) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();
              if (!data || data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                if (parsed.token) {
                  content += parsed.token;
                  setAiReflection(content);
                }
              } catch {}
            }
          }
        }
      } else {
        setAiReflection("The AI reflection service is currently unavailable. Please try again later.");
      }
    } catch {
      setAiReflection("Could not connect to the reflection service. Please try again later.");
    } finally {
      setAiLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-3/4 bg-secondary/40 rounded" />
          <div className="h-4 w-1/3 bg-secondary/40 rounded" />
          <div className="h-40 w-full bg-secondary/30 rounded-xl" />
        </div>
      </main>
    );
  }

  if (!entry) return null;

  const typeInfo = EXPERIENCE_TYPE_DISPLAY[entry.experienceType] || EXPERIENCE_TYPE_DISPLAY.DREAM;

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      {/* Back */}
      <Link
        href="/dreamshare"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        Back to DreamShare
      </Link>

      <article className="space-y-8">
        {/* ─── Header ─── */}
        <section className="relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-b from-card/60 to-card/30 p-6 md:p-8">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary/30 via-primary/10 to-transparent" />

          <div className="flex items-center gap-3 mb-4">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border"
              style={{
                color: typeInfo.color,
                backgroundColor: `${typeInfo.color}12`,
                borderColor: `${typeInfo.color}25`,
              }}
            >
              <span className="text-base">{typeInfo.icon}</span>
              {typeInfo.label}
            </span>
            {entry.visibility === "PRIVATE" && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                🔒 Private
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-serif font-medium text-foreground mb-2 leading-tight">
            {entry.title}
          </h1>

          <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground/60">
            <span className="font-medium text-muted-foreground/80">{entry.author.displayName}</span>
            <span>·</span>
            <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
            {entry.dateLabel && (
              <>
                <span>·</span>
                <span className="italic">
                  {entry.dateLabel === "last_night" ? "Last night" : entry.dateLabel === "recently" ? "Recently" : ""}
                </span>
              </>
            )}
            {entry.isRecurring && (
              <>
                <span>·</span>
                <span className="text-primary/70">🔄 Recurring{entry.recurringThemeName ? ` — ${entry.recurringThemeName}` : ""}</span>
              </>
            )}
          </div>
        </section>

        {/* ─── The Experience ─── */}
        <section>
          <div className="text-base leading-relaxed text-foreground/90 whitespace-pre-wrap font-serif italic">
            {entry.body}
          </div>
        </section>

        {/* ─── Emotional Energy ─── */}
        {entry.emotions && entry.emotions.length > 0 && (
          <section>
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground/50 font-medium mb-2 flex items-center gap-2">
              <span>❤️</span> Emotional Energy
            </h3>
            <div className="flex flex-wrap gap-2">
              {entry.emotions.map((emotion) => (
                <span
                  key={emotion}
                  className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary/80 border border-primary/15"
                >
                  {getEmotionEmoji(emotion)} {emotion}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* ─── Symbols ─── */}
        {entry.symbols && entry.symbols.length > 0 && (
          <section>
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground/50 font-medium mb-2 flex items-center gap-2">
              <span>🔮</span> Symbols
            </h3>
            <div className="flex flex-wrap gap-2">
              {entry.symbols.map((sym, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-full bg-secondary/50 text-muted-foreground/80 border border-border/40"
                >
                  {sym.emoji} {sym.label}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* ─── Author's Reflection ─── */}
        {entry.authorReflection && (
          <section className="bg-secondary/20 rounded-xl p-5 border border-border/30">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground/50 font-medium mb-2">
              💭 Author&apos;s Reflection
            </h3>
            <p className="text-sm text-muted-foreground/80 italic leading-relaxed">
              {entry.authorReflection}
            </p>
          </section>
        )}

        {/* ─── Action Bar ─── */}
        <section className="flex items-center gap-3 py-4 border-y border-border/30">
          <button
            onClick={handleResonate}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium border transition-all ${
              entry.userHasResonated
                ? "bg-rose-500/15 border-rose-500/30 text-rose-400"
                : "border-border/50 text-muted-foreground/70 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/5"
            }`}
          >
            <Heart size={14} className={entry.userHasResonated ? "fill-rose-400" : ""} />
            {entry.resonateCount > 0 ? `${entry.resonateCount} Resonated` : "Resonate"}
          </button>
          <span className="flex items-center gap-1 text-xs text-muted-foreground/50">
            <MessageCircleMore size={14} />
            {entry.reflectionCount} {(entry.reflectionCount === 1 ? "Reflection" : "Reflections")}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground/40">
            <Eye size={14} />
            {entry.viewCount} views
          </span>
        </section>

        {/* ─── AI Reflection ─── */}
        <section>
          <button
            onClick={handleAiReflection}
            disabled={aiLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500/10 to-indigo-500/10 hover:from-violet-500/20 hover:to-indigo-500/20 text-primary border border-violet-500/20 hover:border-violet-400/30 transition-all text-sm font-medium"
          >
            <Sparkles size={16} />
            {aiLoading ? "Reflecting..." : "✨ Reflect With Sanctuary"}
          </button>

          {showAiReflection && (
            <div className="mt-4 p-5 rounded-xl bg-gradient-to-br from-indigo-500/5 via-violet-500/5 to-primary/5 border border-violet-500/20">
              <h3 className="text-xs uppercase tracking-wider text-violet-400/70 font-medium mb-3 flex items-center gap-2">
                <Sparkles size={12} />
                Sanctuary Reflection
              </h3>
              {aiLoading ? (
                <div className="space-y-2">
                  <div className="h-3 w-full bg-violet-500/10 rounded animate-pulse" />
                  <div className="h-3 w-5/6 bg-violet-500/10 rounded animate-pulse" />
                  <div className="h-3 w-4/6 bg-violet-500/10 rounded animate-pulse" />
                </div>
              ) : (
                <div className="text-sm text-muted-foreground/90 leading-relaxed whitespace-pre-wrap font-serif">
                  {aiReflection}
                </div>
              )}
            </div>
          )}
        </section>

        {/* ─── Community Reflections ─── */}
        <section>
          <h3 className="text-sm font-serif font-medium text-foreground/80 mb-4 flex items-center gap-2">
            <MessageCircleMore size={16} className="text-primary/60" />
            Reflections
          </h3>

          {/* Reflection form */}
          <form onSubmit={handleReflection} className="mb-6">
            <textarea
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              placeholder="What does this bring to mind for you? Have you experienced something similar?"
              rows={3}
              className="w-full bg-secondary/20 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 placeholder:text-muted-foreground/50 transition-all resize-y leading-relaxed"
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-[10px] text-muted-foreground/40 italic">
                Share your perspective — not as absolute truth, but as one way of seeing.
              </p>
              <button
                type="submit"
                disabled={!reflectionText.trim() || submittingReflection}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submittingReflection ? "Sharing..." : "Share Reflection"}
              </button>
            </div>
          </form>

          {/* Reflection list */}
          {entry.reflections && entry.reflections.length > 0 ? (
            <div className="space-y-4">
              {entry.reflections.map((reflection: any) => (
                <div key={reflection.id} className="border border-border/30 rounded-xl p-4 bg-secondary/10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-foreground/80">{reflection.author.displayName}</span>
                    <span className="text-[10px] text-muted-foreground/40">{timeAgo(reflection.createdAt)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground/80 leading-relaxed">{reflection.body}</p>

                  {/* Nested replies */}
                  {reflection.children && reflection.children.length > 0 && (
                    <div className="mt-3 ml-4 space-y-3 border-l-2 border-border/30 pl-4">
                      {reflection.children.map((child: any) => (
                        <div key={child.id}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-foreground/70">{child.author.displayName}</span>
                            <span className="text-[10px] text-muted-foreground/40">{timeAgo(child.createdAt)}</span>
                          </div>
                          <p className="text-sm text-muted-foreground/70">{child.body}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground/50 text-center py-8 italic">
              No reflections yet. Be the first to share what this experience brings to mind.
            </p>
          )}
        </section>
      </article>
    </main>
  );
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function getEmotionEmoji(emotion: string): string {
  const map: Record<string, string> = {
    Peace: "🕊️", Fear: "😨", Love: "❤️", Confusion: "😕", Awe: "✨",
    Sadness: "😢", Joy: "😊", Curiosity: "🔍", Familiarity: "🫂", Transformation: "🦋",
  };
  return map[emotion] || "💭";
}