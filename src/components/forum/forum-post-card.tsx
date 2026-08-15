"use client";

import Link from "next/link";
import { Heart, Lightbulb, Sprout, HandHeart, MessageCircleMore, Bookmark, Eye, MessageSquare } from "lucide-react";

interface PostCardProps {
  post: {
    id: string;
    title: string;
    slug: string;
    body: string;
    postType: string;
    tags: string[];
    createdAt: string;
    isAnonymous: boolean;
    author: { id: string; displayName: string };
    category: { slug: string; name: string; icon: string; color: string };
    reactionCounts?: Record<string, number>;
    _count: { replies: number; reactions: number; bookmarks: number };
    pollOptions?: { id: string; emoji?: string; text: string }[] | null;
    pollConfig?: { isClosed?: boolean } | null;
    pollVoteCount?: number;
  };
}

const POST_TYPE_STYLES: Record<string, { icon: string; label: string }> = {
  question: { icon: "❓", label: "Question" },
  reflection: { icon: "🪞", label: "Reflection" },
  experience: { icon: "🌟", label: "Experience" },
  teaching: { icon: "📿", label: "Teaching" },
  discussion: { icon: "💬", label: "Discussion" },
  journal: { icon: "📓", label: "Journal" },
  resource: { icon: "📚", label: "Resource" },
  poll: { icon: "🗳️", label: "Poll" },
  "would-you-rather": { icon: "⚖️", label: "Would You Rather" },
};

export default function ForumPostCard({ post }: PostCardProps) {
  const typeInfo = POST_TYPE_STYLES[post.postType] || POST_TYPE_STYLES.reflection;
  const totalReactions = Object.values(post.reactionCounts || {}).reduce((a, b) => a + b, 0);
  const totalReactionCount = totalReactions || post._count.reactions;

  return (
    <Link href={`/forum/post/${post.slug}`} className="block group">
      <article className="border border-border/60 rounded-xl p-5 hover:border-primary/20 hover:bg-secondary/30 transition-all duration-300 animate-fade-in">
        <div className="flex items-start gap-3">
          {/* Post type badge */}
          <span className="text-lg shrink-0 mt-0.5" title={typeInfo.label}>
            {typeInfo.icon}
          </span>

          <div className="flex-1 min-w-0">
            {/* Category & Type row */}
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full"
                style={{ color: post.category.color, backgroundColor: `${post.category.color}15`, borderColor: `${post.category.color}30` }}
              >
                {post.category.icon} {post.category.name}
              </span>
              <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">
                {typeInfo.label}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-base font-serif font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
              {post.title}
            </h3>

            {/* Body preview */}
            <p className="text-sm text-muted-foreground/80 line-clamp-2 mb-3 leading-relaxed">
              {post.body.replace(/<[^>]*>/g, "").slice(0, 200)}
            </p>

            {/* Poll preview */}
            {post.pollOptions && post.pollOptions.length > 0 && (
              <div className="mb-3 p-2.5 rounded-lg bg-violet-500/5 border border-violet-500/15">
                <div className="flex flex-wrap gap-2">
                  {post.pollOptions.slice(0, 2).map((opt) => (
                    <span key={opt.id} className="flex items-center gap-1 text-[11px] text-muted-foreground/70">
                      {opt.emoji && <span>{opt.emoji}</span>}
                      <span className="line-clamp-1">{opt.text}</span>
                    </span>
                  ))}
                </div>
                {post.pollVoteCount !== undefined && (
                  <span className="text-[10px] text-muted-foreground/40 mt-1 block">
                    {post.pollVoteCount} {post.pollVoteCount === 1 ? "vote" : "votes"}
                    {post.pollConfig?.isClosed ? " · Closed" : ""}
                  </span>
                )}
              </div>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {post.tags.slice(0, 5).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/80 text-muted-foreground/70"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Meta row */}
            <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground/60">
              <span className="flex items-center gap-1">
                {post.isAnonymous ? "Anonymous" : post.author.displayName}
              </span>
              <span>·</span>
              <span>{timeAgo(post.createdAt)}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <MessageSquare size={12} />
                {post._count.replies}
              </span>
              <span className="flex items-center gap-1">
                <Heart size={12} />
                {totalReactionCount}
              </span>
              {post._count.bookmarks > 0 && (
                <span className="flex items-center gap-1">
                  <Bookmark size={12} />
                  {post._count.bookmarks}
                </span>
              )}
            </div>
          </div>
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