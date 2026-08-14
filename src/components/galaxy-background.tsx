"use client";

import { useMemo, useState, useEffect } from "react";
import { useTheme } from "next-themes";

interface Star {
  left: string;
  top: string;
  size: "sm" | "md" | "lg" | "xl";
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

const SIZES = ["sm", "sm", "sm", "sm", "md", "md", "md", "lg", "lg", "xl"] as const;

export default function GalaxyBackground() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  const stars = useMemo<Star[]>(() => {
    const rand = createSeededRandom(42);
    return Array.from({ length: 200 }, (_, i) => {
      const size = SIZES[Math.floor(rand(0, SIZES.length))];
      return {
        left: `${rand(0, 100)}%`,
        top: `${rand(0, 100)}%`,
        size,
        duration: `${rand(2, 9)}s`,
        delay: `${rand(0, 6)}s`,
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
        <div className="night-glow" aria-hidden="true" />
        <div className="galaxy-bg" aria-hidden="true">
          <div className="nebula-orb" />
          <div className="nebula-orb" />
          <div className="nebula-orb" />
          <div className="nebula-orb" />
        </div>
        {/* Moon */}
        <div className="moon-glow" aria-hidden="true">
          <div className="moon" />
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
      {/* Sun Emblem — Top Right (mirrors moon position) */}
      <div className="sun-emblem-container">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          {/* Outer glow rays */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
            <line
              key={angle}
              x1="100"
              y1="100"
              x2={100 + 80 * Math.cos((angle * Math.PI) / 180)}
              y2={100 + 80 * Math.sin((angle * Math.PI) / 180)}
              stroke="rgba(244, 196, 48, 0.15)"
              strokeWidth="3"
              strokeLinecap="round"
            />
          ))}
          {/* Middle rays */}
          {[15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345].map((angle) => (
            <line
              key={angle}
              x1="100"
              y1="100"
              x2={100 + 60 * Math.cos((angle * Math.PI) / 180)}
              y2={100 + 60 * Math.sin((angle * Math.PI) / 180)}
              stroke="rgba(255, 220, 100, 0.2)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          ))}
          {/* Sun core glow */}
          <circle cx="100" cy="100" r="55" fill="rgba(255, 253, 225, 0.6)" filter="url(#sunBlur)" />
          {/* Sun body */}
          <circle cx="100" cy="100" r="35" fill="url(#sunGradient)" />
          {/* Sun inner highlight */}
          <circle cx="90" cy="88" r="12" fill="rgba(255, 255, 255, 0.4)" filter="url(#sunBlur)" />
          <defs>
            <radialGradient id="sunGradient" cx="40%" cy="35%">
              <stop offset="0%" stopColor="#FFFDE8" />
              <stop offset="40%" stopColor="#FCE88A" />
              <stop offset="80%" stopColor="#F4C430" />
              <stop offset="100%" stopColor="#E8A820" />
            </radialGradient>
            <filter id="sunBlur">
              <feGaussianBlur stdDeviation="4" />
            </filter>
          </defs>
        </svg>
      </div>
      {/* Radiant Heart SVG */}
      <div className="heart-container">
        <svg viewBox="0 0 100 100" className="radiant-heart">
          <defs>
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
            </filter>
          </defs>
          {/* Soft Blurred Core */}
          <path
            d="M 50,30 A 12,12 0 0,0 26,30 C 26,42 50,65 50,65 C 50,65 74,42 74,30 A 12,12 0 0,0 50,30 Z"
            fill="rgba(248, 187, 208, 0.3)"
            filter="url(#softGlow)"
          />
          {/* Clear Crisp Outline */}
          <path
            d="M 50,30 A 12,12 0 0,0 26,30 C 26,42 50,65 50,65 C 50,65 74,42 74,30 A 12,12 0 0,0 50,30 Z"
            fill="none"
            stroke="rgba(248, 187, 208, 0.7)"
            strokeWidth="1.2"
          />
        </svg>
      </div>

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