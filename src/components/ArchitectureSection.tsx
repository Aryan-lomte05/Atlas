"use client";

import { useState } from "react";
import {
  Brain,
  Cpu,
  Layers,
  ArrowRight,
  Database,
  RefreshCw,
  CheckCircle2,
  GitBranch,
  Terminal,
  Eye,
  FileCheck
} from "lucide-react";

interface FlowStep {
  id: string;
  number: string;
  title: string;
  role: string;
  description: string;
  technicalDetails: string;
}

const FLOW_STEPS: FlowStep[] = [
  {
    id: "goal",
    number: "01",
    title: "Travel Goal Ingestion",
    role: "User Prompt & Constraints",
    description: "The user submits high-level travel goals, time horizons, budgets, and personal preferences.",
    technicalDetails: "Tokenized and validated against agent safety guardrails. Preloaded into the working conversation memory window.",
  },
  {
    id: "thought",
    number: "02",
    title: "ReAct Reasoning (Thought)",
    role: "LLM Cognitive Decomposition",
    description: "The LLM analyzes missing variables (weather, costs, flights, hotels) and formulates the next rational sub-task.",
    technicalDetails: "Zero-shot chain-of-thought with explicit goal tracking. Employs Llama 3.3 70B via high-throughput inference.",
  },
  {
    id: "action",
    number: "03",
    title: "Tool Dispatch (Action)",
    role: "Autonomous Tool Selection",
    description: "The agent decides which specific external tool to invoke and produces strictly formatted input arguments.",
    technicalDetails: "Deterministic regex parser verifies action against known registry: [weather, flight, hotel, budget, attractions, visa].",
  },
  {
    id: "observation",
    number: "04",
    title: "Environmental Grounding",
    role: "Live API Execution",
    description: "Real-world tools query external REST endpoints (Open-Meteo, Wikipedia, mathjs) and capture actual data.",
    technicalDetails: "Handles network latency, JSON payload parsing, and standardizes responses into human-readable observation text.",
  },
  {
    id: "reflection",
    number: "05",
    title: "Contextual Reflection",
    role: "Working Memory Integration",
    description: "The observation is appended to the dialogue context, allowing the agent to refine or correct its strategy.",
    technicalDetails: "Contextual memory buffer keeps track of prior tool returns, avoiding redundant queries and detecting conflicts.",
  },
  {
    id: "synthesis",
    number: "06",
    title: "Final Itinerary Synthesis",
    role: "Output Generation",
    description: "Once all essential dimensions are grounded, the agent compiles an itemized, realistic schedule and budget.",
    technicalDetails: "Structured markdown synthesis containing day-by-day itineraries, flight schedules, hotel tiers, and emergency protocols.",
  },
];

export default function ArchitectureSection() {
  const [activeStep, setActiveStep] = useState<FlowStep>(FLOW_STEPS[1]);

  return (
    <section id="architecture" className="relative w-full py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-sky-500/10 border border-sky-500/20 text-sky-400 mb-4">
          <GitBranch size={13} />
          Part A & B: System Architecture
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
          The <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">ReAct Agent Flow</span>
        </h2>
        <p className="max-w-2xl text-base sm:text-lg text-zinc-400">
          Observable multi-step reasoning cycle: User Goal -&gt; Agent Reasoning -&gt; Tool Call -&gt; Observation -&gt; Next Action -&gt; Final Answer.
        </p>
      </div>

      {/* Interactive Flow Stepper */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 sm:gap-3 mb-10">
        {FLOW_STEPS.map((step) => {
          const isActive = activeStep.id === step.id;
          return (
            <button
              key={step.id}
              onClick={() => setActiveStep(step)}
              className={`p-3.5 sm:p-4 rounded-xl text-left border transition-all duration-200 ${
                isActive
                  ? "bg-sky-500/10 border-sky-500/60 shadow-lg shadow-sky-500/10"
                  : "bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-mono font-bold ${isActive ? "text-sky-400" : "text-zinc-500"}`}>
                  {step.number}
                </span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />}
              </div>
              <h4 className={`text-xs sm:text-sm font-bold ${isActive ? "text-white" : "text-zinc-300"}`}>
                {step.title}
              </h4>
            </button>
          );
        })}
      </div>

      {/* Active Step Deep Dive Card */}
      <div className="rounded-2xl border border-white/10 bg-[#0d0f15] p-6 sm:p-8 shadow-2xl relative overflow-hidden mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-sm font-mono font-bold text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded border border-sky-500/20">
                STAGE {activeStep.number}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white">{activeStep.title}</h3>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400">{activeStep.role}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 w-fit">
            <CheckCircle2 size={14} />
            Autonomous Execution Verified
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Behavioral Functionality
            </h5>
            <p className="text-sm text-zinc-200 leading-relaxed">
              {activeStep.description}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 font-mono">
            <h5 className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-2">
              Technical Implementation
            </h5>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {activeStep.technicalDetails}
            </p>
          </div>
        </div>
      </div>

      {/* Architecture Spec Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="p-2.5 w-fit rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-3">
            <Brain size={20} />
          </div>
          <h4 className="text-base font-bold text-white mb-1">Planning Strategy</h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            ReAct (Reasoning + Acting) loop. The agent reasons before each tool invocation and observes feedback before planning the next step.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="p-2.5 w-fit rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-3">
            <Database size={20} />
          </div>
          <h4 className="text-base font-bold text-white mb-1">Memory Model</h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Short-term contextual working memory. Preserves prior thoughts, actions, and observations across up to 8 reasoning cycles.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="p-2.5 w-fit rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
            <Cpu size={20} />
          </div>
          <h4 className="text-base font-bold text-white mb-1">LLM Foundation</h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Llama 3.3 70B Versatile. Chosen for deterministic instruction following, strict structured outputs, and sub-second inference speeds.
          </p>
        </div>
      </div>
    </section>
  );
}
