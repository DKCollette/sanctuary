"use client";

import { useState } from "react";
import { Heart, Lightbulb, Sprout, HandHeart, MessageCircleMore } from "lucide-react";
import { toast } from "sonner";

interface ReactionBarProps {
  postId: string;
  replyId?: string;
  reactionCounts: Record<string, number>;
  userReactions?: string[];
  onReactionChange?: (type: string, added: boolean) => void;
  size?: "sm" | "md";
}

const REACTION_TYPES = [
  { key: "resonates", icon: Heart, label: "Resonates", color: "text-rose-400 hover:text-rose-300" },
  { key: "insightful", icon: Lightbulb, label: "Insightful", color: "text-amber-400 hover:text-amber-300" },
  { key: "growth", icon: Sprout, label: "Growth", color: "text-emerald-400 hover:text-emerald-300" },
  { key: "gratitude", icon: HandHeart, label: "Gratitude", color: "text-sky-400 hover:text-sky-300" },
  { key: "reflecting", icon: MessageCircleMore, label: "Reflecting", color: "text-violet-400 hover:text-violet-300" },
];

export default function ReactionBar({ postId, replyId, reactionCounts, userReactions = [], onReactionChange, size = "md" }: ReactionBarProps) {
  const [loading, setLoading] = useState<string | null>(null);

  async function toggleReaction(type: string) {
    setLoading(type);
    try {
      const url = replyId
        ? `/api/forum/posts/${postId}/reactions`
        : `/api/forum/posts/${postId}/reactions`;

      const body = replyId ? { type, replyId } : { type };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        onReactionChange?.(type, !data.removed);
      }
    } catch {
      toast.error("Could not add reaction");
    } finally {
      setLoading(null);
    }
  }

  const labelSize = size === "sm" ? "text-[10px]" : "text-xs";
  const iconSize = size === "sm" ? 14 : 16;

  return (
    <div className="flex items-center flex-wrap gap-1">
      {REACTION_TYPES.map(({ key, icon: Icon, label, color }) => {
        const isActive = userReactions.includes(key);
        const count = reactionCounts[key] || 0;
        const isLoading = loading === key;

        return (
          <button
            key={key}
            onClick={() => toggleReaction(key)}
            disabled={isLoading}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all ${
              isActive
                ? `${color} bg-secondary/80`
                : "text-muted-foreground/50 hover:text-muted-foreground hover:bg-secondary/50"
            } ${isLoading ? "opacity-50" : ""}`}
            title={label}
          >
            <Icon size={iconSize} className={isActive ? "fill-current" : ""} />
            {count > 0 && <span className={labelSize}>{count}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function ReactionSummary({ reactionCounts, count }: { reactionCounts: Record<string, number>; count: number }) {
  const topType = Object.entries(reactionCounts).sort((a, b) => b[1] - a[1])[0];

  if (!topType) return null;

  const labelMap: Record<string, string> = {
    resonates: "Resonated",
    insightful: "Found insightful",
    growth: "Found growth in",
    gratitude: "Felt gratitude for",
    reflecting: "Is reflecting on",
  };

  return (
    <span className="text-xs text-muted-foreground/60">
      {labelMap[topType[0]] || "Resonated with"} {topType[1]} {topType[1] === 1 ? "person" : "people"}
    </span>
  );
}