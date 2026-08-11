"use client";

import { useEffect, useState } from "react";
import { Sparkles, Lock, Globe } from "lucide-react";
import { toast } from "sonner";

interface Reflection {
  id: string;
  prompt: string;
  date: string;
  responses: { id: string; content: string; createdAt: string }[];
}

export default function DailyReflection() {
  const [reflection, setReflection] = useState<Reflection | null>(null);
  const [response, setResponse] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showResponses, setShowResponses] = useState(false);

  useEffect(() => {
    fetch("/api/forum/reflections")
      .then((r) => r.json())
      .then((data) => {
        if (data && data.prompt) setReflection(data);
      })
      .catch(() => {});
  }, []);

  if (!reflection) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!response.trim() || !reflection) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/forum/reflections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: response.trim(),
          isPrivate,
          reflectionId: reflection.id,
        }),
      });

      if (res.ok) {
        toast.success(isPrivate ? "Saved to your private journal" : "Shared with the community");
        setResponse("");
      }
    } catch {
      toast.error("Could not save reflection");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="border border-border/60 rounded-xl p-6 bg-gradient-to-br from-amber-500/[0.04] to-transparent">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={16} className="text-amber-400" />
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground/60 font-medium">
          Today&rsquo;s Reflection
        </h3>
      </div>

      <p className="text-lg font-serif italic text-foreground/90 mb-5 leading-relaxed">
        &ldquo;{reflection.prompt}&rdquo;
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Write what arises in this moment..."
          rows={3}
          className="w-full bg-secondary/40 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none transition-all"
        />

        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setIsPrivate(!isPrivate)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${
              isPrivate
                ? "border-muted-foreground/20 text-muted-foreground/60"
                : "border-primary/30 text-primary bg-primary/5"
            }`}
          >
            {isPrivate ? <Lock size={12} /> : <Globe size={12} />}
            {isPrivate ? "Private journal" : "Share publicly"}
          </button>

          <button
            type="submit"
            disabled={!response.trim() || submitting}
            className="text-xs px-4 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-colors disabled:opacity-40"
          >
            {submitting ? "Saving..." : "Reflect"}
          </button>
        </div>
      </form>

      {reflection.responses.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <button
            onClick={() => setShowResponses(!showResponses)}
            className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
          >
            {showResponses ? "Hide" : "Show"} community reflections ({reflection.responses.length})
          </button>

          {showResponses && (
            <div className="mt-3 space-y-2">
              {reflection.responses.map((r) => (
                <p key={r.id} className="text-sm text-muted-foreground/80 italic leading-relaxed border-l-2 border-primary/20 pl-3">
                  &ldquo;{r.content}&rdquo;
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}