import { Section, SectionHead } from "./Section";

const ROWS: {
  axis: string;
  classical: string;
  modern: string;
}[] = [
  {
    axis: "Knowledge source",
    classical:
      "Rules written by the developer. Anything not anticipated at authoring time is simply absent.",
    modern:
      "A pretrained model for language and judgement, with every fact sourced from a tool call at run time.",
  },
  {
    axis: "Control flow",
    classical:
      "Fixed. The same branch order executes on every input, regardless of what the input needs.",
    modern:
      "Chosen per step. The next action depends on the observation the previous one returned.",
  },
  {
    axis: "Handling the unseen",
    classical:
      "Falls through to a default branch. A destination missing from the table yields a generic reply.",
    modern:
      "Generalises. An unfamiliar destination still routes through geocoding, weather and encyclopedic lookup.",
  },
  {
    axis: "Goal decomposition",
    classical:
      "None. The developer decomposed the problem in advance by writing the branches.",
    modern:
      "Performed by the agent at run time, and revised mid-run when an observation invalidates the plan.",
  },
  {
    axis: "Transparency",
    classical:
      "Total. The branch taken is readable in the source, and the output is reproducible to the character.",
    modern:
      "Reconstructed from the trace. Every thought, call and observation is logged, but runs are not bit-identical.",
  },
  {
    axis: "Failure mode",
    classical:
      "Silent irrelevance. It confidently returns a rule that does not fit the request.",
    modern:
      "Wasted or looping steps, and fabrication if a tool result is missing. Mitigated by step ceilings and strict grounding.",
  },
  {
    axis: "Cost and latency",
    classical:
      "Microseconds, no network, no spend. Hard to beat when the domain really is closed.",
    modern:
      "Seconds and a token bill, because reasoning and tool round trips dominate the run.",
  },
  {
    axis: "Maintenance",
    classical:
      "Every new city, season or currency is a new branch. Effort grows with coverage.",
    modern:
      "Add a tool and describe it. Capability grows without rewriting the control flow.",
  },
];

export default function ComparisonSection() {
  return (
    <Section id="comparison" band>
      <SectionHead
        index="#06"
        label="Analysis, syllabus part C"
        title={
          <>
            Rule-based agent against
            <br className="hidden sm:block" /> the modern agentic system.
          </>
        }
        lede="Both agents are implemented in this repository and both are runnable from the playground, so the comparison below is observed rather than quoted."
      />

      {/* Matrix */}
      <div className="border-t border-line">
        {/* Head */}
        <div className="hidden grid-cols-[minmax(0,0.6fr)_minmax(0,1fr)_minmax(0,1fr)] border-b border-line bg-surface md:grid">
          <div className="border-r border-line px-6 py-4">
            <span className="micro text-ink-mute">Axis</span>
          </div>
          <div className="border-r border-line px-6 py-4">
            <span className="micro text-clay">Classical rule-based</span>
          </div>
          <div className="px-6 py-4">
            <span className="micro text-cobalt">Atlas, ReAct agent</span>
          </div>
        </div>

        {ROWS.map((r) => (
          <div
            key={r.axis}
            className="grid grid-cols-1 border-b border-line md:grid-cols-[minmax(0,0.6fr)_minmax(0,1fr)_minmax(0,1fr)]"
          >
            <div className="border-line px-6 pt-6 pb-2 md:border-r md:py-6">
              <span className="micro text-ink">{r.axis}</span>
            </div>
            <div className="border-line px-6 py-3 md:border-r md:py-6">
              <span className="micro mb-2 block text-clay md:hidden">
                Classical
              </span>
              <p className="text-[13px] leading-relaxed text-ink-soft">
                {r.classical}
              </p>
            </div>
            <div className="px-6 py-3 pb-6 md:py-6">
              <span className="micro mb-2 block text-cobalt md:hidden">
                Atlas
              </span>
              <p className="text-[13px] leading-relaxed text-ink-soft">
                {r.modern}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Verdict */}
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="border-b border-line px-6 py-10 sm:px-10 lg:border-r">
          <p className="micro mb-4 text-clay">Where the classical agent wins</p>
          <p className="text-[14px] leading-relaxed text-ink-soft">
            When the domain is genuinely closed, rules are better. The rule
            agent answers in microseconds, costs nothing, never fabricates, and
            its output can be proved correct by reading the source. For a fixed
            list of twelve cities with fixed packages, the ReAct agent is
            strictly worse engineering.
          </p>
        </div>
        <div className="px-6 py-10 sm:px-10">
          <p className="micro mb-4 text-cobalt">Where it breaks down</p>
          <p className="text-[14px] leading-relaxed text-ink-soft">
            Travel planning is not closed. The thirteenth city, an unseasonal
            forecast, a budget that does not divide cleanly: each is a branch
            nobody wrote. Atlas absorbs these because it decides the next step
            after seeing the last result, which is exactly the capability the
            rule agent cannot express.
          </p>
        </div>
      </div>
    </Section>
  );
}
