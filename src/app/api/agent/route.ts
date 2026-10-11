import { runAgent, type AgentStep } from "@/lib/agent";
import { runClassicalAgent } from "@/lib/classicalAgent";
import { connectToDatabase } from "@/lib/db";
import { AgentTrace } from "@/lib/models/AgentTrace";
import { NextRequest } from "next/server";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { goal, mode, history } = await req.json();

    // Prior turns, flattened into a short context block. Trimmed because a
    // long conversation would otherwise crowd out the live scratchpad.
    const priorContext = Array.isArray(history)
      ? history
          .slice(-4)
          .map((h: { goal?: string; answer?: string }) => {
            const answer = (h.answer ?? "").slice(0, 1200);
            return `Traveller asked: ${h.goal ?? ""}\nYou answered: ${answer}`;
          })
          .join("\n\n")
          .slice(0, 5000)
      : undefined;

    if (!goal || typeof goal !== "string") {
      return new Response(JSON.stringify({ error: "Goal is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Classical Agent Mode
    if (mode === "classical") {
      const classicalResult = runClassicalAgent(goal);

      // Attempt async log persistence to MongoDB
      try {
        await connectToDatabase();
        if (AgentTrace) {
          await AgentTrace.create({
            goal: classicalResult.goal,
            agentType: classicalResult.agentType,
            steps: classicalResult.steps.map((s) => ({
              type: s.type,
              content: `${s.ruleName}: ${s.content}`,
              timestamp: s.timestamp,
            })),
            finalAnswer: classicalResult.finalAnswer,
            totalSteps: classicalResult.steps.length,
            toolsUsed: [],
            duration: classicalResult.duration,
          });
        }
      } catch (dbErr) {
        console.warn("MongoDB log persistence skipped:", dbErr);
      }

      return new Response(JSON.stringify({ type: "complete", result: classicalResult }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Modern ReAct Agent Streaming SSE
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const result = await runAgent(
            goal,
            (step: AgentStep) => {
              const data = `data: ${JSON.stringify(step)}\n\n`;
              controller.enqueue(encoder.encode(data));
            },
            priorContext || undefined,
          );

          // Send final completion packet
          const finalData = `data: ${JSON.stringify({ type: "complete", result })}\n\n`;
          controller.enqueue(encoder.encode(finalData));

          // Attempt async trace persistence to MongoDB
          try {
            await connectToDatabase();
            if (AgentTrace) {
              await AgentTrace.create({
                goal: result.goal,
                agentType: result.agentType,
                steps: result.steps.map((s) => ({
                  type: s.type,
                  content: s.content,
                  tool: s.tool,
                  toolInput: s.toolInput,
                  timestamp: s.timestamp,
                })),
                finalAnswer: result.finalAnswer,
                totalSteps: result.totalSteps,
                toolsUsed: result.toolsUsed,
                duration: result.duration,
              });
            }
          } catch (dbErr) {
            console.warn("MongoDB trace persistence skipped:", dbErr);
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Unknown execution error";
          const errData = `data: ${JSON.stringify({ type: "error", message: msg })}\n\n`;
          controller.enqueue(encoder.encode(errData));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
