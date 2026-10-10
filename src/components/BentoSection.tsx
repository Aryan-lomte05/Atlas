"use client";

import {
  Sparkles,
  Zap,
  Terminal,
  Cpu,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  Gauge,
  Compass
} from "lucide-react";

export default function BentoSection() {
  return (
    <section className="relative w-full py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-sky-500/10 border border-sky-500/20 text-sky-400 mb-4">
          <Sparkles size={13} />
          Core Architectural Highlights
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
          Engineered for{" "}
          <span className="bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
            Autonomous Autonomy
          </span>
        </h2>
        <p className="max-w-2xl text-base sm:text-lg text-zinc-400">
          How modern LLMs transcend conversational interfaces to operate as dependable, reasoning agents.
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bento 1: Large Featured Card */}
        <div className="md:col-span-2 rounded-3xl border border-white/10 bg-[#0d0f15] p-8 shadow-2xl relative overflow-hidden group hover:border-sky-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-sky-500/20 transition-all duration-500" />
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div>
              <div className="p-3 w-fit rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-6">
                <Cpu size={24} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Autonomous ReAct Cognitive Loop
              </h3>
              <p className="text-sm text-zinc-300 leading-relaxed max-w-xl mb-6">
                Unlike simple one-shot prompts, Atlas engages in dynamic self-directed reasoning cycles. Each step evaluates user constraints, invokes external tools, inspects observations, and self-corrects before finalizing an itinerary.
              </p>
            </div>

            {/* Code / Visual Box */}
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 font-mono text-xs text-zinc-300 space-y-1.5">
              <div className="text-sky-400 font-bold">&gt; Thought: Need live weather in Tokyo before scheduling outdoor temples.</div>
              <div className="text-amber-300">&gt; Action: weather_forecast(&quot;Tokyo, Japan&quot;)</div>
              <div className="text-emerald-400">&gt; Observation: 19.4 deg C, Clear sunny skies, Rain prob 10%</div>
              <div className="text-purple-300">&gt; Thought: Weather confirmed clear. Now checking flights and central lodging.</div>
            </div>
          </div>
        </div>

        {/* Bento 2: Verifiable Grounding */}
        <div className="rounded-3xl border border-white/10 bg-[#0d0f15] p-8 shadow-2xl relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-300">
          <div className="p-3 w-fit rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-6">
            <Compass size={24} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            Zero-Hallucination Grounding
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6">
            Never invent flight schedules, currency conversion rates, or climate data. Every itinerary calculation is backed by live mathematical and API evaluation.
          </p>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Open-Meteo & Mathjs verification
          </div>
        </div>

        {/* Bento 3: Contextual Memory */}
        <div className="rounded-3xl border border-white/10 bg-[#0d0f15] p-8 shadow-2xl relative overflow-hidden group hover:border-purple-500/30 transition-all duration-300">
          <div className="p-3 w-fit rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-6">
            <Layers size={24} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            Contextual Memory Window
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6">
            Tracks user constraints, group size, budget caps, and historical steps throughout the planning dialogue without forgetting previous details.
          </p>
          <div className="flex items-center gap-2 text-xs font-mono text-purple-400">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            Multi-turn state preservation
          </div>
        </div>

        {/* Bento 4: Wide Metric Strip */}
        <div className="md:col-span-2 rounded-3xl border border-white/10 bg-[#0d0f15] p-8 shadow-2xl relative overflow-hidden group hover:border-teal-500/30 transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="p-3 w-fit rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 mb-4">
                <Gauge size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Sub-Second Step Execution
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-md">
                Combining high-throughput LLM reasoning with parallel tool dispatchers guarantees fluid real-time streaming traces for end-user observability.
              </p>
            </div>
            <div className="flex flex-col gap-3 min-w-[200px]">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <span className="text-xs text-zinc-400">Model Inference</span>
                <span className="text-xs font-mono font-bold text-white">&lt; 380ms</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <span className="text-xs text-zinc-400">Tool API Query</span>
                <span className="text-xs font-mono font-bold text-sky-400">&lt; 180ms</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <span className="text-xs text-zinc-400">SSE Stream Latency</span>
                <span className="text-xs font-mono font-bold text-emerald-400">&lt; 50ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
