"use client";

interface AvatarState {
  tier: string;
  consciousness_level: number;
  xp_gained: number;
  current_element: string;
  aura_color: string;
}

const ELEMENT_SYMBOLS: Record<string, string> = {
  Earth: "🜃",
  Water: "🜄",
  Fire: "🜂",
  Air: "🜁",
  Ether: "✦",
  Light: "☀",
  Cosmos: "∞",
};

function getLevel(level: number): { label: string; min: number; max: number } {
  if (level <= 50) return { label: "Level 1", min: 0, max: 50 };
  if (level <= 175) return { label: "Level 2", min: 51, max: 175 };
  if (level <= 310) return { label: "Level 3", min: 176, max: 310 };
  if (level <= 400) return { label: "Level 4", min: 311, max: 400 };
  if (level <= 540) return { label: "Level 5", min: 401, max: 540 };
  if (level <= 699) return { label: "Level 6", min: 541, max: 699 };
  return { label: "Level 7", min: 700, max: 1000 };
}

export default function AvatarDisplay({ state }: { state: AvatarState }) {
  const lvl = getLevel(state.consciousness_level);
  const progress = Math.min(
    ((state.consciousness_level - lvl.min) / (lvl.max - lvl.min || 1)) * 100,
    100
  );

  return (
    <div className="flex flex-col items-center gap-3 p-4">
      {/* Aura glow */}
      <div className="relative">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center relative"
          style={{
            background: `radial-gradient(circle, ${state.aura_color}44 0%, ${state.aura_color}22 50%, transparent 70%)`,
            boxShadow: `0 0 30px ${state.aura_color}33, 0 0 60px ${state.aura_color}22`,
          }}
        >
          {/* Inner glow animation */}
          <div
            className="absolute inset-0 rounded-full animate-pulse"
            style={{
              background: `radial-gradient(circle, ${state.aura_color}33 0%, transparent 70%)`,
            }}
          />
          {/* Element symbol */}
          <span className="text-2xl relative z-10">
            {ELEMENT_SYMBOLS[state.current_element] || "✦"}
          </span>
        </div>
      </div>

      {/* Tier name */}
      <div className="text-center">
        <p className="text-sm font-serif text-foreground">{state.tier}</p>
        <p className="text-[10px] text-muted-foreground/60">{state.current_element} · {lvl.label}</p>
      </div>

      {/* Consciousness level */}
      <div className="w-full max-w-[160px]">
        <div className="flex justify-between text-[10px] text-muted-foreground/60 mb-1">
          <span>Consciousness</span>
          <span>{state.consciousness_level}</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${state.aura_color}66, ${state.aura_color})`,
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground/40 mt-0.5">
          <span>{lvl.min}</span>
          <span>+{state.xp_gained} XP</span>
          <span>{lvl.max}</span>
        </div>
      </div>
    </div>
  );
}