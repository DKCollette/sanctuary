"use client";

import { useState } from "react";
import AvatarDisplay from "./avatar-display";
import ChakraMap from "./chakra-map";
import ConsciousnessScale from "./consciousness-scale";
import { AssessmentInviteCard } from "./assessment-invite-card";

interface StateData {
  user_meta?: {
    has_completed_assessment: boolean;
  };
  avatar: {
    tier: string;
    consciousness_level: number;
    xp_gained: number;
    current_element: string;
    aura_color: string;
  };
  chakras: Array<{
    name: string;
    sanskrit: string;
    status: "blocked" | "overactive" | "balanced";
    intensity_percent: number;
    recommended_crystals: string[];
    action_practice: string;
  }>;
  reflection_prompt: string;
}

export default function StateDashboard({ data }: { data: StateData }) {
  const [showAssessment, setShowAssessment] = useState(false);
  const needsAssessment = data.user_meta?.has_completed_assessment === false;

  return (
    <div className="border border-border rounded-xl bg-card/50 p-4 animate-slide-up">
      {/* Top row: Avatar + Consciousness Scale + Chakra Map */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-border/50 rounded-lg bg-background/30">
          <AvatarDisplay state={data.avatar} />
        </div>
        <div className="border border-border/50 rounded-lg bg-background/30 p-3">
          <ConsciousnessScale
            currentLevel={data.avatar.consciousness_level}
            auraColor={data.avatar.aura_color}
            tier={data.avatar.tier}
          />
        </div>
        <div className="border border-border/50 rounded-lg bg-background/30 p-3">
          <ChakraMap chakras={data.chakras} />
        </div>
      </div>

      {/* Reflection prompt */}
      {data.reflection_prompt && (
        <div className="mt-4 pt-3 border-t border-border/50">
          <p className="text-[10px] uppercase tracking-wider text-primary/60 font-medium mb-1">
            Sit With This
          </p>
          <p className="text-sm text-muted-foreground italic leading-relaxed">
            {data.reflection_prompt}
          </p>
        </div>
      )}

      {/* Assessment invite for first-time users */}
      {needsAssessment && !showAssessment && (
        <AssessmentInviteCard onStartAssessment={() => setShowAssessment(true)} />
      )}

      {/* Assessment questions */}
      {showAssessment && (
        <div className="mt-4 p-4 rounded-xl bg-secondary/30 border border-border/50 animate-slide-up">
          <h4 className="text-sm font-semibold text-foreground mb-3">Your Energetic Check-In</h4>
          <p className="text-xs text-muted-foreground mb-4">
            Reflect on each question and share your answers in the chat whenever you feel ready.
          </p>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-primary font-medium shrink-0">1.</span>
              <span>How would you describe your overall emotional state over the past week?</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-medium shrink-0">2.</span>
              <span>What area of your life feels most in need of healing or clarity right now?</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-medium shrink-0">3.</span>
              <span>When you think of your spiritual self, what word or image comes to mind?</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-medium shrink-0">4.</span>
              <span>What is one intention you'd like to set for our time together?</span>
            </li>
          </ol>
        </div>
      )}
    </div>
  );
}