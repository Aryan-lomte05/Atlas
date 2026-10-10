# CLAUDE.md: Developer & Agent Guidelines for Atlas

## Project Overview
Atlas is an autonomous, goal-driven travel planning concierge built for College IA-2 Activity 1 (Artificial Intelligence course, ECE Dept 2026-27). It implements the ReAct (Reasoning + Acting) loop with Meta Llama 3.3 70B, integrates 6 live tools, persists traces to MongoDB Atlas, and provides an empirical comparison against a classical rule-based agent.

---

## Critical Project Rules

1. **NO EM-DASHES OR EN-DASHES**:
   - Strictly forbidden across all source code, markdown, documentation, and UI strings.
   - Never use the characters `\u2014` or `\u2013`.
   - Always use standard hyphen `-`, colon `:`, or comma `,`.
2. **Directory Structure**:
   - Keep all code in the project root. Do not create nested wrapper folders.
3. **Dual Deployment Capability**:
   - Support both unified Vercel deployment (Next.js App Router) and decoupled Render deployment (`server/index.ts`).

---

## Essential Commands

### Installation & Setup
```bash
npm install
cp .env.example .env.local
```

### Running Locally
```bash
# Start Next.js Fullstack Frontend & API (port 3000)
npm run dev

# Start Dedicated Express Backend for Render (port 5000)
npm run server

# Run Python Terminal Demo (no browser required for lab viva)
python demo_agent.py
```

### Validation & Verification
```bash
# Typecheck
npx tsc --noEmit

# Production Build
npm run build
```

---

## File Structure & Module Map

```
AI-IA2/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── agent/route.ts      # Real-time SSE streaming ReAct runner + classical handler
│   │   │   └── traces/route.ts     # MongoDB trace query API
│   │   ├── globals.css             # Clean Tailwind v4 theme, marquee animations, custom scrollbar
│   │   ├── layout.tsx              # Root HTML wrapper with fonts and SEO metadata
│   │   └── page.tsx                # Master landing page assembling all UI sections
│   ├── components/
│   │   ├── Navbar.tsx              # Floating frosted glass navbar with direct section links
│   │   ├── Hero.tsx                # Parallax hero with live metrics and glowing canvas
│   │   ├── HeroCanvas.tsx          # Interactive background particle and light mesh
│   │   ├── LogoMarquee.tsx         # Infinite scrolling partner & technology marquee
│   │   ├── StatementSection.tsx    # Big typography statement on modern agentic intelligence
│   │   ├── Playground.tsx          # Core interactive console with live SSE streaming trace logs
│   │   ├── BentoSection.tsx        # Bento grid detailing cognitive decomposition and memory
│   │   ├── StickyHowItWorks.tsx    # Interactive 5-phase execution workflow
│   │   ├── ToolsSection.tsx        # Deep dive into the 6 grounding tools with sample payloads
│   │   ├── ArchitectureSection.tsx # ReAct system architecture and tool flow diagram
│   │   ├── ComparisonSection.tsx   # Part C academic comparison matrix (Classical vs Modern)
│   │   ├── TestimonialsSection.tsx # 3 validated travel persona case studies
│   │   ├── PricingSection.tsx      # 3-tier budget calibration cards (Backpacker, Boutique, Luxury)
│   │   ├── TeamSection.tsx         # Lab team cards for Aryan Lomte, Aditya, and Manthan
│   │   ├── FaqSection.tsx          # Accordion FAQ covering syllabus and technical questions
│   │   ├── CtaSection.tsx          # Pre-footer newsletter and launch banner
│   │   ├── Footer.tsx              # Attribution, GitHub links, and back-to-top button
│   │   ├── SmoothScroll.tsx        # Lenis smooth inertial scrolling wrapper
│   │   └── GithubIcon.tsx          # Reusable SVG icon component
│   └── lib/
│       ├── agent.ts                # Modern ReAct orchestrator with Llama 3.3 & simulated fallback
│       ├── classicalAgent.ts       # Part C syllabus classical rule-based agent
│       ├── tools.ts                # 6 tool implementations (Open-Meteo, Wikipedia, mathjs, etc.)
│       ├── db.ts                   # MongoDB Atlas connection helper with connection caching
│       └── models/
│           ├── AgentTrace.ts       # Mongoose schema for execution logs
│           └── SavedItinerary.ts   # Mongoose schema for finalized travel plans
├── server/
│   └── index.ts                    # Dedicated Express server for Render deployment
├── demo_agent.py                   # Standalone Python script for terminal viva demo
├── render.yaml                     # Render Blueprint specification
├── REPORT.md                       # Comprehensive 5-10 page academic college report
├── SYSTEM.md                       # Complete end-to-end system design documentation
└── README.md                       # GitHub documentation and setup guide
```

---

## Roadmap & Tasks for Teammates

### Tasks for Aditya (Tool Engineering Lead):
1. **Add More Grounded Tools** (`src/lib/tools.ts`):
   - Add a `restaurant_recommender(city, cuisine)` tool for local food discovery.
   - Add a `packing_checklist(destination, weather)` tool that uses weather observations to generate clothing checklists.
2. **Unit Tests**:
   - Write tests for tool dispatch error handling and API fallback timeouts.
3. **MongoDB Trace Explorer**:
   - Add a small history drawer in the playground that calls `GET /api/traces` to display past student queries stored in Atlas.

### Tasks for Manthan (Evaluation & Benchmarks Lead):
1. **Viva Demonstration Prep**:
   - Test `python demo_agent.py` on various complex prompts and prepare terminal screenshots for the viva presentation.
2. **Review Academic Report** (`REPORT.md`):
   - Cross-check `REPORT.md` with the college template `AI IA2 report format.docx` and add any batch-specific roll numbers.
3. **Slide Deck**:
   - Populate `IA2 Instructions.pptx` using the diagrams and tables from `SYSTEM.md` and `REPORT.md`.

---

## Environment Variables
- `MONGODB_URI`: MongoDB connection string.
- `GROQ_API_KEY`: Groq API key for Llama 3.3 70B (optional, system has high-fidelity live tool fallback if omitted).
- `NEXT_PUBLIC_API_URL`: Set only if pointing the Vercel frontend to the decoupled Render backend.
