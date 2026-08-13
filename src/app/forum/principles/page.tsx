"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrinciplesPage() {
  const principles = [
    {
      title: "Seek Understanding Before Judgment",
      description:
        "When you encounter a perspective that differs from your own, pause. Ask questions. Seek to understand before you evaluate. The greatest spiritual growth often comes from the voices that challenge our comfortable narratives.",
    },
    {
      title: "Share Experience Rather Than Claiming Absolute Truth",
      description:
        "Frame your contributions as your own experience, insight, or understanding. Use 'I have found...' rather than 'The truth is...'. None of us holds the complete picture, but together we see more.",
    },
    {
      title: "Respect Different Religions and Philosophies",
      description:
        "This is a home for seekers of all paths. Whether someone follows a structured religion, a philosophical tradition, or no tradition at all, their journey deserves respect. Critique ideas with care; never attack a person's faith or beliefs.",
    },
    {
      title: "Question Ideas Without Attacking People",
      description:
        "Disagreement is welcome; disrespect is not. Challenge ideas, explore contradictions, and ask difficult questions — but always with the understanding that there is a human being on the other side of the conversation.",
    },
    {
      title: "Do Not Manipulate Vulnerable Members",
      description:
        "Some members come here during times of deep personal struggle or spiritual crisis. Do not use their vulnerability to recruit, convert, sell, or exploit. This is a sanctuary, not a marketplace.",
    },
    {
      title: "Do Not Encourage Dangerous Behavior",
      description:
        "Spiritual exploration should never come at the cost of physical, mental, or emotional safety. Do not encourage others to abandon medical treatment, isolate from loved ones, or engage in harmful practices in the name of spiritual growth.",
    },
    {
      title: "Spiritual Discussion Is Not Medical or Mental Health Care",
      description:
        "Collettive is a space for reflection, community, and exploration. It is not a replacement for professional medical, psychiatric, or therapeutic care. If you or someone here is in crisis, please seek qualified professional support.",
    },
    {
      title: "Everyone Is at a Different Place in Their Journey",
      description:
        "A beginner asking their first question about consciousness is as valuable as an experienced practitioner sharing deep wisdom. Meet each person where they are. There is no race, no hierarchy — only the shared path of unfolding awareness.",
    },
  ];

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <Link
        href="/forum"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground/50 hover:text-muted-foreground mb-6 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Collettive
      </Link>

      <div className="text-center mb-10 animate-sacred-in">
        <h1 className="text-3xl md:text-4xl font-serif font-light text-primary mb-3">
          Sanctuary Principles
        </h1>
        <p className="text-sm text-muted-foreground/70 max-w-lg mx-auto leading-relaxed">
          These principles help us hold space for genuine exploration —
          where every seeker feels safe to question, reflect, and grow.
        </p>
      </div>

      <div className="space-y-8">
        {principles.map((principle, i) => (
          <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
            <h2 className="text-base font-serif font-medium text-foreground mb-2 flex items-start gap-2">
              <span className="text-primary text-lg shrink-0 font-sans">{String(i + 1).padStart(2, "0")}</span>
              {principle.title}
            </h2>
            <p className="text-sm text-muted-foreground/80 leading-relaxed ml-7">
              {principle.description}
            </p>
            {i < principles.length - 1 && (
              <div className="mt-6 border-b border-border/30" />
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 border border-primary/10 rounded-xl p-6 bg-gradient-to-br from-primary/[0.04] to-transparent text-center">
        <p className="text-sm text-muted-foreground/70 italic leading-relaxed">
          &ldquo;Collettive is not a building. It is a way of being with one another.&rdquo;
        </p>
      </div>

      <footer className="mt-8 text-center">
        <Link href="/forum" className="text-xs text-muted-foreground/50 hover:text-primary transition-colors">
          ← Return to Collettive
        </Link>
      </footer>
    </main>
  );
}