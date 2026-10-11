"use client";

import { useState } from "react";
import { Layers, Database, GitBranch, Search } from "lucide-react";
import { Section, SectionHead } from "./Section";
import { cn } from "@/lib/utils";

const FACETS = [
  {
    key: "scratchpad",
    icon: Layers,
    label: "Scratchpad",
    blurb:
      "The running transcript of thoughts, actions and observations. It is the agent's working memory for a single run, and it is what gets re-read before every next decision.",
    code: `[1] thought  Need the April climate before I fix the day order.
[2] action   getWeather { city: "Kyoto", month: 4 }
[3] observe  { meanHigh: 19.4, rainDays: 9, advice: "pack a shell" }
[4] thought  Nine wet days. Put the temple walks on the clear ones.`,
  },
  {
    key: "episodic",
    icon: Database,
    label: "Episodic store",
    blurb:
      "Every completed run is written to MongoDB Atlas with its full step list, tool payloads and timings. Past runs stay queryable long after the process exits.",
    code: `{
  goal:      "5 days in Kyoto, 90000 INR, early April",
  steps:     14,
  toolCalls: [ "getWeather", "findRoutes", "findStays",
               "calcBudget", "findSights", "getAdvisory" ],
  latencyMs: 9840,
  createdAt: "2026-10-11T04:12:55Z"
}`,
  },
  {
    key: "decomposition",
    icon: GitBranch,
    label: "Decomposition",
    blurb:
      "One goal becomes an ordered set of sub-goals. The agent does not plan all of them up front: it commits to the next step only once it has seen the last observation.",
    code: `goal: "5 days in Kyoto, 90000 INR, early April"
  |- resolve place and dates
  |- climate for the window
  |- routes in and out
  |- lodging inside the nightly ceiling
  |- sights ordered around the wet days
  \`- reconcile the budget, then write it up`,
  },
  {
    key: "retrieval",
    icon: Search,
    label: "Grounded retrieval",
    blurb:
      "Facts enter the plan only through a tool result. If no tool can supply a number, the agent says so rather than inventing one that reads well.",
    code: `// every figure carries its origin
nightly:  6200 INR   <- findStays.midRange
flights:  31400 INR  <- findRoutes.economyReturn
food:      9000 INR  <- calcBudget.perDiem * 5
total:    86600 INR  <- calcBudget.sum  (ceiling 90000)`,
  },
];

export default function BentoSection() {
  const [active, setActive] = useState(0);
  const Current = FACETS[active];

  return (
    <Section id="memory" band>
      <SectionHead
        index="#02"
        label="Context and memory"
        title={
          <>
            The next step starts from
            <br className="hidden sm:block" /> what the last one returned.
          </>
        }
      />

      {/* Facet row */}
      <div className="cells grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {FACETS.map((f, i) => {
          const Icon = f.icon;
          const on = i === active;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setActive(i)}
              aria-pressed={on}
              className={cn(
                "group relative text-left transition-colors",
                on ? "bg-cobalt-wash" : "hover:bg-surface",
              )}
            >
              <span
                className={cn(
                  "absolute inset-x-0 top-0 h-[2px] transition-colors",
                  on ? "bg-cobalt" : "bg-transparent",
                )}
              />
              <Icon
                size={17}
                className={cn(
                  "mb-5 transition-colors",
                  on ? "text-cobalt" : "text-ink-mute",
                )}
              />
              <p
                className={cn(
                  "micro mb-3 transition-colors",
                  on ? "text-cobalt" : "text-ink",
                )}
              >
                {f.label}
              </p>
              <p className="text-[13px] leading-relaxed text-ink-soft">
                {f.blurb}
              </p>
            </button>
          );
        })}
      </div>

      {/* Showcase */}
      <div className="dotfield border-b border-line px-6 py-12 sm:px-10 sm:py-16">
        <div className="mx-auto max-w-3xl overflow-hidden rounded-[5px] border border-line bg-surface shadow-2xl">
          <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
            <span className="h-2 w-2 rounded-full bg-line-strong" />
            <span className="h-2 w-2 rounded-full bg-line-strong" />
            <span className="h-2 w-2 rounded-full bg-line-strong" />
            <span className="micro ml-2 text-ink-mute">{Current.label}</span>
          </div>
          <pre className="overflow-x-auto px-5 py-5 font-mono text-[12.5px] leading-[1.75] text-ink-soft">
            {Current.code}
          </pre>
        </div>
      </div>
    </Section>
  );
}
