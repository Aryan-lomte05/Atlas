"use client";

import { useState } from "react";
import { Section, SectionHead } from "./Section";
import { TOOL_SPECS, SOURCE_LABEL, type ToolSource } from "@/lib/toolManifest";
import { cn } from "@/lib/utils";

const SOURCE_TONE: Record<ToolSource, string> = {
  live: "text-moss border-moss/35",
  compute: "text-cobalt border-cobalt/35",
  curated: "text-clay border-clay/35",
};

export default function ToolsSection() {
  const [open, setOpen] = useState(0);

  return (
    <Section id="tools" band>
      <SectionHead
        index="#04"
        label="The tool surface"
        title={
          <>
            Six calls the agent
            <br className="hidden sm:block" /> can actually make.
          </>
        }
        lede="The model never answers from memory where a tool can answer from fact. Each entry below is labelled by where its data genuinely comes from."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* List */}
        <div className="border-t border-line lg:border-r">
          {TOOL_SPECS.map((t, i) => {
            const on = i === open;
            return (
              <button
                key={t.name}
                type="button"
                onClick={() => setOpen(i)}
                aria-pressed={on}
                className={cn(
                  "relative block w-full border-b border-line px-6 py-6 text-left transition-colors sm:px-10",
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
                      "micro transition-colors",
                      on ? "text-cobalt" : "text-ink",
                    )}
                  >
                    {t.title}
                  </span>
                  <span
                    className={cn(
                      "micro shrink-0 rounded-[3px] border px-2 py-1",
                      SOURCE_TONE[t.source],
                    )}
                  >
                    {SOURCE_LABEL[t.source]}
                  </span>
                </div>

                <p className="mt-3 max-w-md text-[13px] leading-relaxed text-ink-soft">
                  {t.summary}
                </p>

                <p className="mt-3 font-mono text-[11.5px] text-ink-mute">
                  {t.name}({t.argument})
                </p>
              </button>
            );
          })}
        </div>

        {/* Payload preview */}
        <div className="dotfield border-t border-line">
          <div className="px-6 py-10 sm:px-10 lg:sticky lg:top-24">
            <p className="micro mb-4 text-ink-mute">
              Returned to the scratchpad
            </p>

            <div className="overflow-hidden rounded-[5px] border border-line bg-surface shadow-xl">
              <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
                <span className="micro text-ink-soft">
                  {TOOL_SPECS[open].name}
                </span>
                <span className="micro text-ink-mute">
                  {TOOL_SPECS[open].provider}
                </span>
              </div>
              <pre className="overflow-x-auto px-5 py-5 font-mono text-[12.5px] leading-[1.75] text-ink-soft">
                {TOOL_SPECS[open].sample}
              </pre>
            </div>

            <p className="mt-5 max-w-sm text-[12.5px] leading-relaxed text-ink-mute">
              Observations are appended verbatim. The agent reasons over this
              text on the next pass, so what you see here is what it sees.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
