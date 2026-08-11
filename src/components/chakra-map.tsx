"use client";

import { useState } from "react";

interface ChakraData {
  name: string;
  sanskrit: string;
  status: "blocked" | "overactive" | "balanced";
  intensity_percent: number;
  recommended_crystals: string[];
  action_practice: string;
}

const CHAKRA_COLORS: Record<string, string> = {
  Root: "#FF4B4B",
  Sacral: "#FF8C42",
  "Solar Plexus": "#FFD700",
  Heart: "#4CAF50",
  Throat: "#42A5F5",
  "Third Eye": "#7C4DFF",
  Crown: "#9B59B6",
};

const CHAKRA_POSITIONS = [
  { name: "Root", cx: 100, cy: 220 },
  { name: "Sacral", cx: 100, cy: 190 },
  { name: "Solar Plexus", cx: 100, cy: 160 },
  { name: "Heart", cx: 100, cy: 130 },
  { name: "Throat", cx: 100, cy: 100 },
  { name: "Third Eye", cx: 100, cy: 72 },
  { name: "Crown", cx: 100, cy: 46 },
];

function chakraStatusColor(status: string, baseColor: string): string {
  if (status === "blocked") return "#666";
  if (status === "overactive") return "#FFD700";
  return baseColor;
}

function chakraStatusGlow(status: string): string {
  if (status === "blocked") return "none";
  if (status === "overactive") return "url(#overactiveGlow)";
  return "url(#balancedGlow)";
}

export default function ChakraMap({
  chakras,
}: {
  chakras: ChakraData[];
}) {
  const [selected, setSelected] = useState<ChakraData | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const chakraMap = new Map(chakras.map((c) => [c.name, c]));

  return (
    <div className="relative">
      <svg viewBox="0 0 200 260" className="w-full max-w-[200px] mx-auto">
        <defs>
          <radialGradient id="balancedGlow">
            <stop offset="0%" stopColor="white" stopOpacity="0.6" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="overactiveGlow">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Central spine */}
        <line x1="100" y1="40" x2="100" y2="226" stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />

        {/* Connecting arcs */}
        {CHAKRA_POSITIONS.slice(0, -1).map((pos, i) => {
          const next = CHAKRA_POSITIONS[i + 1];
          return (
            <path
              key={`arc-${i}`}
              d={`M ${pos.cx} ${pos.cy + 12} Q ${pos.cx + 20} ${(pos.cy + next.cy) / 2} ${next.cx} ${next.cy - 12}`}
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="0.5"
              opacity="0.3"
            />
          );
        })}

        {/* Chakra nodes */}
        {CHAKRA_POSITIONS.map((pos) => {
          const chakra = chakraMap.get(pos.name);
          if (!chakra) return null;
          const baseColor = CHAKRA_COLORS[pos.name] || "#888";
          const color = chakraStatusColor(chakra.status, baseColor);
          const isActive = selected?.name === pos.name || hovered === pos.name;

          return (
            <g key={pos.name}>
              {/* Glow ring */}
              {chakra.status !== "blocked" && (
                <circle
                  cx={pos.cx}
                  cy={pos.cy}
                  r={isActive ? 18 : 14}
                  fill={
                    chakra.status === "overactive"
                      ? "rgba(255, 215, 0, 0.15)"
                      : `${baseColor}22`
                  }
                  className="transition-all duration-300"
                />
              )}

              {/* Main circle */}
              <circle
                cx={pos.cx}
                cy={pos.cy}
                r={isActive ? 10 : 8}
                fill={color}
                opacity={chakra.status === "blocked" ? 0.4 : 0.9}
                stroke={isActive ? "white" : "transparent"}
                strokeWidth={isActive ? 2 : 0}
                className="transition-all duration-200 cursor-pointer"
                onClick={() => setSelected(chakra === selected ? null : chakra)}
                onMouseEnter={() => setHovered(pos.name)}
                onMouseLeave={() => setHovered(null)}
              />

              {/* Intensity ring */}
              <circle
                cx={pos.cx}
                cy={pos.cy}
                r={12}
                fill="none"
                stroke={color}
                strokeWidth={1.5}
                strokeDasharray={`${chakra.intensity_percent} ${100 - chakra.intensity_percent}`}
                strokeDashoffset={25}
                opacity={chakra.status === "blocked" ? 0.2 : 0.5}
                className="transition-all duration-500"
                transform={`rotate(-90 ${pos.cx} ${pos.cy})`}
              />

              {/* Active indicator */}
              {isActive && (
                <circle
                  cx={pos.cx}
                  cy={pos.cy}
                  r={14}
                  fill="none"
                  stroke={color}
                  strokeWidth={1}
                  opacity={0.4}
                  className="animate-pulse"
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Chakra detail popup */}
      {selected && (
        <div className="absolute top-0 right-0 w-48 md:w-56 bg-card border border-border rounded-xl p-3 shadow-lg z-10 animate-slide-up">
          <button
            onClick={() => setSelected(null)}
            className="absolute top-1 right-1 text-muted-foreground hover:text-foreground text-xs"
          >
            ✕
          </button>

          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: chakraStatusColor(selected.status, CHAKRA_COLORS[selected.name] || "#888") }}
            />
            <div>
              <p className="text-sm font-medium text-foreground">{selected.name}</p>
              <p className="text-[10px] text-muted-foreground/60">{selected.sanskrit}</p>
            </div>
          </div>

          <div className="mb-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium">
              Status
            </span>
            <p className="text-xs capitalize" style={{ color: chakraStatusColor(selected.status, CHAKRA_COLORS[selected.name] || "#888") }}>
              {selected.status}
              <span className="text-muted-foreground/60 ml-1">
                · {selected.intensity_percent}%
              </span>
            </p>
          </div>

          <div className="mb-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium">
              Crystals
            </span>
            <p className="text-xs text-foreground">
              {selected.recommended_crystals.join(", ")}
            </p>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium">
              Practice
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {selected.action_practice}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}