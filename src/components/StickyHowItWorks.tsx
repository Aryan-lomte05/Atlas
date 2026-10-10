"use client";

import { useState } from "react";
import { ListFilter, BrainCircuit, Terminal, RefreshCw, FileCheck2, ArrowRight } from "lucide-react";

const STEPS = [
  {
    step: "01",
    tag: "INGESTION",
    title: "Declare Travel Goal & Constraints",
    desc: "The traveler provides destinations, party size, budget limit, and travel dates. Atlas parses explicit and implicit constraints into its context memory window.",
    icon: <ListFilter size={20} />,
    color: "sky",
    codeSnippet: 'Goal: "5-day trip to Tokyo in spring under $1600 with Shinjuku lodging and live weather check."',
  },
  {
    step: "02",
    tag: "COGNITION",
    title: "Autonomous ReAct Reasoning",
    desc: "Rather than guessing answers, the model reasons: 'What information do I lack?'. It formulates hypotheses and sequences required external tools.",
    icon: <BrainCircuit size={20} />,
    color: "purple",
    codeSnippet: 'Thought: "Before scheduling outdoor shrines, I must query real-time rainfall data in Tokyo."',
  },
  {
    step: "03",
    tag: "EXECUTION",
    title: "Tool Dispatch to Real-World APIs",
    desc: "Atlas invokes specialized REST endpoints: Open-Meteo for live meteorology, flight corridor databases, lodging registries, and mathjs calculators.",
    icon: <Terminal size={20} />,
    color: "amber",
    codeSnippet: 'Action: weather_forecast("Tokyo, Japan")\nAction: flight_finder("Tokyo round-trip economy")',
  },
  {
    step: "04",
    tag: "REFLECTION",
    title: "Environmental Observation Feedback",
    desc: "Live tool returns are ingested back into the agent context. If adverse weather or high costs are detected, Atlas self-corrects the plan dynamically.",
    icon: <RefreshCw size={20} />,
    color: "emerald",
    codeSnippet: 'Observation: "19.4 deg C, Clear sunny skies, Rain prob 10%." -> Proceed with outdoor parks on Day 2.',
  },
  {
    step: "05",
    tag: "SYNTHESIS",
    title: "Itemized Audit & Final Schedule",
    desc: "Atlas evaluates the full mathematical budget formula, formats a day-by-day itinerary, and saves the verified trace to MongoDB Atlas.",
    icon: <FileCheck2 size={20} />,
    color: "rose",
    codeSnippet: 'Total Calculated: $1,660 USD (~Rs. 139,440 INR)\nTrace saved to MongoDB: ID #6708b1a4f',
  },
];

export default function StickyHowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="relative w-full py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-sky-500/10 border border-sky-500/20 text-sky-400 mb-4">
          <Terminal size={13} />
          Step-by-Step Workflow
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
          How Atlas <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">Orchestrates Intelligence</span>
        </h2>
        <p className="max-w-2xl text-base sm:text-lg text-zinc-400">
          The inner mechanics of autonomous multi-step reasoning, tool dispatch, and verification.
        </p>
      </div>

      {/* Grid of Steps */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Navigation Column */}
        <div className="md:col-span-5 space-y-3">
          {STEPS.map((s, idx) => {
            const isSelected = activeStep === idx;
            return (
              <div
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "bg-sky-500/10 border-sky-500/50 shadow-lg shadow-sky-500/10"
                    : "bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-mono font-bold ${isSelected ? "text-sky-400" : "text-zinc-500"}`}>
                    STAGE {s.step}
                  </span>
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-white/5 text-zinc-400">
                    {s.tag}
                  </span>
                </div>
                <h4 className={`text-base font-bold ${isSelected ? "text-white" : "text-zinc-300"}`}>
                  {s.title}
                </h4>
              </div>
            );
          })}
        </div>

        {/* Step Preview Pane */}
        <div className="md:col-span-7 rounded-3xl border border-white/10 bg-[#0d0f15] p-8 shadow-2xl relative overflow-hidden sticky top-28">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              {STEPS[activeStep].icon}
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-sky-400">
                PHASE {STEPS[activeStep].step}
              </span>
              <h3 className="text-xl font-bold text-white">
                {STEPS[activeStep].title}
              </h3>
            </div>
          </div>

          <p className="text-sm text-zinc-300 leading-relaxed mb-6">
            {STEPS[activeStep].desc}
          </p>

          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
              Live Trace Segment:
            </span>
            <div className="p-4 rounded-2xl bg-black/70 border border-white/10 font-mono text-xs text-sky-300 whitespace-pre-wrap leading-relaxed">
              {STEPS[activeStep].codeSnippet}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
