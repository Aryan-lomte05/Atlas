import express, { Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import { runAgent, type AgentStep } from "../src/lib/agent";
import { runClassicalAgent } from "../src/lib/classicalAgent";
import { AgentTrace } from "../src/lib/models/AgentTrace";
import { SavedItinerary } from "../src/lib/models/SavedItinerary";

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "";

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// MongoDB Connection
if (MONGODB_URI) {
  mongoose
    .connect(MONGODB_URI)
    .then(() => console.log("Atlas Server: Connected to MongoDB Atlas successfully."))
    .catch((err) => console.error("Atlas Server: MongoDB connection error:", err));
} else {
  console.warn("Atlas Server: MONGODB_URI not set. Running in memory-only mode.");
}

// Health Check for Render
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "Atlas Agent Backend",
    mongoStatus: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// GET Recent Traces from MongoDB
app.get("/api/traces", async (req: Request, res: Response) => {
  try {
    const traces = await AgentTrace.find().sort({ createdAt: -1 }).limit(15).lean();
    res.json({ traces });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Database fetch failed";
    res.status(500).json({ error: msg, traces: [] });
  }
});

// POST Agent Execution (SSE Streaming or Classical)
app.post("/api/agent", async (req: Request, res: Response) => {
  const { goal, mode } = req.body;

  if (!goal || typeof goal !== "string") {
    res.status(400).json({ error: "Goal string is required" });
    return;
  }

  // Classical Agent Mode
  if (mode === "classical") {
    const classicalResult = runClassicalAgent(goal);

    try {
      if (mongoose.connection.readyState === 1) {
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
    } catch (e) {
      console.warn("Failed to save classical trace to MongoDB:", e);
    }

    res.json({ type: "complete", result: classicalResult });
    return;
  }

  // Modern Agent Mode: Streaming SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const result = await runAgent(goal, (step: AgentStep) => {
      res.write(`data: ${JSON.stringify(step)}\n\n`);
    });

    res.write(`data: ${JSON.stringify({ type: "complete", result })}\n\n`);

    try {
      if (mongoose.connection.readyState === 1) {
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
    } catch (e) {
      console.warn("Failed to save modern trace to MongoDB:", e);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Agent loop error";
    res.write(`data: ${JSON.stringify({ type: "error", message: msg })}\n\n`);
  } finally {
    res.end();
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Atlas Agent Express Server running on port ${PORT}`);
});
