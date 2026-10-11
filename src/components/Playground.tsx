"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  Brain,
  CircleDot,
  Eye,
  Loader2,
  Square,
  Terminal,
  Wrench,
} from "lucide-react";
import { Section, SectionHead } from "./Section";
import { cn } from "@/lib/utils";

/* ---------------- types mirroring src/lib ---------------- */

interface AgentStep {
  type: "thought" | "action" | "observation" | "answer";
  content: string;
  tool?: string;
  toolInput?: string;
  timestamp: number;
}

interface AgentRunResult {
  goal: string;
  agentType: string;
  steps: AgentStep[];
  finalAnswer: string;
  totalSteps: number;
  toolsUsed: string[];
  duration: number;
}

interface ClassicalStep {
  type: "rule_eval" | "lookup" | "output";
  ruleName: string;
  matched: boolean;
  content: string;
  timestamp: number;
}

interface ClassicalRunResult {
  goal: string;
  agentType: string;
  steps: ClassicalStep[];
  finalAnswer: string;
  totalRulesEvaluated: number;
  matchedRules: number;
  duration: number;
  limitationsEncountered: string[];
}

type Mode = "react" | "classical" | "both";

const PRESETS = [
  "Plan 5 days in Kyoto in early April for two people on a 90000 INR budget. Work around the weather.",
  "A week in Reykjavik in November. I have not set a budget. What should I know before booking?",
  "Four days in Goa for three friends, 18000 INR total, cheapest workable plan.",
  "Three days in Singapore with one rainy day expected. Keep it under 45000 INR.",
];

const STEP_META: Record<
  AgentStep["type"],
  { label: string; tone: string; Icon: typeof Brain }
> = {
  thought: { label: "Thought", tone: "text-plum", Icon: Brain },
  action: { label: "Action", tone: "text-cobalt", Icon: Wrench },
  observation: { label: "Observation", tone: "text-moss", Icon: Eye },
  answer: { label: "Final answer", tone: "text-ink", Icon: CircleDot },
};

/* ---------------- component ---------------- */

export default function Playground() {
  const [goal, setGoal] = useState(PRESETS[0]);
  const [mode, setMode] = useState<Mode>("react");
  const [running, setRunning] = useState(false);

  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [result, setResult] = useState<AgentRunResult | null>(null);
  const [classical, setClassical] = useState<ClassicalRunResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const abortRef = useRef<AbortController | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const startedAt = useRef(0);

  /* live timer */
  useEffect(() => {
    if (!running) return;
    const id = setInterval(
      () => setElapsed(Date.now() - startedAt.current),
      100,
    );
    return () => clearInterval(id);
  }, [running]);

  /* keep the trace pinned to the newest step */
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [steps, classical]);

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "";

  function reset() {
    setSteps([]);
    setResult(null);
    setClassical(null);
    setError(null);
    setElapsed(0);
  }

  async function runClassical(signal: AbortSignal) {
    const res = await fetch(`${apiBase}/api/agent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal, mode: "classical" }),
      signal,
    });
    if (!res.ok) throw new Error(`Classical agent returned ${res.status}`);
    const json = await res.json();
    setClassical(json.result as ClassicalRunResult);
  }

  async function runReact(signal: AbortSignal) {
    const res = await fetch(`${apiBase}/api/agent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal, mode: "react" }),
      signal,
    });
    if (!res.ok || !res.body) {
      throw new Error(`Agent route returned ${res.status}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSE frames are separated by a blank line.
      const frames = buffer.split("\n\n");
      buffer = frames.pop() ?? "";

      for (const frame of frames) {
        const line = frame.split("\n").find((l) => l.startsWith("data: "));
        if (!line) continue;
        let parsed: unknown;
        try {
          parsed = JSON.parse(line.slice(6));
        } catch {
          continue;
        }
        const p = parsed as Record<string, unknown>;

        if (p.type === "complete") {
          setResult(p.result as AgentRunResult);
        } else if (p.type === "error") {
          setError(String(p.message ?? "Agent error"));
        } else if (typeof p.type === "string") {
          setSteps((prev) => [...prev, p as unknown as AgentStep]);
        }
      }
    }
  }

  async function run() {
    if (!goal.trim() || running) return;
    reset();
    setRunning(true);
    startedAt.current = Date.now();

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      if (mode === "classical") {
        await runClassical(ctrl.signal);
      } else if (mode === "react") {
        await runReact(ctrl.signal);
      } else {
        await Promise.all([
          runReact(ctrl.signal),
          runClassical(ctrl.signal),
        ]);
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setError((e as Error).message);
      }
    } finally {
      setRunning(false);
      abortRef.current = null;
    }
  }

  function stop() {
    abortRef.current?.abort();
    setRunning(false);
  }

  const showReact = mode === "react" || mode === "both";
  const showClassical = mode === "classical" || mode === "both";
  const hasOutput = steps.length > 0 || classical !== null || error !== null;

  return (
    <Section id="playground">
      <SectionHead
        index="#01"
        label="Live playground"
        title="Give it a goal. Watch it decide."
        lede="This runs the real agent against the real tools. Every thought, tool call and observation below is produced during the run, not replayed."
      />

      {/* Composer */}
      <div className="border-t border-line px-6 py-8 sm:px-10">
        <div className="overflow-hidden rounded-[5px] border border-line bg-surface">
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            rows={3}
            spellCheck={false}
            placeholder="Describe the trip you want planned."
            className="w-full resize-none bg-transparent px-5 py-5 text-[15px] leading-relaxed text-ink outline-none placeholder:text-ink-mute"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
            {/* Mode switch */}
            <div className="flex items-center rounded-[4px] border border-line">
              {(
                [
                  ["react", "ReAct agent"],
                  ["classical", "Classical"],
                  ["both", "Both"],
                ] as [Mode, string][]
              ).map(([m, label], i) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  aria-pressed={mode === m}
                  className={cn(
                    "micro px-3 py-2 transition-colors",
                    i > 0 && "border-l border-line",
                    mode === m
                      ? "bg-cobalt text-[#231007]"
                      : "text-ink-soft hover:text-ink",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {running ? (
                <button
                  type="button"
                  onClick={stop}
                  className="flex items-center gap-2 rounded-[4px] border border-line px-3.5 py-2 text-ink-soft transition-colors hover:text-ink"
                >
                  <Square size={12} />
                  <span className="micro">Stop</span>
                </button>
              ) : null}

              <button
                type="button"
                onClick={run}
                disabled={running || !goal.trim()}
                className="flex items-center gap-2 rounded-full bg-cobalt px-4 py-2 text-[#231007] transition-colors hover:bg-cobalt-deep disabled:opacity-45"
              >
                {running ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <ArrowUp size={13} />
                )}
                <span className="micro font-bold">
                  {running ? "Running" : "Run"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Presets */}
        <div className="mt-4 flex flex-wrap gap-2">
          {PRESETS.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setGoal(p)}
              disabled={running}
              className={cn(
                "micro max-w-full truncate rounded-[3px] border px-2.5 py-1.5 transition-colors disabled:opacity-50",
                goal === p
                  ? "border-cobalt/40 bg-cobalt-wash text-cobalt"
                  : "border-line text-ink-mute hover:border-line-strong hover:text-ink-soft",
              )}
            >
              {p.length > 54 ? `${p.slice(0, 54)}...` : p}
            </button>
          ))}
        </div>
      </div>

      {/* Status strip */}
      <div className="grid grid-cols-2 border-t border-line sm:grid-cols-4">
        {[
          {
            k: "Status",
            v: running
              ? "Running"
              : error
                ? "Error"
                : result || classical
                  ? "Complete"
                  : "Idle",
          },
          {
            k: "Steps",
            v: showReact
              ? String(steps.length)
              : String(classical?.steps.length ?? 0),
          },
          {
            k: "Tools called",
            v: String(
              result?.toolsUsed.length ??
                new Set(steps.filter((s) => s.tool).map((s) => s.tool)).size,
            ),
          },
          {
            k: "Elapsed",
            v: running
              ? `${(elapsed / 1000).toFixed(1)}s`
              : result
                ? `${(result.duration / 1000).toFixed(1)}s`
                : classical
                  ? `${classical.duration}ms`
                  : "0.0s",
          },
        ].map((m, i) => (
          <div
            key={m.k}
            className={cn(
              "border-line px-5 py-4",
              i < 3 && "border-r",
              i < 2 && "border-b sm:border-b-0",
            )}
          >
            <p className="micro mb-2 text-ink-mute">{m.k}</p>
            <p className="font-mono text-[15px] text-ink">{m.v}</p>
          </div>
        ))}
      </div>

      {/* Trace */}
      <div
        className={cn(
          "grid grid-cols-1 border-t border-line",
          mode === "both" && "lg:grid-cols-2",
        )}
      >
        {showReact && (
          <div className={cn(mode === "both" && "lg:border-r lg:border-line")}>
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <span className="micro flex items-center gap-2 text-cobalt">
                <Terminal size={12} />
                ReAct trace
              </span>
              {running && (
                <span className="micro flex items-center gap-1.5 text-ink-mute">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cobalt" />
                  streaming
                </span>
              )}
            </div>

            <div
              ref={logRef}
              className="max-h-[520px] min-h-[260px] overflow-y-auto"
            >
              {steps.length === 0 && !running && !error && (
                <EmptyState text="The trace appears here, one step at a time, as the agent produces it." />
              )}

              {steps.map((s, i) => {
                const meta = STEP_META[s.type] ?? STEP_META.thought;
                const Icon = meta.Icon;
                return (
                  <div
                    key={i}
                    className="animate-rise border-b border-line px-5 py-4"
                  >
                    <div className="mb-2.5 flex items-center gap-2.5">
                      <span className="micro text-ink-mute">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <Icon size={12} className={meta.tone} />
                      <span className={cn("micro", meta.tone)}>
                        {meta.label}
                      </span>
                      {s.tool && (
                        <span className="micro rounded-[3px] border border-line px-2 py-1 text-ink-mute">
                          {s.tool}
                        </span>
                      )}
                    </div>

                    <p className="whitespace-pre-wrap font-mono text-[12.5px] leading-[1.7] text-ink-soft">
                      {s.content}
                    </p>

                    {s.toolInput && (
                      <p className="mt-2 font-mono text-[11.5px] text-ink-mute">
                        input: {s.toolInput}
                      </p>
                    )}
                  </div>
                );
              })}

              {running && (
                <div className="flex items-center gap-2.5 px-5 py-4">
                  <Loader2 size={12} className="animate-spin text-cobalt" />
                  <span className="micro text-ink-mute">
                    deciding the next step
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {showClassical && (
          <div>
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <span className="micro flex items-center gap-2 text-clay">
                <Terminal size={12} />
                Classical rule evaluation
              </span>
            </div>

            <div className="max-h-[520px] min-h-[260px] overflow-y-auto">
              {!classical && !running && (
                <EmptyState text="Rule-by-rule evaluation appears here. Note that the order never changes between runs." />
              )}

              {classical?.steps.map((s, i) => (
                <div key={i} className="border-b border-line px-5 py-4">
                  <div className="mb-2.5 flex items-center gap-2.5">
                    <span className="micro text-ink-mute">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={cn(
                        "micro",
                        s.matched ? "text-moss" : "text-ink-mute",
                      )}
                    >
                      {s.matched ? "matched" : "no match"}
                    </span>
                    <span className="micro text-clay">{s.ruleName}</span>
                  </div>
                  <p className="whitespace-pre-wrap font-mono text-[12.5px] leading-[1.7] text-ink-soft">
                    {s.content}
                  </p>
                </div>
              ))}

              {classical && classical.limitationsEncountered.length > 0 && (
                <div className="border-b border-line bg-band px-5 py-4">
                  <p className="micro mb-3 text-clay">Limitations hit</p>
                  <ul className="space-y-2">
                    {classical.limitationsEncountered.map((l) => (
                      <li
                        key={l}
                        className="text-[12.5px] leading-relaxed text-ink-soft"
                      >
                        {l}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="border-t border-line bg-band px-6 py-5 sm:px-10">
          <p className="micro mb-2 text-rose">Run failed</p>
          <p className="font-mono text-[12.5px] text-ink-soft">{error}</p>
        </div>
      )}

      {/* Final answers */}
      {(result || classical) && (
        <div className="border-t border-line">
          {result && (
            <div className="border-b border-line px-6 py-8 sm:px-10">
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span className="micro text-cobalt">Itinerary</span>
                <span className="micro text-ink-mute">
                  {result.totalSteps} steps, {result.toolsUsed.length} tools,{" "}
                  {(result.duration / 1000).toFixed(1)}s
                </span>
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap font-sans text-[14px] leading-[1.75] text-ink-soft">
                {result.finalAnswer}
              </pre>
            </div>
          )}

          {classical && (
            <div className="px-6 py-8 sm:px-10">
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span className="micro text-clay">Classical output</span>
                <span className="micro text-ink-mute">
                  {classical.matchedRules} of {classical.totalRulesEvaluated}{" "}
                  rules matched, {classical.duration}ms
                </span>
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap font-sans text-[14px] leading-[1.75] text-ink-soft">
                {classical.finalAnswer}
              </pre>
            </div>
          )}
        </div>
      )}

      {!hasOutput && <div className="border-t border-line" />}
    </Section>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex min-h-[260px] items-center justify-center px-8 py-12">
      <p className="max-w-xs text-center text-[13px] leading-relaxed text-ink-mute">
        {text}
      </p>
    </div>
  );
}
