"use client";

import { useMemo } from "react";

interface ScaleProps {
  currentLevel: number;
  auraColor: string;
  tier: string;
  history?: { level: number; createdAt: string }[];
}

const HAWKINS_LEVELS = [
  { name: "Enlightenment", min: 700, max: 1000, color: "#FFFFFF", range: "700-1000" },
  { name: "Peace", min: 600, max: 699, color: "#E0B0FF", range: "600-699" },
  { name: "Joy", min: 540, max: 599, color: "#A78BFA", range: "540-599" },
  { name: "Love", min: 500, max: 539, color: "#7C4DFF", range: "500-539" },
  { name: "Reason", min: 400, max: 499, color: "#42A5F5", range: "400-499" },
  { name: "Acceptance", min: 350, max: 399, color: "#4CAF50", range: "350-399" },
  { name: "Willingness", min: 310, max: 349, color: "#66BB6A", range: "310-349" },
  { name: "Neutrality", min: 250, max: 309, color: "#FFD700", range: "250-309" },
  { name: "Courage", min: 200, max: 249, color: "#FFB74D", range: "200-249" },
  { name: "Pride", min: 175, max: 199, color: "#FF8C42", range: "175-199" },
  { name: "Anger", min: 150, max: 174, color: "#FF4B4B", range: "150-174" },
  { name: "Desire", min: 125, max: 149, color: "#E53935", range: "125-149" },
  { name: "Fear", min: 100, max: 124, color: "#C62828", range: "100-124" },
  { name: "Grief", min: 75, max: 99, color: "#8E24AA", range: "75-99" },
  { name: "Apathy", min: 50, max: 74, color: "#6A1B9A", range: "50-74" },
  { name: "Guilt", min: 30, max: 49, color: "#4A148C", range: "30-49" },
  { name: "Shame", min: 1, max: 29, color: "#1A1040", range: "1-29" },
] as const;

function getLevelColor(level: number): string {
  for (const l of HAWKINS_LEVELS) {
    if (level >= l.min && level <= l.max) return l.color;
  }
  return "#666";
}

function getLevelIndex(level: number): number {
  for (let i = 0; i < HAWKINS_LEVELS.length; i++) {
    if (level >= HAWKINS_LEVELS[i].min && level <= HAWKINS_LEVELS[i].max) return i;
  }
  return -1;
}

const BAR_HEIGHT = 420;
const ROW_HEIGHT = BAR_HEIGHT / HAWKINS_LEVELS.length; // ~24.7px per row

export default function ConsciousnessScale({ currentLevel, auraColor, tier, history }: ScaleProps) {
  const maxScale = 1000;
  const levelIndex = getLevelIndex(currentLevel);

  // Position on the bar (0 = bottom = Shame, 100 = top = Enlightenment)
  const currentPos = Math.min((currentLevel / maxScale) * 100, 100);

  // Sort history by date ascending
  const sortedHistory = useMemo(() => {
    if (!history || history.length < 2) return [];
    return [...history]
      .filter((h) => h.level > 0)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [history]);

  // Build timeline path data (y = 0 at top = Enlightenment, 100 at bottom = Shame)
  const timelinePath = useMemo(() => {
    if (sortedHistory.length < 2) return null;
    const points = sortedHistory.map((h) => ({
      y: 100 - (h.level / maxScale) * 100,
      level: h.level,
    }));
    return points;
  }, [sortedHistory]);

  return (
    <div className="w-full">
      {/* Current reading header */}
      <div className="mb-3 pb-2 border-b border-border/50">
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">Consciousness</p>
          <span
            className="text-lg font-bold font-mono"
            style={{ color: getLevelColor(currentLevel) }}
          >
            {currentLevel}
          </span>
        </div>
        <p className="text-xs text-foreground font-medium">{tier}</p>
      </div>

      <div className="flex gap-3">
        {/* Gradient bar with indicator */}
        <div className="relative shrink-0" style={{ width: "20px", height: `${BAR_HEIGHT}px` }}>
          {/* Gradient bar */}
          <div
            className="w-3 mx-auto rounded-full overflow-hidden"
            style={{
              height: "100%",
              background: `linear-gradient(to top, #1A1040, #4A148C, #8E24AA, #C62828, #FF4B4B, #FFB74D, #FFD700, #4CAF50, #42A5F5, #7C4DFF, #A78BFA, #E0B0FF, #FFFFFF)`,
            }}
          >
            {/* Glow at current position */}
            <div
              className="absolute left-0 right-0 transition-all duration-1000 ease-out pointer-events-none"
              style={{ bottom: `${currentPos}%` }}
            >
              <div
                className="w-8 h-8 -ml-0.5 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${auraColor}88 0%, ${auraColor}44 40%, transparent 70%)`,
                  filter: "blur(3px)",
                }}
              />
            </div>
          </div>

          {/* Current position indicator */}
          <div
            className="absolute left-1/2 -translate-x-1/2 transition-all duration-1000 ease-out z-10"
            style={{ bottom: `calc(${currentPos}% - 6px)` }}
          >
            <div
              className="w-3 h-3 rounded-full border-2 shadow-lg"
              style={{
                backgroundColor: getLevelColor(currentLevel),
                borderColor: auraColor,
                boxShadow: `0 0 10px ${auraColor}aa`,
              }}
            />
          </div>

          {/* Timeline dots */}
          {timelinePath?.map((point, i) => (
            <div
              key={i}
              className="absolute left-1/2 -translate-x-1/2 group"
              style={{ bottom: `calc(${point.y}% - 3px)` }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full border border-white/30 transition-all duration-300 hover:scale-150"
                style={{
                  backgroundColor: getLevelColor(point.level),
                  opacity: 0.6,
                }}
              />
              <div className="absolute left-4 bottom-0 hidden group-hover:block bg-card border border-border rounded-lg px-1.5 py-0.5 shadow-lg whitespace-nowrap z-20">
                <span className="text-[9px] text-muted-foreground">{point.level}</span>
              </div>
            </div>
          ))}

          {/* Connecting line for timeline */}
          {timelinePath && timelinePath.length > 1 && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox={`0 0 20 ${BAR_HEIGHT}`}
              preserveAspectRatio="none"
            >
              <path
                d={timelinePath
                  .map((p, i) => {
                    const x = 10;
                    const y = BAR_HEIGHT - (p.y / 100) * BAR_HEIGHT;
                    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
                  })
                  .join(" ")}
                fill="none"
                stroke={auraColor}
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.4"
              />
            </svg>
          )}
        </div>

        {/* Labels side - evenly spaced, Shame at bottom, Enlightenment at top */}
        <div className="flex-1 relative" style={{ height: `${BAR_HEIGHT}px` }}>
          {HAWKINS_LEVELS.map((level, i) => {
            // Evenly spaced from bottom (i=16, Shame) to top (i=0, Enlightenment)
            const isCurrentLevel = levelIndex === i;
            const row = HAWKINS_LEVELS.length - 1 - i; // 0 = bottom row (Shame)
            const topPos = (row / (HAWKINS_LEVELS.length - 1)) * 100;

            return (
              <div
                key={level.name}
                className="absolute left-0 right-0 flex items-center"
                style={{ top: `${topPos}%`, height: `${ROW_HEIGHT}px`, marginTop: `${-ROW_HEIGHT / 2}px` }}
              >
                <div className="flex-1 min-w-0 flex items-center gap-1.5">
                  {/* Color dot */}
                  <div
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      isCurrentLevel ? "animate-pulse" : ""
                    }`}
                    style={{ backgroundColor: isCurrentLevel ? level.color : "transparent" }}
                  />

                  {/* Level name + range */}
                  <span
                    className={`text-[11px] leading-none ${
                      isCurrentLevel
                        ? "text-foreground font-semibold"
                        : "text-muted-foreground/60"
                    }`}
                  >
                    {level.name}
                  </span>
                  <span className="text-[8px] text-muted-foreground/30 leading-none">
                    {level.range}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}