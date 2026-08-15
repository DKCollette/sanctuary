"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Lock, Globe, Users } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { EXPERIENCE_TYPES, EMOTIONS, SYMBOL_LIBRARY, VISIBILITY_OPTIONS } from "@/lib/dreamshare-constants";

export default function DreamShareComposer() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [experienceType, setExperienceType] = useState("DREAM");
  const [visibility, setVisibility] = useState("PUBLIC");
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [selectedSymbols, setSelectedSymbols] = useState<{ emoji: string; label: string }[]>([]);
  const [customSymbol, setCustomSymbol] = useState("");
  const [dateLabel, setDateLabel] = useState("");
  const [customDate, setCustomDate] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringThemeName, setRecurringThemeName] = useState("");
  const [authorReflection, setAuthorReflection] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showCustomDate, setShowCustomDate] = useState(false);

  function toggleEmotion(emotion: string) {
    setSelectedEmotions((prev) =>
      prev.includes(emotion) ? prev.filter((e) => e !== emotion) : [...prev, emotion]
    );
  }

  function toggleSymbol(symbol: { emoji: string; label: string }) {
    setSelectedSymbols((prev) =>
      prev.find((s) => s.label === symbol.label)
        ? prev.filter((s) => s.label !== symbol.label)
        : [...prev, symbol]
    );
  }

  function addCustomSymbol() {
    const trimmed = customSymbol.trim();
    if (!trimmed) return;
    if (selectedSymbols.length >= 20) {
      toast.error("Maximum 20 symbols");
      return;
    }
    toggleSymbol({ emoji: "🔮", label: trimmed });
    setCustomSymbol("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error("Title and story are required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/dreamshare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          experienceType,
          visibility,
          emotions: selectedEmotions,
          symbols: selectedSymbols,
          dateLabel: showCustomDate ? null : dateLabel || null,
          happenedAt: showCustomDate ? customDate || null : null,
          isRecurring,
          recurringThemeName: recurringThemeName.trim() || null,
          authorReflection: authorReflection.trim() || null,
        }),
      });

      if (res.ok) {
        const entry = await res.json();
        toast.success("Your experience has been shared");
        router.push(`/dreamshare/${entry.id}`);
      } else {
        const err = await res.json();
        toast.error(err.error || "Could not share your experience");
      }
    } catch {
      toast.error("Could not share your experience");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Experience Type */}
      <section>
        <label className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium block mb-3">
          What kind of experience are you sharing?
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {EXPERIENCE_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setExperienceType(type.value)}
              className={`text-left p-3.5 rounded-xl border transition-all ${
                experienceType === type.value
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "border-border/60 text-muted-foreground/70 hover:text-muted-foreground hover:border-primary/30 hover:bg-secondary/30"
              }`}
            >
              <span className="text-xl block mb-1">{type.icon}</span>
              <span className="text-sm font-medium block">{type.label}</span>
              <span className="text-[10px] text-muted-foreground/60 mt-0.5 block leading-relaxed">
                {type.description}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Visibility */}
      <section>
        <label className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium block mb-3">
          Who can see this?
        </label>
        <div className="flex flex-wrap gap-2">
          {VISIBILITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setVisibility(opt.value)}
              disabled={opt.value === "LIMITED"}
              className={`flex items-center gap-2 text-xs px-4 py-2.5 rounded-full border transition-all ${
                visibility === opt.value
                  ? "bg-primary/15 border-primary/30 text-primary"
                  : "border-border/60 text-muted-foreground/70 hover:text-muted-foreground hover:border-primary/30 opacity-60"
              } ${opt.value === "LIMITED" ? "cursor-not-allowed opacity-40" : ""}`}
              title={opt.value === "LIMITED" ? "Coming soon" : opt.description}
            >
              <span>{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* Title */}
      <section>
        <label className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium block mb-2">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. The Black Dog That Became Peaceful"
          maxLength={200}
          className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 placeholder:text-muted-foreground/50 transition-all"
        />
      </section>

      {/* Body / Story */}
      <section>
        <label className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium block mb-2">
          What happened?
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Describe your experience in as much detail as you'd like..."
          rows={8}
          maxLength={50000}
          className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 placeholder:text-muted-foreground/50 transition-all resize-y min-h-[200px] leading-relaxed"
        />
      </section>

      {/* Emotions */}
      <section>
        <label className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium block mb-2">
          How did you feel? <span className="text-muted-foreground/40 normal-case font-normal">(optional, select multiple)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {EMOTIONS.map((emotion) => (
            <button
              key={emotion}
              type="button"
              onClick={() => toggleEmotion(emotion)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                selectedEmotions.includes(emotion)
                  ? "bg-primary/15 border-primary/30 text-primary"
                  : "border-border/60 text-muted-foreground/70 hover:text-muted-foreground hover:border-primary/30"
              }`}
            >
              {emotion}
            </button>
          ))}
        </div>
      </section>

      {/* Symbols */}
      <section>
        <label className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium block mb-2">
          What stood out? <span className="text-muted-foreground/40 normal-case font-normal">(optional symbols & elements)</span>
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {SYMBOL_LIBRARY.map((symbol) => {
            const isSelected = selectedSymbols.find((s) => s.label === symbol.label);
            return (
              <button
                key={symbol.label}
                type="button"
                onClick={() => toggleSymbol(symbol)}
                className={`text-sm px-2.5 py-1 rounded-full border transition-all ${
                  isSelected
                    ? "bg-primary/15 border-primary/30"
                    : "border-border/60 hover:border-primary/30 hover:bg-secondary/30"
                }`}
                title={symbol.label}
              >
                {symbol.emoji}
              </button>
            );
          })}
        </div>
        {/* Custom symbol */}
        <div className="flex gap-2">
          <input
            type="text"
            value={customSymbol}
            onChange={(e) => setCustomSymbol(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomSymbol(); } }}
            placeholder="Type a custom symbol..."
            className="flex-1 bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/50"
          />
          <button
            type="button"
            onClick={addCustomSymbol}
            className="text-xs px-3 py-2 rounded-lg border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
          >
            Add
          </button>
        </div>
        {selectedSymbols.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {selectedSymbols.map((sym, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-secondary/50 text-muted-foreground/80"
              >
                {sym.emoji} {sym.label}
                <button
                  type="button"
                  onClick={() => toggleSymbol(sym)}
                  className="ml-0.5 hover:text-foreground"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </section>

      {/* When did it happen */}
      <section>
        <label className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium block mb-2">
          When did this happen? <span className="text-muted-foreground/40 normal-case font-normal">(optional)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {["last_night", "recently"].map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => { setDateLabel(label); setShowCustomDate(false); }}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all capitalize ${
                dateLabel === label && !showCustomDate
                  ? "bg-primary/15 border-primary/30 text-primary"
                  : "border-border/60 text-muted-foreground/70 hover:text-muted-foreground hover:border-primary/30"
              }`}
            >
              {label === "last_night" ? "Last Night" : "Recently"}
            </button>
          ))}
          <button
            type="button"
            onClick={() => { setShowCustomDate(true); setDateLabel(""); }}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
              showCustomDate
                ? "bg-primary/15 border-primary/30 text-primary"
                : "border-border/60 text-muted-foreground/70 hover:text-muted-foreground hover:border-primary/30"
            }`}
          >
            Choose Date
          </button>
        </div>
        {showCustomDate && (
          <input
            type="date"
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            className="mt-2 bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        )}
      </section>

      {/* Recurring */}
      <section>
        <div className="flex items-center gap-3 mb-2">
          <button
            type="button"
            onClick={() => setIsRecurring(!isRecurring)}
            className={`w-5 h-5 rounded border flex items-center justify-center transition-all text-xs ${
              isRecurring ? "bg-primary border-primary text-primary-foreground" : "border-border/60"
            }`}
          >
            {isRecurring && "✓"}
          </button>
          <span className="text-xs text-muted-foreground/80">
            I&apos;ve experienced this dream/theme before
          </span>
        </div>
        {isRecurring && (
          <input
            type="text"
            value={recurringThemeName}
            onChange={(e) => setRecurringThemeName(e.target.value)}
            placeholder="Optional: name for this recurring theme (e.g. 'My Ocean Dream')"
            className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/50"
          />
        )}
      </section>

      {/* Author's Reflection */}
      <section>
        <label className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium block mb-2">
          What do you think this experience meant to you?{" "}
          <span className="text-muted-foreground/40 normal-case font-normal">(optional reflection)</span>
        </label>
        <textarea
          value={authorReflection}
          onChange={(e) => setAuthorReflection(e.target.value)}
          placeholder="Share your own interpretation, feelings, or notes about what this might mean..."
          rows={3}
          className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 placeholder:text-muted-foreground/50 transition-all resize-y leading-relaxed"
        />
      </section>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-4 border-t border-border/40">
        <button
          type="submit"
          disabled={submitting || !title.trim() || !body.trim()}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-primary-foreground transition-all text-sm font-medium"
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sharing...
            </>
          ) : (
            <>
              <Send size={16} />
              Share with {visibility === "PRIVATE" ? "My Journal" : visibility === "PUBLIC" ? "Sanctuary" : "Selected"}
            </>
          )}
        </button>
        <Link
          href="/dreamshare"
          className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}