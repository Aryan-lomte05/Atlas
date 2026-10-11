# Atlas: Autonomous Travel Planning Agent
## Complete source dump for NotebookLM

> Paste this whole file into NotebookLM as a source, or upload it directly.
> It contains everything needed to generate the presentation.

---

## 0. Submission facts

| Field | Value |
| --- | --- |
| Assessment | Internal Assessment Task II, Activity 1, 20 marks |
| Title | Agentic AI System using Modern LLM-based Tools |
| Project name | Atlas: An Autonomous Travel Planning Agent |
| Subject | Artificial Intelligence |
| Department | Electronics & Computer Engineering |
| Academic Year | 2026-27 |
| Team | Manthan Kadu (16015024036), Aditya Lokhande (16015024040), Aryan Lomte (16015024041) |
| Contribution | Equal across all modules, same lab batch |
| Repository | https://github.com/Aryan-lomte05/Atlas.git |
| Live deployment | https://atlas-travel-agent-theta.vercel.app |
| Demo date | 13 October 2026 |
| Codebase size | 3,267 lines of TypeScript and Python |

---

## 1. The problem

Planning a multi-day trip is a research task before it is a writing task. A
traveller must establish the weather for the chosen month, the cost of a night
at the destination, how to get there, which sights are worth the time, where to
eat, whether a visa is needed, and whether the total fits the budget. These
answers live in different places and several change the others: nine wet days
changes which days the outdoor sights go on; a lodging rate that overshoots
changes the tier of the whole plan.

A conventional chatbot fails here predictably. It produces fluent itineraries
containing invented hotel rates, invented flight prices and invented weather,
because it generates the most likely continuation of a travel plan rather than
consulting anything. The output is confident and unusable. The failure is not
that the model is weak. Generation is simply the wrong operation for a task
whose answer depends on facts the model does not hold.

---

## 2. The solution: Atlas

Atlas is an autonomous agent that treats trip planning as a loop of
investigation rather than an act of composition. Given one goal in plain
language, it decides what it needs to know, calls a real tool to find out,
reads the result, and uses it to decide the next step. It repeats this until
the goal is satisfied, then writes an itinerary in which every figure is
attributable to a tool call made during that run.

Three defining properties:

1. **Grounded.** A figure may only enter the plan through a tool observation.
   Arithmetic is executed by a calculator, never by the model.
2. **Observable.** Every thought, action and observation is streamed to the
   interface as it happens and persisted afterwards.
3. **Specific.** The plan must name real places. "Dinner at Britannia and Co."
   is acceptable; "try a local Parsi restaurant" is not.

---

## 3. Frameworks and stack

| Layer | Choice | Reason |
| --- | --- | --- |
| Agent pattern | ReAct (Reason + Act), implemented directly | Listed as accepted in the brief. Written by hand rather than via LangChain or CrewAI so the control flow is readable in ~200 lines and every decision is explainable at the viva. A framework would hide exactly the mechanism being assessed. |
| Model | openai/gpt-oss-120b on Groq, resolved at run time | Free tier, 131,072 token context, ~1 s per reasoning step |
| SDK | groq-sdk, OpenAI-compatible API | Free, no credit card, very low latency on LPU hardware |
| Runtime | Next.js 16 App Router, React 19, TypeScript 5 | One codebase for interface and agent API |
| Streaming | Server-Sent Events | Trace appears step by step rather than as a dump at the end |
| Persistence | MongoDB Atlas via Mongoose | Completed traces remain reviewable after the process exits |
| Arithmetic | mathjs | Deterministic, deliberately outside the model |
| Interface | Tailwind CSS v4, Lenis | Conversational console styled as a desktop chat window |

### The model selection problem, and the fix

The original design named Meta Llama 3.3 70B. Testing against the Groq
catalogue showed `llama-3.3-70b-versatile` was not available to the account.
Every request failed and the agent silently fell back to its offline planner,
which looked like success because a plan still appeared.

The fix was not to hardcode a different string. `selectModels()` queries the
`/models` endpoint at run time, intersects the response with an ordered
preference list, and returns every reachable model best first. On this key that
resolves to `openai/gpt-oss-120b`. If a future key can serve Llama 3.3 70B the
same code picks it first with no edit. Returning a list rather than one id also
lets a run drop to a smaller model when the larger one is rate limited.

---

## 4. The sixteen tools

Eleven live, two local compute, three curated tables. Every tool is labelled
with which it is, in the report and in the interface, because claiming a
curated table is a live API would be the easiest way to overstate the project.

| # | Tool | Source | Provider | Purpose |
| --- | --- | --- | --- | --- |
| 1 | geocode_place | live | Open-Meteo geocoding | Name to coordinates, country, timezone, population |
| 2 | weather_forecast | live | Open-Meteo forecast | Seven day highs, lows, precipitation probability |
| 3 | climate_normals | live | Open-Meteo archive | What a month is actually like, from the historical record |
| 4 | daylight_hours | live | sunrise-sunset.org | Sunrise, sunset, usable daylight |
| 5 | currency_convert | live | Frankfurter, ECB rates | Convert at today's published rate |
| 6 | public_holidays | live | Nager.Date | Closures and crowding |
| 7 | air_quality | live | Open-Meteo air quality | European AQI and PM2.5 |
| 8 | elevation | live | Open-Meteo elevation | Altitude and acclimatisation warnings |
| 9 | attractions_explorer | live | Wikipedia REST | Encyclopedic description |
| 10 | find_attractions | live | Wikivoyage, OSM fallback | Named sights a traveller has heard of |
| 11 | find_restaurants | live | Wikivoyage, OSM fallback | Named restaurants, cafes, bars |
| 12 | budget_calculator | compute | mathjs | Exact arithmetic, kept out of the model |
| 13 | packing_list | compute | local rules | Derived from observed temperature and rainfall |
| 14 | route_options | curated | in-repo table | Carriers, duration, indicative fare |
| 15 | lodging_tiers | curated | in-repo table | Nightly rates across three tiers |
| 16 | travel_advisory | curated | in-repo table | Visa, safety, payment, etiquette |

The brief requires two tools. Atlas has sixteen, and they are heterogeneous:
geocoding, time series, financial data, civic calendars, encyclopedic text,
curated travel guides, map data and local computation.

---

## 5. Part A: Agent design

**Goal.** Take one natural-language travel goal, for example "Plan 5 days in
Kyoto in early April for two people on a 90,000 INR budget, work around the
weather", and return a day-by-day itinerary with an itemised budget in which
every factual claim originates from a tool call made during that run.

Goals are deliberately underspecified. Real requests omit the origin city, the
travel style, sometimes the budget. Part of the agent's job is to notice what
is missing, choose a defensible default, and say that it has done so.

**Role.** A travel concierge, constrained along three axes: grounded (no figure
without an observation), specific (names real places), and honest about
provenance (curated figures described as indicative).

**Memory, at three levels.**

| Memory | Scope | Lifetime | Medium |
| --- | --- | --- | --- |
| Scratchpad | One run | Duration of the run | In-process string, re-read before every decision |
| Contextual | One session | Until page reload | Client state, sent as prior context on follow-ups |
| Episodic | All runs | Permanent | MongoDB Atlas, collection agenttraces |

The scratchpad is what makes the loop stateful: step 7 can only be chosen
because steps 1 to 6 are visible. When it nears the context limit it is trimmed
from the middle, keeping the goal framing at the head and recent exchanges at
the tail.

**Planning strategy: ReAct**, chosen over plan-then-execute precisely because
observations change the plan. Each iteration is Thought, Action, Action Input,
Observation, repeated until the goal is met or a ceiling of 14 iterations.

A fixed plan written before step 1 cannot know the climate record will report
nine wet days, and therefore cannot contain the step that reorders the
itinerary around them. The adaptivity is the point.

---

## 6. Part B: Implementation, and the four enforcement mechanisms

This is the core engineering contribution. A plain ReAct loop over a capable
model behaves worse than the literature suggests. Three failures were observed
in live testing and each was fixed in code.

### Failure 1: premature completion

The model gathered three facts, decided it had the gist, and wrote a confident
itinerary whose lodging and transport figures it had invented.

**Mechanism 1, the grounding gate.** A Final Answer is rejected while any
required tool remains uncalled. The agent receives an observation naming
exactly which facts are ungrounded and is sent back to the tools. The required
set is derived from the goal, so a goal mentioning visas also requires
travel_advisory.

### Failure 2: breadth-first exploration

Given room, the agent queried sights repeatedly and priced the same corridor
from three different origin cities, exhausting its iteration budget before
pricing anything.

**Mechanism 2, per-tool call caps and normalised deduplication.** Each tool has
a ceiling per run. Call keys are normalised so find_attractions("Kinkaku-ji,
Kyoto") and find_attractions("Kinkaku-ji") count as the same call.

**Mechanism 3, iteration budgeting.** When remaining iterations approach the
number of required tools still unrun, the orchestrator injects an observation
naming them and instructing the agent to call them immediately.

### Failure 3: the model ignoring instruction anyway

Even with all of the above, some runs reached the ceiling without computing a
budget.

**Mechanism 4, deterministic enforcement.** If the loop ends and
budget_calculator was never called, the orchestrator derives the expression
itself from figures already in the trace, executes it, appends the result as a
real step, and regenerates the answer.

**The consequence is the strongest guarantee in the system: a total in an Atlas
plan is never a number the model wrote.** It is either computed by mathjs at
the model's request, or at the orchestrator's insistence.

### Two further robustness measures

**Parser hardening.** The first parser was a regex with lookaheads. Models wrap
labels in markdown (`**Action:**`), emit two cycles in one reply, and sometimes
hallucinate their own Observation. The regex swallowed all of it into the tool
argument, producing calls like `geocode_place("MumbaiAction: find_attractions")`.
Replaced with a line-based parser that strips markdown, honours only the first
cycle, and ignores a Final Answer appearing after an Action.

**Rate-limit recovery.** Groq's free tier enforces a token-per-minute cap. A
429 now either switches to a smaller available model or waits the interval
stated in the error body, instead of discarding every tool result gathered. If
the model becomes permanently unreachable the run assembles a partial plan from
the observations already collected.

### Measured performance

| Metric | Observed range |
| --- | --- |
| Loop iterations per run | 9 to 16 |
| Distinct tools per run | 6 to 11 |
| Total trace steps | 29 to 47 |
| Duration | 61 s to 240 s |
| Tool call success rate | 100%, failures degrade to an informative observation |

---

## 7. Architecture

```
CLIENT                EDGE                ORCHESTRATION
Playground  --POST--> /api/agent  ------> ReAct loop
React, SSE  <--steps--             <-----  think / act / observe
                                            |        ^
                                    prompt  v        | action
                                      gpt-oss-120b on Groq LPU
                                            |
                                     call   v
                                      Tool dispatcher
                                      (name resolution, timeout,
                                       caps, deduplication)
                                       |        |         |
                            LIVE (11)  |  COMPUTE (2)  |  CURATED (3)
                            Open-Meteo x4  mathjs         route_options
                            sunrise-sunset packing_list   lodging_tiers
                            Frankfurter                   travel_advisory
                            Nager.Date
                            Wikipedia
                            Wikivoyage
                            OpenStreetMap

                            PERSISTENCE: MongoDB Atlas, agenttraces
```

---

## 8. Tool flow of a representative run

Goal: "Plan 5 days in Kyoto in early April for two people on a 90,000 INR budget"

```
[1] Thought  need coordinates before any location tool
    Action   geocode_place("Kyoto")
    Observ.  Kyoto, Japan (JP), lat 35.0, lon 135.8, Asia/Tokyo

[2] Thought  April is months out, a forecast will not reach
    Action   climate_normals("Kyoto, 4")
    Observ.  mean high 19.3 C, low 8.4 C, wet days 9 of 30   -> drives day order

[3] Action   daylight_hours("Kyoto, 2026-04-05")
    Observ.  sunrise 05:37, sunset 18:22, 12h 45m, two blocks fit

[4] Action   public_holidays("JP, 2026")
    Observ.  Golden Week from Apr 29, heavy domestic travel

[5] find_attractions("Kyoto")   -> named sights from Wikivoyage
[6] find_restaurants("Kyoto")   -> named places to eat
[7] lodging_tiers("Kyoto")      -> 2400 / 6200 / 14500 INR
[8] route_options("Kyoto")      -> via Osaka KIX, 62000 INR

[9] Action   budget_calculator("62000*2 + 6200*5 + 2800*5*2")
    Observ.  = 183000     <-- OVER the 90000 ceiling

[10] Thought over budget, re-price at the backpacker tier
     Action  budget_calculator("62000*2 + 2400*5 + 1200*5*2")
     Observ. = 148000

Final Answer: day-by-day plan, itemised budget, honest note that the
international fare alone exceeds the stated ceiling
```

**The branch at step 9 is the point of the whole exercise.** The second budget
call exists only because the first returned a number over the ceiling. A
rule-based agent cannot produce that step, because nobody wrote a rule for it.

---

## 9. Part C: Classical vs modern comparison

The classical agent (177 lines) is a genuine rule-based agent, not a strawman:
four condition-action rules over a destination table, instrumented to report
the limitations it hits.

| Axis | Classical Agent (Syllabus) | Modern Agent (Atlas) |
| --- | --- | --- |
| Basis | Rule-based | LLM-driven |
| Logic | Static logic | Dynamic planning |
| Memory | No memory | Contextual memory |
| Reasoning | Single-step | Multi-step reasoning |
| Knowledge source | Developer-written rules. Unanticipated cases are absent. | Pretrained model plus every fact sourced from a run-time tool call |
| Control flow | Static, same branch order every input | Dynamic, next action depends on the last observation |
| Unseen input | Falls through to a default branch | Generalises via geocoding, climate, daylight, guide lookup |
| Decomposition | None, developer decomposed in advance | At run time, revised mid-run |
| Reasoning depth | Single pass, 4 rules | 9 to 16 iterations |
| Tool use | None | 16 tools, 11 live |
| Transparency | Total, reproducible to the character | Reconstructed from the trace, not bit-identical |
| Failure mode | Silent irrelevance | Wasted steps or fabrication, mitigated by four mechanisms |
| Latency | Under 2 ms | 61 s to 240 s |
| Cost | Zero | Token cost per run |
| Maintenance | Every new city is a new branch | Add a tool and describe it |

### Observed head-to-head on the same prompt

Prompt: "A week in Reykjavik in November. I have not set a budget."

**Classical agent:** evaluated its rules, matched none because Reykjavik is not
in its table, fell through to the default and returned a generic template in
under 2 ms. It reported its own limitation because it was instrumented to, but
had nothing to say about the destination.

**Atlas:** geocoded Reykjavik, pulled the November climate record, and called
daylight_hours, which returned 6 h 38 m of daylight. That observation changed
the plan: one outdoor block per day instead of two, and it said why. No rule in
the classical agent encodes "at high latitude in winter, daylight is the
binding constraint", and no rule could without somebody first anticipating that
specific case.

### Where the classical agent genuinely wins

When the domain is actually closed, rules win. The rule agent answers in
microseconds, costs nothing, never fabricates, needs no network, and can be
proved correct by reading the source. For a fixed list of twelve destinations
with fixed packages, Atlas is strictly worse engineering: slower by five orders
of magnitude, more expensive, dependent on third-party availability, and
capable of being wrong in ways a branch cannot be.

The argument for the agentic approach is that travel planning is not a closed
domain. The thirteenth city, an unseasonal forecast, a budget that does not
divide cleanly, a traveller who asks a follow-up: each is a branch nobody
wrote. These are not competitors. Rules suit closed, auditable,
latency-critical problems. Agents suit open-ended problems where the steps
cannot be enumerated in advance.

---

## 10. Why the data source mattered more than the model

The first implementation of the place tools used only the OpenStreetMap
Overpass API. A Mumbai query returned:

```
Kings Circle (garden), bialbazzar (park), NSm park (park), park (park),
Domino's (restaurant, pizza), Cafe Coffee Day (cafe)
```

Mapped, but nobody flies to Mumbai for them. OSM contains everything that has
been mapped, not everything worth visiting.

Switching the primary source to **Wikivoyage**, a human-written travel guide
with structured see / do / eat / drink listings, changed the same query to:

```
Gateway of India, Sassoon Docks, Marine Drive, Wellington Fountain,
Bademiya Kebab Restaurant, Martin's, Cafe Mondegar, Bootlegger's
```

No change to the agent at all. The lesson: data source quality dominates model
quality.

---

## 11. Six takeaways

1. **The gap between a demo and a system is error handling.** The ReAct loop
   took an afternoon. Everything after was failure modes: an unavailable model
   id, a parser broken by bold text, rate limits, invented budgets, and map
   data returning municipal parks.
2. **Prompt instructions are requests, not constraints.** We told the model in
   capitals never to state an ungrounded figure. It did anyway. Every
   reliability property the system has is enforced in orchestrator code. If a
   property matters, it belongs in code around the model, not in the prompt.
3. **Tool output is part of the prompt.** Tools initially returned raw JSON and
   the agent reasoned poorly. Rewriting them to return short labelled lines
   plus an interpretation sentence ("Nine wet days. Build the plan so outdoor
   days can move.") improved step quality more than any prompt change.
4. **Data source quality dominates model quality.** See section 10.
5. **Honesty is a feature.** Labelling three tools curated costs nothing and
   makes the system defensible. The agent saying "the international fare alone
   exceeds your ceiling" is more useful than a tidy plan that ignores it.
6. **Degradation should be visible.** When rate limited, the trace says so,
   says what it is doing, and says how many tool results are preserved. An
   agent that explains its own failure is easier to trust.

---

## 12. Deliverables and rubric mapping

| Rubric component | Marks | Evidence |
| --- | --- | --- |
| Use of modern tools and frameworks | 5 | ReAct pattern, gpt-oss-120b on Groq with run-time model resolution, 16 tools of which 11 live, Next.js 16, SSE, MongoDB Atlas |
| Agent reasoning and tool orchestration | 5 | Multi-step loop 9 to 16 iterations, four enforcement mechanisms with source, tool flow showing an observation-driven branch, four committed logs |
| Architecture and design clarity | 5 | Architecture diagram, tool flow diagram, request sequence, module map, three-level memory model, single-source-of-truth tool manifest |
| Analysis and reflection | 5 | Comparison matrix, observed same-prompt comparison, honest account of where the classical agent wins, six takeaways from real failures, limitations and future work |

| Required deliverable | Delivered |
| --- | --- |
| PDF report | docs/Atlas-IA2-Report.pdf, 30 pages |
| Architecture / tool flow diagram | In the report and rendered in the interface |
| Code repository with working demo | github.com/Aryan-lomte05/Atlas, live at atlas-travel-agent-theta.vercel.app, plus demo_agent.py |
| Agent interaction logs | docs/logs/, four runs |
| Prompts and output screenshots | docs/screenshots/, eleven images |

---

## 13. Limitations and future work

**Limitations.** Three tools are curated tables rather than live APIs. Free
tier rate limits can interrupt a long run. Wikivoyage coverage is uneven for
small towns. There is no scored evaluation set, only comparison on a handful of
prompts. English only. Single agent, no delegation.

**Future work, in the order we would do it.** A scored evaluation harness that
automatically checks every figure traces to an observation. Replace curated
tables with live APIs where a free tier exists. Parallel tool calls, since
geocoding, climate and holidays are independent. A reflection step where the
agent critiques its own draft against the goal. Caching of tool results across
runs.

---

## 14. Conclusion

Atlas plans multi-day trips by reasoning in a loop rather than generating in
one pass. It implements ReAct over a 120-billion-parameter model on Groq,
dispatches 16 tools of which 11 make live third-party calls, maintains memory
at three levels, and streams every thought, action and observation so its
behaviour can be audited rather than trusted.

The most interesting result was not that the agentic approach beat the
rule-based one, which the brief presupposes. It was how much of the reliability
had to be enforced outside the model. The gate that refuses an ungrounded
answer, the caps that stop endless exploration, the budgeting that reserves
steps for what matters, and the deterministic fallback that computes the total
when the model will not, are all orchestration code.

**The model supplies fluency and judgement. Everything you can actually depend
on is built around it.**
