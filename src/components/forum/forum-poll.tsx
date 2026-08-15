"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Check, ArrowLeft } from "lucide-react";

export interface PollOption {
  id: string;
  emoji?: string;
  text: string;
  description?: string;
}

export interface PollResults {
  total: number;
  optionCounts: Record<string, number>;
  userVote: string | null;
}

interface ForumPollProps {
  postId: string;
  options: PollOption[];
  results: PollResults;
  config?: {
    allowChangeVote?: boolean;
    isClosed?: boolean;
    reflectionPrompt?: string;
  };
  onVote?: () => void;
}

export default function ForumPoll({ postId, options, results, config, onVote }: ForumPollProps) {
  const [voting, setVoting] = useState(false);
  const [localResults, setLocalResults] = useState<PollResults>(results);
  const [justVoted, setJustVoted] = useState<string | null>(null);
  const [showReflectionPrompt, setShowReflectionPrompt] = useState(false);

  const hasVoted = !!localResults.userVote;
  const isClosed = config?.isClosed || false;
  const totalVotes = localResults.total;

  const handleVote = useCallback(async (optionId: string) => {
    if (voting || isClosed) return;
    // Don't allow changing vote if disabled
    if (hasVoted && !config?.allowChangeVote) {
      toast.error("You cannot change your vote");
      return;
    }

    setVoting(true);
    setJustVoted(optionId);

    try {
      const res = await fetch(`/api/forum/posts/${postId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedOption: optionId }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Could not cast vote");
        setJustVoted(null);
        return;
      }

      const data = await res.json();

      // Update local results optimistically
      setLocalResults((prev) => {
        const newCounts = { ...prev.optionCounts };
        // Remove old vote if changing
        if (prev.userVote && prev.userVote !== optionId && newCounts[prev.userVote] > 0) {
          newCounts[prev.userVote] = (newCounts[prev.userVote] || 1) - 1;
        }
        newCounts[optionId] = (newCounts[optionId] || 0) + 1;
        return {
          total: data.changed ? prev.total : prev.total + 1,
          optionCounts: newCounts,
          userVote: optionId,
        };
      });

      if (data.changed) {
        toast.success("Your vote has been updated");
      } else {
        toast.success("Your soul has spoken");
        if (config?.reflectionPrompt) {
          setShowReflectionPrompt(true);
        }
      }
      onVote?.();
    } catch {
      toast.error("Could not cast vote");
      setJustVoted(null);
    } finally {
      setVoting(false);
    }
  }, [postId, voting, isClosed, hasVoted, config, onVote]);

  const getPercentage = (count: number) => {
    if (!totalVotes) return 0;
    return Math.round((count / totalVotes) * 100);
  };

  return (
    <div className="my-6">
      {/* Vote Cards */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${isClosed ? "opacity-80" : ""}`}>
        {options.map((option) => {
          const count = localResults.optionCounts[option.id] || 0;
          const percentage = getPercentage(count);
          const isSelected = localResults.userVote === option.id;
          const isJustVoted = justVoted === option.id;

          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={voting || isClosed || (hasVoted && !config?.allowChangeVote)}
              className={`relative overflow-hidden text-left p-5 rounded-2xl border-2 transition-all duration-500 ${
                isSelected
                  ? "border-primary/50 bg-primary/8 shadow-lg shadow-primary/10"
                  : hasVoted
                  ? "border-border/30 bg-card/30 opacity-70"
                  : "border-border/50 bg-card/50 hover:border-primary/30 hover:bg-secondary/30 hover:shadow-md hover:scale-[1.02] cursor-pointer"
              } ${isJustVoted ? "animate-pulse" : ""} disabled:cursor-default`}
            >
              {/* Fill bar */}
              {hasVoted && totalVotes > 0 && (
                <div
                  className="absolute bottom-0 left-0 h-1 bg-primary/20 transition-all duration-1000 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              )}

              <div className="relative">
                {/* Emoji */}
                {option.emoji && (
                  <span className="text-3xl block mb-2">{option.emoji}</span>
                )}

                {/* Option text */}
                <span className="text-sm font-medium text-foreground block mb-1">
                  {option.text}
                </span>

                {/* Description */}
                {option.description && (
                  <span className="text-xs text-muted-foreground/70 block leading-relaxed">
                    {option.description}
                  </span>
                )}

                {/* Result bar + percentage (shown after voting or if closed) */}
                {(hasVoted || isClosed) && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-secondary/60 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${
                          isSelected ? "bg-primary" : "bg-primary/30"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground/70 tabular-nums min-w-[3ch] text-right">
                      {percentage}%
                    </span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* VS Divider (for 2 options) */}
      {options.length === 2 && !hasVoted && !isClosed && (
        <div className="flex items-center justify-center my-2">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground/30 font-medium px-3 py-1">
            VS
          </span>
        </div>
      )}

      {/* Vote count */}
      <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground/50">
        {totalVotes > 0 ? (
          <span>
            <span className="font-medium text-muted-foreground/70">{totalVotes}</span>{" "}
            {totalVotes === 1 ? "soul has answered" : "souls have answered"}
          </span>
        ) : (
          <span>Be the first to answer</span>
        )}

        {hasVoted && config?.allowChangeVote && (
          <button
            onClick={async () => {
              try {
                const res = await fetch(`/api/forum/posts/${postId}/vote`, { method: "DELETE" });
                if (res.ok) {
                  setLocalResults((prev) => {
                    const newCounts = { ...prev.optionCounts };
                    if (prev.userVote && newCounts[prev.userVote] > 0) {
                      newCounts[prev.userVote] = newCounts[prev.userVote] - 1;
                    }
                    return { ...prev, optionCounts: newCounts, userVote: null, total: prev.total - 1 };
                  });
                  toast.success("Vote removed");
                }
              } catch {
                toast.error("Could not remove vote");
              }
            }}
            className="text-muted-foreground/40 hover:text-muted-foreground transition-colors"
          >
            Remove vote
          </button>
        )}

        {isClosed && (
          <span className="text-amber-400/60">🔒 Closed</span>
        )}
      </div>

      {/* Reflection prompt after voting */}
      {hasVoted && config?.reflectionPrompt && (
        <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/15 text-center">
          <p className="text-sm text-muted-foreground/80 mb-2 italic">
            {config.reflectionPrompt}
          </p>
          <p className="text-xs text-muted-foreground/50">
            Share your perspective in the reflections below.
          </p>
        </div>
      )}

      {/* Post-vote reflection encouragement */}
      {hasVoted && !config?.reflectionPrompt && (
        <div className="mt-3 text-center">
          <p className="text-xs text-muted-foreground/50 italic">
            What made your soul choose this answer? Share below.
          </p>
        </div>
      )}
    </div>
  );
}