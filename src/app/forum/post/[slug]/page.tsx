"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bookmark, Bell, Flag, Share2, MoreHorizontal, Trash2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import ReactionBar, { ReactionSummary } from "@/components/forum/forum-reactions";
import ReplyTree from "@/components/forum/forum-reply-tree";

interface PostData {
  id: string;
  title: string;
  slug: string;
  body: string;
  postType: string;
  tags: string[];
  createdAt: string;
  isAnonymous: boolean;
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  realization?: string;
  whatChanged?: string;
  practicingNow?: string;
  author: { id: string; displayName: string; createdAt: string };
  category: { slug: string; name: string; icon: string; color: string };
  reactionCounts: Record<string, number>;
  userReactions: string[];
  isBookmarked: boolean;
  isFollowing: boolean;
  _count: { replies: number; reactions: number; bookmarks: number; followers: number };
  replies: any[];
}

const POST_TYPE_STYLES: Record<string, { icon: string; label: string }> = {
  question: { icon: "❓", label: "Question" },
  reflection: { icon: "🪞", label: "Reflection" },
  experience: { icon: "🌟", label: "Experience" },
  teaching: { icon: "📿", label: "Teaching" },
  discussion: { icon: "💬", label: "Discussion" },
  journal: { icon: "📓", label: "Journal" },
  resource: { icon: "📚", label: "Resource" },
};

export default function PostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");

  useEffect(() => {
    // Look up post by slug directly
    fetch(`/api/forum/posts?slug=${encodeURIComponent(slug)}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => {
        setPost(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim() || !post) return;

    setSubmittingReply(true);
    try {
      const res = await fetch(`/api/forum/posts/${post.id}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: replyText.trim() }),
      });

      if (res.ok) {
        toast.success("Reply posted");
        setReplyText("");
        // Reload to see new reply
        window.location.reload();
      } else {
        const err = await res.json();
        toast.error(err.error || "Could not post reply");
      }
    } catch {
      toast.error("Could not submit reply");
    } finally {
      setSubmittingReply(false);
    }
  }

  async function toggleBookmark() {
    if (!post) return;
    try {
      const res = await fetch(`/api/forum/posts/${post.id}/bookmark`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setPost({ ...post, isBookmarked: data.bookmarked });
        toast.success(data.bookmarked ? "Bookmarked" : "Bookmark removed");
      }
    } catch {
      toast.error("Could not toggle bookmark");
    }
  }

  async function toggleFollow() {
    if (!post) return;
    try {
      const res = await fetch(`/api/forum/posts/${post.id}/follow`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setPost({ ...post, isFollowing: data.following });
        toast.success(data.following ? "Following this discussion" : "Unfollowed");
      }
    } catch {
      toast.error("Could not toggle follow");
    }
  }

  async function handleReport(e: React.FormEvent) {
    e.preventDefault();
    if (!reportReason.trim() || !post) return;
    try {
      const res = await fetch(`/api/forum/posts/${post.id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reportReason.trim() }),
      });
      if (res.ok) {
        toast.success("Report submitted");
        setShowReport(false);
        setReportReason("");
      }
    } catch {
      toast.error("Could not submit report");
    }
  }

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin mx-auto" />
      </main>
    );
  }

  if (!post) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Post not found.</p>
        <Link href="/forum" className="text-primary text-sm mt-2 inline-block hover:underline">
          Return to Collettive
        </Link>
      </main>
    );
  }

  const typeInfo = POST_TYPE_STYLES[post.postType] || POST_TYPE_STYLES.reflection;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        href={`/forum/${post.category.slug}`}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground/50 hover:text-muted-foreground mb-6 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to {post.category.name}
      </Link>

      {/* Post header */}
      <article className="animate-fade-in">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full border"
            style={{ color: post.category.color, borderColor: `${post.category.color}30`, backgroundColor: `${post.category.color}10` }}
          >
            {post.category.icon} {post.category.name}
          </span>
          <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">
            {typeInfo.label}
          </span>
          {post.isPinned && <span className="text-[10px] text-amber-400">📌 Pinned</span>}
        </div>

        <h1 className="text-2xl md:text-3xl font-serif font-medium mb-3 leading-tight">
          {post.title}
        </h1>

        <div className="flex items-center gap-2 text-xs text-muted-foreground/60 mb-6">
          <span className="font-medium text-foreground/70">
            {post.isAnonymous ? "Anonymous" : post.author.displayName}
          </span>
          <span>·</span>
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          <span>·</span>
          <span>{post.viewCount} views</span>
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {post.tags.map((tag) => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/80 text-muted-foreground/70">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
          <ReactMarkdown
            components={{
              p: ({ children }: any) => <p className="text-sm leading-relaxed mb-3 text-foreground/85">{children}</p>,
              strong: ({ children }: any) => <strong className="font-semibold text-primary">{children}</strong>,
              em: ({ children }: any) => <em className="italic text-foreground/90">{children}</em>,
              ul: ({ children }: any) => <ul className="list-disc list-inside space-y-1 mb-3 text-sm text-foreground/85">{children}</ul>,
              a: ({ href, children }: any) => <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>,
            }}
          >
            {post.body}
          </ReactMarkdown>
        </div>

        {/* Growth structure fields */}
        {post.realization && (
          <div className="border-l-2 border-emerald-400/30 pl-4 mb-4 py-2">
            <p className="text-[10px] uppercase tracking-wider text-emerald-400/60 mb-1">What I realized</p>
            <p className="text-sm text-foreground/80">{post.realization}</p>
          </div>
        )}
        {post.whatChanged && (
          <div className="border-l-2 border-blue-400/30 pl-4 mb-4 py-2">
            <p className="text-[10px] uppercase tracking-wider text-blue-400/60 mb-1">What changed</p>
            <p className="text-sm text-foreground/80">{post.whatChanged}</p>
          </div>
        )}
        {post.practicingNow && (
          <div className="border-l-2 border-amber-400/30 pl-4 mb-4 py-2">
            <p className="text-[10px] uppercase tracking-wider text-amber-400/60 mb-1">What I&rsquo;m practicing now</p>
            <p className="text-sm text-foreground/80">{post.practicingNow}</p>
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center flex-wrap gap-3 py-4 border-y border-border/30 mb-6">
          {/* Reactions */}
          <ReactionBar
            postId={post.id}
            reactionCounts={post.reactionCounts}
            userReactions={post.userReactions}
            onReactionChange={(type, added) => {
              setPost((prev) => {
                if (!prev) return prev;
                const counts = { ...prev.reactionCounts };
                counts[type] = (counts[type] || 0) + (added ? 1 : -1);
                const reactions = added
                  ? [...prev.userReactions, type]
                  : prev.userReactions.filter((r) => r !== type);
                return { ...prev, reactionCounts: counts, userReactions: reactions };
              });
            }}
          />

          <div className="w-px h-4 bg-border/50" />

          <button onClick={toggleBookmark} className="flex items-center gap-1 text-xs text-muted-foreground/60 hover:text-foreground transition-colors" title="Bookmark">
            <Bookmark size={14} className={post.isBookmarked ? "fill-primary text-primary" : ""} />
            {post._count.bookmarks > 0 && post._count.bookmarks}
          </button>

          <button onClick={toggleFollow} className="flex items-center gap-1 text-xs text-muted-foreground/60 hover:text-foreground transition-colors" title={post.isFollowing ? "Following" : "Follow"}>
            <Bell size={14} className={post.isFollowing ? "text-primary" : ""} />
          </button>

          <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied"); }} className="flex items-center gap-1 text-xs text-muted-foreground/60 hover:text-foreground transition-colors" title="Share">
            <Share2 size={14} />
          </button>

          <button onClick={() => setShowReport(!showReport)} className="flex items-center gap-1 text-xs text-muted-foreground/40 hover:text-destructive/60 transition-colors" title="Report">
            <Flag size={12} />
          </button>
        </div>

        {/* Report form */}
        {showReport && (
          <form onSubmit={handleReport} className="mb-6 flex gap-2">
            <input
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Reason for reporting..."
              className="flex-1 bg-secondary/40 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
            <button type="submit" className="text-xs px-3 py-2 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">Submit Report</button>
          </form>
        )}

        {/* Reaction summary */}
        <ReactionSummary reactionCounts={post.reactionCounts} count={post._count.reactions} />
      </article>

      {/* Replies Section */}
      <section className="mt-8">
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground/60 font-medium mb-4 flex items-center gap-2">
          <MessageSquare size={14} />
          {post._count.replies} {post._count.replies === 1 ? "Reflection" : "Reflections"}
        </h2>

        {/* Reply form */}
        {!post.isLocked && (
          <form onSubmit={handleReply} className="mb-6">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Share your perspective..."
              rows={3}
              className="w-full bg-secondary/30 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none mb-2"
            />
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground/40 italic">
                Share from your experience. Leave room for others to discover their own truth.
              </span>
              <button
                type="submit"
                disabled={!replyText.trim() || submittingReply}
                className="text-xs px-4 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all disabled:opacity-40"
              >
                {submittingReply ? "Posting..." : "Share Reflection"}
              </button>
            </div>
          </form>
        )}

        {post.isLocked && (
          <p className="text-xs text-muted-foreground/50 italic mb-6 text-center py-4 border border-dashed border-border/50 rounded-lg">
            This discussion is closed for new reflections.
          </p>
        )}

        {/* Replies tree */}
        <ReplyTree replies={post.replies} postId={post.id} />
      </section>
    </main>
  );
}