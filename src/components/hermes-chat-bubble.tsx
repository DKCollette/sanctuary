"use client";

import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";

interface StateData {
  avatar: {
    tier: string;
    consciousness_level: number;
    xp_gained: number;
    current_element: string;
    aura_color: string;
  };
  chakras: Array<{
    name: string;
    sanskrit: string;
    status: string;
    intensity_percent: number;
    recommended_crystals: string[];
    action_practice: string;
  }>;
  reflection_prompt: string;
}

interface HermesChatBubbleProps {
  rawResponse: string;
  onUpdateState?: (stateData: StateData) => void;
}

export function HermesChatBubble({ rawResponse, onUpdateState }: HermesChatBubbleProps) {
  const { narrativeText, stateData } = useMemo(() => {
    if (!rawResponse) return { narrativeText: "", stateData: null };

    const stateRegex = /<state_data>([\s\S]*?)<\/state_data>/;
    const match = rawResponse.match(stateRegex);

    if (!match) {
      return { narrativeText: rawResponse, stateData: null };
    }

    const textOnly = rawResponse.replace(stateRegex, "").trim();
    const cleanJsonStr = match[1].replace(/```json|```/g, "").trim();

    try {
      const parsedJson = JSON.parse(cleanJsonStr);
      return { narrativeText: textOnly, stateData: parsedJson };
    } catch (e) {
      console.error("Failed to parse Hermes state_data JSON:", e);
      return { narrativeText: textOnly, stateData: null };
    }
  }, [rawResponse]);

  // Notify parent of state data when it changes
  React.useEffect(() => {
    if (stateData && onUpdateState) {
      onUpdateState(stateData);
    }
  }, [stateData, onUpdateState]);

  return (
    <div className="sanctuary-chat-bubble prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown
        components={{
          h3: ({ node, ...props }: any) => (
            <h3 className="text-lg font-semibold text-primary mt-4 mb-2 tracking-wide" {...props} />
          ),
          p: ({ node, ...props }: any) => (
            <p className="text-sm leading-relaxed mb-3 text-foreground" {...props} />
          ),
          strong: ({ node, ...props }: any) => (
            <strong className="font-semibold text-primary" {...props} />
          ),
          em: ({ node, ...props }: any) => (
            <em className="italic text-foreground/90" {...props} />
          ),
          ul: ({ node, ...props }: any) => (
            <ul className="list-disc list-inside space-y-1 mb-3 text-sm text-foreground" {...props} />
          ),
          ol: ({ node, ...props }: any) => (
            <ol className="list-decimal list-inside space-y-1 mb-3 text-sm text-foreground" {...props} />
          ),
          hr: () => (
            <hr className="my-4 border-t border-border" />
          ),
          blockquote: ({ node, ...props }: any) => (
            <blockquote className="border-l-2 border-primary/30 pl-4 italic text-muted-foreground my-3" {...props} />
          ),
          code: ({ node, inline, ...props }: any) => (
            inline
              ? <code className="bg-secondary/50 px-1.5 py-0.5 rounded text-xs font-mono" {...props} />
              : <code className="block bg-secondary/50 p-3 rounded-lg text-xs font-mono overflow-x-auto my-2" {...props} />
          ),
        }}
      >
        {narrativeText}
      </ReactMarkdown>
    </div>
  );
}