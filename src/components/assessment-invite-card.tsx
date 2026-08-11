"use client";

interface AssessmentInviteCardProps {
  onStartAssessment: () => void;
}

export function AssessmentInviteCard({ onStartAssessment }: AssessmentInviteCardProps) {
  return (
    <div className="mt-4 p-4 rounded-xl bg-primary/10 border border-primary/30 backdrop-blur-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-slide-up">
      <div>
        <h4 className="text-sm font-semibold text-primary">Calibrate Your Energetic Resonance</h4>
        <p className="text-xs text-muted-foreground/80">
          Take a 60-second assessment to discover your baseline Hawkins Level and unlock your custom avatar glow.
        </p>
      </div>
      <button
        onClick={onStartAssessment}
        className="px-4 py-2 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all whitespace-nowrap shadow-md"
      >
        Begin Check-In
      </button>
    </div>
  );
}