"use client";

import { ArrowLeft, Sparkles, Heart, Brain, Target, Compass, BookOpen, Sun } from "lucide-react";

interface ResultsProps {
  results: any;
  tier: string;
  onBack: () => void;
}

const TIER_ICONS: Record<string, string> = {
  quick: "🌿",
  balanced: "🌙",
  deep: "✨",
};

export default function AssessmentResults({ results, tier, onBack }: ResultsProps) {
  const r = results || {};

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in py-4">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground/50 hover:text-muted-foreground mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> Back to assessment selection
      </button>

      {/* Header */}
      <div className="text-center mb-8">
        <span className="text-3xl mb-2 block">{TIER_ICONS[tier] || "🌿"}</span>
        <h2 className="text-2xl font-serif font-light text-foreground mb-1">Your Reflection</h2>
        <p className="text-xs text-muted-foreground/60">
          {tier === "quick" ? "Quick Reflection" : tier === "balanced" ? "Balanced Journey" : "Deep Discovery"} · Complete
        </p>
      </div>

      {/* Consciousness level */}
      {r.consciousness_level && (
        <div className="border border-border/50 rounded-xl p-6 bg-card/30 mb-4 text-center">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-1">Consciousness Level</p>
          <p className="text-3xl font-serif font-medium text-primary">{r.consciousness_level}</p>
          {r.tier_label && (
            <p className="text-sm text-muted-foreground/70 mt-1">{r.tier_label}</p>
          )}
          {r.consciousness_estimate && (
            <p className="text-xs text-muted-foreground/60 mt-2 leading-relaxed">{r.consciousness_estimate}</p>
          )}
        </div>
      )}

      {/* Current State */}
      {r.current_state && (
        <Section icon={<Sun size={14} />} title="Current State">
          <p className="text-sm text-muted-foreground/80 leading-relaxed">{r.current_state}</p>
        </Section>
      )}

      {/* Dominant Emotions */}
      {r.dominant_emotions && r.dominant_emotions.length > 0 && (
        <Section icon={<Heart size={14} />} title="Emotional Landscape">
          <div className="flex flex-wrap gap-1.5">
            {r.dominant_emotions.map((emotion: string, i: number) => (
              <span
                key={i}
                className="text-[11px] px-2.5 py-1 rounded-full bg-primary/5 text-primary/80 border border-primary/10"
              >
                {emotion}
              </span>
            ))}
          </div>
          {r.emotional_patterns && (
            <p className="text-xs text-muted-foreground/70 mt-3 leading-relaxed">{r.emotional_patterns}</p>
          )}
        </Section>
      )}

      {/* Strengths */}
      {r.strengths && r.strengths.length > 0 && (
        <Section icon={<Sparkles size={14} />} title="Strengths">
          <ul className="space-y-1">
            {r.strengths.map((s: string, i: number) => (
              <li key={i} className="text-sm text-muted-foreground/80 flex items-start gap-2">
                <span className="text-emerald-400/70 mt-0.5">✦</span>
                {s}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Growth Areas */}
      {r.growth_areas && r.growth_areas.length > 0 && (
        <Section icon={<Brain size={14} />} title="Areas for Growth">
          <ul className="space-y-1">
            {r.growth_areas.map((g: string, i: number) => (
              <li key={i} className="text-sm text-muted-foreground/80 flex items-start gap-2">
                <span className="text-amber-400/70 mt-0.5">○</span>
                {g}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Purpose Alignment */}
      {r.purpose_alignment && (
        <Section icon={<Compass size={14} />} title="Purpose & Alignment">
          <p className="text-sm text-muted-foreground/80 leading-relaxed">{r.purpose_alignment}</p>
        </Section>
      )}

      {/* Affirmation */}
      {r.affirmation && (
        <div className="border border-primary/15 rounded-xl p-5 bg-primary/5 mb-4 text-center">
          <p className="text-[10px] uppercase tracking-wider text-primary/50 mb-2">Your Affirmation</p>
          <p className="text-base font-serif italic text-primary/80 leading-relaxed">&ldquo;{r.affirmation}&rdquo;</p>
        </div>
      )}

      {/* Suggested Action */}
      {r.suggested_action && (
        <Section icon={<Target size={14} />} title="Suggested Action for Today">
          <p className="text-sm text-muted-foreground/80 leading-relaxed">{r.suggested_action}</p>
        </Section>
      )}

      {/* Practices */}
      {r.practices && r.practices.length > 0 && (
        <Section icon={<BookOpen size={14} />} title="Recommended Practices">
          <ul className="space-y-1.5">
            {r.practices.map((p: string, i: number) => (
              <li key={i} className="text-sm text-muted-foreground/80 flex items-start gap-2">
                <span className="text-primary/50 mt-0.5">·</span>
                {p}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Reflection Prompt */}
      {r.reflection_prompt && (
        <div className="border border-border/50 rounded-xl p-5 bg-card/30 mb-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-2">Sit With This</p>
          <p className="text-sm font-serif italic text-foreground/80 leading-relaxed">{r.reflection_prompt}</p>
        </div>
      )}

      <div className="text-center pt-4 pb-8">
        <button
          onClick={onBack}
          className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors underline"
        >
          Take another assessment
        </button>
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border/50 rounded-xl p-5 bg-card/30 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-primary/70">{icon}</span>
        <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium">{title}</h3>
      </div>
      {children}
    </div>
  );
}