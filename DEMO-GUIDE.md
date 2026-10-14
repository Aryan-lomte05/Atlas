# Atlas: end to end knowledge transfer

**Who this is for:** whoever is standing in front of the examiner. Read it
once fully, then keep section 3 open during the demo.

**Live site:** https://atlas-travel-agent-theta.vercel.app
**Repo:** https://github.com/Aryan-lomte05/Atlas
**Backup if the network dies:** `docs/logs/` and `docs/screenshots/`

---

## 1. The one-minute version

Say this if you only get one minute.

> Atlas is an autonomous travel planning agent. You give it one sentence, like
> "plan five days in Mumbai for two people on sixty thousand rupees", and
> instead of writing an itinerary from memory the way ChatGPT would, it works
> the problem: it thinks about what it needs, calls a real tool, reads the
> result, and decides the next step from that. It repeats that loop until the
> plan is done.
>
> It has sixteen tools. Eleven of them are live APIs: weather, climate records,
> daylight hours, currency rates, public holidays, air quality, Wikipedia, and
> a travel guide for actual named places. Every number in the final plan comes
> from one of those calls, and the arithmetic is done by a calculator, not by
> the model.
>
> The whole reasoning trace streams to the screen while it runs, so you can
> watch it decide. And we built a classical rule-based agent alongside it, so
> you can run both on the same prompt and see the difference.

**The single sentence to land if nothing else:** *the model supplies fluency
and judgement, everything you can actually depend on is enforced in code
around it.*

---

## 2. What you must understand before demoing

You will be asked "how does it work". Here is the mental model, in layers.

### 2.1 The loop (this is the whole project)

```
Thought       what do I still need to know, and which tool settles it
Action        one tool name
Action Input  the argument
Observation   whatever the tool returned, pasted in verbatim
```

Repeat, up to 11 times, then write the Final Answer.

The important word is **one**. The model picks exactly one tool per turn. It
does not get a plan handed to it. **The order of tool calls is different
between runs because it is derived from what the previous observation said.**

Why that matters, and the line to use: *a plan written before step one cannot
know that the climate record will report nine wet days, so it cannot contain
the step that reorders the itinerary around them.* The adaptivity is the point
of the whole exercise.

### 2.2 The three memories

| Memory | Lives where | Lifetime | What it does |
| --- | --- | --- | --- |
| **Scratchpad** | A string in the running process | One run | The transcript of every thought, action and observation so far. Re-read in full before every single decision. This is what makes the loop stateful: step 7 can only be chosen because steps 1 to 6 are visible. |
| **Contextual** | Browser state, sent with the request | One session | Previous goals and answers, so a follow-up like "make it cheaper" amends the plan instead of starting over. |
| **Episodic** | MongoDB Atlas, collection `agenttraces` | Permanent | The full step list, tool payloads and timings of every completed run. |

If asked "what kind of memory", the expected answer from the brief is
"short-term / context". Say: **short-term scratchpad within a run, contextual
across turns, episodic across runs in a database.** That is more than the brief
asks for, which is good.

### 2.3 The sixteen tools, and the honesty point

| Kind | Count | Examples |
| --- | --- | --- |
| **Live** (real API call leaves the machine) | 11 | Open-Meteo geocoding / forecast / climate archive / air quality / elevation, sunrise-sunset.org, Frankfurter currency, Nager.Date holidays, Wikipedia, Wikivoyage, OpenStreetMap |
| **Compute** (runs locally, deterministic) | 2 | `budget_calculator` (mathjs), `packing_list` |
| **Curated** (table inside the repo) | 3 | `route_options`, `lodging_tiers`, `travel_advisory` |

**Be upfront about the three curated ones.** They are labelled "curated table"
on the website itself, in the Tools section. The reason is that live flight
fare and hotel booking APIs are paid and need commercial agreements. Saying
this before the examiner spots it turns a weakness into a credibility point.

### 2.4 The four enforcement mechanisms (your strongest material)

This is what separates the project from "I wrapped a prompt". We observed three
real failures in testing and fixed each in code.

| # | Failure we hit | Fix |
| --- | --- | --- |
| 1 | Model gathered 3 facts, then wrote a confident itinerary with **invented** lodging and transport prices | **Grounding gate.** A Final Answer is rejected while any required tool has not run. The agent gets told exactly which facts are ungrounded and is sent back. |
| 2 | Agent priced the same route from three different origin cities and ran out of steps before pricing anything | **Per-tool caps + normalised dedup.** Each tool has a ceiling per run, and `find_attractions("Kinkaku-ji, Kyoto")` and `find_attractions("Kinkaku-ji")` count as the same call. |
| 3 | Agent still sometimes finished without computing a budget, ignoring the nudge | **Iteration budgeting**: when steps run low, the orchestrator names the missing tools and orders them. |
| 4 | Even then, the model occasionally refused | **Deterministic enforcement**: if the loop ends with no budget computed, the orchestrator computes it itself from figures already in the trace. |

**The guarantee to state out loud:** *a total in an Atlas plan is never a number
the model wrote. It is either computed by mathjs because the agent asked, or
computed by mathjs because the orchestrator insisted.*

### 2.5 Why the model is gpt-oss-120b and not Llama 3.3

You will probably be asked, and the report says this, so do not contradict it.

> We originally specified Llama 3.3 70B. When we tested, our Groq key could not
> actually serve that model, and every request was failing silently into a
> fallback. So instead of hardcoding another model name, we made the agent
> query Groq's model list at startup and pick the best one it can actually
> reach from a ranked preference list. On our key that resolves to
> gpt-oss-120b, a 120 billion parameter open-weights model with a 131k context
> window. If the key ever gets Llama 3.3, the same code picks it first with no
> change.

That is a better answer than "we used Llama", because it shows you found and
fixed a real bug.

---

## 3. The demo script

**Total: about 5 minutes.** Practise it once. Timings assume the live site.

### Before you start

- Open https://atlas-travel-agent-theta.vercel.app in a **fresh tab**, full
  screen, and let it fully load.
- Have a second tab with the GitHub repo open.
- Have `docs/logs/kyoto-react-full.log` open in a third tab as your backup.
- Zoom the browser to 90% so more of the trace is visible at once.

### Step 1: the page, 30 seconds

Scroll from the top. You do not need to narrate every section, just:

> "This is the landing page. The sections below the console document the agent:
> how the loop works, the tool surface, the architecture diagram, and the
> comparison against the classical agent. Let me just run it."

Do not linger. The examiner wants the agent, not the marketing.

### Step 2: run it, 10 seconds to type

Scroll to **Playground** (`#01 / LIVE PLAYGROUND`). Click the composer at the
bottom of the window and type, or click the first suggestion chip:

```
Plan 5 days in Mumbai for two people on a 60000 INR budget.
Tell me exactly where to eat and what to see.
```

Press **Enter**.

### Step 3: narrate the trace while it runs, about 2 minutes

This is the part that earns the marks. The run takes 60 to 200 seconds. While
steps appear, talk:

> "You can see it reasoning. Step one is a Thought: it says it needs
> coordinates before it can call any location tool. Then an Action,
> `geocode_place`, and the Observation is the real API response pasted in
> verbatim.
>
> Now watch this one. It says the trip is months away so a forecast will not
> reach that far, and it calls `climate_normals` instead, which pulls the
> historical record for the same month last year. **Nobody told it to do that.**
> It chose the tool because of what it had just read.
>
> These are real network calls happening right now: Open-Meteo, Wikivoyage,
> sunrise-sunset."

Point at the header of the reasoning panel. It shows a live count:
`N steps, M tools, X.Xs`.

### Step 4: the answer, 1 minute

When the itinerary appears:

> "Here is the plan. Look at the budget block: lodging, food, transport, total,
> and the headroom against the sixty thousand ceiling. Every one of those
> numbers came from a tool call you just watched.
>
> And notice this line: it says specific flight fares were not available from
> curated data, so the transport figure is local travel only. **It told us what
> it did not know instead of inventing a number.** That is the behaviour we
> designed for."

Then point at the day plan:

> "These are real named places. Gateway of India, Sassoon Docks. That comes
> from the Wikivoyage travel guide tool, not from the model's memory."

### Step 5: the follow-up, 30 seconds

This proves contextual memory. Type:

```
Make it cheaper.
```

> "It is keeping the thread. It is amending the plan it already made rather
> than starting the whole thing again, because previous turns are sent back as
> context."

### Step 6: the comparison, 1 minute

Switch the mode toggle at the bottom of the console from **ReAct agent** to
**Compare**. Then run:

```
A week in Reykjavik in November.
```

> "Two agents on the same prompt. The classical one is the rule-based agent
> from the syllabus, four condition-action rules over a destination table. It
> finishes in under two milliseconds. But Reykjavik is not in its table, so it
> falls through to a default and reports its own limitation.
>
> Atlas geocodes it, pulls the November climate record, and checks daylight.
> It gets six hours thirty-eight minutes of daylight, and **that changes the
> plan**: one outdoor block a day instead of two, and it says why. There is no
> rule in the classical agent for 'at high latitude in winter, daylight is the
> binding constraint', and there could not be, unless somebody had already
> thought of that exact case."

### Step 7: close

> "Everything is on GitHub, the report is in the repo, and the trace you just
> watched can be copied or downloaded as a text file from the window title
> bar."

Click **Copy** or **.txt** in the title bar to show it.

---

## 4. Tour of the site, section by section

In case you are asked to walk the page rather than run the agent.

| Section | Nav label | What to say |
| --- | --- | --- |
| Hero | top | One line: an agent that reasons before it answers. |
| Destination strip | - | Photography, sets the travel context. Skip. |
| The shift | - | Why a chatbot fails: it guesses the weather and invents a rate. |
| **#01 Live playground** | Playground | The console. The main event. |
| **#02 Context and memory** | - | Four tabs: scratchpad, episodic store, decomposition, grounded retrieval. Click through them, each shows a real example. |
| **#03 The loop** | How it works | Five phases of one ReAct cycle. Scroll slowly, it highlights each phase as you go. |
| **#04 The tool surface** | Tools | All 16 tools. **Point out the live / local compute / curated badges.** Click a tool to see its real sample output. |
| **#05 System architecture** | Architecture | The diagram. Client, edge, orchestration, model, dispatcher, persistence. |
| **#06 Analysis, part C** | Comparison | The full comparison matrix, plus an honest "where the classical agent wins" panel. |
| **#07 Recorded runs** | - | Three real runs with what each exposed. |
| **#08 Budget calibration** | - | The three lodging tiers the budget tool reasons with. |
| **#09 Project team** | - | Three names, equal contribution. |
| **#10 Questions** | FAQ | Eight answers, useful if you blank. |

There is a light/dark toggle bottom right. Dark is the default and looks
better. Leave it.

---

## 5. When it goes wrong

It degrades in stages and **all of it is visible in the trace**, which is
itself a talking point. Do not panic, narrate it.

| Problem | What you will see | What to say |
| --- | --- | --- |
| **Rate limited** | An observation saying the model is rate limited and it is switching to a smaller model or waiting | "Groq's free tier has a token-per-minute cap. Rather than throw away the tool results it already has, it switches model or waits the interval the error specifies." |
| **Run is very slow** | Steps appear but slowly | Keep narrating the steps. Each one is a real network call. |
| **Model unreachable entirely** | Trace says so, then a deterministic plan appears | "With no reachable model it runs a deterministic planner over the same live tools. The trace says so explicitly rather than pretending. Real data, scripted order." |
| **A single tool fails** | An observation explaining the failure and suggesting an alternative | "Tools never throw. A failure returns an observation the agent can reason about, so one bad endpoint cannot kill the run." |
| **No network at all** | Nothing works | Switch to the backup: open `docs/logs/kyoto-react-full.log` and walk the trace as text. Screenshots in `docs/screenshots/` cover the rest. |
| **Site will not load** | - | Run locally: `npm run dev`. Or `python demo_agent.py`, which needs no browser. |

**Rate limits are the most likely problem.** If you are demoing back to back,
leave 60 seconds between runs.

---

## 6. Questions you will get, with answers

**"Isn't this just a wrapper around a prompt?"**
No. The model cannot finish until required tools have actually run. The
grounding gate rejects a Final Answer while any required fact is ungrounded,
and if the model never computes the budget, the orchestrator computes it. Those
are control-flow guarantees, not prompting. We can show you the code.

**"Why didn't you use LangChain or CrewAI?"**
Because the assessment is on agent reasoning and tool orchestration, and a
framework would hide exactly that. Our loop is about 200 lines and we can
explain every line. We also hit four distinct failure modes that we fixed
inside the loop, which would have been much harder through a framework's
abstraction.

**"How do you know it isn't hallucinating the prices?"**
Three ways. Arithmetic is executed by mathjs, never by the model. A figure may
only enter the plan through a tool observation, and the trace shows which tool
produced each one. If the model skips the calculator, the orchestrator runs it
from figures already in the trace and regenerates the answer.

**"Three of your tools are hardcoded tables. Isn't that cheating?"**
They are labelled curated everywhere, on the site and in the report, and their
output states the figures are indicative. Live fare and booking APIs are paid
and rate limited. We thought being explicit was more defensible than implying
all sixteen are live.

**"Why is it so much slower than the classical agent?"**
Because it is doing genuinely more: 9 to 16 reasoning steps and up to 11
network round trips, against four in-memory branch evaluations. For a closed
domain the classical agent is the better engineering choice and we say so in
the report. The agentic approach earns its cost only when the steps cannot be
enumerated in advance.

**"What is the memory type?"**
Short-term scratchpad within a run, contextual across conversation turns, and
episodic across runs in MongoDB Atlas.

**"What would you do next?"**
A scored evaluation harness that automatically checks every figure in the
output traces back to an observation. Then parallel tool calls, since geocoding,
climate and holidays are independent and currently run in sequence.

**"Who did what?"**
All three of us worked across the whole system: orchestration, tools,
evaluation and documentation. Contribution is recorded as equal.

---

## 7. Running it yourself

```bash
git clone https://github.com/Aryan-lomte05/Atlas.git
cd Atlas
npm install
cp .env.example .env.local        # then paste the GROQ_API_KEY in
npm run dev                       # http://localhost:3000
```

Terminal only, no browser needed:

```bash
python demo_agent.py
```

Checks:

```bash
npx tsc --noEmit     # typecheck
npm run build        # production build
```

**Two gotchas that will waste your time if you do not know them:**

1. **CSS changes need a dev server restart.** Tailwind v4 is compiled through a
   Turbopack loader rule in `next.config.ts`, and it does not hot-reload
   `globals.css`. If a colour change does nothing, restart `npm run dev`.
2. **Do not delete the `turbopack` block in `next.config.ts`.** There is no
   PostCSS config, so that rule is the only thing compiling Tailwind. Removing
   it silently disables every utility class and the whole site renders unstyled.

---

## 8. Where things live in the code

If the examiner asks to see the code, these are the files worth opening.

| File | Lines | What is in it |
| --- | --- | --- |
| `src/lib/agent.ts` | 840 | **The main one.** The ReAct loop, the four enforcement mechanisms, the parser, model selection, the deterministic fallback planner. |
| `src/lib/tools.ts` | 1181 | All 16 tool implementations, the Wikivoyage and Overpass clients, the dispatcher. |
| `src/lib/toolManifest.ts` | 239 | Tool metadata. Single source of truth, read by both the agent prompt and the website, so the page can never advertise a tool that does not exist. |
| `src/lib/classicalAgent.ts` | 177 | The Part C rule-based agent. Four rules, instrumented to report its own limitations. |
| `src/app/api/agent/route.ts` | 130 | The SSE streaming endpoint. |
| `src/components/Playground.tsx` | 648 | The console UI. |
| `demo_agent.py` | 182 | Terminal demo. |

**Good things to point at in `agent.ts`:**

- `requiredTools()` and the gate, around the Final Answer handling
- `TOOL_CALL_CAP`
- `deriveBudgetExpression()` for the deterministic enforcement
- `parseCycle()` for the line-based parser
- `selectModels()` for run-time model resolution

---

## 9. Honest weak points, and how to handle them

Do not hide these. Being first to name them reads as competence.

| Weakness | How to frame it |
| --- | --- |
| Three curated tables | "Live fare APIs are paid. We labelled them curated rather than imply they are live." |
| Slow, 1 to 3 minutes | "It is doing 9 to 16 reasoning steps and up to 11 network calls. For a closed domain, rules are the better choice and we say so." |
| Free tier rate limits | "Handled by model downgrade and retry, and the trace shows it happening." |
| No scored benchmark | "We compared behaviour on a handful of prompts. A scored harness is the first thing on our future work list." |
| Wikivoyage coverage uneven for small towns | "It falls back to OpenStreetMap, which has worse quality. Known limitation." |
| MongoDB may not be connected | "Persistence is optional by design. The run is unaffected, traces just are not stored." |

---

## 10. The thirty-second recap, for the end

> The ReAct loop itself took an afternoon. Everything after that was failure
> handling: a model our key could not serve, a parser that broke on markdown,
> rate limits, and an agent that wrote budgets it had not computed. What we
> actually learned is that prompt instructions are requests, not constraints.
> We told the model in capital letters never to state a figure it had not
> looked up, and it did it anyway. Every reliability property this system has
> is enforced in code around the model, not asked for in the prompt.
