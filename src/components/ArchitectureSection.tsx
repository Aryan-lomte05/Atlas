import { Section, SectionHead } from "./Section";

/** Hairline box used throughout the diagram. */
function Box({
  x,
  y,
  w,
  h,
  label,
  sub,
  accent,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={3}
        fill={accent ? "var(--color-cobalt-wash)" : "var(--color-surface)"}
        stroke={accent ? "var(--color-cobalt)" : "var(--color-line-strong)"}
        strokeWidth={1}
      />
      <text
        x={x + w / 2}
        y={sub ? y + h / 2 - 4 : y + h / 2 + 4}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="10.5"
        letterSpacing="0.09em"
        fill={accent ? "var(--color-cobalt)" : "var(--color-ink)"}
      >
        {label.toUpperCase()}
      </text>
      {sub ? (
        <text
          x={x + w / 2}
          y={y + h / 2 + 12}
          textAnchor="middle"
          fontFamily="var(--font-sans)"
          fontSize="10"
          fill="var(--color-ink-mute)"
        >
          {sub}
        </text>
      ) : null}
    </g>
  );
}

function Arrow({ d, dashed }: { d: string; dashed?: boolean }) {
  return (
    <path
      d={d}
      fill="none"
      stroke="var(--color-line-strong)"
      strokeWidth={1}
      strokeDasharray={dashed ? "3 3" : undefined}
      markerEnd="url(#arrowhead)"
    />
  );
}

export default function ArchitectureSection() {
  return (
    <Section id="architecture">
      <SectionHead
        index="#05"
        label="System architecture"
        title={
          <>
            Where each request goes,
            <br className="hidden sm:block" /> and what comes back.
          </>
        }
        lede="One HTTP request opens a Server-Sent Events stream. The orchestrator holds the loop, the model chooses, the dispatcher executes, and the finished trace is written to Atlas."
      />

      {/* Diagram */}
      <div className="dotfield border-t border-line px-4 py-10 sm:px-10 sm:py-14">
        <div className="overflow-x-auto">
          <svg
            viewBox="0 0 900 430"
            className="mx-auto block h-auto w-full min-w-[720px] max-w-[900px]"
            role="img"
            aria-label="Atlas request flow: browser to the agent route, into the ReAct orchestrator, which alternates between the Llama 3.3 model and the tool dispatcher, then persists the trace to MongoDB Atlas."
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="7"
                markerHeight="7"
                refX="6"
                refY="3"
                orient="auto"
              >
                <path d="M0,0 L6,3 L0,6 z" fill="var(--color-line-strong)" />
              </marker>
            </defs>

            {/* Client tier */}
            <text
              x="20"
              y="26"
              fontFamily="var(--font-mono)"
              fontSize="9.5"
              letterSpacing="0.1em"
              fill="var(--color-ink-mute)"
            >
              CLIENT
            </text>
            <Box x={20} y={38} w={160} h={54} label="Playground" sub="React client" />

            {/* Edge */}
            <text
              x="20"
              y="150"
              fontFamily="var(--font-mono)"
              fontSize="9.5"
              letterSpacing="0.1em"
              fill="var(--color-ink-mute)"
            >
              EDGE
            </text>
            <Box
              x={20}
              y={162}
              w={160}
              h={54}
              label="/api/agent"
              sub="SSE stream"
            />

            {/* Orchestrator */}
            <text
              x="260"
              y="26"
              fontFamily="var(--font-mono)"
              fontSize="9.5"
              letterSpacing="0.1em"
              fill="var(--color-ink-mute)"
            >
              ORCHESTRATION
            </text>
            <Box
              x={260}
              y={100}
              w={190}
              h={116}
              label="ReAct loop"
              sub="think / act / observe"
              accent
            />

            {/* Model */}
            <text
              x="530"
              y="26"
              fontFamily="var(--font-mono)"
              fontSize="9.5"
              letterSpacing="0.1em"
              fill="var(--color-ink-mute)"
            >
              REASONING
            </text>
            <Box
              x={530}
              y={38}
              w={180}
              h={54}
              label="Llama 3.3 70B"
              sub="Groq LPU"
            />

            {/* Tools */}
            <text
              x="530"
              y="150"
              fontFamily="var(--font-mono)"
              fontSize="9.5"
              letterSpacing="0.1em"
              fill="var(--color-ink-mute)"
            >
              GROUNDING
            </text>
            <Box x={530} y={162} w={180} h={40} label="Dispatcher" />
            {[
              "weather",
              "routes",
              "stays",
              "budget",
              "sights",
              "advisory",
            ].map((t, i) => (
              <g key={t}>
                <rect
                  x={530 + (i % 2) * 92}
                  y={214 + Math.floor(i / 2) * 36}
                  width={84}
                  height={28}
                  rx={2}
                  fill="var(--color-surface)"
                  stroke="var(--color-line)"
                />
                <text
                  x={530 + (i % 2) * 92 + 42}
                  y={214 + Math.floor(i / 2) * 36 + 18}
                  textAnchor="middle"
                  fontFamily="var(--font-mono)"
                  fontSize="9.5"
                  fill="var(--color-ink-soft)"
                >
                  {t}
                </text>
              </g>
            ))}

            {/* Persistence */}
            <text
              x="260"
              y="300"
              fontFamily="var(--font-mono)"
              fontSize="9.5"
              letterSpacing="0.1em"
              fill="var(--color-ink-mute)"
            >
              PERSISTENCE
            </text>
            <Box
              x={260}
              y={312}
              w={190}
              h={54}
              label="MongoDB Atlas"
              sub="agenttraces"
            />

            {/* Wires */}
            <Arrow d="M100,92 L100,162" />
            <Arrow d="M180,189 L260,170" />
            <Arrow d="M450,140 L530,80" />
            <Arrow d="M530,70 L470,70 L470,128 L450,128" dashed />
            <Arrow d="M450,176 L530,182" />
            <Arrow d="M530,196 L470,196 L470,186 L450,186" dashed />
            <Arrow d="M355,216 L355,312" />
            <Arrow d="M260,196 L210,196 L210,120 L180,120" dashed />

            {/* Wire captions */}
            <text x="106" y="128" fontFamily="var(--font-mono)" fontSize="9" fill="var(--color-ink-mute)">POST goal</text>
            <text x="455" y="104" fontFamily="var(--font-mono)" fontSize="9" fill="var(--color-ink-mute)">prompt</text>
            <text x="476" y="152" fontFamily="var(--font-mono)" fontSize="9" fill="var(--color-ink-mute)">action</text>
            <text x="455" y="212" fontFamily="var(--font-mono)" fontSize="9" fill="var(--color-ink-mute)">call</text>
            <text x="362" y="270" fontFamily="var(--font-mono)" fontSize="9" fill="var(--color-ink-mute)">write trace</text>
            <text x="150" y="112" fontFamily="var(--font-mono)" fontSize="9" fill="var(--color-ink-mute)">step events</text>
          </svg>
        </div>
      </div>

      {/* Notes */}
      <div className="cells grid-cols-1 sm:grid-cols-3">
        {[
          {
            k: "Streaming",
            v: "Steps are flushed to the client as they complete, so the trace fills in live rather than arriving as one block at the end.",
          },
          {
            k: "Degradation",
            v: "With no Groq key the loop runs a deterministic planner over the same tools. With no Mongo URI it runs without persistence. Neither failure stops a demo.",
          },
          {
            k: "Two deployments",
            v: "The same orchestrator is importable from the Next.js route and from the standalone Express server, which is what lets the client sit on Vercel and the API on Render.",
          },
        ].map((c) => (
          <div key={c.k}>
            <p className="micro mb-3 text-cobalt">{c.k}</p>
            <p className="text-[13px] leading-relaxed text-ink-soft">{c.v}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
