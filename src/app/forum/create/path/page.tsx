"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, MessageCircle, ChevronRight, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface ConversationSummary {
  id: string;
  title: string;
  createdAt: string;
  selectedMode: string;
}

export default function SharePathPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Get session ID
        const sessionId = sessionStorage.getItem("sanctuary-session-id");
        const url = sessionId ? `/api/conversations?session=${sessionId}` : "/api/conversations";
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setConversations(Array.isArray(data) ? data : []);
        }
      } catch {
        toast.error("Could not load conversations");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <Link
        href="/forum"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground/50 hover:text-muted-foreground mb-6 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Forum
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">👣</span>
        <div>
          <h1 className="text-2xl font-serif font-light">Share a Path</h1>
          <p className="text-sm text-muted-foreground/70 font-serif italic">
            Choose a conversation to share with the community.
          </p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground/50 mb-8 max-w-xl leading-relaxed">
        A Path is a snapshot of your journey with the Sanctuary Guide. 
        You choose which messages to share, add context, and reflect on where it left you.
      </p>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-400/30 border-t-indigo-400 animate-spin mx-auto" />
        </div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border/60 rounded-2xl">
          <div className="text-3xl mb-3">💬</div>
          <h3 className="text-base font-serif text-muted-foreground mb-1">No conversations yet</h3>
          <p className="text-xs text-muted-foreground/50 max-w-xs mx-auto mb-6">
            Have a conversation with the Sanctuary Guide first, then share it as a Path.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all text-sm"
          >
            <MessageCircle size={16} />
            Start a Conversation
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => (
            <Link
              key={conv.id}
              href={`/forum/create/path?conversation=${conv.id}`}
              className="flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:border-indigo-400/30 hover:bg-indigo-500/5 transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                <MessageCircle size={18} className="text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground/80 truncate group-hover:text-indigo-400 transition-colors">
                  {conv.title}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground/50 mt-0.5">
                  <span>{new Date(conv.createdAt).toLocaleDateString()}</span>
                  <span>·</span>
                  <span className="capitalize">{conv.selectedMode?.replace(/-/g, " ")}</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-muted-foreground/30 group-hover:text-indigo-400/60 transition-colors" />
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}