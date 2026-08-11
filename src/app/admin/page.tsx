"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface AdminStats {
  conversationCount: number;
  messageCount: number;
  feedbackCount: number;
  positiveFeedback: number;
  negativeFeedback: number;
  averageLatency: number;
  modelUsage: Record<string, number>;
  tokenUsage: number;
  modeUsage: Record<string, number>;
  recentErrors: { id: string; message: string; createdAt: string }[];
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authToken, setAuthToken] = useState("");

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/stats");
      if (res.status === 401) {
        setError("Authentication required");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        setError("Failed to load stats");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4 text-center">
          <h1 className="text-2xl font-serif">Admin Dashboard</h1>
          {error && <p className="text-destructive">{error}</p>}
          <div className="border border-border rounded-xl p-6 space-y-3">
            <p className="text-muted-foreground text-sm">
              The admin dashboard is protected. Enter your admin credentials below.
            </p>
            <input
              type="password"
              value={authToken}
              onChange={(e) => setAuthToken(e.target.value)}
              placeholder="Admin password"
              className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              onClick={() => {
                // Set a cookie and reload
                document.cookie = `admin_token=${btoa(authToken)}; path=/; max-age=86400`;
                window.location.reload();
              }}
              className="w-full bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm hover:bg-primary/90 transition-colors"
            >
              Authenticate
            </button>
          </div>
          <Link href="/" className="text-sm text-primary hover:text-primary/80 underline">
            Return to Sanctuary
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-xl font-serif text-primary">
            Sanctuary
          </Link>
          <span className="text-sm text-muted-foreground">Admin Dashboard</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-serif mb-8">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Conversations" value={stats.conversationCount} />
          <StatCard label="Messages" value={stats.messageCount} />
          <StatCard label="Avg Latency" value={`${stats.averageLatency}ms`} />
          <StatCard label="Tokens Used" value={stats.tokenUsage.toLocaleString()} />
        </div>

        {/* Feedback */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="border border-border rounded-xl p-4">
            <h3 className="text-sm text-muted-foreground mb-1">Feedback</h3>
            <p className="text-2xl font-serif">{stats.feedbackCount}</p>
            <div className="flex gap-4 mt-2 text-xs">
              <span className="text-success">{stats.positiveFeedback} 👍</span>
              <span className="text-destructive">{stats.negativeFeedback} 👎</span>
              <span className="text-muted-foreground">
                {stats.feedbackCount > 0
                  ? `${Math.round((stats.positiveFeedback / stats.feedbackCount) * 100)}% positive`
                  : "—"}
              </span>
            </div>
          </div>
          <div className="border border-border rounded-xl p-4">
            <h3 className="text-sm text-muted-foreground mb-1">Guidance Modes</h3>
            <div className="space-y-1 mt-2">
              {Object.entries(stats.modeUsage).map(([mode, count]) => (
                <div key={mode} className="flex justify-between text-xs">
                  <span className="text-muted-foreground capitalize">{mode.replace("-", " ")}</span>
                  <span>{count}</span>
                </div>
              ))}
              {Object.keys(stats.modeUsage).length === 0 && (
                <span className="text-xs text-muted-foreground">No data yet</span>
              )}
            </div>
          </div>
        </div>

        {/* Model Usage */}
        <div className="border border-border rounded-xl p-4 mb-8">
          <h3 className="text-sm text-muted-foreground mb-3">Model Usage</h3>
          {Object.entries(stats.modelUsage).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(stats.modelUsage).map(([model, count]) => (
                <div key={model} className="flex items-center gap-2">
                  <div className="flex-1 h-6 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{
                        width: `${
                          Math.max(
                            1,
                            (count / Math.max(...Object.values(stats.modelUsage))) * 100
                          )
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-32 text-right truncate">{model}</span>
                  <span className="text-xs font-medium w-12 text-right">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No model usage data yet</p>
          )}
        </div>

        {/* Recent Errors */}
        <div className="border border-border rounded-xl p-4">
          <h3 className="text-sm text-muted-foreground mb-3">Recent Errors</h3>
          {stats.recentErrors.length > 0 ? (
            <div className="space-y-2">
              {stats.recentErrors.map((err) => (
                <div key={err.id} className="text-xs p-2 bg-destructive/5 rounded border border-destructive/20">
                  <p className="text-destructive">{err.message}</p>
                  <p className="text-muted-foreground mt-1">{new Date(err.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No errors recorded</p>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-border rounded-xl p-4">
      <h3 className="text-sm text-muted-foreground mb-1">{label}</h3>
      <p className="text-2xl font-serif">{value}</p>
    </div>
  );
}