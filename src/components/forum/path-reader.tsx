"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Send, ChevronDown, User, Sparkles, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { PATH_MILESTONES } from "@/lib/path-constants";

interface PathMessage {
  id: string;
  role: string;
  content: string;
  createdAt: string;
  milestone: string | null;
}

interface PathData {
  intro: string;
  reflection: string;
  messages: PathMessage[];
  sourceConversationId: string;
  conversationDate: string;
  modelUsed: string;
  topics?: string[];
}

interface PathReaderProps {
  pathData: PathData;
  postId: string;
  postTitle: string;
}

export default function PathReader({ pathData, postId, postTitle }: PathReaderProps) {
  const router = useRouter();
  const [walking, setWalking] = useState(false);
  const [branchingMsgIndex, setBranchingMsgIndex] = useState<number | null>(null);
  const [expandedMilestones, setExpandedMilestones] = useState<Record<number, boolean>>({});

  const milestoneMap = Object.fromEntries(PATH_MILESTONES.map((m) => [m.value, m]));

  const MILESTONE_OPTIONS = PATH_MILESTONES;

  const toggleMilestone = (index: number) => {
    setExpandedMilestones((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  async function handleWalkThisPath(messageIndex?: number) {
    setWalking(true);
    try {
      const res = await fetch(`/api/paths/${postId}/walk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageIndex: messageIndex ?? null }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.alreadyWalking) {
          toast.success("You're already walking this Path");
          router.push(`/?conversation=${data.conversationId}`);
        } else {
          toast.success("Your Path begins...");
          router.push(`/?conversation=${data.conversationId}`);
        }
      } else {
        const err = await res.json();
        toast.error(err.error || "Could not walk this path");
      }
    } catch {
      toast.error("Could not start walking");
    } finally {
      setWalking(false);
      setBranchingMsgIndex(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Path Header */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 via-violet-500/5 to-primary/5 p-6 md:p-8">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-400/40 via-violet-400/30 to-transparent" />

        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">👣</span>
          <span className="text-[10px] uppercase tracking-wider text-indigo-400/70 font-medium">The Path</span>
        </div>

        {pathData.intro && (
          <p className="text-sm text-muted-foreground/80 italic leading-relaxed mb-4 max-w-2xl">
            &ldquo;{pathData.intro}&rdquo;
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground/50">
          <span>{pathData.messages.length} {pathData.messages.length === 1 ? "step" : "steps"}</span>
          <span>·</span>
          <span>{new Date(pathData.conversationDate).toLocaleDateString()}</span>
          <span>·</span>
          <span>via {pathData.modelUsed}</span>
        </div>

        {pathData.topics && pathData.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {pathData.topics.map((topic) => (
              <span key={topic} className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/8 text-indigo-400/70 border border-indigo-500/15">
                {topic}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Walk This Path button */}
      <div className="text-center">
        <button
          onClick={() => handleWalkThisPath()}
          disabled={walking}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-indigo-500/20 to-violet-500/20 hover:from-indigo-500/30 hover:to-violet-500/30 text-primary border border-indigo-500/30 hover:border-indigo-400/40 transition-all text-sm font-medium shadow-lg shadow-indigo-500/10"
        >
          {walking ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : (
            <span className="text-lg">👣</span>
          )}
          {walking ? "Opening your Path..." : "Walk This Path"}
        </button>
        <p className="text-[10px] text-muted-foreground/40 mt-2">
          Begin your own private exploration inspired by this journey
        </p>
      </div>

      {/* Messages as Path Steps */}
      <div className="relative">
        {/* Vertical trail line */}
        <div className="absolute left-[18px] top-8 bottom-8 w-px bg-gradient-to-b from-indigo-500/30 via-violet-500/20 to-transparent pointer-events-none" />

        <div className="space-y-6">
          {pathData.messages.map((msg, index) => {
            const isUser = msg.role === "user";
            const milestone = msg.milestone ? milestoneMap[msg.milestone] : null;

            return (
              <div key={msg.id || index} className="relative flex gap-4">
                {/* Step dot */}
                <div className="relative shrink-0 mt-1">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm border-2 ${
                      isUser
                        ? "bg-secondary/80 border-primary/30 text-primary"
                        : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                    }`}
                  >
                    {isUser ? (
                      <span className="text-xs">👤</span>
                    ) : (
                      <Sparkles size={14} />
                    )}
                  </div>
                </div>

                {/* Message content */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${isUser ? "text-foreground/80" : "text-indigo-400/80"}`}>
                      {isUser ? "You asked" : "Sanctuary Guide"}
                    </span>
                    {milestone && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400/80 border border-amber-500/20">
                        {milestone.icon} {milestone.label}
                      </span>
                    )}
                  </div>

                  <div
                    className={`text-sm leading-relaxed rounded-xl p-4 ${
                      isUser
                        ? "bg-secondary/30 border border-border/40 text-foreground/90"
                        : "bg-indigo-500/5 border border-indigo-500/10 text-foreground/85 font-serif italic"
                    }`}
                  >
                    <ReactMarkdown
                      components={{
                        p: ({ children }: any) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                        strong: ({ children }: any) => <strong className="font-semibold text-primary">{children}</strong>,
                        em: ({ children }: any) => <em className="italic">{children}</em>,
                        ul: ({ children }: any) => <ul className="list-disc list-inside space-y-1 mb-2 text-sm">{children}</ul>,
                        ol: ({ children }: any) => <ol className="list-decimal list-inside space-y-1 mb-2 text-sm">{children}</ol>,
                        blockquote: ({ children }: any) => (
                          <blockquote className="border-l-2 border-primary/30 pl-3 my-2 text-muted-foreground/80 italic">
                            {children}
                          </blockquote>
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>

                  {/* Branch From Here */}
                  <div className="flex items-center gap-2 pl-1">
                    <button
                      onClick={() => handleWalkThisPath(index)}
                      disabled={walking}
                      className="text-[10px] text-muted-foreground/40 hover:text-indigo-400/70 transition-colors flex items-center gap-1"
                    >
                      <span className="text-xs">🌿</span>
                      Branch From Here
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Where This Path Left Me */}
      {pathData.reflection && (
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-transparent p-6 md:p-8 mt-8">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-400/40 via-teal-400/30 to-transparent" />

          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🪷</span>
            <span className="text-xs uppercase tracking-wider text-emerald-400/70 font-medium">
              Where This Path Left Me
            </span>
          </div>

          <p className="text-sm text-foreground/85 leading-relaxed font-serif italic">
            &ldquo;{pathData.reflection}&rdquo;
          </p>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="text-center pt-4 pb-2">
        <div className="inline-flex items-center gap-2 text-xs text-muted-foreground/40">
          <span className="text-xs">👣</span>
          <span>Every question leaves a trail.</span>
          <span className="text-xs">👣</span>
        </div>
      </div>
    </div>
  );
}