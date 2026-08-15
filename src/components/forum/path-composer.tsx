"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw, Sparkles, Eye, EyeOff, Shield } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { PATH_TOPICS, detectSensitiveContent, generatePathSuggestion } from "@/lib/path-constants";

interface MessageData {
  id: string;
  role: string;
  content: string;
  createdAt: string;
  selected?: boolean;
}

export default function PathComposer({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [body, setBody] = useState("");
  const [reflection, setReflection] = useState("");
  const [visibility, setVisibility] = useState("PUBLIC");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [tags, setTags] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<{ found: boolean; patterns: string[] }>({ found: false, patterns: [] });
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    async function loadMessages() {
      try {
        const res = await fetch(`/api/conversations/${conversationId}/messages`);
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        const msgs = Array.isArray(data) ? data : data.messages || [];
        setMessages(msgs.map((m: any) => ({ ...m, selected: true })));
      } catch {
        toast.error("Could not load conversation");
      } finally {
        setLoading(false);
      }
    }
    loadMessages();
  }, [conversationId]);

  // Generate suggested title from first user message
  useEffect(() => {
    if (!title && messages.length > 0) {
      const firstUser = messages.find((m) => m.role === "user");
      if (firstUser) {
        setTitle(generatePathSuggestion(firstUser.content));
      }
    }
  }, [messages, title]);

  const selectedMessages = messages.filter((m) => m.selected);
  const allText = selectedMessages.map((m) => m.content).join(" ");

  // Run privacy scan when selection changes
  useEffect(() => {
    if (allText) {
      setWarnings(detectSensitiveContent(allText));
    }
  }, [allText]);

  function toggleMessage(id: string) {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, selected: !m.selected } : m))
    );
  }

  function selectAll() {
    setMessages((prev) => prev.map((m) => ({ ...m, selected: true })));
  }

  function selectNone() {
    setMessages((prev) => prev.map((m) => ({ ...m, selected: false })));
  }

  function toggleTopic(topic: string) {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || selectedMessages.length === 0) {
      toast.error("Title and at least one message are required");
      return;
    }

    setSubmitting(true);
    try {
      const selectedIds = selectedMessages.map((m) => m.id);
      const res = await fetch("/api/paths/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          title: title.trim(),
          description: description.trim(),
          body: body.trim() || description.trim() || title,
          selectedMessageIds: selectedIds,
          reflection: reflection.trim(),
          visibility,
          isAnonymous,
          tags: tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean),
          topics: selectedTopics,
        }),
      });

      if (res.ok) {
        const post = await res.json();
        toast.success("Your Path has been shared with the community");
        router.push(`/forum/post/${post.slug}`);
      } else {
        const err = await res.json();
        toast.error(err.error || "Could not publish Path");
      }
    } catch {
      toast.error("Could not publish Path");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-400/30 border-t-indigo-400 animate-spin mx-auto mb-4" />
        <p className="text-sm text-muted-foreground/60">Loading your conversation...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Title */}
      <section>
        <label className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium block mb-2">
          Path Title
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. The Path to Understanding Ego"
          maxLength={200}
          className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
        />
        <p className="text-[10px] text-muted-foreground/40 mt-1">
          Auto-suggested from your conversation
        </p>
      </section>

      {/* Description */}
      <section>
        <label className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium block mb-2">
          What led you here? <span className="text-muted-foreground/40 normal-case">(optional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder='e.g. "I started this conversation because I realized how much of my motivation came from wanting the people I love to be proud of me."'
          rows={2}
          className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/40 resize-y"
        />
      </section>

      {/* Topics */}
      <section>
        <label className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium block mb-2">
          Topics <span className="text-muted-foreground/40 normal-case">(optional)</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {PATH_TOPICS.map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => toggleTopic(topic)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                selectedTopics.includes(topic)
                  ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-400"
                  : "border-border/60 text-muted-foreground/60 hover:text-muted-foreground hover:border-indigo-400/30"
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </section>

      {/* Select Messages */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium">
            Select Messages to Share
          </label>
          <div className="flex gap-2">
            <button type="button" onClick={selectAll} className="text-[10px] text-muted-foreground/40 hover:text-muted-foreground">All</button>
            <button type="button" onClick={selectNone} className="text-[10px] text-muted-foreground/40 hover:text-muted-foreground">None</button>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground/40 mb-3">
          {selectedMessages.length} of {messages.length} messages selected
        </p>
        <div className="space-y-2 max-h-80 overflow-y-auto rounded-xl border border-border/40 p-3 bg-secondary/10">
          {messages.map((msg, idx) => (
            <div
              key={msg.id}
              onClick={() => toggleMessage(msg.id)}
              className={`flex items-start gap-3 p-2.5 rounded-lg cursor-pointer border transition-all ${
                msg.selected
                  ? "border-indigo-400/30 bg-indigo-500/5"
                  : "border-transparent hover:bg-secondary/30 opacity-50"
              }`}
            >
              <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-all text-[10px] ${
                msg.selected ? "bg-indigo-500 border-indigo-500 text-white" : "border-border/60"
              }`}>
                {msg.selected && "✓"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[10px] font-medium ${msg.role === "user" ? "text-foreground/70" : "text-indigo-400/70"}`}>
                    {msg.role === "user" ? "You" : "Guide"}
                  </span>
                  <span className="text-[9px] text-muted-foreground/30">#{idx + 1}</span>
                </div>
                <p className="text-xs text-muted-foreground/70 line-clamp-2 leading-relaxed">
                  {msg.content.slice(0, 200)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy Scan Warning */}
      {warnings.found && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={14} className="text-amber-400" />
            <span className="text-xs font-medium text-amber-400/80">Privacy Notice</span>
          </div>
          <p className="text-xs text-muted-foreground/80 leading-relaxed">
            We found information that may identify you or another person: <strong>{warnings.patterns.join(", ")}</strong>.
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Review these sections before publishing. Consider removing names or identifying details.
          </p>
        </div>
      )}

      {/* Where This Path Left Me */}
      <section className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
        <label className="text-xs uppercase tracking-wider text-emerald-400/70 font-medium block mb-2 flex items-center gap-1.5">
          <span>🪷</span> Where This Path Left Me
        </label>
        <p className="text-[10px] text-muted-foreground/50 mb-2 italic">
          After walking this Path, what do you understand differently?
        </p>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder='e.g. "I realized that wanting people to be proud of me wasnt necessarily wrong. The problem was allowing their approval to determine whether I was proud of myself."'
          rows={3}
          className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/40 resize-y leading-relaxed"
        />
      </section>

      {/* Visibility */}
      <section>
        <label className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium block mb-2">
          Privacy
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { value: "PUBLIC", icon: "🌎", label: "Public" },
            { value: "MEMBERS", icon: "🔐", label: "Sanctuary Members" },
            { value: "PRIVATE", icon: "🔒", label: "Private (unlisted)" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setVisibility(opt.value)}
              className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-full border transition-all ${
                visibility === opt.value
                  ? "bg-primary/15 border-primary/30 text-primary"
                  : "border-border/60 text-muted-foreground/60"
              }`}
            >
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 mt-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="rounded border-border bg-secondary/50 text-primary focus:ring-primary/30"
          />
          <span className="text-xs text-muted-foreground/70">Publish anonymously</span>
        </label>
      </section>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-4 border-t border-border/40">
        <button
          type="submit"
          disabled={submitting || selectedMessages.length === 0 || !title.trim()}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500/20 to-violet-500/20 hover:from-indigo-500/30 hover:to-violet-500/30 text-primary border border-indigo-500/30 transition-all text-sm font-medium disabled:opacity-40"
        >
          {submitting ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : (
            <span className="text-lg">👣</span>
          )}
          {submitting ? "Publishing..." : `Share Your Path (${selectedMessages.length} messages)`}
        </button>
        <Link href="/forum" className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors">
          Cancel
        </Link>
      </div>

      {/* Disclaimer */}
      <div className="border border-indigo-500/10 rounded-xl p-3 bg-indigo-500/[0.02]">
        <p className="text-[10px] text-muted-foreground/40 italic text-center leading-relaxed">
          Your Path is a snapshot of this conversation as it was when shared. 
          AI responses are exploration aids, not spiritual or factual authority.
        </p>
      </div>
    </form>
  );
}