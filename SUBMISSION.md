# Submission package

**Internal Assessment Task II, Activity 1 (20 marks)**
Agentic AI System using Modern LLM-based Tools

| | |
| --- | --- |
| Project | Atlas: An Autonomous Travel Planning Agent |
| Subject | Artificial Intelligence |
| Department | Electronics & Computer Engineering, 2026-27 |
| Team | Manthan Kadu (16015024036), Aditya Lokhande (16015024040), Aryan Lomte (16015024041) |
| Submission | Today, batchwise in lab session |
| Demo | 13 October 2026 |
| Live app | https://atlas-travel-agent-theta.vercel.app |
| Repository | https://github.com/Aryan-lomte05/Atlas.git |

---

## What to hand in

| # | Deliverable required by the brief | File to submit | Status |
| --- | --- | --- | --- |
| 1 | PDF report | `docs/Atlas-IA2-Report.pdf` | Ready, 30 pages, follows the department template |
| 2 | Architecture / tool flow diagram | Inside the PDF (Part B), also rendered live on the site | Ready |
| 3 | Code repository with a demo of the working agent | GitHub link above, plus the live Vercel app and `demo_agent.py` | Ready |
| 4 | Agent interaction logs | `docs/logs/` (4 files) | Ready |
| 5 | Prompts and output screenshots | `docs/screenshots/` (11 files) | Ready |
| 6 | Presentation | Build from `docs/PPT-PROMPT.md` using NotebookLM | Prompt ready |

---

## Files in this package

```
docs/
  Atlas-IA2-Report.pdf        <- THE SUBMISSION. 30 pages, all figures.
  report.html                 <- source the PDF was rendered from
  NOTEBOOKLM-SOURCE.md        <- paste into NotebookLM to build the deck
  PPT-PROMPT.md               <- the prompt, plus prepared viva Q and A
  logs/
    kyoto-react-full.log      35 steps, 10 tools, a complete run
    kyoto-steering.log        40 steps, iteration budgeting firing
    kyoto-gate-and-429.log    47 steps, grounding gate plus rate-limit recovery
    mumbai-named-places.log   Wikivoyage returning real named spots
  screenshots/
    01-landing.png            04-trace-streaming.png   08-tools.png
    02-playground-empty.png   05-final-answer.png      09-architecture.png
    03-prompt-entered.png     06-itinerary.png         10-comparison.png
    07-how-it-works.png       11-memory.png
REPORT.md                     <- markdown source of the report
```

---

## Making the presentation

1. Open NotebookLM, create a notebook.
2. Add `docs/NOTEBOOKLM-SOURCE.md` as a source. Optionally add
   `docs/Atlas-IA2-Report.pdf` and one log file.
3. Paste the prompt from `docs/PPT-PROMPT.md`.
4. Copy the resulting outline into `IA2 Instructions.pptx`.
5. Pull figures from `docs/screenshots/` for the architecture, trace and
   comparison slides.

`docs/PPT-PROMPT.md` also contains five prepared examiner questions with
answers, including the hostile ones.

---

## Running the demo in the lab

**Easiest, nothing to install:** open
https://atlas-travel-agent-theta.vercel.app, scroll to the Playground, type a
goal, press Enter. The Groq key is already configured on the deployment.

**Locally:**

```bash
git clone https://github.com/Aryan-lomte05/Atlas.git
cd Atlas
npm install
cp .env.example .env.local      # add GROQ_API_KEY from console.groq.com
npm run dev                     # http://localhost:3000
```

**Terminal only, no browser:**

```bash
python demo_agent.py
```

### Suggested demo script, about 4 minutes

1. Open the site, scroll to the Playground.
2. Enter: *"Plan 5 days in Mumbai for two people on a 60000 INR budget. Tell
   me exactly where to eat and what to see."*
3. While it runs, narrate the trace: thought, then action, then observation.
   Point out that it chose the tool, nobody scripted the order.
4. When it finishes, open the reasoning disclosure and show the step count and
   tool count in the header.
5. Show the itinerary naming the Gateway of India and Sassoon Docks, and the
   line where it says fare data was unavailable rather than inventing one.
6. Ask a follow-up: *"Make it cheaper."* Show that it amends the existing plan
   rather than starting over.
7. Switch the mode toggle to **Compare** and run a destination not in the
   classical agent's table, for example Reykjavik. The classical agent returns
   a template in milliseconds and reports its own limitation; Atlas finds the
   daylight constraint and plans around it.

**If the network is unreliable in the lab:** the agent still runs. Without a
reachable model it uses the deterministic planner over the same live tools, and
the trace says so explicitly. Have `docs/logs/` open as a backup.

---

## Before you submit

- [ ] Confirm the three roll numbers on page 1 of the PDF are correct
- [ ] Upload `docs/Atlas-IA2-Report.pdf`
- [ ] Attach or link `docs/logs/` and `docs/screenshots/`
- [ ] Include the repository link and the live URL
- [ ] Build the deck from `docs/PPT-PROMPT.md`

---

## One security note

An earlier commit (`8302371`) contains a MongoDB password in `.env.example`.
It has been scrubbed from the current file, but it remains in git history on a
public repository. **Rotate that database password in MongoDB Atlas.** The
current `.env.local` holds only placeholders and the Groq key, and is
gitignored.
