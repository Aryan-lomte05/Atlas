"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  ArrowUpRight,
  Brain,
  ChevronDown,
  CircleDot,
  Download,
  Eye,
  Loader2,
  Square,
  Wrench,
} from "lucide-react";
import { Section, SectionHead } from "./Section";
import CopyButton from "./CopyButton";
import Markdown from "./Markdown";
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
  model?: string;
  simulated?: boolean;
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

interface Turn {
  id: string;
  goal: string;
  mode: Mode;
  steps: AgentStep[];
  result?: AgentRunResult;
  classical?: ClassicalRunResult;
  error?: string;
  running: boolean;
  startedAt: number;
}

const PRESETS = [
  "Plan 5 days in Kyoto in early April for two people on a 90000 INR budget.",
  "5 days in Mumbai for two. Tell me exactly where to eat and what to see.",
  "A week in Reykjavik in November. No budget set. What should I know?",
  "Four days in Goa for three friends, 18000 INR total.",
];

const FOLLOW_UPS = [
  "Make it cheaper.",
  "What should I pack?",
  "Swap day 3 for something indoors.",
  "Add one more day.",
];

const STEP_META: Record<
  AgentStep["type"],
  { label: string; tone: string; Icon: typeof Brain }
> = {
  thought: { label: "Thought", tone: "text-plum", Icon: Brain },
  action: { label: "Action", tone: "text-cobalt", Icon: Wrench },
  observation: { label: "Observation", tone: "text-lagoon", Icon: Eye },
  answer: { label: "Answer", tone: "text-ink", Icon: CircleDot },
};

/* ---------------- component ---------------- */

export default function Playground() {
  const [draft, setDraft] = useState("");
  const [mode, setMode] = useState<Mode>("react");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [tick, setTick] = useState(0);

  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pinned = useRef(true);

  const running = turns.some((t) => t.running);
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "";

  /* live timer while a turn is in flight */
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTick((t) => t + 1), 200);
    return () => clearInterval(id);
  }, [running]);

  /* follow the conversation unless the reader has scrolled up */
  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < 90;
  }, []);

  /**
   * Keep the newest step in view.
   *
   * This sets scrollTop on the conversation pane rather than calling
   * scrollIntoView, which walks up the ancestor chain and scrolls the whole
   * document. That is what made the landing page open part-way down at the
   * console instead of at the top.
   */
  useEffect(() => {
    if (turns.length === 0) return;
    if (!pinned.current) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns, tick]);

  function patch(id: string, update: Partial<Turn>) {
    setTurns((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...update } : t)),
    );
  }

  function appendStep(id: string, step: AgentStep) {
    setTurns((prev) =>
      prev.map((t) => (t.id === id ? { ...t, steps: [...t.steps, step] } : t)),
    );
  }

  /** Settled turns, sent so a follow-up knows what it is amending. */
  function historyPayload() {
    return turns
      .filter((t) => !t.running && (t.result || t.classical))
      .slice(-4)
      .map((t) => ({
        goal: t.goal,
        answer: t.result?.finalAnswer ?? t.classical?.finalAnswer ?? "",
      }));
  }

  async function runClassical(id: string, goal: string, signal: AbortSignal) {
    const res = await fetch(`${apiBase}/api/agent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal, mode: "classical" }),
      signal,
    });
    if (!res.ok) throw new Error(`Classical agent returned ${res.status}`);
    const json = await res.json();
    patch(id, { classical: json.result as ClassicalRunResult });
  }

  async function runReact(
    id: string,
    goal: string,
    history: { goal: string; answer: string }[],
    signal: AbortSignal,
  ) {
    const res = await fetch(`${apiBase}/api/agent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal, mode: "react", history }),
      signal,
    });
    if (!res.ok || !res.body) throw new Error(`Agent route returned ${res.status}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

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
          patch(id, { result: p.result as AgentRunResult });
        } else if (p.type === "error") {
          patch(id, { error: String(p.message ?? "Agent error") });
        } else if (typeof p.type === "string") {
          appendStep(id, p as unknown as AgentStep);
        }
      }
    }
  }

  async function send(text?: string) {
    const goal = (text ?? draft).trim();
    if (!goal || running) return;

    const id = `${Date.now()}`;
    const history = historyPayload();

    setTurns((prev) => [
      ...prev,
      { id, goal, mode, steps: [], running: true, startedAt: Date.now() },
    ]);
    setDraft("");
    pinned.current = true;

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      if (mode === "classical") {
        await runClassical(id, goal, ctrl.signal);
      } else if (mode === "react") {
        await runReact(id, goal, history, ctrl.signal);
      } else {
        await Promise.all([
          runReact(id, goal, history, ctrl.signal),
          runClassical(id, goal, ctrl.signal),
        ]);
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        patch(id, { error: (e as Error).message });
      }
    } finally {
      patch(id, { running: false });
      abortRef.current = null;
    }
  }

  function stop() {
    abortRef.current?.abort();
    setTurns((prev) => prev.map((t) => ({ ...t, running: false })));
  }

  function transcript(): string {
    const out: string[] = [
      "Atlas agent transcript",
      `captured: ${new Date().toISOString()}`,
      "",
    ];
    for (const t of turns) {
      out.push("=".repeat(64), `GOAL: ${t.goal}`, `MODE: ${t.mode}`, "=".repeat(64), "");
      t.steps.forEach((s, i) => {
        out.push(`[${String(i + 1).padStart(2, "0")}] ${s.type.toUpperCase()}`);
        if (s.tool) out.push(`     tool: ${s.tool}(${s.toolInput ?? ""})`);
        out.push(...s.content.split("\n").map((l) => `     ${l}`), "");
      });
      if (t.result) {
        out.push(
          "SUMMARY",
          `  model: ${t.result.model ?? "n/a"}`,
          `  steps: ${t.result.totalSteps}`,
          `  tools: ${t.result.toolsUsed.join(", ")}`,
          `  duration: ${(t.result.duration / 1000).toFixed(1)}s`,
          "",
        );
      }
    }
    return out.join("\n");
  }

  function downloadTranscript() {
    const blob = new Blob([transcript()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `atlas-transcript-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const suggestions = turns.length === 0 ? PRESETS : FOLLOW_UPS;

  return (
    <Section id="playground">
      <SectionHead
        index="#01"
        label="Live playground"
        title="Give it a goal. Watch it decide."
        lede="This runs the real agent against the real tools. Every thought, tool call and observation below is produced during the run, not replayed. Ask a follow-up and it keeps the thread."
      />

      <div className="px-4 pb-14 sm:px-10">
        {/* macOS style window */}
        <div className="overflow-hidden rounded-[10px] border border-line-strong bg-surface shadow-2xl">
          {/* Title bar */}
          <div className="flex items-center gap-3 border-b border-line bg-raised/60 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            </div>
            <p className="micro flex-1 text-center text-ink-mute">
              atlas {turns.length > 0 ? `- ${turns.length} turn${turns.length === 1 ? "" : "s"}` : "- travel agent"}
            </p>
            <div className="flex items-center gap-2">
              {turns.length > 0 && (
                <>
                  <CopyButton value={transcript} label="Copy" />
                  <button
                    type="button"
                    onClick={downloadTranscript}
                    className="micro flex items-center gap-1.5 rounded-[3px] border border-line px-2.5 py-1.5 text-ink-mute transition-colors hover:border-line-strong hover:text-ink"
                  >
                    <Download size={11} />
                    .txt
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Conversation. Collapsed until there is something to read, so an
              untouched console is not 600px of empty space. */}
          <div
            ref={scrollRef}
            onScroll={onScroll}
            data-lenis-prevent
            className={cn(
              "overflow-y-auto overscroll-contain bg-canvas/40 px-4 py-6 transition-[height] duration-500 sm:px-6",
              turns.length === 0 ? "h-[300px]" : "h-[min(68vh,620px)]",
            )}
          >
            {turns.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="mx-auto flex max-w-3xl flex-col gap-8">
                {turns.map((t) => (
                  <TurnView key={t.id} turn={t} />
                ))}
              </div>
            )}
          </div>

          {/* Composer, pinned to the bottom */}
          <div className="border-t border-line bg-raised/40 px-4 py-4 sm:px-6">
            <div className="mx-auto max-w-3xl">
              {/* Suggestions. Two columns when they are full goals, inline
                  when they are short follow-ups. */}
              <div
                className={cn(
                  "mb-3 gap-2",
                  turns.length === 0
                    ? "grid grid-cols-1 sm:grid-cols-2"
                    : "flex flex-wrap",
                )}
              >
                {suggestions.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => send(p)}
                    disabled={running}
                    title={p}
                    className="group flex items-center gap-2 rounded-[6px] border border-line bg-surface/60 px-3 py-2 text-left transition-colors hover:border-cobalt/40 hover:bg-surface disabled:opacity-40"
                  >
                    <ArrowUpRight
                      size={11}
                      className="shrink-0 text-ink-mute transition-colors group-hover:text-cobalt"
                    />
                    <span className="micro truncate text-ink-soft transition-colors group-hover:text-ink">
                      {p}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex items-end gap-2 rounded-[8px] border border-line bg-surface px-3 py-2.5 focus-within:border-line-strong">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={1}
                  spellCheck={false}
                  placeholder={
                    turns.length === 0
                      ? "Where do you want to go?"
                      : "Ask a follow-up..."
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send();
                    }
                  }}
                  className="max-h-32 min-h-[28px] flex-1 resize-none bg-transparent py-1 text-[15px] leading-relaxed text-ink outline-none placeholder:text-ink-mute"
                />

                {running ? (
                  <button
                    type="button"
                    onClick={stop}
                    aria-label="Stop"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-ink-soft transition-colors hover:text-ink"
                  >
                    <Square size={13} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => send()}
                    disabled={!draft.trim()}
                    aria-label="Send"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cobalt text-[#231007] transition-colors hover:bg-cobalt-deep disabled:opacity-35"
                  >
                    <ArrowUp size={15} />
                  </button>
                )}
              </div>

              {/* Mode switch */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center rounded-full border border-line">
                  {(
                    [
                      ["react", "ReAct agent"],
                      ["classical", "Classical"],
                      ["both", "Compare"],
                    ] as [Mode, string][]
                  ).map(([m, label], i) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      aria-pressed={mode === m}
                      className={cn(
                        "micro px-3 py-1.5 transition-colors",
                        i === 0 && "rounded-l-full",
                        i === 2 && "rounded-r-full",
                        mode === m
                          ? "bg-cobalt text-[#231007]"
                          : "text-ink-mute hover:text-ink",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <span className="micro text-ink-mute">
                  Enter to send, Shift + Enter for a new line
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ---------------- pieces ---------------- */

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="mb-5 grid h-11 w-11 place-items-center rounded-full border border-line bg-surface">
        <Brain size={17} className="text-cobalt" />
      </div>
      <p className="font-serif text-[1.5rem] font-light leading-snug text-ink">
        Tell Atlas where you want to go.
      </p>
      <p className="mt-3 max-w-sm text-[13.5px] leading-relaxed text-ink-soft">
        It will think, call the tools it needs, and show every step on the way
        to the plan. Then you can keep talking to it.
      </p>
      <p className="micro mt-6 text-ink-mute">
        Pick a starting point below, or type your own
      </p>
    </div>
  );
}

function TurnView({ turn }: { turn: Turn }) {
  const [open, setOpen] = useState(true);
  const elapsed = turn.running
    ? (Date.now() - turn.startedAt) / 1000
    : (turn.result?.duration ?? 0) / 1000;

  const toolCount = new Set(
    turn.steps.filter((s) => s.tool && s.type === "action").map((s) => s.tool),
  ).size;

  return (
    <div className="flex flex-col gap-4">
      {/* Traveller message */}
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-[10px] rounded-br-[3px] bg-cobalt px-4 py-2.5 text-[14.5px] leading-relaxed text-[#231007]">
          {turn.goal}
        </div>
      </div>

      {/* Agent side */}
      <div className="flex flex-col gap-3">
        {/* Reasoning disclosure */}
        {turn.steps.length > 0 && (
          <div className="overflow-hidden rounded-[8px] border border-line bg-surface">
            <button
              type="button"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-3 px-4 py-2.5 transition-colors hover:bg-raised/40"
            >
              <span className="micro flex items-center gap-2 text-ink-soft">
                {turn.running ? (
                  <Loader2 size={11} className="animate-spin text-cobalt" />
                ) : (
                  <Wrench size={11} className="text-cobalt" />
                )}
                {turn.running ? "Working" : "Reasoning"}
                <span className="text-ink-mute">
                  {turn.steps.length} steps, {toolCount} tools,{" "}
                  {elapsed.toFixed(1)}s
                </span>
              </span>
              <ChevronDown
                size={14}
                className={cn(
                  "shrink-0 text-ink-mute transition-transform",
                  open && "rotate-180",
                )}
              />
            </button>

            {open && (
              <div
                data-lenis-prevent
                className="max-h-80 overflow-y-auto overscroll-contain border-t border-line"
              >
                {turn.steps
                  .filter((s) => s.type !== "answer")
                  .map((s, i) => {
                    const meta = STEP_META[s.type] ?? STEP_META.thought;
                    const Icon = meta.Icon;
                    return (
                      <div
                        key={i}
                        className="animate-rise border-b border-line px-4 py-3 last:border-0"
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <span className="micro text-ink-mute">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <Icon size={11} className={meta.tone} />
                          <span className={cn("micro", meta.tone)}>
                            {meta.label}
                          </span>
                          {s.tool && (
                            <span className="micro rounded-[3px] border border-line px-1.5 py-0.5 text-ink-mute">
                              {s.tool}
                            </span>
                          )}
                        </div>
                        <p className="whitespace-pre-wrap font-mono text-[11.5px] leading-[1.7] text-ink-soft">
                          {s.content.length > 900
                            ? `${s.content.slice(0, 900)}...`
                            : s.content}
                        </p>
                      </div>
                    );
                  })}

                {turn.running && (
                  <div className="flex items-center gap-2 px-4 py-3">
                    <Loader2 size={11} className="animate-spin text-cobalt" />
                    <span className="micro text-ink-mute">
                      deciding the next step
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {turn.running && turn.steps.length === 0 && (
          <div className="flex items-center gap-2.5 px-1">
            <Loader2 size={13} className="animate-spin text-cobalt" />
            <span className="micro text-ink-mute">thinking</span>
          </div>
        )}

        {/* Error */}
        {turn.error && (
          <div className="rounded-[8px] border border-rose/30 bg-rose/5 px-4 py-3">
            <p className="micro mb-1.5 text-rose">Run failed</p>
            <p className="font-mono text-[12px] text-ink-soft">{turn.error}</p>
          </div>
        )}

        {/* Answers */}
        {turn.result && (
          <AnswerCard
            tone="cobalt"
            label="Itinerary"
            meta={`${turn.result.totalSteps} steps, ${turn.result.toolsUsed.length} tools, ${(turn.result.duration / 1000).toFixed(1)}s${
              turn.result.simulated ? ", deterministic planner" : ""
            }`}
            body={turn.result.finalAnswer}
          />
        )}

        {turn.classical && (
          <AnswerCard
            tone="gold"
            label="Classical rule-based output"
            meta={`${turn.classical.matchedRules} of ${turn.classical.totalRulesEvaluated} rules matched, ${turn.classical.duration}ms`}
            body={turn.classical.finalAnswer}
          />
        )}
      </div>
    </div>
  );
}

function AnswerCard({
  tone,
  label,
  meta,
  body,
}: {
  tone: "cobalt" | "gold";
  label: string;
  meta: string;
  body: string;
}) {
  return (
    <div className="overflow-hidden rounded-[10px] rounded-bl-[3px] border border-line bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <span
            className={cn(
              "micro",
              tone === "cobalt" ? "text-cobalt" : "text-gold",
            )}
          >
            {label}
          </span>
          <span className="micro text-ink-mute">{meta}</span>
        </div>
        <CopyButton value={body} label="Copy" />
      </div>
      <div
        data-lenis-prevent
        className="max-h-[460px] overflow-y-auto overscroll-contain px-4 py-4"
      >
        <Markdown>{body}</Markdown>
      </div>
    </div>
  );
}
