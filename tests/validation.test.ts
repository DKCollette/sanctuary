import { describe, it, expect } from "vitest";
import { chatRequestSchema, feedbackSchema } from "@/lib/validation";

describe("chatRequestSchema", () => {
  it("accepts valid chat request", () => {
    const result = chatRequestSchema.safeParse({
      message: "Hello, I need guidance",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty message", () => {
    const result = chatRequestSchema.safeParse({ message: "" });
    expect(result.success).toBe(false);
  });

  it("rejects message over max length", () => {
    const longMsg = "a".repeat(4001);
    const result = chatRequestSchema.safeParse({ message: longMsg });
    expect(result.success).toBe(false);
  });

  it("defaults mode to balanced", () => {
    const result = chatRequestSchema.safeParse({ message: "Hello" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.mode).toBe("balanced");
    }
  });

  it("accepts valid mode", () => {
    const result = chatRequestSchema.safeParse({
      message: "Hello",
      mode: "divine-reflection",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid mode", () => {
    const result = chatRequestSchema.safeParse({
      message: "Hello",
      mode: "invalid-mode",
    });
    expect(result.success).toBe(false);
  });
});

describe("feedbackSchema", () => {
  it("accepts valid feedback", () => {
    const result = feedbackSchema.safeParse({
      messageId: "abc123",
      rating: "up",
    });
    expect(result.success).toBe(true);
  });

  it("accepts feedback with comment", () => {
    const result = feedbackSchema.safeParse({
      messageId: "abc123",
      rating: "down",
      comment: "Not what I needed",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing messageId", () => {
    const result = feedbackSchema.safeParse({ rating: "up" });
    expect(result.success).toBe(false);
  });
});