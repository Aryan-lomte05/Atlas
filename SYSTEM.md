# Atlas System Architecture & Technical Specifications

> Project: Atlas - Autonomous Travel Concierge & Agentic AI Itinerary Planner  
> Course: Artificial Intelligence (IA-2: Activity 1 - 20 Marks)  
> Department of Electronics & Computer Engineering, Academic Year 2026-27  
> Repository: https://github.com/Aryan-lomte05/Atlas.git  

---

## 1. Executive Summary & Objective

Atlas is an autonomous, goal-driven travel planning agent built using the **ReAct (Reasoning + Acting)** paradigm paired with **Meta Llama 3.3 70B** on Groq. Unlike static chatbots that hallucinate outdated flights and weather, Atlas dynamically decomposes open-ended human goals, executes real-world REST tools, checks intermediate observations, self-corrects based on constraints, and compiles verifiable multi-day travel itineraries.

In compliance with the college syllabus (IA-2 Activity 1, Part C), Atlas also features a fully functional **Classical Rule-Based Agent** built from scratch to provide an empirical, side-by-side benchmark demonstrating the superiority of modern agentic systems over static if/else heuristics.

---

## 2. Team Division of Labor

| Team Member | Role | Key Deliverables & Responsibilities |
| :--- | :--- | :--- |
| **Aryan Lomte** | Lead System Architect | ReAct engine orchestration, Next.js fullstack frontend, Server-Sent Events (SSE) streaming traces, cloud deployment. |
| **Aditya** | Tool Engineering Lead | External API integrations (Open-Meteo weather, flight routes, lodging tiers, mathjs budget evaluator), error fallbacks, unit test suite. |
| **Manthan** | Evaluation & Benchmarks | Classical agent implementation, Part C comparative evaluation matrix, viva test cases, academic report authoring. |

---

## 3. High-Level Architecture Flow

```
                      User Goal / Constraints
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │  Next.js 16 Client    │
                     │  (Interactive UI)     │
                     └───────────┬───────────┘
                                 │ HTTP POST / SSE
                                 ▼
                     ┌───────────────────────┐
                     │   Agent API Engine    │
                     │  (Next.js / Express)  │
                     └───────────┬───────────┘
                                 │
          ┌──────────────────────┴──────────────────────┐
          │                                             │
          ▼                                             ▼
┌───────────────────────────┐               ┌───────────────────────────┐
│ Modern ReAct Agent Loop   │               │ Classical Rule-Based Agent│
│  - Thought Generation     │               │  - Static Regex Lookup    │
│  - Tool Selection         │               │  - Hardcoded Templates    │
│  - Observation Grounding  │               │  - 0 Memory / 0 Tool APIs │
└─────────────┬─────────────┘               └─────────────┬─────────────┘
              │                                           │
              ▼                                           ▼
┌───────────────────────────┐               ┌───────────────────────────┐
│ 6 Grounded Tool Handlers  │               │ Instant Predefined Output │
│ - Weather (Open-Meteo)    │               └───────────────────────────┘
│ - Flight Route Estimator  │
│ - Hotel Lodging Explorer  │
│ - Math & FX Calculator    │
│ - Attractions (Wikipedia) │
│ - Visa & Travel Advisory  │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│ MongoDB Atlas Persistence │
│ (Traces, Steps, Costs)    │
└───────────────────────────┘
```

---

## 4. ReAct Reasoning Protocol

Atlas follows the formal ReAct cycle across up to 8 reasoning iterations:

1. **Thought**: The LLM analyzes the current goal and reflects: *"What information is missing? Which tool will supply it?"*
2. **Action**: The LLM outputs the exact tool name (e.g. `weather_forecast`).
3. **Action Input**: The LLM supplies targeted arguments (e.g. `"Tokyo, Japan"`).
4. **Observation**: The system executes the tool and injects raw ground truth back into the prompt buffer.
5. **Context Update**: The observation is appended to the message history, enabling the agent to refer back to earlier discoveries (e.g. noticing rain on day 2 and adjusting outdoor activities).
6. **Final Answer**: Once weather, flights, lodging, attractions, visa, and budget are resolved, the agent outputs the structured itinerary and saves the trace to MongoDB Atlas.

---

## 5. The 6 Integrated Grounding Tools

1. **`weather_forecast(destination)`**
   - Live Open-Meteo REST API call with global geocoding.
   - Returns real-time temperature, humidity, wind, and precipitation probability.
2. **`flight_finder(query)`**
   - Aviation corridor estimator with carrier networks (Star Alliance, SkyTeam, Oneworld).
   - Computes realistic round-trip economy/premium fares and durations.
3. **`hotel_search(query)`**
   - Curated lodging database segmented into budget ($15-55), mid-range boutique ($60-200), and luxury ($220-950).
   - Calculates neighborhood walkability and local tourism taxes.
4. **`currency_and_budget_calculator(expression)`**
   - Evaluates mathematical expressions using `mathjs`.
   - Multi-currency conversions (USD, INR, EUR, GBP, JPY, AED) with benchmark exchange rates.
5. **`attractions_explorer(query)`**
   - Queries Wikipedia REST API for cultural summaries.
   - Combines encyclopedic facts with curated UNESCO heritage routes and food markets.
6. **`travel_advisory_and_visa(query)`**
   - Regulatory travel registry containing visa rules, emergency numbers, and cultural etiquette.

---

## 6. Classical Agent vs Modern Agent Benchmark (Part C)

| Dimension | Classical Rule-Based Agent | Modern ReAct Agent (Atlas) |
| :--- | :--- | :--- |
| **Logic Paradigm** | Static `if/else` keyword matching | LLM-driven probabilistic reasoning via Llama 3.3 |
| **Planning Depth** | Single-step template lookup | Multi-step iterative ReAct loop |
| **External Grounding**| None (reads only local arrays) | 6 live tools (APIs, math engine, Wikipedia) |
| **Memory Buffer** | Stateless (0 tokens retained) | Contextual working memory window + MongoDB Atlas |
| **Novel Inputs** | Rigid failure on unseen cities | Seamless zero-shot generalization worldwide |
| **Error Recovery** | Hard crashes or generic fallback | Self-correcting reflection upon tool error returns |
| **Execution Speed** | ~3ms (instantaneous string lookup)| ~1.5s - 2.8s (includes live network HTTP I/O) |

---

## 7. MongoDB Atlas Persistence Schema

Atlas connects to MongoDB Atlas using Mongoose:
- **`AgentTrace` Model**:
  - `goal`: Original user objective string.
  - `agentType`: Modern ReAct or Classical Rule-Based.
  - `steps`: Array of `{ type, content, tool, toolInput, timestamp }`.
  - `finalAnswer`: Generated markdown itinerary.
  - `totalSteps`: Step count.
  - `toolsUsed`: List of distinct tools invoked.
  - `duration`: Execution time in milliseconds.
- **`SavedItinerary` Model**:
  - Stores finalized itineraries with destination, duration, and calculated budget in USD and INR.

---

## 8. Deployment Architecture

1. **Option 1: Unified Next.js Deployment on Vercel**
   - Frontend and API route handlers (`/api/agent`, `/api/traces`) deploy to Vercel in 1 click.
2. **Option 2: Decoupled Client (Vercel) + Dedicated Server (Render)**
   - Frontend on Vercel pointing to Render via `NEXT_PUBLIC_API_URL`.
   - Dedicated Express server (`server/index.ts`) deployed on Render using the included `render.yaml` blueprint.
