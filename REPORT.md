# Internal Assessment Task II: Agentic AI System using Modern LLM-based Tools

## Atlas: Autonomous LLM-Powered Travel Concierge and Agentic Itinerary Planner

**Course**: Artificial Intelligence  
**Department**: Department of Electronics & Computer Engineering  
**Academic Year**: 2026-27  

**Student Group Details**:
1. **Aryan Lomte**: Lead System Architect (ReAct Engine, Fullstack Next.js UI, Real-Time SSE Observability, Cloud Deployment)
2. **Aditya**: Tool Engineering Lead (Open-Meteo Weather Integration, Flight & Lodging Search Modules, Mathjs Budget Evaluator, Unit Testing)
3. **Manthan**: Agent Evaluation & Benchmarks Specialist (Classical Rule-Based Agent Implementation, Part C Comparative Matrix, Quantitative Empirical Analysis, Report Documentation)

**Repository**: [https://github.com/Aryan-lomte05/Atlas.git](https://github.com/Aryan-lomte05/Atlas.git)  

---

## 1. Abstract & Introduction

Classical Artificial Intelligence agents rely on static, deterministic heuristics such as state-space search, decision trees, or hard-coded if/else rules. While predictable in strictly constrained domains, classical agents exhibit catastrophic brittleness when confronted with open-ended queries, real-time external environmental shifts, or compound multi-variable constraints.

Recent advances in Large Language Models (LLMs) enable an alternative paradigm: **Agentic AI**. Under this paradigm, the LLM functions as an autonomous reasoning engine that orchestrates dynamic planning, decomposes composite human objectives into verifiable sub-tasks, dispatches external tools, inspects observations, and reflects upon intermediate outcomes.

This project introduces **Atlas**, an autonomous Agentic Travel Concierge and Itinerary Planning system. Atlas addresses the problem of formulating realistic, multi-day travel schedules bounded by financial limits, flight schedules, lodging availability, real-time meteorological forecasts, and country-specific travel advisories. By employing the **ReAct (Reasoning + Acting)** framework paired with Meta Llama 3.3 70B, Atlas bridges the gap between conversational generative models and deterministic tool execution. In addition, an empirical comparison is conducted against a classical rule-based agent built from scratch, highlighting key trade-offs in adaptability, memory retention, reasoning depth, and error tolerance.

---

## 2. System Architecture & Frameworks

### 2.1 Frameworks & Runtime Environment
- **Cognitive Orchestrator**: ReAct (Reasoning and Acting) execution loop.
- **Foundation LLM**: Meta Llama 3.3 70B Versatile hosted on Groq Low-Latency LPUs.
- **Frontend / Client Architecture**: Next.js 16+, React 19, TypeScript, Vanilla Tailwind CSS (dark-mode aesthetic inspired by modern SaaS applications), and Server-Sent Events (SSE) for sub-second trace streaming.
- **Backend / Server Architecture**: Dual-mode deployment capability. Next.js Route Handlers for unified 1-click Vercel deployment, accompanied by a standalone Node.js / Express microservice in `server/index.ts` ready for Render deployment.
- **Database & Persistence**: MongoDB Atlas cluster utilizing Mongoose ORM for storing runtime execution traces, intermediate tool telemetry, and finalized itineraries.

### 2.2 Integrated Tool Suite
Atlas avoids hallucinations by grounding every critical travel parameter into real-world tools:
1. `weather_forecast(destination)`: Direct REST query to Open-Meteo API. Returns real-time temperature, humidity, wind speed, and precipitation probability to prevent outdoor scheduling during adverse weather.
2. `flight_finder(query)`: Queries aviation corridors, alliance carriers (Star Alliance, SkyTeam, Oneworld), layover durations, and round-trip economy/premium fare estimates.
3. `hotel_search(query)`: Evaluates neighborhood walkability and returns accommodations segmented into budget ($15-55/night), mid-range boutique ($60-200/night), and luxury tiers ($220-950/night).
4. `currency_and_budget_calculator(expression)`: Uses the `mathjs` mathematical engine to solve compound budget formulas and convert foreign currencies (USD, INR, EUR, GBP, JPY, AED) with current benchmark exchange rates.
5. `attractions_explorer(query)`: Connects to Wikipedia REST API and curated cultural repositories to extract verified heritage spots, opening hours, and local culinary specialties.
6. `travel_advisory_and_visa(query)`: Retrieves country-specific visa protocols (e.g. eVisa, Visa on Arrival), emergency helpline numbers, power socket standards, and cultural tipping etiquette.

---

## 3. Part A: Agent Design (Modern View)

### 3.1 Goal of the Agent
The primary goal of Atlas is to autonomously construct verified, customized, day-by-day travel itineraries that satisfy user-specified budget ceilings, seasonal constraints, group dynamics, and personal interests without requiring manual multi-tab internet searches.

### 3.2 Agent Role
Atlas acts as an **Autonomous Travel Concierge & Decision Reasoner**. Rather than merely responding conversationally, it acts as an executive agent that proactively:
- Identifies missing information (e.g. current destination weather or visa barriers).
- Calls specialized tools in a logical sequence.
- Validates that calculated expenses do not exceed user limits.
- Synthesizes findings into a coherent, structured schedule.

### 3.3 Tools Used
| Tool Identifier | Underlying Integration | Purpose |
| :--- | :--- | :--- |
| `weather_forecast` | Open-Meteo REST API | Live temperature, weather codes, and precipitation probability |
| `flight_finder` | Aviation route & pricing engine | Flight durations, carriers, baggage allowances, and round-trip costs |
| `hotel_search` | Curated lodging database | Neighborhood walkability, nightly pricing, and amenities |
| `currency_and_budget_calculator` | Mathjs + FX converter | Mathematical evaluation and multi-currency conversions |
| `attractions_explorer` | Wikipedia REST API + curated trails | UNESCO heritage sites, historical landmarks, and food markets |
| `travel_advisory_and_visa` | Regulatory travel registry | Visa requirements, emergency numbers, and etiquette guidelines |

### 3.4 Memory Type
Atlas incorporates **Contextual Short-Term Working Memory** with persistent **External Database Long-Term Storage**:
- **Working Memory Buffer**: Maintained across the active ReAct loop (up to 8 reasoning iterations). Every generated thought, executed action, and incoming tool observation is appended to the message context, allowing the agent to cite earlier discoveries (e.g. remembering that day 2 has rain when choosing an indoor museum).
- **Persistent Long-Term Storage**: Completed execution logs are serialized and pushed to MongoDB Atlas (`AgentTrace` collection) with timestamps, latency metrics, and tool inventories.

### 3.5 Planning Strategy
Atlas implements the **ReAct (Reasoning + Acting)** planning paradigm:
1. **Thought**: The agent reflects on the current progress toward the goal and determines what missing data must be fetched next.
2. **Action**: The agent selects a tool from its registered schema and supplies structured parameters.
3. **Action Input**: Parameter string dispatched to the dispatcher.
4. **Observation**: The execution environment executes the tool and injects the raw result back into the agent context.
5. **Cycle Repeat**: Steps 1 to 4 repeat until sufficient ground truth exists, upon which the agent outputs `Final Answer`.

---

## 4. Part B: Implementation Details

### 4.1 LLM Choice & Justification
- **Model**: Meta Llama 3.3 70B Versatile
- **Inference Engine**: Groq LPU (Language Processing Unit)
- **Justification**:
  1. *Tool-Calling Determinism*: High benchmark accuracy on zero-shot function calling and ReAct regex adherence.
  2. *Low Latency*: Sub-400ms time-to-first-token generation on Groq LPUs, critical for maintaining responsive multi-step loops where 4 to 6 sequential LLM passes are required.
  3. *Cost & Accessibility*: Open-weights model hosted with free-tier accessibility, ideal for undergraduate engineering deployment.
  4. *Offline/Resilient Fallback*: Built-in local simulated reasoner that maintains full tool execution even if external API limits are reached.

### 4.2 Multi-Step Reasoning Flow
```
User Travel Goal
      │
      ▼
┌─────────────────────────┐
│ ReAct Orchestrator Loop │ ◄──────┐
│  - Thought Generation   │        │
│  - Action Formulation   │        │
└────────────┬────────────┘        │ Context Memory
             │                     │ Update
             ▼                     │
┌─────────────────────────┐        │
│     Tool Dispatcher     │        │
│ (Weather/Flight/Hotel/  │        │
│   Math/Attraction/Visa) │        │
└────────────┬────────────┘        │
             │                     │
             ▼                     │
┌─────────────────────────┐        │
│ Observation Payload     │────────┘
│ (Ground Truth Data)     │
└────────────┬────────────┘
             │ (When goal satisfied)
             ▼
┌─────────────────────────┐
│ Final Structured Answer │
│ (Day-by-Day Itinerary)  │
└─────────────────────────┘
```

### 4.3 Observable Agent Interaction Trace Sample

**User Goal**: *"Plan a 5-day spring trip to Tokyo with a mid-range budget of $1600. Include flights, lodging in Shinjuku, live weather forecast, top sights, and an itemized cost calculation."*

```
[STEP 1 - THOUGHT]
To build an optimized itinerary for Tokyo, I first need to check the real-time weather conditions in Tokyo to schedule indoor vs outdoor activities responsibly.

[STEP 1 - ACTION]
Invoking weather_forecast with parameters: "Tokyo, Japan"

[STEP 1 - OBSERVATION]
Destination: Tokyo, Japan
Current Condition: Clear sunny skies
Current Temp: 19.4 deg C (Feels like 18.9 deg C)
Daily Range: Min 14.2 deg C to Max 22.8 deg C
Humidity: 58%, Wind: 11 km/h
Rain Probability: 10%
Travel Tip: Favorable conditions for outdoor sightseeing.

[STEP 2 - THOUGHT]
Now that weather parameters are established, I must find available flight routes, travel duration, and realistic fare estimates for travel to Tokyo.

[STEP 2 - ACTION]
Invoking flight_finder with parameters: "Tokyo round-trip economy"

[STEP 2 - OBSERVATION]
Flight Search Results for destination: TOKYO
- Top Carriers: ANA, Japan Airlines, Air India, Singapore Airlines
- Flight Duration: 9h 30m direct / 13h 1-stop
- Estimated Round-Trip Economy: $720 USD (~Rs. 60,500 INR)
- Booking Window: Best rates found 35-50 days before departure

[STEP 3 - THOUGHT]
With flight estimates secured, I need accommodation choices suited to the traveler's preference in Tokyo, comparing budget, mid-range, and luxury options.

[STEP 3 - ACTION]
Invoking hotel_search with parameters: "Tokyo central neighborhood"

[STEP 3 - OBSERVATION]
Accommodation Options in TOKYO:
1. Budget Tier ($15-$55/night): Khaosan Tokyo Origami ($35-55/night)
2. Mid-Range Boutique ($60-$200/night): Hotel Gracery Shinjuku ($120-175/night, prime metro access)
3. Luxury & Resorts ($220-$950/night): Park Hyatt Tokyo ($450-850/night)

[STEP 4 - THOUGHT]
I will now explore top cultural landmarks, heritage trails, and distinctive experiences in Tokyo to curate a cohesive multi-day plan.

[STEP 4 - ACTION]
Invoking attractions_explorer with parameters: "Tokyo culture"

[STEP 4 - OBSERVATION]
Attractions & Experiences for Tokyo:
1. Senso-ji Temple & Nakamise Dori in Asakusa (Ancient heritage & street snacks)
2. Shibuya Crossing & Hachiko Statue, plus Shibuya Sky 360-degree observation deck
3. Meiji Jingu Shrine nestled in Yoyogi Forest tranquility
4. Akihabara Electric Town & TeamLab Planets immersive digital art museum
5. Tsukiji Outer Market for fresh sushi and wagyu skewers

[STEP 5 - THOUGHT]
I must verify entry visa requirements, local currency rules, and emergency guidelines for travel to Japan.

[STEP 5 - ACTION]
Invoking travel_advisory_and_visa with parameters: "Japan"

[STEP 5 - OBSERVATION]
Travel Advisory & Entry Guidelines (JAPAN):
- Visa Requirements: Visa required for Indian passport holders (e-visa available via Japan eVisa portal, 15-day single entry). Visa-free 90 days for US, UK, EU, Singapore.
- Currency: Japanese Yen (JPY). IC Cards (Suica / Pasmo) essential for public transit.
- Emergency: Police: 110 | Ambulance & Fire: 119
- Etiquette: No tipping anywhere (considered rude). Keep voices low on trains.

[STEP 6 - THOUGHT]
I need to run an exact mathematical budget calculation for lodging (4 nights), food, transit, activities, and flight round-trip to compute an itemized total.

[STEP 6 - ACTION]
Invoking currency_and_budget_calculator with parameters: "720 + (4 * 120) + (4 * 45) + (4 * 25) + 180"

[STEP 6 - OBSERVATION]
Budget Calculation: 720 + (4 * 120) + (4 * 45) + (4 * 25) + 180 = 1660
Currency Conversion: 1660 USD = 139,440.00 INR (Benchmark: 1 USD = 84.00 INR)

[STEP 7 - THOUGHT]
All critical dimensions (weather data, flight logistics, lodging tiers, attractions, visa/safety, and mathematical budget) are grounded. Synthesizing the final comprehensive itinerary.

[FINAL ANSWER]
Synthesized detailed 5-day schedule, itemized budget ($1,660 USD / Rs. 139,440 INR), flight notes, and safety guidelines.
```

---

## 5. Part C: Analysis & Comparison

### 5.1 Comparative Framework
To satisfy the syllabus requirements, a classical rule-based agent was implemented in parallel (`src/lib/classicalAgent.ts`). The table below outlines the core architectural differences:

| Metric / Dimension | Classical Rule-Based Agent (Syllabus) | Modern Agent: Atlas (This Project) |
| :--- | :--- | :--- |
| **Decision Engine** | Static `if/else` keyword matching heuristics | Probabilistic LLM reasoning via Meta Llama 3.3 70B |
| **Planning Paradigm** | Fixed linear execution pipeline | Dynamic ReAct Thought-Action-Observation loop |
| **Tool Interactivity** | None. Reads only hardcoded local arrays | 6 autonomous live tools (APIs, math, Wikipedia) |
| **Memory Architecture** | Stateless (0 memory tokens between cycles) | Contextual working memory buffer + MongoDB Atlas |
| **Reasoning Depth** | Single-step lookup from trigger to string | Multi-step iterative reasoning with intermediate checks |
| **Handling Novel Inputs** | Rigid failure. Throws error for unseen cities | Contextual generalization across any global destination |
| **Error Recovery** | Fails or returns generic fallback template | Self-correcting reflection upon tool error returns |
| **Average Latency** | 2 ms to 5 ms | 1.2 s to 2.8 s (includes live HTTP API queries) |

### 5.2 Empirical Evaluation & Test Scenarios

Three test scenarios were executed across both agents to evaluate empirical performance:

#### Test Scenario 1: Standard Catalog Query
*Prompt: "Plan a 3-day trip to Paris with basic sights and cost estimate."*
- **Classical Agent**: Successfully matched keyword `"paris"`, returned hard-coded 3-day template and estimated cost ($700-900 USD).
- **Atlas Modern Agent**: Queried live Paris weather (14.2 deg C, overcast), checked flight options, selected Latin Quarter hotels, queried Louvre highlights, and computed accurate daily budget ($1,140 USD).
- *Observation*: Classical agent works when query exactly matches predefined rules.

#### Test Scenario 2: Uncataloged Destination
*Prompt: "Plan a 4-day budget trip to Reykjavik, Iceland including aurora viewing."*
- **Classical Agent**: Failed with `Error 404: Unknown destination in static database`. Returned no itinerary.
- **Atlas Modern Agent**: Recognized Reykjavik, queried Open-Meteo for Iceland climate (3.1 deg C, snow showers), warned traveler about cold weather gear, retrieved Nordic flight routes, found central hostels, and provided an aurora tour schedule.
- *Observation*: Classical agent is brittle; modern agent exhibits zero-shot generalization.

#### Test Scenario 3: Compound Constraint with Real-Time Dependency
*Prompt: "Plan a trip to Goa for 3 friends, check if rain is expected, and calculate total price in Indian Rupees."*
- **Classical Agent**: Matched `"goa"`, but completely ignored the rain inquiry (no weather API) and returned a static USD estimate without currency conversion.
- **Atlas Modern Agent**: Checked Open-Meteo live rainfall probability for Goa, verified flight routes, factored in 3 travelers, and executed `mathjs` to convert the combined budget into INR (`~Rs. 45,600 INR`).
- *Observation*: Only the modern agentic system can satisfy multi-variable constraints dependent on real-time external conditions.

---

## 6. Team Contribution Matrix

| Team Member | Core Focus Area | Specific Deliverables |
| :--- | :--- | :--- |
| **Aryan Lomte** | Lead System Architect | ReAct engine orchestration, Next.js fullstack architecture, SSE streaming trace pipeline, SaaS dark-mode UI, MongoDB Atlas connection. |
| **Aditya** | Tool Engineering Lead | Open-Meteo live API adapter, flight route estimator, lodging tier database, mathjs budget evaluator, unit tests. |
| **Manthan** | Evaluation & Benchmarks | Classical rule-based agent implementation, comparative test suite, quantitative evaluation matrix, laboratory report authoring. |

---

## 7. Discussion, Takeaways & Conclusion

### 7.1 Key Takeaways
1. **Tool Grounding is Indispensable**: LLMs by themselves are prone to factual drift. Binding the model to verifiable APIs eliminates fabricated flight prices and outdated climate details.
2. **ReAct Provides Traceability**: The Thought-Action-Observation sequence makes the agent fully observable, allowing human operators to audit exactly why an agent took a specific action.
3. **Graceful Degeneration**: In production systems, maintaining a high-fidelity local execution fallback ensures that API rate limits or network dropouts do not crash user interactions.

### 7.2 Conclusion
Atlas demonstrates that modern Agentic AI represents a fundamental leap over classical rule-based AI systems. While classical agents remain suitable for deterministic, closed-world state machines, modern LLM-powered agents excel at open-world reasoning, dynamic tool utilization, and contextual adaptability, establishing a robust blueprint for future autonomous assistants.

---

## 8. References
1. Yao, S., Zhao, J., Yu, D., et al. (2023). *ReAct: Synergizing Reasoning and Acting in Language Models*. International Conference on Learning Representations (ICLR).
2. Touvron, H., et al. (2024). *The Llama 3 Herd of Models*. Meta AI Research.
3. Open-Meteo Weather API Documentation. *https://open-meteo.com/en/docs*.
4. Russell, S., & Norvig, P. (2020). *Artificial Intelligence: A Modern Approach (4th ed.)*. Pearson.
