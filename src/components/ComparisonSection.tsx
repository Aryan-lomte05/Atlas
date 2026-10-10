"use client";

import { Check, X, Layers, Cpu, AlertCircle, Sparkles } from "lucide-react";

interface ComparisonRow {
  dimension: string;
  syllabusCategory: string;
  classical: {
    title: string;
    description: string;
    supported: boolean;
  };
  modern: {
    title: string;
    description: string;
    supported: boolean;
  };
}

const COMPARISON_DATA: ComparisonRow[] = [
  {
    dimension: "Core Paradigm",
    syllabusCategory: "Decision Engine",
    classical: {
      title: "Deterministic Rule-Based",
      description: "Hard-coded if/else heuristics and keyword lookup tables.",
      supported: false,
    },
    modern: {
      title: "LLM-Driven Autonomous",
      description: "Probabilistic reasoning and dynamic goal decomposition via Llama 3.3.",
      supported: true,
    },
  },
  {
    dimension: "Planning Strategy",
    syllabusCategory: "Execution Architecture",
    classical: {
      title: "Static Logic Pipeline",
      description: "Fixed execution path. Cannot alter course based on new data.",
      supported: false,
    },
    modern: {
      title: "Dynamic ReAct Planning",
      description: "Iterative Thought-Action-Observation loop that adapts to live tool results.",
      supported: true,
    },
  },
  {
    dimension: "Memory Architecture",
    syllabusCategory: "Context Retention",
    classical: {
      title: "Stateless (No Memory)",
      description: "Each evaluation cycle is independent with zero context history.",
      supported: false,
    },
    modern: {
      title: "Contextual Working Memory",
      description: "Maintains multi-turn history buffer across observations and decisions.",
      supported: true,
    },
  },
  {
    dimension: "Reasoning Depth",
    syllabusCategory: "Problem Solving",
    classical: {
      title: "Single-Step Lookup",
      description: "Direct mapping from keyword trigger to prewritten template.",
      supported: false,
    },
    modern: {
      title: "Multi-Step ReAct Reasoning",
      description: "Chains multiple inferences, verifies intermediate states, and self-corrects.",
      supported: true,
    },
  },
  {
    dimension: "Tool Integration",
    syllabusCategory: "External Grounding",
    classical: {
      title: "Zero Tool Interactivity",
      description: "Limited to static hard-coded database values; no external API calls.",
      supported: false,
    },
    modern: {
      title: "Autonomous Tool Orchestration",
      description: "Dynamically selects and calls 6 live tools (weather, flights, hotels, math).",
      supported: true,
    },
  },
  {
    dimension: "Handling Novel Constraints",
    syllabusCategory: "Robustness",
    classical: {
      title: "Fragile (Crashes / Fallback)",
      description: "Fails when user queries uncataloged cities or compound constraints.",
      supported: false,
    },
    modern: {
      title: "Contextual Generalization",
      description: "Seamlessly handles uncataloged destinations, dietary rules, and budgets.",
      supported: true,
    },
  },
];

export default function ComparisonSection() {
  return (
    <section id="comparison" className="relative w-full py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-4">
          <Layers size={13} />
          Part C: Analysis & Syllabus Comparison
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
          Classical Agents vs{" "}
          <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            Modern Agentic Systems
          </span>
        </h2>
        <p className="max-w-2xl text-base sm:text-lg text-zinc-400">
          Rigorous academic comparison between syllabus rule-based architectures and modern LLM-driven agentic systems.
        </p>
      </div>

      {/* Comparison Table */}
      <div className="rounded-2xl border border-white/10 bg-[#0d0f15]/90 backdrop-blur-xl shadow-2xl overflow-hidden mb-12">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-bold uppercase tracking-wider text-zinc-400">
                <th className="py-4 px-6 w-1/4">Evaluation Dimension</th>
                <th className="py-4 px-6 w-3/8 text-amber-400 bg-amber-500/[0.02]">
                  Classical Agent (Syllabus)
                </th>
                <th className="py-4 px-6 w-3/8 text-sky-400 bg-sky-500/[0.02]">
                  Modern Agent: Atlas (This Activity)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {COMPARISON_DATA.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6 font-semibold text-white">
                    <div className="flex flex-col">
                      <span>{row.dimension}</span>
                      <span className="text-[11px] font-normal text-zinc-500">
                        {row.syllabusCategory}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 bg-amber-500/[0.01]">
                    <div className="flex items-start gap-2.5">
                      <div className="p-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 mt-0.5">
                        <X size={13} />
                      </div>
                      <div>
                        <div className="font-bold text-zinc-200">{row.classical.title}</div>
                        <div className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                          {row.classical.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 bg-sky-500/[0.01]">
                    <div className="flex items-start gap-2.5">
                      <div className="p-1 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 mt-0.5">
                        <Check size={13} />
                      </div>
                      <div>
                        <div className="font-bold text-sky-300">{row.modern.title}</div>
                        <div className="text-xs text-zinc-300 mt-0.5 leading-relaxed">
                          {row.modern.description}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quantitative Empirical Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] text-center">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
            Constraint Satisfaction
          </div>
          <div className="text-2xl font-black text-white">
            18% <span className="text-xs font-normal text-zinc-500">vs</span> <span className="text-sky-400">96%</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Classical vs Atlas Modern</div>
        </div>

        <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] text-center">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
            Dynamic Tool Calls
          </div>
          <div className="text-2xl font-black text-white">
            0 <span className="text-xs font-normal text-zinc-500">vs</span> <span className="text-sky-400">6 Tools</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Real-time API capability</div>
        </div>

        <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] text-center">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
            Contextual Memory Window
          </div>
          <div className="text-2xl font-black text-white">
            0 <span className="text-xs font-normal text-zinc-500">vs</span> <span className="text-sky-400">8k tokens</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Multi-turn reflection</div>
        </div>

        <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] text-center">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
            Recovery from Errors
          </div>
          <div className="text-2xl font-black text-white">
            Static Fail <span className="text-xs font-normal text-zinc-500">vs</span> <span className="text-emerald-400">Self-Heal</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Observation-driven loop</div>
        </div>
      </div>
    </section>
  );
}
