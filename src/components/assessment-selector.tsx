"use client";

interface AssessmentSelectorProps {
  onSelect: (tier: "quick" | "balanced" | "deep") => void;
}

const TIERS = [
  {
    id: "quick" as const,
    icon: "🌿",
    title: "Quick Reflection",
    time: "~2 min",
    questions: "5-10 questions",
    purpose: "Perfect for a daily check-in. Get a gentle snapshot of your current emotional, mental, and spiritual state.",
    outputs: [
      "Consciousness snapshot",
      "Dominant emotions",
      "Growth opportunity",
      "Personalized affirmation",
      "Suggested action",
    ],
    color: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 hover:border-emerald-400/50",
    badge: null,
  },
  {
    id: "balanced" as const,
    icon: "🌙",
    title: "Balanced Journey",
    time: "~8 min",
    questions: "20-30 questions",
    purpose: "The recommended experience. Explores your mindset, relationships, purpose, patterns, and growth stage.",
    outputs: [
      "Detailed consciousness profile",
      "Strengths & blind spots",
      "Emotional tendencies",
      "Relationship patterns",
      "Purpose alignment",
      "Growth recommendations",
      "Daily practices",
      "Journal prompts",
    ],
    color: "from-violet-500/20 to-violet-600/10 border-violet-500/30 hover:border-violet-400/50",
    badge: "Recommended",
  },
  {
    id: "deep" as const,
    icon: "✨",
    title: "Deep Discovery",
    time: "20-30 min",
    questions: "60-100 adaptive questions",
    purpose: "For those seeking profound self-understanding. Adaptive questioning creates a uniquely personal exploration.",
    outputs: [
      "Everything in Balanced plus...",
      "Personality map",
      "Values hierarchy",
      "Shadow patterns",
      "Inner child themes",
      "Spiritual archetypes",
      "Development roadmap",
      "Weekly growth plan",
    ],
    color: "from-amber-500/20 to-amber-600/10 border-amber-500/30 hover:border-amber-400/50",
    badge: null,
  },
];

export default function AssessmentSelector({ onSelect }: AssessmentSelectorProps) {
  return (
    <div className="w-full animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-serif font-light text-foreground mb-2">
          How would you like to reflect today?
        </h2>
        <p className="text-sm text-muted-foreground/70 max-w-lg mx-auto">
          Every session is unique. Choose the depth that feels right for this moment — you can always go deeper next time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {TIERS.map((tier) => (
          <button
            key={tier.id}
            onClick={() => onSelect(tier.id)}
            className={`group relative flex flex-col text-left border rounded-xl p-5 transition-all duration-300 bg-gradient-to-b ${tier.color} hover:shadow-lg hover:shadow-primary/5`}
          >
            {tier.badge && (
              <span className="absolute -top-2.5 right-4 text-[10px] uppercase tracking-wider font-medium px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
                {tier.badge}
              </span>
            )}

            <span className="text-2xl mb-3">{tier.icon}</span>
            <h3 className="text-base font-serif font-medium text-foreground mb-1">{tier.title}</h3>

            <div className="flex items-center gap-3 text-[10px] text-muted-foreground/60 mb-3 uppercase tracking-wider">
              <span>{tier.time}</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <span>{tier.questions}</span>
            </div>

            <p className="text-xs text-muted-foreground/70 leading-relaxed mb-4">
              {tier.purpose}
            </p>

            <div className="mt-auto">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium mb-2">
                You&apos;ll receive
              </p>
              <ul className="space-y-1">
                {tier.outputs.slice(0, 4).map((output, i) => (
                  <li key={i} className="text-[11px] text-muted-foreground/60 flex items-start gap-1.5">
                    <span className="text-primary/60 mt-0.5">·</span>
                    {output}
                  </li>
                ))}
                {tier.outputs.length > 4 && (
                  <li className="text-[11px] text-muted-foreground/40">
                    +{tier.outputs.length - 4} more
                  </li>
                )}
              </ul>
            </div>

            <div className="mt-4 pt-3 border-t border-border/30">
              <span className="text-xs text-primary/70 group-hover:text-primary transition-colors font-medium">
                Begin {tier.title.split(" ")[0]} →
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}