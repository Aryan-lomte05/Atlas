import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAgentTrace extends Document {
  goal: string;
  agentType: string;
  steps: Array<{
    type: string;
    content: string;
    tool?: string;
    toolInput?: string;
    timestamp: number;
  }>;
  finalAnswer: string;
  totalSteps: number;
  toolsUsed: string[];
  duration: number;
  createdAt: Date;
}

const AgentTraceSchema = new Schema<IAgentTrace>(
  {
    goal: { type: String, required: true },
    agentType: { type: String, default: "Modern Agent (ReAct LLM)" },
    steps: [
      {
        type: { type: String, required: true },
        content: { type: String, required: true },
        tool: { type: String },
        toolInput: { type: String },
        timestamp: { type: Number },
      },
    ],
    finalAnswer: { type: String, required: true },
    totalSteps: { type: Number, default: 0 },
    toolsUsed: [{ type: String }],
    duration: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const AgentTrace: Model<IAgentTrace> =
  mongoose.models.AgentTrace || mongoose.model<IAgentTrace>("AgentTrace", AgentTraceSchema);
