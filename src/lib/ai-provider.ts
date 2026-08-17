import fs from "fs";
import path from "path";

export interface AIProviderConfig {
  provider: string;
  model: string;
  apiKey?: string;
  baseUrl?: string;
  systemPrompt?: string;
}

export interface AIResponse {
  content: string;
  model: string;
  tokenUsage?: number;
  latency?: number;
}

const MODE_INSTRUCTIONS: Record<string, string> = {
  balanced: "Provide balanced guidance that integrates spiritual insight, logic, emotional awareness, responsibility, and practical action.",
  "divine-reflection": "Focus on surrender, attachment, forgiveness, consciousness, peace, and relationship with God. Help the user release control and trust the divine order.",
  "christ-centered": "Offer guidance inspired by the teachings and character of Jesus — compassion, forgiveness, humility, service, love of neighbor, and spiritual transformation. Never impersonate Jesus.",
  "grounded-clarity": "Focus on facts, boundaries, communication, consequences, and practical decisions. Be direct and clear while remaining compassionate.",
  "deep-reflection": "Offer a longer, deeper analysis of beliefs, emotions, assumptions, and life lessons. Explore the root patterns beneath the surface question.",
  "gentle-guidance": "Use exceptionally soft, nurturing, and gentle language. Prioritize emotional safety and comfort. Be especially patient and warm.",
};

function loadSystemPrompt(): string {
  // Cloudflare Workers has no filesystem access — this is a no-op there.
  // The default prompt string is returned in that case.
  try {
    const customPath = process.env.SYSTEM_PROMPT_PATH;
    if (customPath && fs.existsSync(customPath)) {
      return fs.readFileSync(customPath, "utf-8");
    }
    const defaultPath = path.join(process.cwd(), "src", "lib", "system-prompt.txt");
    if (fs.existsSync(defaultPath)) {
      return fs.readFileSync(defaultPath, "utf-8");
    }
  } catch {
    // fs unavailable (e.g. Workers runtime) — fall through to default
  }
  return `You are Sanctuary, an AI-powered enlightened guide. Be calm, compassionate, and wise. Answer the person beneath the question.`;
}

function buildSystemPrompt(mode: string, userContext?: string): string {
  const base = loadSystemPrompt();
  const modeInstruction = MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS.balanced;
  return `${base}\n\nCURRENT GUIDANCE MODE: ${mode}\n\n${modeInstruction}${userContext || ""}`;
}

function getProviderConfig(): AIProviderConfig {
  return {
    provider: process.env.AI_PROVIDER || "openrouter",
    model: process.env.AI_MODEL || "deepseek/deepseek-v4-flash",
    apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY,
    baseUrl: process.env.OLLAMA_BASE_URL || process.env.LM_STUDIO_BASE_URL,
  };
}

export async function generateSanctuaryResponse(
  messages: { role: string; content: string }[],
  mode: string = "balanced",
  userContext?: string,
  options?: { maxTokens?: number }
): Promise<AIResponse> {
  const config = getProviderConfig();
  const systemMsg = { role: "system", content: buildSystemPrompt(mode) };
  const apiMessages = [systemMsg, ...messages];
  const startTime = Date.now();

  const provider = config.provider;
  let apiUrl: string;
  let headers: Record<string, string> = { "Content-Type": "application/json" };
  let body: Record<string, unknown>;

  switch (provider) {
    case "openrouter":
      apiUrl = "https://openrouter.ai/api/v1/chat/completions";
      headers["Authorization"] = `Bearer ${config.apiKey}`;
      headers["HTTP-Referer"] = process.env.APP_URL || "http://localhost:3000";
      headers["X-Title"] = "Sanctuary";
      body = {
        model: config.model,
        messages: apiMessages,
        max_tokens: options?.maxTokens || parseInt(process.env.MAX_OUTPUT_TOKENS || "2048"),
        stream: false,
      };
      break;
    case "openai":
      apiUrl = "https://api.openai.com/v1/chat/completions";
      headers["Authorization"] = `Bearer ${config.apiKey}`;
      body = {
        model: config.model,
        messages: apiMessages,
        max_tokens: options?.maxTokens || parseInt(process.env.MAX_OUTPUT_TOKENS || "2048"),
        stream: false,
      };
      break;
    case "anthropic": {
      apiUrl = "https://api.anthropic.com/v1/messages";
      headers["x-api-key"] = config.apiKey || "";
      headers["anthropic-version"] = "2023-06-01";
      const resp = await fetch(apiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: config.model,
          system: systemMsg.content,
          messages: messages.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
          max_tokens: options?.maxTokens || parseInt(process.env.MAX_OUTPUT_TOKENS || "2048"),
          stream: false,
        }),
      });
      if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(`Anthropic error (${resp.status}): ${errorText}`);
      }
      const data = await resp.json();
      const latency = Date.now() - startTime;
      const content = data.content?.[0]?.text || "";
      return { content, model: config.model, tokenUsage: undefined, latency };
    }
    case "ollama":
    case "lmstudio":
      apiUrl = `${config.baseUrl || "http://localhost:11434"}/v1/chat/completions`;
      body = {
        model: config.model,
        messages: apiMessages,
        max_tokens: options?.maxTokens || parseInt(process.env.MAX_OUTPUT_TOKENS || "2048"),
        stream: false,
      };
      break;
    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }

  const response = await fetch(apiUrl!, {
    method: "POST",
    headers,
    body: JSON.stringify(body!),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI provider error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const latency = Date.now() - startTime;
  const content = data.choices?.[0]?.message?.content || data.content?.[0]?.text || "";
  const tokenUsage = data.usage?.total_tokens || data.usage?.output_tokens;

  return { content, model: config.model, tokenUsage, latency };
}

export async function* streamSanctuaryResponse(
  messages: { role: string; content: string }[],
  mode: string = "balanced",
  userContext?: string,
  options?: { maxTokens?: number }
): AsyncGenerator<string, AIResponse, unknown> {
  const config = getProviderConfig();
  const systemMsg = { role: "system", content: buildSystemPrompt(mode, userContext) };
  const apiMessages = [systemMsg, ...messages];
  const startTime = Date.now();
  let fullContent = "";

  const provider = config.provider;

  // Handle Anthropic separately (different streaming format)
  if (provider === "anthropic") {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey || "",
      "anthropic-version": "2023-06-01",
    };
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: config.model,
        system: systemMsg.content,
        messages: messages.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
        max_tokens: options?.maxTokens || parseInt(process.env.MAX_OUTPUT_TOKENS || "2048"),
        stream: true,
      }),
    });
    if (!resp.ok) {
      const errorText = await resp.text();
      throw new Error(`Anthropic error (${resp.status}): ${errorText}`);
    }
    const reader = resp.body?.getReader();
    if (!reader) throw new Error("No response body");
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split("\n")) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.delta?.text || parsed.content_block?.text || "";
            if (delta) {
              fullContent += delta;
              yield delta;
            }
          } catch { /* skip parse errors */ }
        }
      }
    }
    return { content: fullContent, model: config.model, latency: Date.now() - startTime };
  }

  // OpenAI-compatible streaming (OpenRouter, OpenAI, Ollama, LM Studio)
  let apiUrl: string;
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  switch (provider) {
    case "openrouter":
      apiUrl = "https://openrouter.ai/api/v1/chat/completions";
      headers["Authorization"] = `Bearer ${config.apiKey}`;
      headers["HTTP-Referer"] = process.env.APP_URL || "http://localhost:3000";
      headers["X-Title"] = "Sanctuary";
      break;
    case "openai":
      apiUrl = "https://api.openai.com/v1/chat/completions";
      headers["Authorization"] = `Bearer ${config.apiKey}`;
      break;
    case "ollama":
      apiUrl = `${config.baseUrl || "http://localhost:11434"}/v1/chat/completions`;
      break;
    case "lmstudio":
      apiUrl = `${config.baseUrl || "http://localhost:1234"}/v1/chat/completions`;
      break;
    default:
      throw new Error(`Unknown AI provider for streaming: ${provider}`);
  }

  const response = await fetch(apiUrl!, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: config.model,
      messages: apiMessages,
      max_tokens: options?.maxTokens || parseInt(process.env.MAX_OUTPUT_TOKENS || "2048"),
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI provider error (${response.status}): ${errorText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    for (const line of chunk.split("\n")) {
      if (line.startsWith("data: ")) {
        const dataStr = line.slice(6).trim();
        if (!dataStr || dataStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(dataStr);
          const delta = parsed.choices?.[0]?.delta?.content || parsed.choices?.[0]?.text || "";
          if (delta) {
            fullContent += delta;
            yield delta;
          }
        } catch { /* skip parse errors */ }
      }
    }
  }

  const latency = Date.now() - startTime;
  return { content: fullContent, model: config.model, latency };
}