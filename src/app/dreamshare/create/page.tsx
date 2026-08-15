"use client";

import { Suspense } from "react";
import DreamShareComposer from "@/components/dreamshare/dreamshare-composer";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateDreamPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        href="/dreamshare"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        Back to DreamShare
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-serif font-light text-primary mb-2">
          Share Your Experience
        </h1>
        <p className="text-sm text-muted-foreground/70 font-serif italic">
          A safe space to record, reflect, and share what moves you.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-4 animate-pulse">
            <div className="h-10 w-full bg-secondary/40 rounded-xl" />
            <div className="h-40 w-full bg-secondary/40 rounded-xl" />
            <div className="h-10 w-1/3 bg-secondary/40 rounded-xl" />
          </div>
        }
      >
        <DreamShareComposer />
      </Suspense>
    </main>
  );
}