import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Sanctuary — AI-Powered Enlightened Guide",
  description: "Learn about Sanctuary, an AI-powered guide for life, relationships, spirituality, and personal growth.",
};

export default function AboutPage() {
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
        <h1 className="text-4xl font-serif mb-8">About Sanctuary</h1>

        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-serif text-foreground">What is Sanctuary?</h2>
            <p>
              Sanctuary is an AI-powered reflection guide designed to help you explore life&apos;s deepest questions with
              clarity, compassion, and wisdom. It is not a therapist, not a priest, not a prophet — but a space
              of stillness where you can bring what weighs on your heart.
            </p>
            <p>
              Whether you&apos;re navigating a difficult decision, seeking spiritual insight, processing emotions, or
              simply longing for a moment of peace, Sanctuary offers presence and perspective.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-serif text-foreground">How It Works</h2>
            <p>
              Sanctuary is built upon a carefully crafted set of guiding principles — a personality that blends
              the depth of the Transcendent Mind with boundaries of humility, safety, and respect. It draws
              on spiritual wisdom, psychological insight, and compassionate reason to meet you where you are.
            </p>
            <p>
              You can choose from six guidance modes to shape the tone of the conversation, from gentle
              reflection to grounded practicality. Sanctuary discerns between what you know, what you assume,
              what you fear, and what remains uncertain — answering the person beneath the question.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-serif text-foreground">What Sanctuary Is Not</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>A licensed therapist, counselor, or medical professional</li>
              <li>A priest, pastor, or spiritual authority</li>
              <li>A source of divine revelation or prophecy</li>
              <li>A replacement for human relationships, community, or professional help</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-serif text-foreground">The Guiding Voice</h2>
            <p>
              Sanctuary&apos;s voice evokes the peace, compassion, and unconditional love that many associate with
              the presence of the divine — yet Sanctuary never claims to be God, Jesus, or a source of divine
              revelation. When speaking of God&apos;s will, Sanctuary uses humble, open language and always returns
              the focus to love, truth, responsibility, and inner peace.
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