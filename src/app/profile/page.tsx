"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Moon, Sun, Lock, User, Sparkles, Heart, BookOpen, Shield, Info, LogOut, ChevronDown, TrendingUp } from "lucide-react";
import { useTheme } from "next-themes";
import ConsciousnessScale from "@/components/consciousness-scale";

interface ProfileData {
  displayName: string;
  currentStage: string;
  createdAt: string;
  lastLoginAt: string;
  preferences: {
    primaryModalities: string[];
    intentions: string[];
    bookmarkedCategories: string[];
    contentDepth: string;
    enableTracking: boolean;
  } | null;
  consciousnessRecords: {
    stage: string;
    energeticState: string;
    sessionSummary: string | null;
    milestone: string | null;
    stateData: any;
    createdAt: string;
  }[];
  sessionLogs: {
    summary: string;
    frequentTopics: string[];
    messageCount: number;
    createdAt: string;
  }[];
  bookmarkedCategories: string[];
}

const MODALITY_OPTIONS = [
  "Astrology", "Lunar Cycles", "Tarot", "Human Design", "Energy Work",
  "Breathwork", "Meditation", "Crystals", "Sound Healing", "Journaling",
];

const DEPTH_OPTIONS = ["Beginner", "Intermediate", "Advanced"];

const STAGE_COLORS: Record<string, string> = {
  Seeking: "text-amber-400 border-amber-500/20 bg-amber-500/10",
  Grounding: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
  Awakening: "text-blue-400 border-blue-500/20 bg-blue-500/10",
  Integrating: "text-purple-400 border-purple-500/20 bg-purple-500/10",
  Aligning: "text-rose-400 border-rose-500/20 bg-rose-500/10",
};

export default function ProfilePage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState("");
  const [editingPrefs, setEditingPrefs] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);

  // Preferences editing state
  const [modalities, setModalities] = useState<string[]>([]);
  const [intentions, setIntentions] = useState<string>("");
  const [contentDepth, setContentDepth] = useState("Intermediate");

  useEffect(() => {
    setMounted(true);
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        if (data.preferences) {
          setModalities(data.preferences.primaryModalities || []);
          setContentDepth(data.preferences.contentDepth || "Intermediate");
          setIntentions((data.preferences.intentions || []).join(", "));
        }
      }
    } catch {
      // not logged in
    } finally {
      setLoading(false);
    }
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
      await fetchProfile();
    } catch {
      setAuthError("Connection error. Please try again.");
    }
  }

  async function handleLogout() {
    await fetch("/api/profile", { method: "POST" });
    setProfile(null);
    setLoading(false);
  }

  async function handleSavePreferences() {
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        primaryModalities: modalities,
        intentions: intentions.split(",").map((s) => s.trim()).filter(Boolean),
        contentDepth,
      }),
    });
    setEditingPrefs(false);
    fetchProfile();
  }

  function toggleModality(m: string) {
    setModalities((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 sticky top-0 z-40 bg-background/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-xl font-serif text-primary">
            Sanctuary
          </Link>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary"
            aria-label="Toggle theme"
          >
            {mounted ? (
              theme === "dark" ? <Sun size={18} /> : <Moon size={18} />
            ) : (
              <div className="w-[18px] h-[18px]" />
            )}
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {!profile ? (
          /* Auth Form */
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="text-primary" size={28} />
              </div>
              <h1 className="text-3xl font-serif mb-2">
                {isLogin ? "Welcome Back" : "Begin Your Journey"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isLogin
                  ? "Return to continue your path."
                  : "Create a Sanctuary to track your spiritual journey across sessions."}
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium block mb-1">
                  Display Name
                </label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your spiritual name or handle"
                  className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                  minLength={2}
                  maxLength={30}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium block mb-1">
                  Passcode
                </label>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="A secret word only you know"
                  className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                  minLength={4}
                />
              </div>

              {authError && (
                <p className="text-xs text-destructive text-center">{authError}</p>
              )}

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
              >
                {isLogin ? "Enter Sanctuary" : "Begin"}
              </button>

              <p className="text-xs text-muted-foreground text-center">
                {isLogin ? "New here? " : "Already have a Sanctuary? "}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary hover:underline"
                >
                  {isLogin ? "Create one" : "Sign in"}
                </button>
              </p>
            </form>
          </div>
        ) : (
          /* Profile Dashboard */
          <div className="space-y-8">
            {/* Welcome Card */}
            <div className="border border-border rounded-xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-serif mb-1">
                    {profile.displayName}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Member since{" "}
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`inline-block text-[10px] uppercase tracking-wider font-medium px-3 py-1 rounded-full border ${STAGE_COLORS[profile.currentStage] || STAGE_COLORS.Seeking}`}
                >
                  {profile.currentStage}
                </span>
              </div>
            </div>

            {/* Full Consciousness Scale */}
            {profile.consciousnessRecords.length > 0 && (
              <section className="border border-border rounded-xl p-4 md:p-6 bg-card/30">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={14} className="text-primary" />
                  <h2 className="text-xs uppercase tracking-widest text-primary/70 font-medium">
                    Your Path on the Hawkins Scale
                  </h2>
                </div>
                <ConsciousnessScale
                  currentLevel={
                    // Get the most recent consciousness level from stateData, or fall back to 200
                    (() => {
                      const latest = profile.consciousnessRecords[0];
                      if (latest?.stateData?.avatar?.consciousness_level) {
                        return latest.stateData.avatar.consciousness_level;
                      }
                      return 200;
                    })()
                  }
                  auraColor={
                    (() => {
                      const latest = profile.consciousnessRecords[0];
                      if (latest?.stateData?.avatar?.aura_color) {
                        return latest.stateData.avatar.aura_color;
                      }
                      return "#8B5CF6";
                    })()
                  }
                  tier={profile.currentStage}
                  history={profile.consciousnessRecords
                    .filter((r) => r.stateData?.avatar?.consciousness_level)
                    .map((r) => ({
                      level: r.stateData!.avatar.consciousness_level,
                      createdAt: r.createdAt,
                    }))}
                />
              </section>
            )}

            {/* Consciousness Journey */}
            {profile.consciousnessRecords.length > 0 && (
              <section>
                <h2 className="text-xs uppercase tracking-widest text-muted-foreground/60 font-medium mb-4 flex items-center gap-2">
                  <Heart size={14} />
                  Consciousness Journey
                </h2>
                <div className="space-y-3">
                  {profile.consciousnessRecords.slice(0, 5).map((record, i) => (
                    <div
                      key={i}
                      className="border border-border rounded-lg p-4"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`inline-block text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full border ${STAGE_COLORS[record.stage] || STAGE_COLORS.Seeking}`}
                        >
                          {record.stage}
                        </span>
                        <span className="text-xs text-muted-foreground/60">
                          {new Date(record.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {record.energeticState}
                      </p>
                      {record.milestone && (
                        <p className="text-xs text-primary/70 mt-1 italic">
                          ✦ {record.milestone}
                        </p>
                      )}
                      {record.stateData && (
                        <div className="mt-3 pt-3 border-t border-border/50">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                            <span className="font-medium text-foreground">{record.stateData.avatar.tier}</span>
                            <span>· {record.stateData.avatar.consciousness_level}</span>
                            <span>· +{record.stateData.avatar.xp_gained} XP</span>
                            <span>· {record.stateData.avatar.current_element}</span>
                          </div>
                          <div className="grid grid-cols-7 gap-1">
                            {record.stateData.chakras.map((chakra: any, j: number) => {
                              const colorMap: Record<string, string> = {
                                Root: "#FF4B4B", Sacral: "#FF8C42", "Solar Plexus": "#FFD700",
                                Heart: "#4CAF50", Throat: "#42A5F5", "Third Eye": "#7C4DFF", Crown: "#9B59B6"
                              };
                              const statusColor = chakra.status === "blocked" ? "#666" : chakra.status === "overactive" ? "#FFD700" : (colorMap[chakra.name] || "#888");
                              return (
                                <div key={j} className="flex flex-col items-center gap-0.5" title={`${chakra.name}: ${chakra.status} (${chakra.intensity_percent}%)`}>
                                  <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: statusColor, opacity: chakra.status === "blocked" ? 0.4 : 0.9 }}
                                  />
                                  <span className="text-[8px] text-muted-foreground/40">{chakra.name === "Solar Plexus" ? "Solar" : chakra.name === "Third Eye" ? "3rd Eye" : chakra.name.substring(0, 4)}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Preferences */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs uppercase tracking-widest text-muted-foreground/60 font-medium flex items-center gap-2">
                  <Sparkles size={14} />
                  Spiritual Preferences
                </h2>
                <button
                  onClick={() => setEditingPrefs(!editingPrefs)}
                  className="text-xs text-primary hover:underline"
                >
                  {editingPrefs ? "Cancel" : "Edit"}
                </button>
              </div>

              {editingPrefs ? (
                <div className="border border-border rounded-xl p-5 space-y-5">
                  {/* Modalities */}
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium block mb-2">
                      Spiritual Modalities
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {MODALITY_OPTIONS.map((m) => (
                        <button
                          key={m}
                          onClick={() => toggleModality(m)}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                            modalities.includes(m)
                              ? "bg-primary/20 border-primary/40 text-primary"
                              : "border-border hover:border-primary/30 text-muted-foreground"
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Intentions */}
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium block mb-1">
                      Intentions (comma-separated)
                    </label>
                    <input
                      value={intentions}
                      onChange={(e) => setIntentions(e.target.value)}
                      placeholder="Daily alignment, shadow work, intuition building"
                      className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  {/* Content Depth */}
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium block mb-2">
                      Guidance Depth
                    </label>
                    <div className="flex gap-2">
                      {DEPTH_OPTIONS.map((d) => (
                        <button
                          key={d}
                          onClick={() => setContentDepth(d)}
                          className={`text-xs px-4 py-2 rounded-lg border transition-colors ${
                            contentDepth === d
                              ? "bg-primary/20 border-primary/40 text-primary"
                              : "border-border hover:border-primary/30 text-muted-foreground"
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleSavePreferences}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                  >
                    Save Preferences
                  </button>
                </div>
              ) : (
                <div className="border border-border rounded-xl p-5 space-y-3">
                  <div>
                    <span className="text-xs text-muted-foreground/60">
                      Modalities
                    </span>
                    <p className="text-sm">
                      {profile.preferences?.primaryModalities?.length
                        ? profile.preferences.primaryModalities.join(", ")
                        : "None selected yet"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground/60">
                      Intentions
                    </span>
                    <p className="text-sm">
                      {profile.preferences?.intentions?.length
                        ? profile.preferences.intentions.join(", ")
                        : "None set yet"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground/60">
                      Guidance Depth
                    </span>
                    <p className="text-sm">
                      {profile.preferences?.contentDepth || "Intermediate"}
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* Recent Sessions */}
            {profile.sessionLogs.length > 0 && (
              <section>
                <h2 className="text-xs uppercase tracking-widest text-muted-foreground/60 font-medium mb-4 flex items-center gap-2">
                  <BookOpen size={14} />
                  Recent Sessions
                </h2>
                <div className="space-y-3">
                  {profile.sessionLogs.slice(0, 3).map((log, i) => (
                    <div key={i} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground/60">
                          {new Date(log.createdAt).toLocaleDateString()} ·{" "}
                          {log.messageCount} messages
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {log.summary}
                      </p>
                      {log.frequentTopics.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {log.frequentTopics.map((topic, j) => (
                            <span
                              key={j}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Logout */}
            <div className="border-t border-border/50 pt-6">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}