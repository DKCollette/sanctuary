"use client";

import { useMemo, useState, useEffect } from "react";
import { useTheme } from "next-themes";

interface Star {
  left: string;
  top: string;
  size: "sm" | "md" | "lg";
  duration: string;
  delay: string;
}

function createSeededRandom(seed: number) {
  let s = seed;
  return (min: number, max: number) => {
    s = (s * 16807 + 0) % 2147483647;
    const r = (s - 1) / 2147483646;
    return min + r * (max - min);
  };
}

const SIZES = ["sm", "sm", "sm", "md", "md", "lg"] as const;

export default function GalaxyBackground() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  const stars = useMemo<Star[]>(() => {
    const rand = createSeededRandom(42);
    return Array.from({ length: 90 }, (_, i) => {
      const size = SIZES[Math.floor(rand(0, SIZES.length))];
      return {
        left: `${rand(0, 100)}%`,
        top: `${rand(0, 100)}%`,
        size,
        duration: `${rand(2.5, 7)}s`,
        delay: `${rand(0, 5)}s`,
      };
    });
  }, []);

  // Generate grass blades with deterministic positions
  const grassBlades = useMemo(() => {
    const rand = createSeededRandom(99);
    return Array.from({ length: 12 }, (_, i) => ({
      left: `${rand(2, 98)}%`,
      height: `${rand(30, 80)}px`,
      delay: `${rand(0, 4)}s`,
      duration: `${rand(2, 5)}s`,
    }));
  }, []);

  if (isDark) {
    return (
      <>
        <div className="galaxy-bg" aria-hidden="true">
          <div className="nebula-orb" />
          <div className="nebula-orb" />
          <div className="nebula-orb" />
          <div className="nebula-orb" />
        </div>
        <div className="stars-container" aria-hidden="true">
          {stars.map((star, i) => (
            <span
              key={i}
              className={`star size-${star.size}`}
              style={{
                left: star.left,
                top: star.top,
                ["--duration" as string]: star.duration,
                ["--delay" as string]: star.delay,
              }}
            />
          ))}
        </div>
      </>
    );
  }

  return (
    <div className="sunshine-bg" aria-hidden="true">
      <div className="sun-orb" />
      <div className="sun-ray" />

      {/* Floating bird */}
      <svg
        className="bird"
        viewBox="0 0 40 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2 18 Q10 8 20 16 Q30 8 38 18"
          stroke="rgba(100,80,60,0.25)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M2 18 Q10 10 20 16 Q30 10 38 18"
          stroke="rgba(100,80,60,0.15)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {/* Second bird, slower */}
      <svg
        className="bird bird-delayed"
        viewBox="0 0 40 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2 18 Q10 8 20 16 Q30 8 38 18"
          stroke="rgba(100,80,60,0.18)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {/* Grass blades */}
      {grassBlades.map((blade, i) => (
        <div
          key={i}
          className="grass-blade"
          style={{
            left: blade.left,
            height: blade.height,
            ["--sway-duration" as string]: blade.duration,
            ["--sway-delay" as string]: blade.delay,
          }}
        />
      ))}
    </div>
  );
}