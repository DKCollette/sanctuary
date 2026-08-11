export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  selectedMode: string;
  anonymousSessionId?: string;
  messages: Message[];
}

export interface Message {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  model?: string;
  tokenUsage?: number;
  responseLatency?: number;
  feedbackRating?: number;
}

export interface Feedback {
  id: string;
  messageId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface AdminStats {
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