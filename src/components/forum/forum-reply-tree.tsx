"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronRight, Reply, Flag } from "lucide-react";
import ReactionBar from "./forum-reactions";

interface ReplyData {
  id: string;
  body: string;
  depth: number;
  createdAt: string;
  isEdited: boolean;
  author: { id: string; displayName: string };
  _count: { reactions: number };
  reactionCounts?: Record<string, number>;
  userReactions?: string[];
  children: ReplyData[];
}

export default function ReplyTree({ replies, postId }: { replies: ReplyData[]; postId: string }) {
  return (
    <div className="space-y-0">
      {replies.map((reply) => (
        <ReplyItem key={reply.id} reply={reply} postId={postId} />
      ))}
    </div>
  );
}

function ReplyItem({ reply, postId }: { reply: ReplyData; postId: string }) {
  const [expanded, setExpanded] = useState(true);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reactionCounts, setReactionCounts] = useState(reply.reactionCounts || {});
  const [userReactions, setUserReactions] = useState(reply.userReactions || []);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const hasChildren = reply.children && reply.children.length > 0;
  const indent = Math.min(reply.depth, 4);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/forum/posts/${postId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: replyText.trim(), parentId: reply.id }),
      });

      if (res.ok) {
        toast.success("Reply added");
        setReplyText("");
        setShowReplyForm(false);
        // Reload page to see new reply
        window.location.reload();
      } else {
        const err = await res.json();
        toast.error(err.error || "Could not reply");
      }
    } catch {
      toast.error("Could not submit reply");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReport(e: React.FormEvent) {
    e.preventDefault();
    if (!reportReason.trim()) return;

    try {
      const res = await fetch(`/api/forum/posts/${postId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reportReason.trim(), replyId: reply.id }),
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

  return (
    <div
      className={`border-l-2 ${indent > 0 ? "border-primary/10" : "border-border/40"} pl-4 ml-${indent > 0 ? (indent - 1) * 4 : 0}`}
    >
      <div className="py-3 animate-fade-in">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-medium text-foreground/80">{reply.author.displayName}</span>
          <span className="text-[10px] text-muted-foreground/50">{timeAgo(reply.createdAt)}</span>
          {reply.isEdited && <span className="text-[10px] text-muted-foreground/30">(edited)</span>}
        </div>

        <p className="text-sm text-foreground/85 leading-relaxed mb-2 whitespace-pre-wrap">{reply.body}</p>

        <div className="flex items-center gap-2">
          <ReactionBar
            postId={postId}
            replyId={reply.id}
            reactionCounts={reactionCounts}
            userReactions={userReactions}
            onReactionChange={(type, added) => {
              setReactionCounts((prev) => ({
                ...prev,
                [type]: (prev[type] || 0) + (added ? 1 : -1),
              }));
              if (added) {
                setUserReactions((prev) => [...prev, type]);
              } else {
                setUserReactions((prev) => prev.filter((r) => r !== type));
              }
            }}
            size="sm"
          />

          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="flex items-center gap-1 text-[10px] text-muted-foreground/40 hover:text-muted-foreground transition-colors"
          >
            <Reply size={12} />
            Reply
          </button>

          <button
            onClick={() => setShowReport(!showReport)}
            className="flex items-center gap-1 text-[10px] text-muted-foreground/30 hover:text-destructive/60 transition-colors"
          >
            <Flag size={10} />
          </button>
        </div>

        {/* Report form */}
        {showReport && (
          <form onSubmit={handleReport} className="mt-2 flex gap-2">
            <input
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Reason for reporting..."
              className="flex-1 bg-secondary/30 border border-border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
            <button type="submit" className="text-[10px] px-2 py-1 rounded bg-destructive/10 text-destructive">Report</button>
          </form>
        )}

        {/* Inline reply form */}
        {showReplyForm && (
          <form onSubmit={handleReply} className="mt-2 flex gap-2">
            <input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Share your perspective..."
              className="flex-1 bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
            <button
              type="submit"
              disabled={!replyText.trim() || submitting}
              className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 disabled:opacity-40"
            >
              {submitting ? "..." : "Reply"}
            </button>
          </form>
        )}

        {/* Children toggle */}
        {hasChildren && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-[10px] text-muted-foreground/40 hover:text-muted-foreground mt-1 transition-colors"
          >
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            {reply.children.length} {reply.children.length === 1 ? "reply" : "replies"}
          </button>
        )}
      </div>

      {hasChildren && expanded && (
        <div className="ml-2">
          {reply.children.map((child) => (
            <ReplyItem key={child.id} reply={child} postId={postId} />
          ))}
        </div>
      )}
    </div>
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