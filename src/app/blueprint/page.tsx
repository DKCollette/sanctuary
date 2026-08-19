"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Moon, Sun, Sparkles, MapPin, Clock, User, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";

interface Blueprint {
  humanDesign: { type: string; strategy: string; authority: string; profile: string; gates: { gate: number; planet: string; center: string }[] };
  astrology: { sun: { sign: string; degree: number }; moon: { sign: string; degree: number }; rising: { sign: string; degree: number }; dominantElement: string; dominantModality: string };
  numerology: { lifePath: number; expression: number };
}

export default function BlueprintPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<"login" | "form" | "result">("login");
  const [bp, setBp] = useState<Blueprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  // Auth state
  const [isLogin, setIsLogin] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState("");

  // Form state
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthCity, setBirthCity] = useState("");

  useEffect(() => { setMounted(true); checkExisting(); }, []);

  async function checkExisting() {
    try {
      const res = await fetch("/api/blueprint/me");
      if (res.ok) {
        const data = await res.json();
        if (data.exists) {
          setBp(data.blueprint as Blueprint);
          setStep("result");
        } else if (data.exists === false) {
          setStep("form");
        } else {
          setStep("login");
        }
      }
    } catch {} finally { setLoading(false); }
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, passcode }),
      });
      if (!res.ok) {
        const err = await res.json();
        setAuthError(err.error || "Authentication failed");
        return;
      }
      setDisplayName("");
      setPasscode("");
      setStep("form");
    } catch { setAuthError("Connection error"); }
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setGenerating(true);
    try {
      const res = await fetch("/api/blueprint/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, date: birthDate, time: birthTime, city: birthCity }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Generation failed");
        return;
      }
      const data = await res.json();
      setBp(data.blueprint as Blueprint);
      setStep("result");
    } catch { setError("Connection error"); } finally { setGenerating(false); }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/50 sticky top-0 z-40 bg-background/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-xl font-serif text-primary wings-aura">Collettive</Link>
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/forum" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-all">🌿 Forum</Link>
            <Link href="/pulse" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-all">✨ Pulse</Link>
            <Link href="/profile" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-all">🧭 Sanctuary</Link>
            <span className="w-px h-4 bg-border mx-1.5" />
            <Link href="/about" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-all">About</Link>
            <Link href="/guidance" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-all">Guidance</Link>
          </nav>
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary" aria-label="Toggle theme">
            {mounted ? theme === "dark" ? <Sun size={18} /> : <Moon size={18} /> : <div className="w-[18px] h-[18px]" />}
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        {step === "login" && (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="text-primary" size={28} />
              </div>
              <h1 className="text-3xl font-serif mb-2">Your Energetic Blueprint</h1>
              <p className="text-sm text-muted-foreground">Sign in to generate your astrological, Human Design, and numerology profile.</p>
            </div>
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium block mb-1">Display Name</label>
                <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your spiritual name" className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" required minLength={2} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium block mb-1">Passcode</label>
                <input type="password" value={passcode} onChange={e => setPasscode(e.target.value)} placeholder="Your secret passcode" className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" required minLength={4} />
              </div>
              {authError && <p className="text-xs text-destructive text-center">{authError}</p>}
              <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-medium transition-colors">{isLogin ? "Sign In" : "Create Account"}</button>
              <p className="text-xs text-muted-foreground text-center">
                {isLogin ? "New here? " : "Already have an account? "}
                <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline">{isLogin ? "Create one" : "Sign in"}</button>
              </p>
            </form>
          </div>
        )}

        {step === "form" && (
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="text-primary" size={28} />
              </div>
              <h1 className="text-3xl font-serif mb-2">Your Birth Data</h1>
              <p className="text-sm text-muted-foreground">Enter your birth information to generate your complete energetic blueprint.</p>
            </div>
            <form onSubmit={handleGenerate} className="space-y-5">
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium block mb-1 flex items-center gap-1.5"><User size={12} /> Full Name at Birth</label>
                <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jane Doe" className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium block mb-1 flex items-center gap-1.5"><Clock size={12} /> Birth Date</label>
                  <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium block mb-1 flex items-center gap-1.5"><Clock size={12} /> Birth Time</label>
                  <input type="time" value={birthTime} onChange={e => setBirthTime(e.target.value)} className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium block mb-1 flex items-center gap-1.5"><MapPin size={12} /> Birth City</label>
                <input value={birthCity} onChange={e => setBirthCity(e.target.value)} placeholder="New York, NY" className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                <p className="text-[10px] text-muted-foreground/50 mt-1">City, state, or country — used to detect your timezone</p>
              </div>
              {error && <p className="text-xs text-destructive text-center">{error}</p>}
              <button type="submit" disabled={generating} className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2">
                {generating ? <><Loader2 size={14} className="animate-spin" /> Generating...</> : "Generate My Blueprint"}
              </button>
            </form>
          </div>
        )}

        {step === "result" && bp && (
          <div className="space-y-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="text-primary" size={28} />
              </div>
              <h1 className="text-3xl font-serif mb-2">Your Energetic Blueprint</h1>
              <p className="text-sm text-muted-foreground">Your complete spiritual profile, generated from your birth data.</p>
            </div>

            {/* Human Design */}
            <section className="border border-border rounded-xl p-6">
              <h2 className="text-xs uppercase tracking-widest text-primary/70 font-medium mb-4 flex items-center gap-2">
                <Sparkles size={14} /> Human Design
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-secondary/30 rounded-lg p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Type</p>
                  <p className="text-lg font-serif text-primary">{bp.humanDesign.type}</p>
                </div>
                <div className="bg-secondary/30 rounded-lg p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Strategy</p>
                  <p className="text-sm font-medium mt-1">{bp.humanDesign.strategy}</p>
                </div>
                <div className="bg-secondary/30 rounded-lg p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Authority</p>
                  <p className="text-sm font-medium mt-1">{bp.humanDesign.authority}</p>
                </div>
                <div className="bg-secondary/30 rounded-lg p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Profile</p>
                  <p className="text-lg font-serif text-primary">{bp.humanDesign.profile}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {bp.humanDesign.gates.slice(0, 8).map((g, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/5 text-primary/70 border border-primary/10">
                    Gate {g.gate} · {g.planet} · {g.center}
                  </span>
                ))}
                {bp.humanDesign.gates.length > 8 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                    +{bp.humanDesign.gates.length - 8} more
                  </span>
                )}
              </div>
            </section>

            {/* Astrology */}
            <section className="border border-border rounded-xl p-6">
              <h2 className="text-xs uppercase tracking-widest text-primary/70 font-medium mb-4 flex items-center gap-2">
                <Sparkles size={14} /> Natal Astrology
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-secondary/30 rounded-lg p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Sun</p>
                  <p className="text-sm font-serif font-medium">{bp.astrology.sun.sign} {bp.astrology.sun.degree}°</p>
                </div>
                <div className="bg-secondary/30 rounded-lg p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Moon</p>
                  <p className="text-sm font-serif font-medium">{bp.astrology.moon.sign} {bp.astrology.moon.degree}°</p>
                </div>
                <div className="bg-secondary/30 rounded-lg p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Rising</p>
                  <p className="text-sm font-serif font-medium">{bp.astrology.rising.sign} {bp.astrology.rising.degree}°</p>
                </div>
                <div className="bg-secondary/30 rounded-lg p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Dominant</p>
                  <p className="text-sm font-medium">{bp.astrology.dominantElement} · {bp.astrology.dominantModality}</p>
                </div>
              </div>
            </section>

            {/* Numerology */}
            <section className="border border-border rounded-xl p-6">
              <h2 className="text-xs uppercase tracking-widest text-primary/70 font-medium mb-4 flex items-center gap-2">
                <Sparkles size={14} /> Numerology
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-secondary/30 rounded-lg p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Life Path</p>
                  <p className="text-2xl font-serif text-primary">{bp.numerology.lifePath}</p>
                </div>
                <div className="bg-secondary/30 rounded-lg p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Expression</p>
                  <p className="text-2xl font-serif text-primary">{bp.numerology.expression}</p>
                </div>
              </div>
            </section>

            <div className="text-center pt-4">
              <Link href="/profile" className="text-sm text-primary hover:underline">
                ← Back to Sanctuary
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}