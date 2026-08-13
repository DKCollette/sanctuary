"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Send, Loader2, User } from "lucide-react";
import Link from "next/link";
import AssessmentResults from "./assessment-results";

interface AssessmentFlowProps {
  tier: "quick" | "balanced" | "deep";
  onBack: () => void;
}

export default function AssessmentFlow({ tier, onBack }: AssessmentFlowProps) {
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState("");
  const [phaseLabel, setPhaseLabel] = useState("your inner world");
  const [progress, setProgress] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(30);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => {
        if (r.ok) setIsAuthenticated(true);
      })
      .catch(() => {})
      .finally(() => setCheckingAuth(false));
  }, []);

  // Start the assessment
  const startAssessment = useCallback(async () => {
    setStarting(true);
    setError(null);
    try {
      const res = await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      if (!res.ok) {
        const err = await res.json();
        if (res.status === 401) {
          setError("Please sign in or create a profile to save your assessment.");
          setIsAuthenticated(false);
        } else {
          setError(err.error || "Could not start assessment");
        }
        return;
      }
      const data = await res.json();
      setAssessmentId(data.id);
      setQuestion(data.question);
      setPhaseLabel(data.phaseLabel);
      setProgress(data.progress);
      setQuestionNumber(data.questionNumber || 1);
      setTotalQuestions(data.totalQuestions);
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setStarting(false);
    }
  }, [tier]);

  // Submit an answer
  const submitAnswer = useCallback(async () => {
    if (!answer.trim() || !assessmentId) return;
    setLoading(true);
    setError(null);
    const currentAnswer = answer.trim();
    setAnswer("");

    try {
      const res = await fetch("/api/assessment", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId, answer: currentAnswer }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Could not submit answer");
        setAnswer(currentAnswer);
        return;
      }
      const data = await res.json();

      if (data.done) {
        setResults(data.results);
      } else {
        setQuestion(data.question);
        setPhaseLabel(data.phaseLabel);
        setProgress(data.progress);
        setQuestionNumber(data.questionNumber);
        setTotalQuestions(data.totalQuestions);
      }
    } catch {
      setError("Connection error");
      setAnswer(currentAnswer);
    } finally {
      setLoading(false);
    }
  }, [answer, assessmentId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitAnswer();
    }
  };

  // If we have results, show the results view
  if (results) {
    return (
      <AssessmentResults
        results={results}
        tier={tier}
        onBack={() => {
          setResults(null);
          setAssessmentId(null);
          setQuestion("");
          setProgress(0);
          setQuestionNumber(0);
        }}
      />
    );
  }

  // If assessment hasn't started, show start screen or auth prompt
  if (!assessmentId) {
    return (
      <div className="w-full max-w-lg mx-auto text-center animate-fade-in py-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground/50 hover:text-muted-foreground mb-6 transition-colors"
        >
          <ArrowLeft size={14} /> Choose a different path
        </button>

        <div className="mb-6">
          <span className="text-3xl mb-3 block">
            {tier === "quick" ? "🌿" : tier === "balanced" ? "🌙" : "✨"}
          </span>
          <h3 className="text-lg font-serif font-medium text-foreground mb-1">
            {tier === "quick" ? "Quick Reflection" : tier === "balanced" ? "Balanced Journey" : "Deep Discovery"}
          </h3>
          <p className="text-xs text-muted-foreground/60">
            {tier === "quick" ? "~2 minutes · 5-10 questions" : tier === "balanced" ? "~8 minutes · 20-30 questions" : "20-30 minutes · 60-100 questions"}
          </p>
        </div>

        {checkingAuth ? (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground/60 py-8">
            <Loader2 size={14} className="animate-spin" />
            Checking...
          </div>
        ) : !isAuthenticated ? (
          /* Auth required prompt */
          <div className="border border-border/50 rounded-xl p-6 bg-card/30">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
              <User size={20} className="text-primary" />
            </div>
            <h4 className="text-sm font-medium text-foreground mb-2">Profile Required</h4>
            <p className="text-xs text-muted-foreground/70 leading-relaxed mb-4 max-w-sm mx-auto">
              Create a free Sanctuary profile to save your assessment results and track your growth over time. Without a profile, your progress will be lost when you leave.
            </p>
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-all"
            >
              Create Your Profile
            </Link>
            <p className="text-[10px] text-muted-foreground/40 mt-3">
              Already have one? Sign in on the profile page
            </p>
          </div>
        ) : (
          /* Authenticated — show start button */
          <>
            <p className="text-sm text-muted-foreground/70 leading-relaxed mb-8 max-w-md mx-auto">
              Take a few gentle breaths. This is a space for you — no right answers, no wrong ones. Just honest reflection. When you feel ready, begin.
            </p>

            {error && (
              <p className="text-xs text-destructive mb-4">{error}</p>
            )}

            <button
              onClick={startAssessment}
              disabled={starting}
              className="px-6 py-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-all disabled:opacity-50 inline-flex items-center gap-2"
            >
              {starting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Beginning...
                </>
              ) : (
                "Begin"
              )}
            </button>
          </>
        )}
      </div>
    );
  }

  // Active assessment - show question and answer input
  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in py-4">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-muted-foreground/60 mb-2">
          <span className="capitalize">{phaseLabel}</span>
          <span>{Math.round(progress * 100)}%</span>
        </div>
        <div className="h-1 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progress * 100}%`,
              background: "linear-gradient(90deg, hsl(var(--primary) / 0.6), hsl(var(--primary)))",
            }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="border border-border/50 rounded-xl p-6 bg-card/30 backdrop-blur-sm mb-4">
        <p className="text-xs text-muted-foreground/50 uppercase tracking-wider mb-3">
          Question {questionNumber} of {totalQuestions}
        </p>
        <p className="text-base md:text-lg text-foreground/90 leading-relaxed font-serif">
          {question}
        </p>
      </div>

      {/* Answer input */}
      <div className="flex gap-2">
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Share your thoughts..."
          rows={3}
          disabled={loading}
          className="flex-1 bg-secondary/30 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none transition-all disabled:opacity-50"
        />
        <button
          onClick={submitAnswer}
          disabled={!answer.trim() || loading}
          className="self-end p-3 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-primary-foreground transition-all"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>

      {error && (
        <p className="text-xs text-destructive mt-2">{error}</p>
      )}

      <p className="text-xs text-muted-foreground/40 mt-3 text-center">
        Press Enter to send · Shift+Enter for a new line
      </p>
    </div>
  );
}