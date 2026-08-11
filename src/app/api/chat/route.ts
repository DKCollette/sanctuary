import { NextRequest, NextResponse } from "next/server";
import { chatRequestSchema } from "@/lib/validation";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { streamSanctuaryResponse } from "@/lib/ai-provider";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { getTokenUser } from "@/lib/auth-middleware";
import { buildProfileContext, analyzeConsciousnessStage, recordConsciousnessReading, recordSessionLog } from "@/lib/profile";

const MAX_CONTEXT = parseInt(process.env.MAX_CONTEXT_MESSAGES || "20");

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const rateKey = getRateLimitKey(ip, "chat");
    const rateCheck = checkRateLimit(rateKey);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait before sending another message." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)),
          },
        }
      );
    }

    const body = await request.json();
    const parsed = chatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid request" },
        { status: 400 }
      );
    }

    const { message, conversationId, mode } = parsed.data;

    // Get user profile context for personalized guidance
    const user = await getTokenUser(request);
    const profileContext = user ? buildProfileContext(user) : undefined;
    let userId = user?.id;

    // Build message history
    let conversation: any = null;
    let messages: { role: string; content: string }[] = [];
    const sessionId = body.sessionId || "anonymous";

    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { messages: { orderBy: { createdAt: "asc" }, take: MAX_CONTEXT * 2 } },
      });

      if (conversation) {
        messages = conversation.messages.map((m: any) => ({
          role: m.role,
          content: m.content,
        }));
      }
    }

    // Add current message
    messages.push({ role: "user", content: message });

    // Truncate context to max
    if (messages.length > MAX_CONTEXT * 2) {
      messages = messages.slice(messages.length - MAX_CONTEXT * 2);
    }

    // Create or get conversation
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          title: message.slice(0, 80),
          selectedMode: mode,
          anonymousSessionId: sessionId,
          userId: userId || null,
        },
      });
    } else {
      conversation = await prisma.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() },
      });
    }

    // Save user message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: message,
      },
    });

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let controllerClosed = false;
        const safeEnqueue = (chunk: Uint8Array) => {
          if (!controllerClosed) {
            try {
              controller.enqueue(chunk);
            } catch {
              controllerClosed = true;
            }
          }
        };
        const safeClose = () => {
          if (!controllerClosed) {
            try {
              controller.close();
            } catch {
              // already closed
            }
            controllerClosed = true;
          }
        };
        try {
          let fullContent = "";
          let narrativeSentLength = 0;
          let stateDataReached = false;

          for await (const token of streamSanctuaryResponse(messages, mode, profileContext)) {
            fullContent += token;

            if (!stateDataReached) {
              // Check for the start of the state_data marker at any position
              const stateDataIndex = fullContent.search(/<state/i);
              if (stateDataIndex >= 0) {
                stateDataReached = true;
                // Send only the narrative portion before the state_data marker
                const narrativeText = fullContent.substring(0, stateDataIndex);
                const remainingNarrative = narrativeText.substring(narrativeSentLength);
                if (remainingNarrative) {
                  const data = JSON.stringify({ token: remainingNarrative, conversationId: conversation.id });
                  safeEnqueue(encoder.encode(`data: ${data}\n\n`));
                }
                narrativeSentLength = narrativeText.length;
              } else {
                // No state_data marker yet — send the token normally
                narrativeSentLength += token.length;
                const data = JSON.stringify({ token, conversationId: conversation.id });
                safeEnqueue(encoder.encode(`data: ${data}\n\n`));
              }
            }
            // Once stateDataReached, we silently accumulate tokens for parsing
          }

          // Save assistant message
          const latency = Date.now() - startTime;

          // Strip <state_data> block from content before saving, parse it
          let stateData: any = null;
          let cleanContent = fullContent;
          const stateMatch = fullContent.match(/<state_data>([\s\S]*?)<\/state_data>/);
          if (stateMatch) {
            try {
              stateData = JSON.parse(stateMatch[1].trim());
              cleanContent = fullContent.replace(/<state_data>[\s\S]*?<\/state_data>/, "").trim();
            } catch (e) {
              logger.warn("Failed to parse state_data JSON", { error: String(e), snippet: stateMatch[1].slice(0, 100) });
            }
          } else {
            logger.warn("No <state_data> found in response", { length: fullContent.length, snippet: fullContent.slice(-200) });
          }

          // If no state data from AI, generate fallback from analysis
          if (!stateData) {
            const diagnosis = analyzeConsciousnessStage([
              { role: "user", content: message },
              { role: "assistant", content: fullContent },
            ]);
            // Map Hawkins stage to a consciousness level
            const stageLevels: Record<string, number> = {
              Seeking: 175, Grounding: 250, Awakening: 310,
              Integrating: 350, Aligning: 500,
            };
            const cl = stageLevels[diagnosis.stage] || 200;
            const tier =
              cl <= 50 ? "The Seeker" :
              cl <= 175 ? "The Voyager" :
              cl <= 310 ? "The Awakening" :
              cl <= 400 ? "The Courageous" :
              cl <= 540 ? "The Loving" :
              cl <= 699 ? "The Radiant" : "The Sage";
            const element = diagnosis.stage === "Seeking" ? "Earth" : diagnosis.stage === "Grounding" ? "Earth" : diagnosis.stage === "Awakening" ? "Air" : diagnosis.stage === "Integrating" ? "Water" : "Ether";
            stateData = {
              avatar: {
                tier,
                consciousness_level: cl,
                xp_gained: 30,
                current_element: element,
                aura_color: "#8B5CF6",
              },
              chakras: [
                { name: "Root", sanskrit: "Muladhara", status: "balanced", intensity_percent: 70, recommended_crystals: ["Red Jasper", "Smoky Quartz"], action_practice: "Walk barefoot on grass for 5 minutes." },
                { name: "Sacral", sanskrit: "Svadhisthana", status: "balanced", intensity_percent: 60, recommended_crystals: ["Carnelian", "Moonstone"], action_practice: "Gently sway your hips side to side as you breathe." },
                { name: "Solar Plexus", sanskrit: "Manipura", status: "balanced", intensity_percent: 65, recommended_crystals: ["Citrine", "Tiger's Eye"], action_practice: "Place your hands on your belly and breathe deeply." },
                { name: "Heart", sanskrit: "Anahata", status: "balanced", intensity_percent: 70, recommended_crystals: ["Rose Quartz", "Green Aventurine"], action_practice: "Hold a hand over your heart and breathe warmth into it." },
                { name: "Throat", sanskrit: "Vishuddha", status: "balanced", intensity_percent: 60, recommended_crystals: ["Aquamarine", "Lapis Lazuli"], action_practice: "Hum softly for 30 seconds." },
                { name: "Third Eye", sanskrit: "Ajna", status: "balanced", intensity_percent: 55, recommended_crystals: ["Amethyst", "Sodalite"], action_practice: "Close your eyes and gaze softly at the space between your brows." },
                { name: "Crown", sanskrit: "Sahasrara", status: "balanced", intensity_percent: 50, recommended_crystals: ["Clear Quartz", "Selenite"], action_practice: "Sit in stillness for 2 minutes." },
              ],
              reflection_prompt: "What would it feel like to trust where you are right now?",
            };
          }

          const savedMsg = await prisma.message.create({
            data: {
              conversationId: conversation.id,
              role: "assistant",
              content: cleanContent,
              model: process.env.AI_MODEL || "openrouter",
              responseLatency: latency,
            },
          });

          // Send completion with message ID
          const doneData = JSON.stringify({
            done: true,
            messageId: savedMsg.id,
            conversationId: conversation.id,
            stateData: stateData,
          });
          safeEnqueue(encoder.encode(`data: ${doneData}\n\n`));
          safeEnqueue(encoder.encode("data: [DONE]\n\n"));
          safeClose();

          // Consciousness tracking for logged-in users
          if (userId) {
            const existingMessages = conversation
              ? (conversation as any).messages?.map?.((m: any) => ({ role: m.role, content: m.content })) || []
              : [];
            const allMessages = [
              ...existingMessages,
              { role: "user", content: message },
              { role: "assistant", content: fullContent },
            ];
            
            const diagnosis = analyzeConsciousnessStage(allMessages);
            await recordConsciousnessReading(userId, {
              stage: diagnosis.stage,
              energeticState: diagnosis.energeticState,
              sessionSummary: `Conversation about: ${message.slice(0, 80)}`,
              milestone: diagnosis.milestone,
              stateData: stateData,
            });
            await recordSessionLog(userId, {
              summary: `Explored: ${message.slice(0, 120)}`,
              frequentTopics: diagnosis.likelyTopics,
              messageCount: allMessages.length,
            });
          }

          logger.info("Chat response completed", {
            conversationId: conversation.id,
            latency,
            messageLength: fullContent.length,
          });
        } catch (err) {
          logger.error("Streaming error", err);
          const errorData = JSON.stringify({ error: "Failed to generate response" });
          safeEnqueue(encoder.encode(`data: ${errorData}\n\n`));
          safeEnqueue(encoder.encode("data: [DONE]\n\n"));
          safeClose();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    logger.error("Chat API error", err);
    return NextResponse.json({ error: "An internal error occurred" }, { status: 500 });
  }
}