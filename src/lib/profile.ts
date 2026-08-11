import { prisma } from "./prisma";
import crypto from "crypto";

const SESSION_TOKEN_COOKIE = "sanctuary_token";
const TOKEN_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function hashPasscode(passcode: string): string {
  return crypto.createHash("sha256").update(passcode).digest("hex");
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

async function issueToken(userId: string): Promise<string> {
  const token = generateToken();
  await prisma.userToken.create({
    data: {
      token,
      userId,
      expiresAt: new Date(Date.now() + TOKEN_EXPIRY_MS),
    },
  });
  return token;
}

/**
 * Register a new user with display name and passcode.
 */
export async function registerUser(displayName: string, passcode: string, modalities?: string[]) {
  const existing = await prisma.user.findUnique({ where: { displayName } });
  if (existing) {
    throw new Error("Display name already taken");
  }

  const user = await prisma.user.create({
    data: {
      displayName,
      passcodeHash: hashPasscode(passcode),
      currentStage: "Seeking",
      preferences: {
        create: {
          primaryModalities: JSON.stringify(modalities || []),
          contentDepth: "Beginner",
        },
      },
    },
    include: { preferences: true },
  });

  // Create first consciousness record
  await prisma.consciousnessRecord.create({
    data: {
      userId: user.id,
      stage: "Seeking",
      energeticState: "New beginning — open and curious",
      sessionSummary: "First entry into Sanctuary",
    },
  });

  return { userId: user.id, displayName: user.displayName, token: await issueToken(user.id) };
}

/**
 * Login returning user. Returns token on success.
 */
export async function loginUser(displayName: string, passcode: string) {
  const user = await prisma.user.findUnique({ where: { displayName } });
  if (!user || user.passcodeHash !== hashPasscode(passcode)) {
    throw new Error("Invalid display name or passcode");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return { userId: user.id, displayName: user.displayName, token: await issueToken(user.id) };
}

/**
 * Get full user profile by user ID.
 */
export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      preferences: true,
      consciousnessRecords: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      sessionLogs: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      bookmarkedCategories: true,
    },
  });
  return user;
}

/**
 * Update user preferences.
 */
export async function updatePreferences(
  userId: string,
  data: {
    primaryModalities?: string[];
    intentions?: string[];
    bookmarkedCategories?: string[];
    contentDepth?: string;
    enableTracking?: boolean;
  }
) {
  const updateData: any = {};
  if (data.primaryModalities !== undefined) updateData.primaryModalities = JSON.stringify(data.primaryModalities);
  if (data.intentions !== undefined) updateData.intentions = JSON.stringify(data.intentions);
  if (data.bookmarkedCategories !== undefined) updateData.bookmarkedCategories = JSON.stringify(data.bookmarkedCategories);
  if (data.contentDepth !== undefined) updateData.contentDepth = data.contentDepth;
  if (data.enableTracking !== undefined) updateData.enableTracking = data.enableTracking;

  return prisma.userPreferences.upsert({
    where: { userId },
    create: { userId, ...updateData },
    update: updateData,
  });
}

/**
 * Record a consciousness reading — analyzes the session and creates a record.
 */
export async function recordConsciousnessReading(
  userId: string,
  data: {
    stage: string;
    energeticState: string;
    sessionSummary?: string;
    milestone?: string;
    stateData?: any;
  }
) {
  const record = await prisma.consciousnessRecord.create({
    data: {
      userId,
      stage: data.stage,
      energeticState: data.energeticState,
      sessionSummary: data.sessionSummary,
      milestone: data.milestone,
      stateData: data.stateData ? JSON.stringify(data.stateData) : null,
    },
  });

  // Update the user's current stage
  await prisma.user.update({
    where: { id: userId },
    data: { currentStage: data.stage, lastStageUpdate: new Date() },
  });

  return record;
}

/**
 * Record a session log at the end of a conversation.
 */
export async function recordSessionLog(
  userId: string,
  data: {
    summary: string;
    frequentTopics: string[];
    energeticNote?: string;
    messageCount: number;
  }
) {
  return prisma.sessionLog.create({
    data: {
      userId,
      summary: data.summary,
      frequentTopics: JSON.stringify(data.frequentTopics),
      energeticNote: data.energeticNote,
      messageCount: data.messageCount,
    },
  });
}

/**
 * Toggle a category bookmark for a user.
 */
export async function toggleCategoryBookmark(userId: string, category: string): Promise<boolean> {
  const existing = await prisma.userBookmark.findUnique({
    where: { userId_category: { userId, category } },
  });

  if (existing) {
    await prisma.userBookmark.delete({ where: { id: existing.id } });
    return false; // removed
  } else {
    await prisma.userBookmark.create({ data: { userId, category } });
    return true; // added
  }
}

/**
 * Build a profile context string for the system prompt.
 */
export function buildProfileContext(user: any): string {
  if (!user) return "";

  const prefs = user.preferences;
  const modalities = prefs?.primaryModalities
    ? JSON.parse(prefs.primaryModalities)
    : [];
  const intentions = prefs?.intentions ? JSON.parse(prefs.intentions) : [];

  let context = `\n\n---\nABOUT THIS SEEKER\n`;
  context += `Known as: ${user.displayName}`;
  context += `\nConsciousness stage: ${user.currentStage}`;

  if (modalities.length > 0) {
    context += `\nSpiritual modalities: ${modalities.join(", ")}`;
  }
  if (intentions.length > 0) {
    context += `\nIntentions: ${intentions.join(", ")}`;
  }

  const depth = prefs?.contentDepth || "Intermediate";
  if (depth === "Beginner") {
    context += `\nGuidance tone: Gentle explanations with grounded, foundational concepts and actionable steps.`;
  } else if (depth === "Advanced") {
    context += `\nGuidance tone: Esoteric insights, shadow work prompts, and complex cosmic transits.`;
  } else {
    context += `\nGuidance tone: Balanced — accessible yet substantive.`;
  }

  // Add recent milestones
  const recentRecords = user.consciousnessRecords?.slice(0, 3) || [];
  if (recentRecords.length > 0) {
    const milestones = recentRecords
      .filter((r: any) => r.milestone)
      .map((r: any) => r.milestone);
    if (milestones.length > 0) {
      context += `\nRecent breakthroughs: ${milestones.join("; ")}`;
    }
  }

  // Last session context
  const lastSession = user.sessionLogs?.[0];
  if (lastSession) {
    const topics = JSON.parse(lastSession.frequentTopics);
    if (topics.length > 0) {
      context += `\nPrevious session topics: ${topics.join(", ")}`;
    }
    context += `\nPrevious session: ${lastSession.summary}`;
  }

  context += `\n---\n`;
  return context;
}

/**
 * Analyze conversation messages for consciousness stage inference.
 */
export function analyzeConsciousnessStage(messages: { role: string; content: string }[]): {
  stage: string;
  energeticState: string;
  likelyTopics: string[];
  milestone?: string;
} {
  // Count user messages and look for patterns
  const userMessages = messages.filter((m) => m.role === "user");
  const allContent = userMessages.map((m) => m.content.toLowerCase()).join(" ");

  const topics: string[] = [];
  const topicKeywords: Record<string, string[]> = {
    "Shadow work": ["shadow", "inner child", "trauma", "wound", "repressed", "dark side"],
    "Relationships": ["relationship", "partner", "love", "connection", "boundary"],
    "Purpose": ["purpose", "meaning", "mission", "calling", "direction", "lost"],
    "Grief & Loss": ["grief", "loss", "died", "mourning", "sadness", "heavy"],
    "Anxiety": ["anxiety", "anxious", "worry", "fear", "panic", "overthinking"],
    "Meditation": ["meditation", "stillness", "silence", "breathe", "breath", "mindful"],
    "Lunar Cycles": ["moon", "full moon", "new moon", "lunar", "cycle"],
    "Energy": ["energy", "vibration", "frequency", "aura", "chakra", "blocked"],
  };

  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some((k) => allContent.includes(k))) {
      topics.push(topic);
    }
  }

  // Infer stage from language patterns
  let stage = "Seeking";
  let energeticState = "Open and curious";
  let milestone: string | undefined;

  if (
    allContent.includes("shadow") ||
    allContent.includes("trauma") ||
    allContent.includes("inner child")
  ) {
    stage = "Integrating";
    energeticState = "Deep work surfacing — courage present";
  } else if (
    allContent.includes("breakthrough") ||
    allContent.includes("realization") ||
    allContent.includes("suddenly") ||
    allContent.includes("awoke") ||
    allContent.includes("saw clearly")
  ) {
    stage = "Awakening";
    energeticState = "Expanding awareness — moments of clarity";
    milestone = "A moment of expanded awareness or sudden clarity";
  } else if (
    allContent.includes("purpose") ||
    allContent.includes("ground") ||
    allContent.includes("foundation") ||
    allContent.includes("routine") ||
    allContent.includes("practice")
  ) {
    stage = "Grounding";
    energeticState = "Building stability — integrating insights";
  } else if (
    allContent.includes("surrender") ||
    allContent.includes("flow") ||
    allContent.includes("alignment") ||
    allContent.includes("whole") ||
    allContent.includes("integration")
  ) {
    stage = "Aligning";
    energeticState = "Harmonizing — deep resonance with self";
  }

  if (userMessages.length <= 2) {
    stage = "Seeking";
    energeticState = "Beginning exploration — receptive";
  }

  return { stage, energeticState, likelyTopics: topics.slice(0, 5), milestone };
}