"use client";

import { useEffect, useState } from "react";

interface PulseItem {
  name: string;
  count: number;
}

export default function CommunityPulse() {
  const [pulse, setPulse] = useState<PulseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/forum/pulse")
      .then((r) => r.json())
      .then((data) => {
        setPulse(Array.isArray(data) ? data : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  if (pulse.length === 0) return null;

  return (
    <div className="border border-border/60 rounded-xl p-6 bg-gradient-to-br from-primary/[0.03] to-transparent">
      <h3 className="text-xs uppercase tracking-widest text-muted-foreground/60 font-medium mb-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse-soft" />
        The Sanctuary is reflecting on&hellip;
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {pulse.map((item, i) => {
          const maxCount = Math.max(...pulse.map((p) => p.count), 1);
          const barWidth = (item.count / maxCount) * 100;

          return (
            <div key={i} className="group animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  {item.name}
                </span>
                <span className="text-xs text-muted-foreground/50">{item.count}</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary/40 to-primary/60 transition-all duration-1000 ease-out"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}