"use client";

import { Suspense, use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PathComposer from "@/components/forum/path-composer";

export default function PathComposerPage({ params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = use(params);

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <Link
        href="/forum/create/path"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/50 hover:text-muted-foreground mb-6 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to conversations
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">👣</span>
        <div>
          <h1 className="text-2xl font-serif font-light">Share Your Path</h1>
          <p className="text-sm text-muted-foreground/70 font-serif italic">
            Choose what to share, add your reflection, and publish.
          </p>
        </div>
      </div>

      <Suspense fallback={<div className="text-center py-12"><div className="w-8 h-8 rounded-full border-2 border-indigo-400/30 border-t-indigo-400 animate-spin mx-auto" /></div>}>
        <PathComposer conversationId={conversationId} />
      </Suspense>
    </main>
  );
}