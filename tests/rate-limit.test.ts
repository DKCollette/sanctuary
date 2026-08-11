import { describe, it, expect } from "vitest";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";

describe("rate-limit", () => {
  it("allows first request", () => {
    const key = getRateLimitKey("127.0.0.1", "test");
    const result = checkRateLimit(key);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBeGreaterThanOrEqual(0);
  });

  it("returns rate limit key", () => {
    const key = getRateLimitKey("192.168.1.1", "chat");
    expect(key).toBeTruthy();
    expect(typeof key).toBe("string");
    expect(key.length).toBe(64); // sha256 hex
  });

  it("provides reset timestamp", () => {
    const key = getRateLimitKey("10.0.0.1", "test");
    const result = checkRateLimit(key);
    expect(result.resetAt).toBeGreaterThan(Date.now());
  });
});