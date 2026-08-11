"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "next-themes";
import { Music, VolumeX } from "lucide-react";

// MapleStory-inspired gentle pentatonic melody generator
const DARK_MELODY = [262, 294, 330, 392, 440, 523, 587, 659]; // C D E G A in C4-C5
const LIGHT_MELODY = [523, 587, 659, 784, 880, 1047, 1175, 1319]; // C5 D5 E5 G5 A5

export default function AmbientMusic() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);
  const noteIndexRef = useRef(0);
  const masterGainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  const stopMusic = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (masterGainRef.current) {
      try {
        masterGainRef.current.gain.linearRampToValueAtTime(0, audioContextRef.current!.currentTime + 0.5);
      } catch {}
    }
    setTimeout(() => {
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        try { audioContextRef.current.close(); } catch {}
      }
      audioContextRef.current = null;
      masterGainRef.current = null;
    }, 600);
    setIsPlaying(false);
  }, []);

  const playNote = useCallback((ctx: AudioContext, freq: number, time: number, vol: number) => {
    // Music box / bell tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, time);

    // Add a gentle overtone for richness
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(freq * 2, time);
    gain2.gain.setValueAtTime(vol * 0.15, time);
    gain2.gain.exponentialRampToValueAtTime(0.001, time + 0.5);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2000, time);
    filter.Q.setValueAtTime(0.5, time);

    // Bell-like envelope: fast attack, medium decay
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.8);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGainRef.current!);

    osc2.connect(gain2);
    gain2.connect(masterGainRef.current!);

    osc.start(time);
    osc.stop(time + 0.9);
    osc2.start(time);
    osc2.stop(time + 0.5);
  }, []);

  const startMusic = useCallback(() => {
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch {}
    }

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    audioContextRef.current = ctx;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.04, ctx.currentTime);
    masterGain.connect(ctx.destination);
    masterGainRef.current = masterGain;

    const melody = isDark ? DARK_MELODY : LIGHT_MELODY;

    // Play a random note from the pentatonic scale every 1.2-2 seconds
    noteIndexRef.current = 0;
    let lastTime = ctx.currentTime;

    const scheduleNext = () => {
      if (!audioContextRef.current) return;
      const now = audioContextRef.current.currentTime;
      if (now < lastTime + 0.1) return; // skip if we're catching up

      // Pick a random note from the scale
      const noteIdx = Math.floor(Math.random() * melody.length);
      const freq = melody[noteIdx];

      // Volume varies slightly for dynamics
      const vol = 0.12 + Math.random() * 0.08;

      playNote(audioContextRef.current, freq, now + 0.05, vol);

      // Occasionally play a second note (harmony)
      if (Math.random() > 0.6) {
        const harmonyIdx = (noteIdx + 2 + Math.floor(Math.random() * 3)) % melody.length;
        const harmonyFreq = melody[harmonyIdx];
        playNote(audioContextRef.current, harmonyFreq, now + 0.1, vol * 0.5);
      }

      lastTime = now;

      // Next note in 1.2-2.8 seconds
      const nextDelay = 1200 + Math.random() * 1600;
      intervalRef.current = window.setTimeout(scheduleNext, nextDelay);
    };

    // Start after a short delay
    intervalRef.current = window.setTimeout(scheduleNext, 500);
    setIsPlaying(true);
  }, [isDark, playNote]);

  const toggleMusic = useCallback(() => {
    if (isPlaying) {
      stopMusic();
    } else {
      startMusic();
    }
  }, [isPlaying, startMusic, stopMusic]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioContextRef.current) {
        try { audioContextRef.current.close(); } catch {}
      }
    };
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={toggleMusic}
      className="fixed bottom-4 right-4 z-50 w-10 h-10 rounded-full bg-background/60 border border-border/50 backdrop-blur-sm flex items-center justify-center hover:bg-background/80 transition-all shadow-sm group"
      title={isPlaying ? "Pause" : "Play music"}
      aria-label={isPlaying ? "Pause music" : "Play music"}
    >
      {isPlaying ? (
        <VolumeX size={16} className="text-muted-foreground/70 group-hover:text-foreground transition-colors" />
      ) : (
        <Music size={16} className="text-muted-foreground/50 group-hover:text-foreground transition-colors" />
      )}
    </button>
  );
}