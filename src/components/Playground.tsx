"use client";

import { useState, useRef, useCallback } from "react";
import {
  Plane,
  Building,
  CloudSun,
  Calculator,
  Compass,
  ShieldCheck,
  Play,
  RotateCcw,
  Download,
  Copy,
  Check,
  Sparkles,
  Layers,
  Cpu,
  Clock,
  ArrowRight,
  AlertTriangle
} from "lucide-react";

interface AgentStep {
  type: "thought" | "action" | "observation" | "answer";
  content: string;
  tool?: string;
  toolInput?: string;
  timestamp: number;
}

interface AgentResult {
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

interface ClassicalResult {
  goal: string;
  agentType: string;
  steps: ClassicalStep[];
  finalAnswer: string;
  totalRulesEvaluated: number;
  matchedRules: number;
  duration: number;
  limitationsEncountered: string[];
}

const PRESET_GOALS = [
  {
    title: "Tokyo 5-Day Spring Trip",
    prompt: "Plan a 5-day trip to Tokyo in spring with a mid-range budget of $1600. Include flights, lodging in Shinjuku, live weather forecast, top sights, and an itemized cost calculation.",
  },
  {
    title: "Paris 3-Day Art & Dining",
    prompt: "I want a 3-day cultural weekend in Paris. Check current weather, flight routes, boutique hotels near Latin Quarter, and museum highlights.",
  },
  {
    title: "Goa Beach & Heritage Tour",
    prompt: "Plan a 4-day trip to Goa for 3 friends with nightlife, heritage churches in Old Goa, beach stays, and convert total budget to INR.",
  },
  {
    title: "Kyoto Solo Cultural Trail",
    prompt: "Plan a 4-day solo cultural tour to Kyoto. Include Arashiyama bamboo grove, Fushimi Inari, budget ryokan or hostel stays, and local etiquette guidelines.",
  },
  {
    title: "Bali Wellness & Nature",
    prompt: "Formulate a 6-day wellness trip to Bali with rice terraces in Ubud, beach sunset in Seminyak, current weather check, and estimated lodging expenses.",
  },
];

const STEP_THEMES: Record<string, { label: string; bg: string; border: string; text: string; icon: string }> = {
  thought: {
    label: "THOUGHT",
    bg: "rgba(168, 85, 247, 0.08)",
    border: "rgba(168, 85, 247, 0.3)",
    text: "#c084fc",
    icon: "brain",
  },
  action: {
    label: "ACTION",
    bg: "rgba(56, 189, 248, 0.08)",
    border: "rgba(56, 189, 248, 0.3)",
    text: "#38bdf8",
    icon: "tool",
  },
  observation: {
    label: "OBSERVATION",
    bg: "rgba(251, 191, 36, 0.08)",
    border: "rgba(251, 191, 36, 0.3)",
    text: "#fbbf24",
    icon: "eye",
  },
  answer: {
    label: "FINAL ITINERARY",
    bg: "rgba(52, 211, 153, 0.08)",
    border: "rgba(52, 211, 153, 0.3)",
    text: "#34d399",
    icon: "check",
  },
};

const TOOL_PILLS: Record<string, { name: string; color: string; icon: React.ReactNode }> = {
  weather_forecast: { name: "Weather API", color: "#38bdf8", icon: <CloudSun size={13} /> },
  flight_finder: { name: "Flight Route Engine", color: "#818cf8", icon: <Plane size={13} /> },
  hotel_search: { name: "Lodging Explorer", color: "#f472b6", icon: <Building size={13} /> },
  currency_and_budget_calculator: { name: "Math & FX Calculator", color: "#34d399", icon: <Calculator size={13} /> },
  attractions_explorer: { name: "Attractions Explorer", color: "#fbbf24", icon: <Compass size={13} /> },
  travel_advisory_and_visa: { name: "Visa & Advisory Guide", color: "#fb7185", icon: <ShieldCheck size={13} /> },
};

export default function Playground() {
  const [goal, setGoal] = useState(PRESET_GOALS[0].prompt);
  const [activeMode, setActiveMode] = useState<"modern" | "classical" | "side_by_side">("modern");
  const [isRunning, setIsRunning] = useState(false);
  const [modernSteps, setModernSteps] = useState<AgentStep[]>([]);
  const [modernResult, setModernResult] = useState<AgentResult | null>(null);
  const [classicalResult, setClassicalResult] = useState<ClassicalResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleRun = useCallback(async () => {
    if (!goal.trim() || isRunning) return;

    setIsRunning(true);
    setModernSteps([]);
    setModernResult(null);
    setClassicalResult(null);
    const start = Date.now();
    setStartTime(start);

    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 100));
    }, 100);

    abortControllerRef.current = new AbortController();

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
      if (activeMode === "modern" || activeMode === "side_by_side") {
        const res = await fetch(`${apiBase}/api/agent`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ goal, mode: "modern" }),
          signal: abortControllerRef.current.signal,
        });

        if (!res.body) throw new Error("No response body received");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;

            try {
              const parsed = JSON.parse(jsonStr);
              if (parsed.type === "complete") {
                setModernResult(parsed.result);
              } else if (parsed.type === "error") {
                console.error("Stream error:", parsed.message);
              } else {
                setModernSteps((prev) => [...prev, parsed as AgentStep]);
              }
            } catch (e) {
              console.warn("Parse warning:", e);
            }
          }
        }
      }

      if (activeMode === "classical" || activeMode === "side_by_side") {
        const res = await fetch(`${apiBase}/api/agent`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ goal, mode: "classical" }),
        });
        const data = await res.json();
        if (data.result) {
          setClassicalResult(data.result as ClassicalResult);
        }
      }
    } catch (err: unknown) {
      if ((err as Error)?.name !== "AbortError") {
        console.error("Agent execution error:", err);
      }
    } finally {
      setIsRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [goal, activeMode, isRunning]);

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleCopy = () => {
    const text = modernResult?.finalAnswer || classicalResult?.finalAnswer || "";
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadLogs = () => {
    const logPayload = {
      project: "Atlas Autonomous Travel Concierge",
      timestamp: new Date().toISOString(),
      goal,
      activeMode,
      modernRun: modernResult || { steps: modernSteps },
      classicalRun: classicalResult,
    };
    const blob = new Blob([JSON.stringify(logPayload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `atlas-agent-trace-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section id="playground" className="relative w-full py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-sky-500/10 border border-sky-500/20 text-sky-400 mb-4">
          <Sparkles size={13} />
          Interactive Live Environment
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
          Observable <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">Agentic Playground</span>
        </h2>
        <p className="max-w-2xl text-base sm:text-lg text-zinc-400">
          Inspect every thought, tool dispatch, API payload, and reflection in real time. Compare modern ReAct multi-step reasoning against static rule-based agents.
        </p>
      </div>

      {/* Main Console Box */}
      <div className="rounded-2xl border border-white/10 bg-[#0d0f15]/90 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Console Top Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 border-b border-white/10 bg-white/[0.02]">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-white/10 text-xs font-medium">
            <button
              onClick={() => setActiveMode("modern")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeMode === "modern"
                  ? "bg-sky-500 text-black font-semibold shadow-md"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Cpu size={13} />
              Modern Agent (ReAct)
            </button>
            <button
              onClick={() => setActiveMode("classical")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeMode === "classical"
                  ? "bg-amber-500 text-black font-semibold shadow-md"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Layers size={13} />
              Classical Agent
            </button>
            <button
              onClick={() => setActiveMode("side_by_side")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeMode === "side_by_side"
                  ? "bg-purple-500 text-white font-semibold shadow-md"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Clock size={13} />
              Side-by-Side Dual Run
            </button>
          </div>

          {/* Execution Controls & Stats */}
          <div className="flex items-center gap-3">
            {isRunning && (
              <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                {(elapsed / 10).toFixed(1)}s elapsed
              </div>
            )}
            <button
              onClick={handleDownloadLogs}
              disabled={modernSteps.length === 0 && !classicalResult}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-medium transition-colors"
              title="Download Trace JSON"
            >
              <Download size={13} />
              Export Logs
            </button>
          </div>
        </div>

        {/* Input & Preset Row */}
        <div className="p-4 sm:p-6 border-b border-white/10 bg-white/[0.01]">
          {/* Preset Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-3 scrollbar-none text-xs">
            <span className="text-zinc-500 font-medium whitespace-nowrap">Presets:</span>
            {PRESET_GOALS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => setGoal(p.prompt)}
                className="whitespace-nowrap px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-zinc-300 hover:text-white transition-colors"
              >
                {p.title}
              </button>
            ))}
          </div>

          {/* Textarea + Run Button */}
          <div className="flex flex-col sm:flex-row gap-3">
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              rows={3}
              placeholder="Enter your travel planning request with constraints (destination, dates, budget, interests)..."
              className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500/60 resize-none font-sans"
            />
            <div className="flex sm:flex-col justify-end gap-2">
              {!isRunning ? (
                <button
                  onClick={handleRun}
                  disabled={!goal.trim()}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 text-black font-bold text-sm shadow-lg shadow-sky-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Play size={15} fill="currentColor" />
                  Run Agent
                </button>
              ) : (
                <button
                  onClick={handleStop}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 font-semibold text-sm transition-all"
                >
                  <RotateCcw size={15} />
                  Stop
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Live Execution Panel */}
        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[460px]">
          {/* Modern Agent Trace Feed */}
          {(activeMode === "modern" || activeMode === "side_by_side") && (
            <div className={activeMode === "side_by_side" ? "lg:col-span-7 flex flex-col" : "lg:col-span-12 flex flex-col"}>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                    Modern ReAct Agent Trace
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    ({modernSteps.length} steps recorded)
                  </span>
                </div>
                {modernResult && (
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <span>{modernResult.toolsUsed.length} tools utilized</span>
                    <span>-</span>
                    <span>{(modernResult.duration / 1000).toFixed(2)}s total</span>
                  </div>
                )}
              </div>

              {/* Steps Scroll Area */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[580px] pr-2">
                {modernSteps.length === 0 && !isRunning && (
                  <div className="h-48 flex flex-col items-center justify-center text-center text-zinc-500 text-sm">
                    <Compass size={32} className="mb-2 text-zinc-600" />
                    <p>Agent is standing by.</p>
                    <p className="text-xs text-zinc-600">Select a preset or enter a goal and click &quot;Run Agent&quot;.</p>
                  </div>
                )}

                {modernSteps.map((step, idx) => {
                  const theme = STEP_THEMES[step.type] || STEP_THEMES.thought;
                  return (
                    <div
                      key={idx}
                      className="rounded-xl border p-3.5 transition-all"
                      style={{ backgroundColor: theme.bg, borderColor: theme.border }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase"
                          style={{ color: theme.text, backgroundColor: `${theme.border}` }}
                        >
                          {theme.label} {step.type !== "answer" ? `#${idx + 1}` : ""}
                        </span>
                        {step.tool && TOOL_PILLS[step.tool] && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium"
                            style={{
                              color: TOOL_PILLS[step.tool].color,
                              backgroundColor: `${TOOL_PILLS[step.tool].color}15`,
                              border: `1px solid ${TOOL_PILLS[step.tool].color}30`,
                            }}
                          >
                            {TOOL_PILLS[step.tool].icon}
                            {TOOL_PILLS[step.tool].name}
                          </span>
                        )}
                      </div>
                      <div className="text-xs sm:text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed font-mono">
                        {step.content}
                      </div>
                    </div>
                  );
                })}

                {isRunning && (
                  <div className="p-3 rounded-xl border border-sky-500/20 bg-sky-500/5 flex items-center gap-3 text-xs text-sky-400 font-mono">
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                    Agent orchestrating reasoning step...
                  </div>
                )}
              </div>

              {/* Action Buttons if Finished */}
              {modernResult && (
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <div className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
                    <Check size={14} />
                    Autonomous planning synthesis complete
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-300 font-medium transition-colors"
                  >
                    {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    {copied ? "Copied" : "Copy Itinerary"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Classical Agent Trace / Side-by-Side Panel */}
          {(activeMode === "classical" || activeMode === "side_by_side") && (
            <div className={activeMode === "side_by_side" ? "lg:col-span-5 flex flex-col border-t lg:border-t-0 lg:border-l border-white/10 lg:pl-6 pt-6 lg:pt-0" : "lg:col-span-12 flex flex-col"}>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Classical Rule-Based Agent
                  </span>
                </div>
                {classicalResult && (
                  <span className="text-xs text-zinc-500 font-mono">
                    {classicalResult.duration}ms
                  </span>
                )}
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto max-h-[580px] pr-2">
                {!classicalResult ? (
                  <div className="h-48 flex flex-col items-center justify-center text-center text-zinc-500 text-sm">
                    <Layers size={32} className="mb-2 text-zinc-600" />
                    <p>Static rule evaluation pending.</p>
                    <p className="text-xs text-zinc-600">Triggers fixed lookup tables without tool reflection.</p>
                  </div>
                ) : (
                  <>
                    {/* Rules Evaluated */}
                    <div className="space-y-2">
                      {classicalResult.steps.map((st, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs font-mono"
                        >
                          <div className="flex items-center justify-between text-amber-300 font-bold mb-1">
                            <span>{st.ruleName}</span>
                            <span>{st.matched ? "MATCHED" : "NO MATCH"}</span>
                          </div>
                          <div className="text-zinc-300">{st.content}</div>
                        </div>
                      ))}
                    </div>

                    {/* Limitations Callout */}
                    {classicalResult.limitationsEncountered.length > 0 && (
                      <div className="p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-xs">
                        <div className="flex items-center gap-1.5 text-red-400 font-bold mb-2">
                          <AlertTriangle size={13} />
                          Classical Limitations Triggered:
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-zinc-300">
                          {classicalResult.limitationsEncountered.map((lim, i) => (
                            <li key={i}>{lim}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Output */}
                    <div className="p-3 rounded-xl border border-white/10 bg-black/40 text-xs text-zinc-300 font-mono whitespace-pre-wrap">
                      {classicalResult.finalAnswer}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
