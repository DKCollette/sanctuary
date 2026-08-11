import { z } from "zod";

export const chatRequestSchema = z.object({
  message: z
    .string()
    .min(1, "Message is required")
    .max(
      parseInt(process.env.MAX_MESSAGE_LENGTH || "4000"),
      `Message too long (max ${process.env.MAX_MESSAGE_LENGTH || "4000"} characters)`
    ),
  conversationId: z.string().optional(),
  mode: z
    .enum(["balanced", "divine-reflection", "christ-centered", "grounded-clarity", "deep-reflection", "gentle-guidance"])
    .default("balanced"),
});

export const feedbackSchema = z.object({
  messageId: z.string().min(1),
  rating: z.enum(["up", "down"]),
  comment: z.string().max(500).optional(),
});

export const conversationTitleSchema = z.object({
  title: z.string().min(1).max(200),
});

export const conversationDeleteSchema = z.object({
  conversationId: z.string().min(1),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type FeedbackRequest = z.infer<typeof feedbackSchema>;