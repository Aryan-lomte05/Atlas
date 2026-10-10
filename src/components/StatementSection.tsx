"use client";

import { Sparkles, ArrowRight } from "lucide-react";

export default function StatementSection() {
  return (
    <section className="relative w-full py-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-sky-500/10 border border-sky-500/20 text-sky-400 mb-8">
        <Sparkles size={13} />
        The Paradigm Shift
      </div>

      <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight sm:leading-snug tracking-tight mb-8">
        Planning trips across 20 browser tabs is broken.{" "}
        <span className="text-zinc-500 font-medium">
          Atlas replaces fragmented tab switching with an autonomous reasoning engine that
        </span>{" "}
        <span className="bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
          verifies real-world weather, audits flight corridors, matches curated lodging, and balances itemized budgets in seconds.
        </span>
      </h2>

      <div className="flex flex-wrap items-center justify-center gap-8 text-xs font-mono text-zinc-400 pt-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          Zero Hallucinated Rates
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-sky-400" />
          Real-Time Open-Meteo Grounding
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-400" />
          Full SSE Observable Traceability
        </div>
      </div>
    </section>
  );
}
