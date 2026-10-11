import { Section, SectionHead } from "./Section";

const MEMBERS = [
  {
    name: "Aryan Lomte",
    initials: "AL",
    focus: "Fullstack AI co-developer",
  },
  {
    name: "Aditya",
    initials: "AD",
    focus: "Fullstack AI co-developer",
  },
  {
    name: "Manthan",
    initials: "MN",
    focus: "Fullstack AI co-developer",
  },
];

const SHARED = [
  "ReAct orchestration and the streaming trace pipeline",
  "Tool implementations, fallbacks and timeout handling",
  "Classical rule-based agent and the Part C comparison",
  "Interface, architecture diagram and written report",
];

export default function TeamSection() {
  return (
    <Section id="team">
      <SectionHead
        index="#09"
        label="Project team"
        title="Three students, one shared scope."
        lede="Work on this project was not split by module. All three members worked across orchestration, tools, evaluation and documentation, and contribution is recorded as equal."
      />

      <div className="grid grid-cols-1 border-t border-line sm:grid-cols-3">
        {MEMBERS.map((m, i) => (
          <div
            key={m.name}
            className={`border-b border-line px-6 py-10 sm:px-8 ${
              i < MEMBERS.length - 1 ? "sm:border-r" : ""
            }`}
          >
            <div className="grid h-12 w-12 place-items-center rounded-[4px] border border-line bg-surface">
              <span className="micro font-bold text-cobalt">{m.initials}</span>
            </div>
            <p className="mt-6 text-[1.05rem] font-medium tracking-[-0.01em] text-ink">
              {m.name}
            </p>
            <p className="micro mt-2 text-ink-mute">{m.focus}</p>
          </div>
        ))}
      </div>

      <div className="border-b border-line px-6 py-10 sm:px-10">
        <p className="micro mb-6 text-cobalt">Shared across all three</p>
        <div className="grid grid-cols-1 gap-x-10 gap-y-3 sm:grid-cols-2">
          {SHARED.map((s) => (
            <div key={s} className="flex gap-3">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-cobalt" />
              <span className="text-[13.5px] leading-relaxed text-ink-soft">
                {s}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-8 border-t border-line pt-6 text-[12.5px] leading-relaxed text-ink-mute">
          Department of Electronics and Computer Engineering, academic year
          2026-27. Artificial Intelligence, IA-2 Activity 1.
        </p>
      </div>
    </Section>
  );
}
