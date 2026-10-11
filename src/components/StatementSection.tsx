import { Section } from "./Section";

export default function StatementSection() {
  return (
    <Section className="border-t-0">
      <div className="px-6 py-24 sm:px-10 sm:py-32">
        <p className="micro mb-10 text-cobalt">The shift</p>

        <h2 className="max-w-5xl text-[clamp(1.6rem,3.5vw,2.9rem)] font-light leading-[1.22] tracking-[-0.02em]">
          <span className="text-ink">
            A chatbot answers the question you asked.
          </span>{" "}
          <span className="text-ink-mute">
            It guesses at the weather, invents a hotel rate, and never checks
            whether the budget actually closes.
          </span>{" "}
          <span className="text-ink">
            An agent does the work instead: it picks a tool, reads what comes
            back, and lets the result change the plan.
          </span>
        </h2>

        <div className="mt-14 grid max-w-4xl grid-cols-1 gap-px border border-line bg-line sm:grid-cols-3">
          {[
            {
              k: "Grounded",
              v: "Every figure in the itinerary traces back to a tool call, not to the model's memory.",
            },
            {
              k: "Observable",
              v: "Thought, action, observation. Each step streams to the screen as it happens.",
            },
            {
              k: "Adaptive",
              v: "A rain forecast reorders the days. The plan responds to what the tools return.",
            },
          ].map((c) => (
            <div key={c.k} className="bg-canvas p-6">
              <p className="micro mb-3 text-cobalt">{c.k}</p>
              <p className="text-[13.5px] leading-relaxed text-ink-soft">
                {c.v}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
