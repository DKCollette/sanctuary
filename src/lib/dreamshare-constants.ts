// ─── Client-Safe Constants & Types ───
// This file does NOT import from next/headers — safe for client components.

export const EXPERIENCE_TYPES = [
  { value: "DREAM", icon: "🌙", label: "Dream", description: "A dream experienced while sleeping." },
  { value: "VISION", icon: "👁️", label: "Vision", description: "A vision, vivid inner experience, meditation experience, or powerful mental image." },
  { value: "SPIRITUAL_EXPERIENCE", icon: "✨", label: "Spiritual Experience", description: "A meaningful spiritual, synchronicity, consciousness, or transcendent experience." },
  { value: "STORY", icon: "📖", label: "Story", description: "A personal story that had a profound impact on your life or spiritual journey." },
  { value: "REFLECTION", icon: "💭", label: "Reflection", description: "A realization, thought, or insight you want to explore with others." },
] as const;

export const EMOTIONS = [
  "Peace", "Fear", "Love", "Confusion", "Awe",
  "Sadness", "Joy", "Curiosity", "Familiarity", "Transformation",
] as const;

export const SYMBOL_LIBRARY = [
  { emoji: "🐍", label: "Snake" },
  { emoji: "🌊", label: "Water" },
  { emoji: "🌙", label: "Moon" },
  { emoji: "🐕", label: "Dog" },
  { emoji: "🔥", label: "Fire" },
  { emoji: "👶", label: "Child" },
  { emoji: "🏠", label: "House" },
  { emoji: "🕊️", label: "Bird" },
  { emoji: "🌳", label: "Forest" },
  { emoji: "💀", label: "Death" },
  { emoji: "✨", label: "Light" },
  { emoji: "🌌", label: "Space" },
  { emoji: "🚪", label: "Door" },
  { emoji: "🌅", label: "Sunrise" },
  { emoji: "🌑", label: "Darkness" },
  { emoji: "👤", label: "Shadow" },
  { emoji: "🦋", label: "Butterfly" },
  { emoji: "⛰️", label: "Mountain" },
  { emoji: "🌊", label: "Ocean" },
  { emoji: "🌧️", label: "Rain" },
  { emoji: "❄️", label: "Snow" },
  { emoji: "🌪️", label: "Storm" },
  { emoji: "🗝️", label: "Key" },
  { emoji: "👑", label: "Crown" },
  { emoji: "🕯️", label: "Candle" },
  { emoji: "🌿", label: "Nature" },
] as const;

export const EXPERIENCE_TYPE_DISPLAY: Record<string, { icon: string; label: string; color: string }> = {
  DREAM: { icon: "🌙", label: "Dream", color: "#818cf8" },
  VISION: { icon: "👁️", label: "Vision", color: "#a78bfa" },
  SPIRITUAL_EXPERIENCE: { icon: "✨", label: "Spiritual", color: "#f472b6" },
  STORY: { icon: "📖", label: "Story", color: "#34d399" },
  REFLECTION: { icon: "💭", label: "Reflection", color: "#fbbf24" },
};

export const VISIBILITY_OPTIONS = [
  { value: "PRIVATE", icon: "🔒", label: "Private Journal", description: "Only you can see this." },
  { value: "LIMITED", icon: "🤝", label: "People I Choose", description: "Share with specific people (coming soon)." },
  { value: "PUBLIC", icon: "🌎", label: "Share With Sanctuary", description: "Visible to the community." },
] as const;