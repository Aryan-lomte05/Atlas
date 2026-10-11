# NotebookLM prompt for generating the presentation

## How to use

1. Open NotebookLM and create a new notebook.
2. Add sources:
   - `docs/NOTEBOOKLM-SOURCE.md` (the main dump, paste or upload)
   - `docs/Atlas-IA2-Report.pdf` (optional, adds the figures)
   - `docs/logs/kyoto-react-full.log` (optional, gives it real trace text)
3. Paste the prompt below into the chat.
4. Ask for the slide deck, then export or copy the outline into
   `IA2 Instructions.pptx`.

---

## The prompt

```
You are building a 14-slide presentation for a university lab viva.

CONTEXT
Subject: Artificial Intelligence, Internal Assessment Task II, Activity 1,
worth 20 marks. Department of Electronics & Computer Engineering, 2026-27.
Team of three: Manthan Kadu (16015024036), Aditya Lokhande (16015024040),
Aryan Lomte (16015024041). Equal contribution.
Project: Atlas, an autonomous travel planning agent built on the ReAct loop.
The viva is roughly 8 to 10 minutes plus questions, with a live demo.

AUDIENCE
A professor assessing against four rubric components, 5 marks each:
use of modern tools and frameworks; agent reasoning and tool orchestration;
architecture and design clarity; analysis and reflection.

PRODUCE EXACTLY THESE 14 SLIDES

1.  Title. Project name, the three names with roll numbers, subject,
    department, year, and the live URL atlas-travel-agent-theta.vercel.app
2.  The problem. Why a chatbot fails at trip planning. Emphasise that it
    invents hotel rates, flight prices and weather because generation is the
    wrong operation for a task whose answer depends on facts it does not hold.
3.  The solution. Atlas in one sentence, plus the three defining properties:
    grounded, observable, specific.
4.  Part A, agent design. Goal, role, memory at three levels (scratchpad,
    contextual, episodic), planning strategy.
5.  Why ReAct and not plan-then-execute. Make the argument that a fixed plan
    written before step one cannot know the climate record will report nine
    wet days, so it cannot contain the step that reorders the itinerary.
6.  The sixteen tools. Show the live / compute / curated split (11 / 2 / 3)
    and stress that the honest labelling is deliberate.
7.  Architecture diagram. Client, edge, orchestration, model, tool dispatcher,
    persistence.
8.  Tool flow of one real run. Walk the Kyoto example and land hard on the
    branch at step 9: the second budget call exists only because the first
    returned a number over the ceiling.
9.  The four enforcement mechanisms. Grounding gate, per-tool caps,
    iteration budgeting, deterministic enforcement. State the guarantee: a
    total in an Atlas plan is never a number the model wrote.
10. Observable behaviour. Streaming trace, four step types, committed logs,
    MongoDB persistence. Include a short real trace extract.
11. Part C, classical vs modern. The comparison table, condensed to the rows
    that matter most: basis, logic, memory, reasoning depth, tool use,
    latency, maintenance.
12. Part C observed. The Reykjavik head-to-head. Classical matched no rule and
    returned a template in under 2 ms. Atlas found 6 h 38 m of daylight and
    changed the plan because of it. Also state where the classical agent
    genuinely wins, because that honesty earns marks.
13. What we learned. The six takeaways, condensed. Lead with "prompt
    instructions are requests, not constraints" and "data source quality
    dominates model quality".
14. Demo and close. The live URL, the repository, how to run it locally,
    and the closing line: the model supplies fluency and judgement,
    everything you can depend on is built around it.

STYLE RULES
- Maximum 6 bullets per slide, maximum 12 words per bullet. These are speaking
  prompts, not paragraphs.
- Use concrete numbers wherever possible: 16 tools, 11 live, 9 to 16
  iterations, 3,267 lines, 6 h 38 m of daylight, under 2 ms, 61 to 240 s.
- Never use em-dashes or en-dashes. Use a hyphen, colon or comma instead.
  This is a hard formatting rule for this project.
- Write plainly. No marketing language, no "revolutionary", no "cutting-edge",
  no "leveraging", no "seamless".
- Prefer a specific claim over a general one. "Found 6 h 38 m of daylight and
  moved to one outdoor block" beats "intelligently adapts to conditions".
- For each slide also give 2 to 3 sentences of speaker notes that the
  presenter can read aloud.

ALSO PRODUCE
- A 60-second elevator summary of the project for the opening.
- Five likely examiner questions with short, confident answers. Include at
  least one hostile question, for example "isn't this just prompting?" and
  one on "why not LangChain".
```

---

## Likely examiner questions, prepared

Use these to sanity-check whatever NotebookLM produces.

**"Isn't this just a wrapper around an LLM prompt?"**
No. The model never sees a tool result it did not ask for, and it cannot finish
until required tools have run. The grounding gate rejects a Final Answer while
any required fact is ungrounded, and if the model never computes the budget the
orchestrator computes it. Those are control-flow guarantees, not prompting.

**"Why not use LangChain or CrewAI?"**
Because the brief assesses agent reasoning and orchestration, and a framework
would hide exactly that. The loop is about 200 lines and we can explain every
line. We also hit four failure modes that we had to fix inside the loop, which
would have been considerably harder through a framework abstraction.

**"How do you know it is not hallucinating the prices?"**
Three ways. Arithmetic is executed by mathjs, never by the model. Figures may
only enter through a tool observation, and the trace shows which tool produced
each one. If the model skips the calculator, the orchestrator runs it from
figures already in the trace and regenerates the answer.

**"What happens if the API is down or you have no key?"**
It degrades in stages, all visible in the trace. A rate limit switches to a
smaller model or waits the stated interval. A permanently unreachable model
produces a partial plan from observations already collected. No key at all runs
a deterministic planner over the same live tools. A tool failure returns an
informative observation rather than throwing.

**"Three of your tools are just hardcoded tables. Isn't that cheating?"**
They are labelled curated everywhere they appear, in the report and in the
interface, and their output says the figures are indicative. Live fare and
booking APIs are paid and rate limited. We thought it more defensible to be
explicit than to imply all sixteen are live.

**"Why is it so slow compared to the classical agent?"**
Because it is doing genuinely more: 9 to 16 reasoning steps and up to 11
network round trips, against four in-memory branch evaluations. For a closed
domain the classical agent is the better engineering choice, and we say so in
the report. The agentic approach earns its cost only when the steps cannot be
enumerated in advance.
