"use client";

import { useState } from "react";
import Image from "next/image";
import { Section, SectionHead } from "./Section";
import { cn } from "@/lib/utils";

const RUNS = [
  {
    id: "kyoto",
    photo: "/img/street.jpg",
    alt: "A narrow colourful old-town street busy with people",
    persona: "Shoulder season, hard ceiling",
    goal: "5 days in Kyoto in early April for two people, 90000 INR all in.",
    steps: 14,
    tools: ["weather", "routes", "stays", "sights", "budget"],
    finding:
      "The forecast returned nine wet days in the window, so the agent moved both temple walks to the two clear days and pushed the covered market and the Nishiki arcade into the rain. It closed at 86600 INR, 3400 under the ceiling.",
    note: "The reordering was not requested. It followed from the observation.",
  },
  {
    id: "reykjavik",
    photo: "/img/night-peaks.jpg",
    alt: "Snow covered peaks under a deep night sky",
    persona: "Unseen destination",
    goal: "A week in Reykjavik in November, no budget stated.",
    steps: 11,
    tools: ["weather", "advisory", "sights", "stays"],
    finding:
      "Reykjavik is absent from the curated route table. Rather than falling through to a default, the agent geocoded it, pulled live climate, and flagged four hours of daylight as the binding constraint on the itinerary.",
    note: "This is the case the classical agent cannot answer at all.",
  },
  {
    id: "goa",
    photo: "/img/palms-beach.jpg",
    alt: "Coconut palms leaning over an empty tropical beach",
    persona: "Budget pressure",
    goal: "Four days in Goa for three friends on 18000 INR total.",
    steps: 9,
    tools: ["routes", "stays", "budget", "weather"],
    finding:
      "The first budget pass came to 23400 INR and overshot. The agent did not quietly round it down: it re-ran lodging at the backpacker tier, dropped one paid activity, and reported the revised 17200 INR with the swap stated.",
    note: "The failed arithmetic is visible in the trace rather than hidden.",
  },
];

export default function TestimonialsSection() {
  const [i, setI] = useState(0);
  const run = RUNS[i];

  return (
    <Section id="runs">
      <SectionHead
        index="#07"
        label="Recorded runs"
        title={
          <>
            Three runs, and what
            <br className="hidden sm:block" /> each one exposed.
          </>
        }
        lede="Captured from the playground against the live tools. Step counts are the real number of loop iterations each goal required."
      />

      <div className="grid grid-cols-1 border-t border-line lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        {/* Selector */}
        <div className="lg:border-r lg:border-line">
          {RUNS.map((r, idx) => {
            const on = idx === i;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setI(idx)}
                aria-pressed={on}
                className={cn(
                  "relative block w-full border-b border-line px-6 py-7 text-left transition-colors sm:px-10",
                  on ? "bg-cobalt-wash" : "hover:bg-surface",
                )}
              >
                <span
                  className={cn(
                    "absolute inset-y-0 left-0 w-[2px] transition-colors",
                    on ? "bg-cobalt" : "bg-transparent",
                  )}
                />
                <div className="flex items-center justify-between gap-4">
                  <span
                    className={cn(
                      "micro",
                      on ? "text-cobalt" : "text-ink-mute",
                    )}
                  >
                    {String(idx + 1).padStart(2, "0")} / {r.persona}
                  </span>
                  <span className="micro shrink-0 text-ink-mute">
                    {r.steps} steps
                  </span>
                </div>
                <p className="mt-3 text-[14.5px] leading-relaxed text-ink">
                  {r.goal}
                </p>
              </button>
            );
          })}
        </div>

        {/* Detail */}
        <div className="px-6 py-10 sm:px-10 lg:py-14">
          <div className="relative mb-8 h-52 overflow-hidden rounded-[4px] border border-line">
            <Image
              key={run.photo}
              src={run.photo}
              alt={run.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 560px"
              className="animate-rise object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(7,20,26,0.8) 0%, transparent 55%)",
              }}
            />
          </div>

          <p className="micro mb-5 text-ink-mute">What happened</p>

          <p className="font-serif text-[1.35rem] font-light leading-[1.45] tracking-[-0.01em] text-ink">
            {run.finding}
          </p>

          <p className="mt-6 border-l-2 border-cobalt pl-4 text-[13px] italic leading-relaxed text-ink-soft">
            {run.note}
          </p>

          <div className="mt-8 flex flex-wrap gap-1.5">
            {run.tools.map((t) => (
              <span
                key={t}
                className="micro rounded-[3px] border border-line bg-surface px-2.5 py-1.5 text-ink-soft"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
