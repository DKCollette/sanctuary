"use client";

import Link from "next/link";
import { Heart, MessageCircleMore, Eye } from "lucide-react";
import { EXPERIENCE_TYPE_DISPLAY } from "@/lib/dreamshare-constants";

interface DreamCardProps {
  entry: {
    id: string;
    title: string;
    body: string;
    experienceType: string;
    emotions: string[];
    symbols: { emoji: string; label: string }[];
    resonateCount: number;
    reflectionCount: number;
    viewCount: number;
    createdAt: string;
    author: { id: string; displayName: string };
  };
}

export default function DreamShareCard({ entry }: DreamCardProps) {
  const typeInfo = EXPERIENCE_TYPE_DISPLAY[entry.experienceType] || EXPERIENCE_TYPE_DISPLAY.DREAM;
  const bodyPreview = entry.body.replace(/<[^>]*>/g, "").slice(0, 180);

  return (
    <Link href={`/dreamshare/${entry.id}`} className="block group">
      <article className="relative overflow-hidden border border-border/50 rounded-2xl p-5 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-500 bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-sm group">
        {/* Subtle glow on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-gradient-to-br from-primary/[0.03] to-transparent rounded-2xl" />

        {/* Type badge */}
        <div className="flex items-center justify-between mb-3">
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border"
            style={{
              color: typeInfo.color,
              backgroundColor: `${typeInfo.color}12`,
              borderColor: `${typeInfo.color}25`,
            }}
          >
            <span className="text-sm">{typeInfo.icon}</span>
            {typeInfo.label}
          </span>
          <span className="text-[10px] text-muted-foreground/40">{timeAgo(entry.createdAt)}</span>
        </div>

        {/* Title */}
        <h3 className="text-base font-serif font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
          {entry.title}
        </h3>

        {/* Body preview */}
        <p className="text-sm text-muted-foreground/80 line-clamp-3 mb-3 leading-relaxed font-serif italic">
          &ldquo;{bodyPreview}{bodyPreview.length >= 180 ? "..." : ""}&rdquo;
        </p>

        {/* Emotions */}
        {entry.emotions && entry.emotions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {entry.emotions.slice(0, 4).map((emotion) => (
              <span
                key={emotion}
                className="text-[10px] px-2 py-0.5 rounded-full bg-primary/5 text-primary/70 border border-primary/10"
              >
                {getEmotionEmoji(emotion)} {emotion}
              </span>
            ))}
            {entry.emotions.length > 4 && (
              <span className="text-[10px] text-muted-foreground/50">+{entry.emotions.length - 4}</span>
            )}
          </div>
        )}

        {/* Symbols */}
        {entry.symbols && entry.symbols.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {entry.symbols.slice(0, 6).map((sym, i) => (
              <span key={i} className="text-sm" title={sym.label}>
                {sym.emoji}
              </span>
            ))}
            {entry.symbols.length > 6 && (
              <span className="text-[10px] text-muted-foreground/50 self-center">+{entry.symbols.length - 6}</span>
            )}
          </div>
        )}

        {/* Meta row */}
        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground/60 pt-2 border-t border-border/30">
          <span className="text-muted-foreground/70 font-medium text-[11px]">
            {entry.author.displayName}
          </span>
          <span className="flex items-center gap-1" title="Resonated">
            <Heart size={12} className="text-rose-400/70" />
            {entry.resonateCount}
          </span>
          <span className="flex items-center gap-1" title="Reflections">
            <MessageCircleMore size={12} />
            {entry.reflectionCount}
          </span>
          <span className="flex items-center gap-1" title="Views">
            <Eye size={12} className="text-muted-foreground/40" />
            {entry.viewCount}
          </span>
        </div>
      </article>
    </Link>
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