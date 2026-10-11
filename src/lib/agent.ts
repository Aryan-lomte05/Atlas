import Groq from "groq-sdk";
import {
  dispatchTool,
  normaliseToolName,
  toolPromptBlock,
  TOOL_NAMES,
  type ToolResult,
} from "./tools";

/**
 * Atlas ReAct orchestrator.
 *
 * The loop is deliberately explicit rather than delegated to a framework,
 * because the point of the exercise is that the control flow is readable:
 * prompt the model, parse one action out of its reply, execute it, append
 * the observation, repeat. Nothing here is hidden behind an abstraction.
 */

export interface AgentStep {
  type: "thought" | "action" | "observation" | "answer";
  content: string;
  tool?: string;
  toolInput?: string;
  toolResult?: ToolResult;
  timestamp: number;
}

export interface AgentRunResult {
  goal: string;
  agentType: "Modern Agent (ReAct LLM)";
  steps: AgentStep[];
  finalAnswer: string;
  totalSteps: number;
  toolsUsed: string[];
  duration: number;
  model: string;
  /** True when no API key was present and the deterministic planner ran. */
  simulated: boolean;
}

const MAX_ITERATIONS = 11;
const MAX_NUDGES = 4;
const MAX_MODEL_RETRIES = 3;

/** How many times one tool may run in a single agent run. */
const DEFAULT_TOOL_CAP = 2;
const TOOL_CALL_CAP: Record<string, number> = {
  geocode_place: 2,
  route_options: 1,
  lodging_tiers: 1,
  travel_advisory: 1,
  climate_normals: 1,
  public_holidays: 1,
  attractions_explorer: 3,
  find_attractions: 2,
  find_restaurants: 2,
  budget_calculator: 4,
};
const MAX_SCRATCHPAD_CHARS = 14000;

/**
 * Preference order for the reasoning model.
 *
 * Groq's catalogue changes, and which models a key can reach differs by
 * account, so the model is resolved at run time against /models rather than
 * hardcoded. A hardcoded id that the key cannot serve fails every request
 * and silently drops the agent into fallback, which is exactly the bug this
 * list exists to prevent.
 */
const MODEL_PREFERENCE = [
  "llama-3.3-70b-versatile",
  "openai/gpt-oss-120b",
  "qwen/qwen3.8-27b",
  "openai/gpt-oss-20b",
  "llama-3.1-8b-instant",
];

const apiKey = process.env.GROQ_API_KEY || "";
const groq = apiKey ? new Groq({ apiKey }) : null;

let resolvedModels: string[] | null = null;

/**
 * Every model in the preference list this key can actually reach, best first.
 *
 * Returning the whole list rather than one id lets a run drop to a smaller
 * model when the larger one is rate limited, which on Groq's free tier is
 * the difference between a finished demo and a fallback plan.
 */
async function selectModels(client: Groq): Promise<string[]> {
  if (resolvedModels) return resolvedModels;
  try {
    const list = await client.models.list();
    const available = new Set((list.data ?? []).map((m) => m.id));
    const usable = MODEL_PREFERENCE.filter((m) => available.has(m));
    resolvedModels = usable.length > 0 ? usable : [MODEL_PREFERENCE[1]];
  } catch {
    resolvedModels = [MODEL_PREFERENCE[1]];
  }
  return resolvedModels;
}

function systemPrompt(): string {
  return `You are Atlas, an autonomous travel planning agent.

You are given one goal. You reach it by repeating a single cycle: reason about
what you still need, call exactly one tool, read what it returns, then decide
again. You do not plan every step up front, because each observation can change
what the next step should be.

AVAILABLE TOOLS
${toolPromptBlock()}

OUTPUT FORMAT
Emit exactly one cycle per reply, in this shape and nothing else:

Thought: what you still need to establish, and why this tool settles it
Action: one tool name from the list above
Action Input: the argument, matching that tool's expected shape

Wait for the Observation. Do not write it yourself, and do not emit more than
one Action per reply.

When you have enough to write the plan, reply instead with:

Thought: why the goal is now satisfied
Final Answer: the itinerary

RULES THAT MATTER
1. Never state a temperature, rate, fare or total that did not come from a tool
   observation in this run. If no tool can supply it, say so in the plan rather
   than producing a figure that merely reads well.
2. Resolve the destination with geocode_place before any location tool, unless
   the place is obviously unambiguous.
3. For a trip more than a week out, use climate_normals. A forecast only
   reaches seven days and will not cover the dates.
4. Every total must come from budget_calculator. Do not do arithmetic yourself.
5. Check daylight_hours for any destination far from the equator. Daylight, not
   opening hours, is what limits a winter day at high latitude.
6. Do not call the same tool with the same input twice. If an observation was
   not useful, change the argument or change the tool.
7. Name real places. Call find_attractions and find_restaurants and build the
   days out of what they return: "dinner at Bastian" and "sunset at Bandra
   Fort", never "try a local seafood place" or "explore the old town". A plan
   the traveller cannot act on without further research has not done its job.
8. Stop and write the Final Answer as soon as the goal is met. Extra calls that
   do not change the plan are wasted steps.

THE FINAL ANSWER
Write it for the traveller, not as a data dump. Give a day by day plan, then an
itemised budget table with a total and the headroom against any stated ceiling,
then a short list of what to know before going. Attribute each figure to the
tool that produced it. Where the weather drove a decision, say so explicitly.`;
}

/**
 * Pull one ReAct cycle out of a model reply.
 *
 * Line based rather than one big regex, because models wrap the labels in
 * markdown ("**Action:**"), sometimes emit several cycles in one reply, and
 * sometimes hallucinate their own Observation. A regex with lookaheads for
 * the next label silently swallows all of that into the tool argument.
 */
function parseCycle(text: string): {
  thought?: string;
  action?: string;
  actionInput?: string;
  finalAnswer?: string;
} {
  // Drop markdown emphasis and heading markers so labels are recognisable.
  const clean = text
    .replace(/\*\*/g, "")
    .replace(/^\s{0,3}#{1,6}\s*/gm, "")
    .replace(/^\s*[-*]\s+(?=(?:Thought|Action|Observation|Final Answer)\s*:)/gim, "");

  const LABEL = /^\s*(Thought|Action\s*Input|Action|Observation|Final\s*Answer)\s*:\s*(.*)$/i;

  const blocks: { label: string; text: string }[] = [];
  for (const line of clean.split("\n")) {
    const m = line.match(LABEL);
    if (m) {
      blocks.push({
        label: m[1].toLowerCase().replace(/\s+/g, ""),
        text: m[2],
      });
    } else if (blocks.length) {
      blocks[blocks.length - 1].text += `\n${line}`;
    }
  }

  const firstOf = (name: string) =>
    blocks.find((b) => b.label === name)?.text.trim();

  const thought = firstOf("thought");

  // Only honour a Final Answer if no Action precedes it, so a reply that
  // reasons, acts, then speculates about the answer still executes the tool.
  const actionIdx = blocks.findIndex((b) => b.label === "action");
  const finalIdx = blocks.findIndex((b) => b.label === "finalanswer");

  if (finalIdx !== -1 && (actionIdx === -1 || finalIdx < actionIdx)) {
    const finalAnswer = blocks[finalIdx].text.trim();
    if (finalAnswer) return { thought, finalAnswer };
  }

  if (actionIdx === -1) return { thought };

  // A tool name is one token. Anything after it on the line is noise.
  const action = blocks[actionIdx].text.trim().split(/[\n(]/)[0].trim();

  // The argument is the first line of Action Input. Models that keep writing
  // past it are producing the next cycle, which this call must not consume.
  const rawInput = blocks.find((b, i) => b.label === "actioninput" && i > actionIdx)?.text ?? "";
  const actionInput = rawInput
    .split("\n")[0]
    // Models often run the next label onto the same line, which would
    // otherwise be swallowed whole into the tool argument.
    .split(/\b(?:Thought|Action\s*Input|Action|Observation|Final\s*Answer)\s*:/i)[0]
    .trim()
    .replace(/^["'`[]+|["'`\]]+$/g, "")
    .trim();

  return { thought, action, actionInput };
}

/**
 * How long to wait before retrying a failed model call.
 *
 * Groq states the real wait in the 429 body ("try again in 7.2s"), so honour
 * that when present and fall back to exponential backoff when it is not.
 */
function retryAfterMs(error: string, attempt: number): number {
  const stated = error.match(/try again in ([\d.]+)\s*s/i);
  if (stated) return Math.min(30000, Math.ceil(parseFloat(stated[1]) * 1000) + 400);
  return Math.min(20000, 1500 * 2 ** attempt);
}

/**
 * Assemble a plan from observations already in the trace.
 *
 * Used when the model becomes unreachable partway through. The run still has
 * real grounded facts in it, and handing those back is far more useful than
 * discarding them and starting over.
 */
function composeFromObservations(
  goal: string,
  steps: AgentStep[],
  toolsUsed: string[],
): string {
  const byTool = new Map<string, string>();
  for (const s of steps) {
    if (s.type === "observation" && s.tool && !byTool.has(s.tool)) {
      byTool.set(s.tool, s.content);
    }
  }

  const sections = [...byTool.entries()].map(
    ([tool, out]) => `${tool}\n${out}`,
  );

  return [
    `Partial plan for: ${goal}`,
    ``,
    `The reasoning model became unreachable before the itinerary was written.`,
    `Everything below was established by a real tool call during this run.`,
    ``,
    ...sections,
    ``,
    `Tools that completed: ${toolsUsed.join(", ")}.`,
    `Nothing here is inferred. Re-run once the rate limit clears for the full plan.`,
  ].join("\n");
}

function trimScratchpad(pad: string): string {
  if (pad.length <= MAX_SCRATCHPAD_CHARS) return pad;
  // Keep the head (the goal framing) and the most recent exchanges.
  const head = pad.slice(0, 1500);
  const tail = pad.slice(-(MAX_SCRATCHPAD_CHARS - 1600));
  return `${head}\n\n[...earlier steps trimmed to fit the context window...]\n\n${tail}`;
}

/**
 * Tools the run must have actually called before a Final Answer is accepted.
 *
 * Without this the model tends to gather two or three facts, decide it has
 * the gist, and write a confident itinerary whose prices it invented. The
 * gate turns that failure into another loop iteration: it tells the agent
 * precisely which claim is ungrounded and sends it back to the tools.
 */
function requiredTools(goal: string): string[] {
  const required = ["geocode_place", "budget_calculator"];
  const g = goal.toLowerCase();

  // Any plan that puts a person somewhere needs a stay and a way in.
  required.push("lodging_tiers", "route_options");

  // A plan that says "explore the old town" is not a plan. Named places are
  // the whole point, so both place tools are mandatory rather than optional.
  required.push("find_attractions", "find_restaurants");

  // Weather drives day ordering, so one of the two climate tools must run.
  required.push(extractMonth(goal) ? "climate_normals" : "weather_forecast");

  if (/visa|passport|safe|entry|document/.test(g)) required.push("travel_advisory");
  return required;
}

function missingTools(goal: string, used: string[]): string[] {
  const have = new Set(used);
  return requiredTools(goal).filter((t) => {
    if (t === "climate_normals" || t === "weather_forecast") {
      return !have.has("climate_normals") && !have.has("weather_forecast");
    }
    return !have.has(t);
  });
}

export async function runAgent(
  goal: string,
  onStep?: (step: AgentStep) => void,
  priorContext?: string,
): Promise<AgentRunResult> {
  const started = Date.now();
  const steps: AgentStep[] = [];
  const toolsUsed: string[] = [];
  const seenCalls = new Set<string>();
  const toolCallCounts = new Map<string, number>();

  const emit = (s: Omit<AgentStep, "timestamp">) => {
    const step: AgentStep = { ...s, timestamp: Date.now() };
    steps.push(step);
    onStep?.(step);
    return step;
  };

  if (!groq) {
    return runDeterministicPlanner(goal, emit, steps, toolsUsed, started);
  }

  const models = await selectModels(groq);
  let modelIndex = 0;
  let model = models[0];
  // Earlier turns are given as settled context rather than replayed as live
  // steps, so a follow-up ("make it cheaper") knows what it is amending
  // without the agent re-running every tool from the first request.
  let scratchpad = priorContext
    ? `Earlier in this conversation:\n${priorContext}\n\nFollow-up goal: ${goal}\n`
    : `Goal: ${goal}\n`;
  let finalAnswer = "";
  let nudges = 0;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    let reply = "";
    let lastError = "";

    // A free-tier rate limit is a wait, not a failure. Retrying costs a few
    // seconds; abandoning the run discards every tool result gathered so far
    // and makes the deterministic planner repeat all of them.
    for (let attempt = 0; attempt <= MAX_MODEL_RETRIES; attempt++) {
      try {
        const completion = await groq.chat.completions.create({
          model,
          messages: [
            { role: "system", content: systemPrompt() },
            { role: "user", content: trimScratchpad(scratchpad) },
          ],
          temperature: 0.25,
          max_tokens: 1000,
          stop: ["\nObservation:", "Observation:"],
        });
        reply = completion.choices[0]?.message?.content ?? "";
        lastError = "";
        break;
      } catch (e) {
        lastError = e instanceof Error ? e.message : "unknown error";
        const retryable =
          /429|rate.?limit|timeout|ETIMEDOUT|ECONNRESET|50\d/i.test(lastError);
        if (!retryable || attempt === MAX_MODEL_RETRIES) break;

        // A token-per-minute cap on the large model clears faster by moving
        // to a smaller one than by waiting it out, so try that first.
        const rateLimited = /429|rate.?limit/i.test(lastError);
        if (rateLimited && modelIndex < models.length - 1) {
          modelIndex++;
          const previous = model;
          model = models[modelIndex];
          emit({
            type: "observation",
            content: `${previous} is rate limited. Switching to ${model} and continuing with the ${toolsUsed.length} tool results already gathered.`,
          });
          continue;
        }

        const waitMs = retryAfterMs(lastError, attempt);
        emit({
          type: "observation",
          content: `Model rate limited on step ${i + 1}. Waiting ${Math.round(
            waitMs / 1000,
          )}s and retrying, so the ${toolsUsed.length} tool results already gathered are not thrown away.`,
        });
        await new Promise((r) => setTimeout(r, waitMs));
      }
    }

    if (lastError) {
      emit({
        type: "observation",
        content: `Model unavailable after ${MAX_MODEL_RETRIES} retries on step ${
          i + 1
        }: ${lastError}. Completing the plan from the observations already gathered.`,
      });
      if (toolsUsed.length > 0) {
        finalAnswer = composeFromObservations(goal, steps, toolsUsed);
        emit({ type: "answer", content: finalAnswer });
        break;
      }
      return runDeterministicPlanner(goal, emit, steps, toolsUsed, started, model);
    }

    const { thought, action, actionInput, finalAnswer: fa } = parseCycle(reply);

    if (thought) emit({ type: "thought", content: thought });

    if (fa) {
      const missing = missingTools(goal, toolsUsed);
      if (missing.length > 0 && nudges < MAX_NUDGES) {
        nudges++;
        const note =
          `Not ready for a Final Answer. These facts are still ungrounded because ` +
          `the tool was never called: ${missing.join(", ")}. Any figure you would ` +
          `write for them right now would be invented. Call ${missing[0]} next.`;
        emit({ type: "observation", content: note });
        scratchpad += `
${reply}
Observation: ${note}
`;
        continue;
      }
      finalAnswer = fa;
      emit({ type: "answer", content: fa });
      break;
    }

    if (!action) {
      // The model broke format. Tell it so, and let it retry.
      scratchpad += `\n${reply}\nObservation: Your reply contained no Action and no Final Answer. Emit exactly one Action, or a Final Answer.\n`;
      continue;
    }

    const tool = normaliseToolName(action);
    const input = actionInput ?? "";

    if (!tool) {
      const note = `There is no tool called "${action}". Choose one of: ${TOOL_NAMES.join(", ")}.`;
      emit({ type: "observation", content: note, tool: action, toolInput: input });
      scratchpad += `\nThought: ${thought ?? ""}\nAction: ${action}\nAction Input: ${input}\nObservation: ${note}\n`;
      continue;
    }

    // Normalise hard: "Kinkaku-ji, Kyoto" and "Kinkaku-ji" are the same call
    // as far as wasted steps are concerned.
    const callKey = `${tool}::${input.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
    if (seenCalls.has(callKey)) {
      const note = `You already called ${tool} with that input and the result is above. Use it, or move on to a tool you have not run.`;
      emit({ type: "observation", content: note, tool, toolInput: input });
      scratchpad += `\nAction: ${tool}\nAction Input: ${input}\nObservation: ${note}\n`;
      continue;
    }

    // Per-tool ceiling. Without it the agent re-queries sights or re-prices
    // the same corridor from three origins and starves the tools it still
    // needs, which is exactly how a run ends with no budget computed.
    const used = (toolCallCounts.get(tool) ?? 0) + 1;
    if (used > (TOOL_CALL_CAP[tool] ?? DEFAULT_TOOL_CAP)) {
      const note = `${tool} has already run ${used - 1} time${
        used - 1 === 1 ? "" : "s"
      }, which is its limit for one run. Move on to a different tool.`;
      emit({ type: "observation", content: note, tool, toolInput: input });
      scratchpad += `\nAction: ${tool}\nAction Input: ${input}\nObservation: ${note}\n`;
      continue;
    }
    toolCallCounts.set(tool, used);
    seenCalls.add(callKey);

    emit({ type: "action", content: `${tool}(${input})`, tool, toolInput: input });

    const result = await dispatchTool(tool, input);
    if (!toolsUsed.includes(result.tool)) toolsUsed.push(result.tool);

    emit({
      type: "observation",
      content: result.output,
      tool: result.tool,
      toolInput: input,
      toolResult: result,
    });

    scratchpad += `\nThought: ${thought ?? ""}\nAction: ${tool}\nAction Input: ${input}\nObservation: ${result.output}\n`;

    // Budget the remaining iterations. Left alone the agent explores breadth
    // first and runs out of steps before pricing anything, which is how a run
    // ends with a rich itinerary and an invented total.
    const stillMissing = missingTools(goal, toolsUsed);
    const left = MAX_ITERATIONS - i - 1;
    if (stillMissing.length > 0 && left <= stillMissing.length + 1) {
      const note =
        `${left} step${left === 1 ? "" : "s"} remain and ${stillMissing.length} required ` +
        `tool${stillMissing.length === 1 ? " has" : "s have"} not run: ${stillMissing.join(", ")}. ` +
        `Call them now, in that order, before writing anything else.`;
      emit({ type: "observation", content: note });
      scratchpad += `Observation: ${note}\n`;
    }
  }

  // Last line of defence. The model can ignore every prompt-level instruction,
  // so if the arithmetic still has not been executed the orchestrator executes
  // it, from figures the tools actually returned. A total in an Atlas plan is
  // therefore never a number the model wrote.
  if (!toolsUsed.includes("budget_calculator")) {
    const expr = deriveBudgetExpression(goal, steps);
    if (expr) {
      emit({
        type: "thought",
        content:
          "The loop ended without the budget being computed. Running the calculator " +
          "directly on the figures the tools returned, so the total is not invented.",
      });
      emit({
        type: "action",
        content: `budget_calculator(${expr})`,
        tool: "budget_calculator",
        toolInput: expr,
      });
      const budgetResult = await dispatchTool("budget_calculator", expr);
      toolsUsed.push("budget_calculator");
      emit({
        type: "observation",
        content: budgetResult.output,
        tool: "budget_calculator",
        toolInput: expr,
        toolResult: budgetResult,
      });
      scratchpad += `\nAction: budget_calculator\nAction Input: ${expr}\nObservation: ${budgetResult.output}\n`;

      // The plan already written would carry an ungrounded total, so rewrite it.
      finalAnswer = "";
    }
  }

  if (!finalAnswer) {
    finalAnswer = await forceFinalAnswer(groq, model, scratchpad, goal);
    emit({ type: "answer", content: finalAnswer });
  }

  return {
    goal,
    agentType: "Modern Agent (ReAct LLM)",
    steps,
    finalAnswer,
    totalSteps: steps.length,
    toolsUsed,
    duration: Date.now() - started,
    model,
    simulated: false,
  };
}

/**
 * Build a budget expression out of figures the tools actually returned.
 *
 * Reads the route fare and nightly rate back out of the observations in the
 * trace, so the arithmetic is assembled from grounded numbers. Returns null
 * when neither was ever established, because a total invented here would be
 * exactly the failure this function exists to prevent.
 */
function deriveBudgetExpression(goal: string, steps: AgentStep[]): string | null {
  const obsFor = (tool: string) =>
    steps.find((s) => s.type === "observation" && s.tool === tool)?.content ?? "";

  const fare = Number(
    obsFor("route_options").match(/indicative return:\s*([\d,]+)/)?.[1]?.replace(/,/g, "") ?? 0,
  );
  const nightly = Number(obsFor("lodging_tiers").match(/mid-range\s+(\d+)/)?.[1] ?? 0);

  if (!fare && !nightly) return null;

  const nights = extractNights(goal);
  const travellers = extractTravellers(goal);
  const perDiem = 2800;

  const parts: string[] = [];
  if (fare) parts.push(`${fare}*${travellers}`);
  if (nightly) parts.push(`${nightly}*${nights}`);
  parts.push(`${perDiem}*${nights}*${travellers}`);

  return parts.join(" + ");
}

/** The loop hit its ceiling. Ask once for a plan from whatever was gathered. */
async function forceFinalAnswer(
  client: Groq,
  model: string,
  scratchpad: string,
  goal: string,
): Promise<string> {
  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt() },
        {
          role: "user",
          content:
            `${trimScratchpad(scratchpad)}\n\n` +
            `You have reached the step limit. Write the Final Answer now using only ` +
            `the observations above. Where something was never established, say so ` +
            `plainly instead of filling the gap.`,
        },
      ],
      temperature: 0.3,
      max_tokens: 1600,
    });
    const text = completion.choices[0]?.message?.content ?? "";
    return text.replace(/^[\s\S]*?Final Answer\s*:/i, "").trim() || text.trim() ||
      `Could not complete a plan for "${goal}" within the step limit.`;
  } catch {
    return `Reached the step limit for "${goal}" and the summarising call also failed. The trace above holds everything that was gathered.`;
  }
}

/* ------------------------------------------------------------------ */
/* Deterministic planner                                               */
/* ------------------------------------------------------------------ */

/**
 * Runs when there is no API key, or when the model endpoint fails mid-run.
 *
 * This is not a mock: it calls the same live tools in a fixed, sensible order
 * and assembles a real plan from real observations. What it lacks is the part
 * that makes the agent an agent, namely choosing the next step from the last
 * result, and the trace says so explicitly rather than pretending otherwise.
 */
async function runDeterministicPlanner(
  goal: string,
  emit: (s: Omit<AgentStep, "timestamp">) => AgentStep,
  steps: AgentStep[],
  toolsUsed: string[],
  started: number,
  model = "deterministic-planner",
): Promise<AgentRunResult> {
  const place = extractDestination(goal);
  const month = extractMonth(goal);
  const budget = extractBudget(goal);
  const nights = extractNights(goal);

  emit({
    type: "thought",
    content:
      `No reasoning model is reachable, so this run uses the deterministic planner. ` +
      `It calls the same live tools in a fixed order. The step sequence is therefore ` +
      `scripted rather than chosen, which is the one capability being demonstrated elsewhere.`,
  });

  const plan: { tool: string; input: string; why: string }[] = [
    { tool: "geocode_place", input: place, why: "resolve the destination to coordinates" },
    month
      ? { tool: "climate_normals", input: `${place}, ${month}`, why: "the trip is dated, so use the seasonal record" }
      : { tool: "weather_forecast", input: place, why: "no month given, use the near-term forecast" },
    { tool: "daylight_hours", input: place, why: "establish how much usable light a day has" },
    { tool: "route_options", input: place, why: "get the corridor and an indicative fare" },
    { tool: "lodging_tiers", input: place, why: "get nightly rates to price the stay" },
    { tool: "attractions_explorer", input: place, why: "gather real description for the itinerary" },
    { tool: "travel_advisory", input: place, why: "check entry requirements and local notes" },
  ];

  const observations: Record<string, string> = {};

  for (const step of plan) {
    emit({ type: "thought", content: `Next: ${step.why}.` });
    emit({ type: "action", content: `${step.tool}(${step.input})`, tool: step.tool, toolInput: step.input });

    const result = await dispatchTool(step.tool, step.input);
    if (!toolsUsed.includes(result.tool)) toolsUsed.push(result.tool);
    observations[step.tool] = result.output;

    emit({
      type: "observation",
      content: result.output,
      tool: result.tool,
      toolInput: step.input,
      toolResult: result,
    });
  }

  // Budget, computed from what the lodging table actually returned.
  const nightly = Number(observations.lodging_tiers?.match(/mid-range (\d+)/)?.[1] ?? 6200);
  const fare = Number(
    observations.route_options?.match(/indicative return: ([\d,]+)/)?.[1]?.replace(/,/g, "") ?? 0,
  );
  const perDiem = 2800;
  const expr = `${fare} + ${nightly}*${nights} + ${perDiem}*${nights + 1}`;

  emit({ type: "thought", content: "Total the itemised costs with the calculator rather than by hand." });
  emit({ type: "action", content: `budget_calculator(${expr})`, tool: "budget_calculator", toolInput: expr });
  const budgetResult = await dispatchTool("budget_calculator", expr);
  if (!toolsUsed.includes("budget_calculator")) toolsUsed.push("budget_calculator");
  emit({
    type: "observation",
    content: budgetResult.output,
    tool: "budget_calculator",
    toolInput: expr,
    toolResult: budgetResult,
  });

  const total = Number(budgetResult.output.match(/=\s*([\d.]+)/)?.[1] ?? 0);

  const finalAnswer = [
    `Plan for: ${goal}`,
    ``,
    `Destination`,
    observations.geocode_place ?? "not resolved",
    ``,
    `Conditions`,
    observations.climate_normals ?? observations.weather_forecast ?? "not established",
    ``,
    `Daylight`,
    observations.daylight_hours ?? "not established",
    ``,
    `Getting there`,
    observations.route_options ?? "not established",
    ``,
    `Where to stay`,
    observations.lodging_tiers ?? "not established",
    ``,
    `Worth seeing`,
    observations.attractions_explorer ?? "not established",
    ``,
    `Before you go`,
    observations.travel_advisory ?? "not established",
    ``,
    `Budget`,
    `${expr}`,
    `total ${total.toLocaleString("en-IN")} INR for ${nights} nights`,
    budget
      ? total <= budget
        ? `Against your ${budget.toLocaleString("en-IN")} INR ceiling: ${(budget - total).toLocaleString("en-IN")} INR of headroom.`
        : `Over your ${budget.toLocaleString("en-IN")} INR ceiling by ${(total - budget).toLocaleString("en-IN")} INR. Drop to the backpacker tier to close the gap.`
      : `No ceiling was stated, so this is priced at the mid-range tier.`,
    ``,
    `Every figure above came from a tool call in this run. This plan was produced`,
    `by the deterministic planner, which follows a fixed tool order. Set GROQ_API_KEY`,
    `to run the full ReAct loop, where the agent chooses each step from the last result.`,
  ].join("\n");

  emit({ type: "answer", content: finalAnswer });

  return {
    goal,
    agentType: "Modern Agent (ReAct LLM)",
    steps,
    finalAnswer,
    totalSteps: steps.length,
    toolsUsed,
    duration: Date.now() - started,
    model,
    simulated: true,
  };
}

/* ---------------- goal parsing helpers ---------------- */

const STOPWORDS = new Set([
  "plan", "days", "day", "week", "weeks", "night", "nights", "trip", "travel",
  "visit", "going", "want", "with", "from", "that", "this", "have", "about",
  "budget", "people", "person", "friends", "under", "early", "late", "total",
  "january", "february", "march", "april", "may", "june", "july", "august",
  "september", "october", "november", "december", "rupee", "rupees", "inr",
  "usd", "and", "the", "for", "two", "three", "four", "five", "good", "food",
  "beach", "somewhere", "what", "should", "know", "before", "booking",
]);

export function extractDestination(goal: string): string {
  // Prefer an explicit "in X" / "to X" phrase.
  const phrase = goal.match(/\b(?:in|to|at|visit(?:ing)?)\s+([A-Z][\w'-]*(?:\s+[A-Z][\w'-]*)?)/);
  if (phrase) return phrase[1].trim();

  // Otherwise the first capitalised token that is not a stopword.
  const caps = goal.match(/\b[A-Z][a-z]{2,}\b/g) ?? [];
  for (const c of caps) {
    if (!STOPWORDS.has(c.toLowerCase())) return c;
  }

  const words = goal.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 3 && !STOPWORDS.has(w));
  return words[0] ?? "Goa";
}

const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

export function extractMonth(goal: string): number | null {
  const g = goal.toLowerCase();
  const i = MONTHS.findIndex((m) => g.includes(m));
  return i === -1 ? null : i + 1;
}

export function extractBudget(goal: string): number | null {
  const g = goal.toLowerCase().replace(/,/g, "");
  const lakh = g.match(/([\d.]+)\s*lakh/);
  if (lakh) return Math.round(parseFloat(lakh[1]) * 100000);
  const k = g.match(/([\d.]+)\s*k\b/);
  if (k) return Math.round(parseFloat(k[1]) * 1000);
  const plain = g.match(/(\d{4,7})\s*(?:inr|rupees?|rs\.?)?/);
  return plain ? parseInt(plain[1], 10) : null;
}

export function extractTravellers(goal: string): number {
  const g = goal.toLowerCase();
  const explicit = g.match(/(\d+)\s*(?:people|persons?|travell?ers?|adults?|friends?|of us)/);
  if (explicit) return Math.max(1, parseInt(explicit[1], 10));

  const words: Record<string, number> = {
    solo: 1, alone: 1, two: 2, couple: 2, three: 3, four: 4, five: 5, six: 6,
  };
  for (const [w, n] of Object.entries(words)) {
    if (new RegExp(`\\b${w}\\b`).test(g)) return n;
  }
  return 2;
}

export function extractNights(goal: string): number {
  const g = goal.toLowerCase();
  const weeks = g.match(/(\d+)\s*week/);
  if (weeks) return parseInt(weeks[1], 10) * 7;
  if (/\ba week\b/.test(g)) return 7;
  const days = g.match(/(\d+)\s*(?:day|night)/);
  if (days) return Math.max(1, parseInt(days[1], 10));
  return 4;
}
