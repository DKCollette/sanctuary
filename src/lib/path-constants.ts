// ─── Path Feature Constants (Client-Safe) ───

export const PATH_TOPICS = [
  "Consciousness", "Love", "Ego", "Spirituality", "Relationships",
  "Dreams", "God", "Purpose", "Healing", "Philosophy",
  "Parenting", "Fear", "Identity", "Manifestation", "Forgiveness",
  "Grief", "Gratitude", "Presence", "Surrender", "Compassion",
] as const;

export const PATH_MILESTONES = [
  { value: "realization", icon: "💡", label: "Realization" },
  { value: "turning_point", icon: "🔄", label: "Turning Point" },
  { value: "question", icon: "❓", label: "Question" },
  { value: "breakthrough", icon: "✨", label: "Breakthrough" },
  { value: "challenge", icon: "🌊", label: "Challenge" },
  { value: "reflection", icon: "🪞", label: "Reflection" },
] as const;

export const PATH_REACTION_TYPES = [
  "resonates", "changed_perspective", "helped_me_grow",
  "i_wonder", "walked_this_path",
] as const;

export const PATH_REACTION_DISPLAY: Record<string, { icon: string; label: string }> = {
  resonates: { icon: "❤️", label: "Resonates" },
  changed_perspective: { icon: "💡", label: "Changed My Perspective" },
  helped_me_grow: { icon: "🌱", label: "Helped Me Grow" },
  i_wonder: { icon: "🤔", label: "I Wonder..." },
  walked_this_path: { icon: "👣", label: "Walked This Path" },
};

export function generatePathSuggestion(title: string): string {
  const prefixes = [
    "The Path to Understanding",
    "The Path Toward",
    "The Path Through",
    "The Path of",
    "Walking Through",
  ];
  const words = title
    .replace(/[^a-zA-Z\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 3);
  const key = words[0] || "Growth";
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  return `${prefix} ${key}`;
}

export function detectSensitiveContent(text: string): { found: boolean; patterns: string[] } {
  const patterns: { regex: RegExp; label: string }[] = [
    { regex: /[\w.+-]+@[\w-]+\.[\w.-]+/g, label: "Email address" },
    { regex: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, label: "Phone number" },
    { regex: /\b(?:\d[ -]*?){13,16}\b/g, label: "Credit card number" },
    { regex: /\b[A-Z]{2}\d{6}\b/g, label: "Government ID" },
    { regex: /\b(?:api[_-]?key|secret|token|password|auth)\s*[:=]\s*\S+/gi, label: "API key or token" },
    { regex: /\b(?:sk-|pk-)[a-zA-Z0-9]{20,}\b/g, label: "API key format" },
    { regex: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, label: "IP address" },
    { regex: /\b(?:0x)?[a-fA-F0-9]{40}\b/g, label: "Cryptographic hash" },
  ];

  const found: string[] = [];
  for (const p of patterns) {
    if (p.regex.test(text)) {
      found.push(p.label);
    }
  }
  return { found: found.length > 0, patterns: [...new Set(found)] };
}

export function anonymizeNames(text: string): string {
  // Simple name detection: capitalized words after common name indicators
  let result = text;
  const nameIndicators = /\b(my (?:friend|sister|brother|mother|father|wife|husband|partner|daughter|son|coworker|boss|therapist|neighbor) )([A-Z][a-z]+)\b/g;
  result = result.replace(nameIndicators, "$1[Someone]");

  // Also detect "My name is X" / "I'm X" patterns
  result = result.replace(/\bmy name is ([A-Z][a-z]+)\b/gi, "my name is [Name]");
  result = result.replace(/\bI'm ([A-Z][a-z]+)\b/gi, "I'm [Name]");

  return result;
}