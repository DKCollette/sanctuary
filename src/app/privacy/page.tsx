import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy — Sanctuary",
  description: "Privacy policy and data handling for Sanctuary.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border/50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center">
          <Link href="/" className="text-xl font-serif text-primary">
            Sanctuary
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-serif mb-8">Privacy</h1>

        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-serif text-foreground">What We Store</h2>
            <p>
              Sanctuary stores your conversations on our server to provide continuity and allow you to
              review past conversations. Each message is stored with a timestamp, the guidance mode
              used, and anonymous session information.
            </p>
            <p>
              We do not require registration or email. You are identified by an anonymous session ID
              stored in your browser.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-serif text-foreground">AI Processing</h2>
            <p>
              Your messages are sent to a third-party AI provider (such as OpenRouter, OpenAI, or
              Anthropic) to generate responses. These providers process your input according to their
              own privacy policies.
            </p>
            <p>
              <strong>Please avoid sharing highly sensitive personal information</strong> such as
              full names, addresses, financial details, or confidential data.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-serif text-foreground">Your Control</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You can view your conversation history at any time</li>
              <li>You can delete individual conversations</li>
              <li>You can clear all stored history</li>
              <li>Conversations are permanently deleted when you remove them</li>
              <li>No long-term memory is stored without your explicit consent</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-serif text-foreground">Data We Do Not Collect</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>No email addresses or personal identifiers (unless you volunteer them in chat)</li>
              <li>No cookies for tracking or advertising</li>
              <li>No analytics services (Google Analytics, etc.)</li>
              <li>No social media tracking</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-serif text-foreground">Server Storage</h2>
            <p>
              By default, conversations are stored on our server. If server-side storage is disabled by
              the administrator, conversations are kept only in your browser&apos;s local storage and
              can be cleared at any time.
            </p>
          </section>

          <section className="p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-sm font-medium text-foreground mb-1">Important Notice</p>
            <p className="text-sm">
              Sanctuary is an AI reflection guide, not a professional service or divine authority. For
              emergencies, please contact appropriate crisis services in your area.
            </p>
          </section>

          <section className="pt-6 border-t border-border">
            <Link href="/" className="text-primary hover:text-primary/80 underline">
              Return to Sanctuary
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
}