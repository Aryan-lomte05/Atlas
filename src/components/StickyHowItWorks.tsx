"use client";

import { useEffect, useRef, useState } from "react";
import { Section } from "./Section";
import { cn } from "@/lib/utils";

const PHASES = [
  {
    n: "01",
    title: "Read the goal",
    body: "The run begins with one sentence of intent. Atlas pulls out the place, the dates, the party size and the ceiling, and states what is still missing rather than assuming it.",
    sample: 'goal: "5 days in Kyoto, early April, 2 people, 90000 INR"',
  },
  {
    n: "02",
    title: "Think",
    body: "Before any call, the agent writes down what it is trying to establish and why this tool is the one that settles it. That sentence is the thought, and it is kept in the trace.",
    sample: "thought: the day order depends on rainfall, so climate comes first",
  },
  {
    n: "03",
    title: "Act",
    body: "The model emits a tool name and a JSON argument object. The runtime validates the arguments, dispatches the call, and enforces a timeout so one slow endpoint cannot stall the run.",
    sample: 'action: getWeather { "city": "Kyoto", "month": 4 }',
  },
  {
    n: "04",
    title: "Observe",
    body: "The tool result is appended verbatim to the scratchpad. Nothing is paraphrased on the way in, so a later step can be audited against exactly what the API returned.",
    sample: 'observation: { "meanHigh": 19.4, "rainDays": 9 }',
  },
  {
    n: "05",
    title: "Decide again, then answer",
    body: "The loop repeats until the agent judges the goal satisfied or hits the step ceiling. Only then does it write the itinerary, with each number attributed to the call that produced it.",
    sample: "final: 5-day plan, 86600 INR of 90000, temple days moved to the dry window",
  },
];

export default function StickyHowItWorks() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const i = refs.current.indexOf(e.target as HTMLDivElement);
            if (i >= 0) setActive(i);
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <Section id="how">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        {/* Sticky side */}
        <div className="border-b border-line lg:border-b-0 lg:border-r">
          <div className="px-6 pt-20 pb-10 sm:px-10 sm:pt-28 lg:sticky lg:top-24">
            <p className="micro text-cobalt">
              <span className="text-ink-mute">#03</span>
              <span className="text-ink-mute"> / </span>
              The loop
            </p>
            <h2 className="mt-7 text-[2rem] font-medium leading-[1.1] tracking-[-0.025em] sm:text-[2.6rem]">
              One pass of the
              <br />
              ReAct cycle.
            </h2>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-ink-soft">
              Reason, act, observe. The agent repeats this until the goal is
              met, and the whole sequence is visible while it runs.
            </p>

            {/* Progress rail */}
            <div className="mt-10 hidden gap-1.5 lg:flex">
              {PHASES.map((p, i) => (
                <span
                  key={p.n}
                  className={cn(
                    "h-[3px] flex-1 rounded-full transition-colors duration-300",
                    i <= active ? "bg-cobalt" : "bg-line",
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Steps */}
        <div>
          {PHASES.map((p, i) => (
            <div
              key={p.n}
              ref={(el) => {
                refs.current[i] = el;
              }}
              className={cn(
                "border-b border-line px-6 py-12 transition-colors duration-300 sm:px-10 sm:py-14",
                i === active ? "bg-cobalt-wash" : "bg-transparent",
              )}
            >
              <div className="flex items-baseline gap-4">
                <span
                  className={cn(
                    "micro transition-colors",
                    i === active ? "text-cobalt" : "text-ink-mute",
                  )}
                >
                  {p.n}
                </span>
                <h3 className="text-[1.3rem] font-medium tracking-[-0.015em] text-ink">
                  {p.title}
                </h3>
              </div>

              <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-ink-soft">
                {p.body}
              </p>

              <pre className="mt-5 overflow-x-auto rounded-[4px] border border-line bg-surface px-4 py-3 font-mono text-[12px] leading-relaxed text-ink-soft">
                {p.sample}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
