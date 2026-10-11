"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Section, SectionHead } from "./Section";
import { cn } from "@/lib/utils";

const QA = [
  {
    q: "What makes this an agent rather than a chatbot with plugins?",
    a: "The model is not told which tools to call or in what order. It receives the goal, the tool descriptions and the growing scratchpad, then chooses the next single action itself. The order of calls differs between runs because it is derived from observations, not from a script. That choice, repeated until the goal is met, is what makes it agentic.",
  },
  {
    q: "Which parts are genuinely live, and which are curated?",
    a: "Weather and the encyclopedic lookups are live third-party calls. Budget arithmetic is executed locally by mathjs. Routes, lodging tiers and advisories are answered from maintained tables in the repository, because live fare and booking APIs are paid and rate limited. Every tool in the interface is labelled with which of the three it is.",
  },
  {
    q: "What memory does the agent have?",
    a: "Two kinds. Within a run it keeps a scratchpad: the ordered transcript of thoughts, actions and observations, which is re-read before every decision. Across runs it has an episodic store in MongoDB Atlas holding the full step list, tool payloads and timings of each completed run.",
  },
  {
    q: "What stops it from inventing a hotel rate?",
    a: "Figures are only permitted to enter the plan through a tool result, and the final answer attributes each number to the call that produced it. Totals are computed by mathjs rather than by the model, which is where invented arithmetic usually appears. If no tool can supply a figure, the agent is instructed to say so instead of producing a plausible one.",
  },
  {
    q: "Does it still work without API keys?",
    a: "Yes, and that is deliberate for a lab demonstration. Without a Groq key the loop runs a deterministic planner over the same six tools, producing a real trace from live data. Without a Mongo URI it runs without persistence. Neither absence breaks the demo.",
  },
  {
    q: "How is the classical agent a fair comparison?",
    a: "It is a genuine rule-based agent written for the same task, not a strawman: condition-action rules over a destination table with explicit branches for season, budget band and party size. It is fast, free and perfectly reproducible. The comparison section reports where it beats the ReAct agent as well as where it fails.",
  },
  {
    q: "How many steps does a run take?",
    a: "Between nine and sixteen loop iterations for the recorded runs, against a hard ceiling that stops runaway loops. Step count scales with how much of the goal is underspecified: a stated budget and fixed dates resolve in fewer iterations than an open brief.",
  },
  {
    q: "Can it be run without a browser?",
    a: "Yes. demo_agent.py drives the same loop from the terminal and prints each thought, action and observation as it happens, which is the intended path for the lab viva.",
  },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section id="faq" band>
      <SectionHead
        index="#10"
        label="Questions"
        title="The things worth asking."
      />

      <div className="border-t border-line">
        {QA.map((item, i) => {
          const on = open === i;
          return (
            <div key={item.q} className="border-b border-line">
              <button
                type="button"
                onClick={() => setOpen(on ? null : i)}
                aria-expanded={on}
                className="flex w-full items-start justify-between gap-6 px-6 py-6 text-left transition-colors hover:bg-surface sm:px-10"
              >
                <span
                  className={cn(
                    "text-[15px] font-medium leading-snug transition-colors",
                    on ? "text-cobalt" : "text-ink",
                  )}
                >
                  {item.q}
                </span>
                <Plus
                  size={16}
                  className={cn(
                    "mt-0.5 shrink-0 transition-transform duration-300",
                    on ? "rotate-45 text-cobalt" : "text-ink-mute",
                  )}
                />
              </button>

              <div
                className={cn(
                  "grid transition-all duration-300 ease-out",
                  on
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0",
                )}
              >
                <div className="overflow-hidden">
                  <p className="max-w-3xl px-6 pb-7 text-[14px] leading-relaxed text-ink-soft sm:px-10">
                    {item.a}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
