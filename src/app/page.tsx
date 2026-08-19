"use client";

import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun, Send, Copy, RotateCcw, ThumbsUp, ThumbsDown, Trash2, Plus, Menu, X, Info, BookOpen, Shield, Sparkles, User, ChevronDown, Compass, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import StateDashboard from "@/components/state-dashboard";
import AssessmentSelector from "@/components/assessment-selector";
import AssessmentFlow from "@/components/assessment-flow";

// Four core pillars
const PILLARS = [
  {
    id: "collettive",
    icon: "☀",
    title: "Collettive",
    tagline: "Collective Consciousness",
    description: "Global spiritual insights, shared wisdom, and the evolving consciousness of the whole.",
    href: "/",
    color: "from-amber-500/10 to-amber-600/5 border-amber-500/20 hover:border-amber-400/30",
    iconColor: "text-amber-400",
  },
  {
    id: "sanctuary",
    icon: "🧭",
    title: "Sanctuary",
    tagline: "Personal Refuge",
    description: "A safe space for personal grounding, private alignment, and your inner journey.",
    href: "/profile",
    color: "from-teal-500/10 to-teal-600/5 border-teal-500/20 hover:border-teal-400/30",
    iconColor: "text-teal-400",
  },
  {
    id: "pulse",
    icon: "✨",
    title: "Pulse",
    tagline: "Cosmic News & Updates",
    description: "Hear the universe — cosmic events, daily mindfulness, faith traditions, and global stories.",
    href: "/pulse",
    color: "from-violet-500/10 to-violet-600/5 border-violet-500/20 hover:border-violet-400/30",
    iconColor: "text-violet-400",
  },
  {
    id: "forum",
    icon: "🌿",
    title: "Forum",
    tagline: "Community & Reflection",
    description: "A place for discussion, reflection, journaling, and growing together.",
    href: "/forum",
    color: "from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 hover:border-emerald-400/30",
    iconColor: "text-emerald-400",
  },
  {
    id: "dreamshare",
    icon: "🌙",
    title: "DreamShare",
    tagline: "Dreams, Visions & Stories",
    description: "Share and explore dreams, visions, spiritual experiences, and meaningful stories.",
    href: "/dreamshare",
    color: "from-violet-500/10 to-indigo-600/5 border-violet-500/20 hover:border-violet-400/30",
    iconColor: "text-violet-400",
  },
];

const MODES = [
  { id: "balanced", label: "Balanced Guidance", description: "Spiritual insight, logic, and practical action" },
  { id: "divine-reflection", label: "Divine Reflection", description: "Surrender, peace, and relationship with God" },
  { id: "christ-centered", label: "Christ-Centered", description: "Compassion, humility, and love" },
  { id: "grounded-clarity", label: "Grounded Clarity", description: "Facts, boundaries, and practical decisions" },
  { id: "deep-reflection", label: "Deep Reflection", description: "Longer analysis of beliefs and patterns" },
  { id: "gentle-guidance", label: "Gentle Guidance", description: "Soft, nurturing support" },
];

interface MessageData {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  feedbackRating?: number;
}

interface ConversationData {
  id: string;
  title: string;
  createdAt: string;
  selectedMode: string;
  messages: MessageData[];
}

function LandingContent({
  onStartAssessment,
  question,
  setQuestion,
  handleSubmit,
  handleKeyDown,
  isStreaming,
  textareaRef,
}: {
  onStartAssessment?: () => void;
  question: string;
  setQuestion: (v: string) => void;
  handleSubmit: (e?: any) => void;
  handleKeyDown: (e: any) => void;
  isStreaming: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  const [prompts, setPrompts] = useState<{ question: string; band: string; scaleLabel: string; scaleRange: string; scaleColor: string }[]>([]);
  const [promptsLoading, setPromptsLoading] = useState(true);
  const [dailyInsight, setDailyInsight] = useState<string | null>(null);
  const [dailyInsightLoading, setDailyInsightLoading] = useState(true);

  // Fetch adaptive prompts on mount
  useEffect(() => {
    async function loadPrompts() {
      try {
        const res = await fetch("/api/prompts");
        if (res.ok) {
          const data = await res.json();
          if (data.prompts?.length === 4) {
            setPrompts(data.prompts);
          }
        }
      } catch {
        // Use empty — the component handles this gracefully
      } finally {
        setPromptsLoading(false);
      }
    }
    loadPrompts();
    loadDailyInsight();
  }, []);

  async function loadDailyInsight() {
    try {
      const res = await fetch("/api/insights/today");
      if (res.ok) {
        const data = await res.json();
        if (data.exists && data.insight) {
          setDailyInsight(data.insight);
        }
      }
    } catch {} finally {
      setDailyInsightLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center px-4 py-12 md:py-16">
      {/* Hero section */}
      <div className="text-center max-w-3xl mx-auto space-y-8 mb-16">
        <div className="space-y-2">
          <h1 className="text-6xl md:text-8xl font-serif font-light tracking-wider text-primary dark:text-primary sacred-glow wings-aura wings-aura-lg">
            Collettive
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-serif italic">
            Ask what is on your heart.
          </p>
        </div>

        <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Many voices, one heartbeat. Welcome to the family of consciousness, for both light and dark.
        </p>

        {/* Adaptive prompts — Hawkins Scale level indicators */}
        {!promptsLoading && prompts.length === 4 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-lg mx-auto">
            {prompts.map((p, i) => (
              <button
                key={i}
                onClick={() => {
                  const input = document.querySelector<HTMLTextAreaElement>('[data-sanctuary-input]');
                  if (input) {
                    input.value = p.question;
                    input.focus();
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                  }
                }}
                className="group relative text-left border border-border rounded-lg px-3.5 py-3 transition-all hover:border-primary/40 hover:bg-secondary/30"
              >
                <p className="text-xs md:text-sm text-muted-foreground group-hover:text-primary transition-colors leading-relaxed">
                  {p.question}
                </p>
                {/* Scale indicator */}
                <div className="flex items-center gap-1.5 mt-2">
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: p.scaleColor }}
                  />
                  <span className="text-[9px] text-muted-foreground/40 font-medium">
                    {p.scaleLabel}
                  </span>
                  <span className="text-[8px] text-muted-foreground/30">
                    {p.scaleRange}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {promptsLoading && (
          <div className="flex items-center justify-center gap-2 py-4">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" />
            <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" style={{ animationDelay: "0.2s" }} />
            <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" style={{ animationDelay: "0.4s" }} />
          </div>
        )}

        {/* Daily Insight — shows if the user has a blueprint */}
        {(!dailyInsightLoading && dailyInsight) && (
          <div className="max-w-lg mx-auto w-full mb-2">
            <div className="border border-primary/20 rounded-xl p-4 bg-gradient-to-br from-primary/5 to-transparent">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-primary" />
                <p className="text-[10px] uppercase tracking-widest text-primary/60 font-medium">Today&rsquo;s Insight</p>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed font-serif italic">
                &ldquo;{dailyInsight}&rdquo;
              </p>
            </div>
          </div>
        )}

        {/* Assessment / Guided Reflection button */}
        {onStartAssessment && (
          <div>
            <button
              onClick={onStartAssessment}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all text-sm font-medium"
            >
              <Compass size={16} />
              Daily Guided Reflection
            </button>
            <p className="text-[10px] text-muted-foreground/40 mt-2">
              An adaptive practice for daily insight, clarity, and self-discovery
            </p>
          </div>
        )}

        {/* Chat input — speak freely */}
        <div className="w-full max-w-lg mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef as React.LegacyRef<HTMLTextAreaElement>}
                data-sanctuary-input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Speak freely. What are you carrying?"
                rows={1}
                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 pr-12 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 placeholder:text-muted-foreground/60 transition-all min-h-[48px] max-h-[160px]"
                style={{ height: "auto" }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = Math.min(el.scrollHeight, 160) + "px";
                }}
              />
            </div>
            <button
              type="submit"
              disabled={!question.trim() || isStreaming}
              className="bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-primary-foreground rounded-xl p-3 transition-all shrink-0"
            >
              <Send size={18} />
            </button>
          </form>
          <p className="text-xs text-muted-foreground/60 text-center mt-3">
            Collettive is an AI reflection guide, not a professional counselor, medical provider, or divine authority.{" "}
            <a href="/privacy" className="underline hover:text-foreground">Privacy</a> ·{" "}
            <a href="/guidance" className="underline hover:text-foreground">About this guide</a>
          </p>
        </div>
      </div>

      {/* Four Pillars */}
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-2">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-medium">
            Explore Collettive
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PILLARS.map((p) => (
            <Link
              key={p.id}
              href={p.href}
              className={`group block border rounded-xl p-4 transition-all duration-300 bg-gradient-to-b ${p.color}`}
            >
              <span className={`text-xl mb-2 block ${p.iconColor}`}>{p.icon}</span>
              <h3 className="text-sm font-serif font-medium text-foreground mb-0.5 group-hover:text-primary transition-colors">
                {p.title}
              </h3>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium mb-1.5">
                {p.tagline}
              </p>
              <p className="text-xs text-muted-foreground/70 leading-relaxed">
                {p.description}
              </p>
            </Link>
          ))}
        </div>

        {/* Secondary links */}
        <div className="flex items-center justify-center flex-wrap gap-x-6 gap-y-2 pt-4">
        <Link href="/principles" className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors">Principles</Link>
        <span className="text-muted-foreground/20">·</span>
        <Link href="/standard" className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors">Standard</Link>
        <span className="text-muted-foreground/20">·</span>
        <Link href="/covenant" className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors">Covenant</Link>
        <span className="text-muted-foreground/20">·</span>
        <Link href="/ledger" className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors">Open Ledger</Link>
        <span className="text-muted-foreground/20">·</span>
        <Link href="/governance" className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors">Governance</Link>
        <span className="text-muted-foreground/20">·</span>
        <Link href="/impact" className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors">Impact</Link>
        <span className="text-muted-foreground/20">·</span>
        <Link href="/guidance" className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors">About the guide</Link>
        <span className="text-muted-foreground/20">·</span>
        <Link href="/about" className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors">About</Link>
        <span className="text-muted-foreground/20">·</span>
        <Link href="/privacy" className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors">Privacy</Link>
        </div>
      </div>
    </div>
  );
}

export default function CollettiveApp() {
  const [question, setQuestion] = useState("");
  const [conversation, setConversation] = useState<ConversationData | null>(null);
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [mode, setMode] = useState("balanced");
  const [history, setHistory] = useState<ConversationData[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [stateData, setStateData] = useState<any>(null);
  const [conversations, setConversations] = useState<{ id: string; title: string }[]>([]);
  const [mounted, setMounted] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessmentTier, setAssessmentTier] = useState<"quick" | "balanced" | "deep" | null>(null);
  const { theme, setTheme } = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setMounted(true);
    loadHistory();
    loadConversations();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages, streamingContent]);

  function getSessionId(): string {
    let id = sessionStorage.getItem("sanctuary-session-id");
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem("sanctuary-session-id", id);
    }
    return id;
  }

  async function loadConversations() {
    try {
      const res = await fetch(`/api/conversations?session=${getSessionId()}`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch {}
  }

  function loadHistory() {
    try {
      const stored = localStorage.getItem("sanctuary-history");
      if (stored) setHistory(JSON.parse(stored));
    } catch {}
  }

  function saveHistory(conv: ConversationData) {
    const updated = history.filter((h) => h.id !== conv.id);
    updated.unshift(conv);
    setHistory(updated.slice(0, 50));
    localStorage.setItem("sanctuary-history", JSON.stringify(updated));
  }

  async function handleSubmit(e?: FormEvent) {
    e?.preventDefault();
    const msg = question.trim();
    if (!msg || isStreaming) return;

    const sessionId = getSessionId();
    const isNew = !conversation;

    try {
      setIsStreaming(true);
      setStreamingContent("");
      const startTime = Date.now();

      // Add user message to conversation
      const userMsg: MessageData = {
        id: crypto.randomUUID(),
        role: "user",
        content: msg,
        createdAt: new Date().toISOString(),
      };

      let conv: ConversationData;
      if (conversation) {
        conv = {
          ...conversation,
          messages: [...conversation.messages, userMsg],
        };
      } else {
        conv = {
          id: crypto.randomUUID(),
          title: msg.slice(0, 60) + (msg.length > 60 ? "..." : ""),
          createdAt: new Date().toISOString(),
          selectedMode: mode,
          messages: [userMsg],
        };
      }
      setConversation(conv);
      setQuestion("");

      // Stream the response
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          conversationId: conversation?.id,
          mode,
          sessionId,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        toast.error(`Error: ${err}`);
        setIsStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");
      const decoder = new TextDecoder();
      let fullContent = "";

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
                fullContent += parsed.token;
                setStreamingContent(fullContent);
              }
              if (parsed.messageId) {
                conv.id = parsed.conversationId;
                // Update with real IDs
              }
              if (parsed.stateData) {
                setStateData(parsed.stateData);
              }
            } catch {}
          }
        }
      }

      // Save the complete response
      const assistantMsg: MessageData = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: fullContent,
        createdAt: new Date().toISOString(),
      };

      const finalConv: ConversationData = {
        ...conv,
        messages: [...conv.messages, assistantMsg],
      };
      setConversation(finalConv);
      setStreamingContent("");
      saveHistory(finalConv);
      loadConversations();
    } catch (err: any) {
      if (err.name !== "AbortError") {
        toast.error("Failed to get response. Please try again.");
      }
    } finally {
      setIsStreaming(false);
    }
  }

  function handleRegenerate() {
    if (!conversation || conversation.messages.length < 2) return;
    const lastUserMsg = [...conversation.messages].reverse().find((m) => m.role === "user");
    if (lastUserMsg) {
      const msgsWithoutLast = conversation.messages.slice(0, -1);
      setConversation({ ...conversation, messages: msgsWithoutLast });
      setQuestion(lastUserMsg.content);
      setTimeout(() => handleSubmit(), 100);
    }
  }

  function handleNewConversation() {
    setConversation(null);
    setStreamingContent("");
    setQuestion("");
    setStateData(null);
  }

  function handleCopy(content: string) {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  }

  async function handleFeedback(messageId: string, rating: "up" | "down") {
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, rating }),
      });
      toast.success(rating === "up" ? "Glad this resonated with you" : "Thank you for the feedback");
    } catch {
      toast.error("Could not submit feedback");
    }
  }

  function handleDeleteConversation(id: string) {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    localStorage.setItem("sanctuary-history", JSON.stringify(updated));
    if (conversation?.id === id) setConversation(null);
    toast.success("Conversation deleted");

    fetch(`/api/conversations?id=${id}`, { method: "DELETE" }).catch(() => {});
  }

  function handleClearAll() {
    setHistory([]);
    localStorage.removeItem("sanctuary-history");
    setConversation(null);
    toast.success("All history cleared");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  // Find the current mode label
  const currentMode = MODES.find((m) => m.id === mode) || MODES[0];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileNav(!showMobileNav)}
              className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground"
            >
              {showMobileNav ? <X size={20} /> : <Menu size={20} />}
            </button>
            <button
              onClick={handleNewConversation}
              className="text-xl font-serif text-primary hover:text-primary/80 transition-colors wings-aura"
            >
              Collettive
            </button>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {/* Service links */}
            <NavLink href="/forum" icon={<span className="text-xs" style={{ color: "#4ade80" }}>🌿</span>} label="Forum" />
            <NavLink href="/pulse" icon={<Sparkles size={14} color="#a78bfa" />} label="Pulse" />
            <NavLink href="/profile" icon={<User size={14} color="#2dd4bf" />} label="Sanctuary" />
            {/* Divider */}
            <span className="w-px h-4 bg-border mx-1.5" />
            {/* Info links */}
            <NavLink href="/about" icon={<Info size={14} color="#60a5fa" />} label="About" />
            <NavLink href="/guidance" icon={<BookOpen size={14} color="#f59e0b" />} label="Guidance" />
            <NavLink href="/privacy" icon={<Shield size={14} color="#94a3b8" />} label="Privacy" />
          </nav>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary"
              aria-label="Toggle theme"
            >
              {mounted ? (theme === "dark" ? <Sun size={18} /> : <Moon size={18} />) : <div className="w-[18px] h-[18px]" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {showMobileNav && (
          <div className="md:hidden border-t border-border/50 bg-background px-4 py-2 space-y-1">
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground/40 font-medium pt-1 pb-1">Services</p>
            <MobileNavLink href="/forum" icon={<span className="text-xs" style={{ color: "#4ade80" }}>🌿</span>} label="Forum" />
            <MobileNavLink href="/pulse" icon={<Sparkles size={14} color="#a78bfa" />} label="Pulse" />
            <MobileNavLink href="/profile" icon={<User size={14} color="#2dd4bf" />} label="Sanctuary" />
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground/40 font-medium pt-3 pb-1">Information</p>
            <MobileNavLink href="/about" icon={<Info size={14} color="#60a5fa" />} label="About" />
            <MobileNavLink href="/guidance" icon={<BookOpen size={14} color="#f59e0b" />} label="Guidance" />
            <MobileNavLink href="/privacy" icon={<Shield size={14} color="#94a3b8" />} label="Privacy" />
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {!conversation && !showAssessment && (
          <LandingContent
            onStartAssessment={() => setShowAssessment(true)}
            question={question}
            setQuestion={setQuestion}
            handleSubmit={handleSubmit}
            handleKeyDown={handleKeyDown}
            isStreaming={isStreaming}
            textareaRef={textareaRef}
          />
        )}

        {!conversation && showAssessment && !assessmentTier && (
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
            <button
              onClick={() => setShowAssessment(false)}
              className="self-start max-w-3xl w-full mx-auto inline-flex items-center gap-1 text-xs text-muted-foreground/50 hover:text-muted-foreground mb-4 transition-colors"
            >
              <ArrowLeft size={14} /> Back
            </button>
            <div className="w-full max-w-4xl">
              <AssessmentSelector onSelect={(tier) => setAssessmentTier(tier)} />
            </div>
          </div>
        )}

        {!conversation && assessmentTier && (
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
            <div className="w-full max-w-2xl">
              <AssessmentFlow
                tier={assessmentTier}
                onBack={() => setAssessmentTier(null)}
              />
            </div>
          </div>
        )}

        {conversation && (
          <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto px-4 py-6">
            <div className="flex-1 space-y-6 overflow-y-auto pb-4">
              {conversation.messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  onCopy={handleCopy}
                  onFeedback={handleFeedback}
                  onRegenerate={handleRegenerate}
                  isLastAssistant={
                    msg.role === "assistant" &&
                    msg === conversation.messages[conversation.messages.length - 1]
                  }
                />
              ))}

              {streamingContent && (
                <div className="flex gap-3 animate-fade-in">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs text-primary font-serif">S</span>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="prose prose-sm dark:prose-invert max-w-none stream-cursor">
                      <ReactMarkdown
                        components={{
                          p: ({ node, ...props }: any) => <p className="text-sm leading-relaxed mb-3 text-foreground" {...props} />,
                          strong: ({ node, ...props }: any) => <strong className="font-semibold text-primary" {...props} />,
                          em: ({ node, ...props }: any) => <em className="italic text-foreground/90" {...props} />,
                          ul: ({ node, ...props }: any) => <ul className="list-disc list-inside space-y-1 mb-3 text-sm text-foreground" {...props} />,
                          hr: () => <hr className="my-4 border-t border-border" />,
                          h3: ({ node, ...props }: any) => <h3 className="text-lg font-semibold text-primary mt-4 mb-2" {...props} />,
                        }}
                      >
                        {streamingContent}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}

              {!isStreaming && stateData && (
                <div className="animate-fade-in">
                  <StateDashboard data={stateData} />
                </div>
              )}

              {isStreaming && !streamingContent && (
                <div className="flex gap-3 animate-fade-in">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs text-primary font-serif">S</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Action bar */}
            <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
              <button onClick={handleNewConversation} className="flex items-center gap-1 hover:text-foreground transition-colors">
                <Plus size={14} /> New
              </button>
              {conversation.messages.filter(m => m.role === "assistant").length > 0 && (
                <button onClick={handleRegenerate} className="flex items-center gap-1 hover:text-foreground transition-colors">
                  <RotateCcw size={14} /> Regenerate
                </button>
              )}
              <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-1 hover:text-foreground transition-colors">
                History ({history.length})
              </button>
            </div>

            {/* History panel */}
            {showHistory && (
              <div className="border border-border rounded-lg bg-card mb-4 max-h-60 overflow-y-auto animate-slide-up">
                <div className="flex items-center justify-between p-3 border-b border-border">
                  <span className="text-sm font-medium">Conversation History</span>
                  <button onClick={handleClearAll} className="text-xs text-destructive hover:text-destructive/80 flex items-center gap-1">
                    <Trash2 size={12} /> Clear All
                  </button>
                </div>
                {history.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground text-center">No conversations saved yet.</p>
                ) : (
                  history.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => setConversation(h)}
                      className="w-full text-left p-3 hover:bg-secondary/50 transition-colors border-b border-border/50 last:border-0 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm truncate">{h.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(h.createdAt).toLocaleDateString()} · {h.messages.length} messages
                        </p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteConversation(h.id); }}
                        className="p-1 text-muted-foreground hover:text-destructive shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {conversation && (
        /* Input area - only shown during chat */
        <div className="border-t border-border/50 bg-background/80 backdrop-blur-md">
          <div className="max-w-3xl mx-auto px-4 py-4">
            {/* Mode selector */}
            <div className="relative mb-3">
              <button
                onClick={() => setShowModeMenu(!showModeMenu)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                {currentMode.label}
                <ChevronDown size={12} />
              </button>
              {showModeMenu && (
                <div className="absolute bottom-full mb-2 left-0 bg-card border border-border rounded-lg shadow-lg p-1 w-64 animate-slide-up z-50">
                  {MODES.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => { setMode(m.id); setShowModeMenu(false); }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        mode === m.id
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className="font-medium">{m.label}</div>
                      <div className="text-xs text-muted-foreground">{m.description}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef as React.LegacyRef<HTMLTextAreaElement>}
                  data-sanctuary-input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Speak freely. What are you carrying?"
                  rows={1}
                  className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 pr-12 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 placeholder:text-muted-foreground/60 transition-all min-h-[48px] max-h-[160px]"
                  style={{ height: "auto" }}
                  onInput={(e) => {
                    const el = e.currentTarget;
                    el.style.height = "auto";
                    el.style.height = Math.min(el.scrollHeight, 160) + "px";
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={!question.trim() || isStreaming}
                className="bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-primary-foreground rounded-xl p-3 transition-all shrink-0"
              >
                <Send size={18} />
              </button>
            </form>

            {/* Disclaimer */}
            <p className="text-xs text-muted-foreground/60 text-center mt-3">
              Collettive is an AI reflection guide, not a professional counselor, medical provider, or divine authority.{" "}
              <a href="/privacy" className="underline hover:text-foreground">Privacy</a> ·{" "}
              <a href="/guidance" className="underline hover:text-foreground">About this guide</a>
            </p>
          </div>
        </div>
        )}
      </main>
    </div>
  );
}

function MessageBubble({
  message,
  onCopy,
  onFeedback,
  onRegenerate,
  isLastAssistant,
}: {
  message: MessageData;
  onCopy: (content: string) => void;
  onFeedback: (id: string, rating: "up" | "down") => void;
  onRegenerate: () => void;
  isLastAssistant: boolean;
}) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 animate-fade-in ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isUser ? "bg-secondary" : "bg-primary/10"
        }`}
      >
        <span className={`text-xs ${isUser ? "text-foreground" : "text-primary"} font-serif`}>
          {isUser ? "Y" : "S"}
        </span>
      </div>
      <div className={`flex-1 space-y-1 ${isUser ? "flex flex-col items-end" : ""}`}>
        <div
          className={`inline-block max-w-[85%] rounded-2xl px-4 py-2.5 ${
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-md"
              : "bg-secondary/70 rounded-tl-md"
          }`}
        >
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
              components={{
                p: ({ node, ...props }: any) => <p className="text-sm leading-relaxed text-foreground" {...props} />,
                strong: ({ node, ...props }: any) => <strong className="font-semibold text-primary" {...props} />,
                em: ({ node, ...props }: any) => <em className="italic text-foreground/90" {...props} />,
                ul: ({ node, ...props }: any) => <ul className="list-disc list-inside space-y-1 text-sm text-foreground" {...props} />,
                hr: () => <hr className="my-3 border-t border-border" />,
                h3: ({ node, ...props }: any) => <h3 className="text-base font-semibold text-primary mt-3 mb-1" {...props} />,
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
        {!isUser && (
          <div className="flex items-center gap-1 px-1">
            <button
              onClick={() => onCopy(message.content)}
              className="p-1 text-muted-foreground/60 hover:text-foreground transition-colors"
              title="Copy"
            >
              <Copy size={12} />
            </button>
            <button
              onClick={() => onFeedback(message.id, "up")}
              className={`p-1 transition-colors ${
                message.feedbackRating === 1
                  ? "text-primary"
                  : "text-muted-foreground/60 hover:text-foreground"
              }`}
              title="Helpful"
            >
              <ThumbsUp size={12} />
            </button>
            <button
              onClick={() => onFeedback(message.id, "down")}
              className={`p-1 transition-colors ${
                message.feedbackRating === -1
                  ? "text-destructive"
                  : "text-muted-foreground/60 hover:text-foreground"
              }`}
              title="Not helpful"
            >
              <ThumbsDown size={12} />
            </button>
            {isLastAssistant && (
              <button
                onClick={onRegenerate}
                className="p-1 text-muted-foreground/60 hover:text-foreground transition-colors"
                title="Regenerate"
              >
                <RotateCcw size={12} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      className="flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
    >
      {icon}
      {label}
    </a>
  );
}

function MobileNavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg transition-colors"
    >
      {icon}
      {label}
    </a>
  );
}