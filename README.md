# Atlas: Autonomous Travel Concierge & Agentic Itinerary Planner

> IA II Activity 1 (20 Marks): Agentic AI System using Modern LLM-based Tools  
> Department of Electronics & Computer Engineering, Academic Year 2026-27

[![Next.js](https://img.shields.io/badge/Next.js-16+-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Atlas is an autonomous, goal-driven travel planning agent built using the **ReAct (Reasoning + Acting)** paradigm and **Meta Llama 3.3 70B**. Unlike traditional conversational chatbots that hallucinate outdated information, Atlas dynamically decomposes complex travel objectives, calls live environmental APIs, computes exact multi-currency budgets, and produces grounded, verifiable travel itineraries.

---

## Key Features

1. **Autonomous ReAct Cognitive Loop**:
   - Step-by-step reasoning cycle: Thought -> Action -> Observation -> Reflection -> Final Answer.
   - Observable traces streamed to the client via Server-Sent Events (SSE).
2. **6 Grounded Travel Tools**:
   - `weather_forecast`: Live global weather and precipitation from Open-Meteo REST API.
   - `flight_finder`: Aviation corridor route estimates, alliance carriers, and fares.
   - `hotel_search`: Accommodations across budget, mid-range boutique, and luxury tiers.
   - `currency_and_budget_calculator`: Mathjs formula solver with multi-currency FX rates.
   - `attractions_explorer`: Wikipedia REST API integration paired with curated heritage spots.
   - `travel_advisory_and_visa`: Regulatory visa requirements, emergency helplines, and local etiquette.
3. **Classical Rule-Based Agent Comparison (Part C Syllabus)**:
   - Built-in classical agent (`src/lib/classicalAgent.ts`) using static if/else keyword heuristics.
   - Live side-by-side execution mode in the playground comparing adaptability, latency, and failure modes.
4. **MongoDB Atlas Persistence**:
   - Automatically records full interaction logs, intermediate tool payloads, and final itineraries into MongoDB Atlas.
5. **Flexible Deployment Architecture**:
   - **Unified Fullstack**: 1-click deployment on Vercel.
   - **Decoupled Architecture**: Client on Vercel + Dedicated Express server on Render (`server/index.ts`).

---

## Lab Batch Project Team (Equal Shared Contribution)

| Team Member | Role | Shared Contributions |
| :--- | :--- | :--- |
| **Aryan Lomte** | Fullstack AI Co-Developer | Co-developed ReAct engine, Next.js UI, SSE trace streaming, and cloud deployment. |
| **Aditya** | Fullstack AI Co-Developer | Co-developed tool integrations (Open-Meteo, flight/hotel APIs, mathjs), error handling, and tests. |
| **Manthan** | Fullstack AI Co-Developer | Co-developed classical agent for Part C, quantitative benchmark matrix, and laboratory report. |

*Team Policy: Equal end-to-end contribution across architecture, agent implementation, tools, and testing.*

---

## Architecture Overview

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
│ (Weather, Flight, Hotel,│        │
│  Math, Attraction, Visa)│        │
└────────────┬────────────┘        │
             │                     │
             ▼                     │
┌─────────────────────────┐        │
│   Observation Payload   │────────┘
│ (Ground Truth API Data) │
└────────────┬────────────┘
             │ (When goal satisfied)
             ▼
┌─────────────────────────┐
│ Final Structured Answer │ ──► Saved to MongoDB Atlas
└─────────────────────────┘
```

---

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Aryan-lomte05/Atlas.git
cd Atlas
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Populate the connection strings in `.env.local`:
```env
MONGODB_URI=mongodb+srv://aryanlomte_db_user:WmJRQUbqKusIpgv5@<YOUR_CLUSTER>.mongodb.net/atlas_travel?retryWrites=true&w=majority
GROQ_API_KEY=your_groq_api_key_here
```
*(Note: If `GROQ_API_KEY` is omitted, Atlas automatically runs a local simulated ReAct reasoner that queries live Open-Meteo, Wikipedia, and mathjs endpoints).*

### 4. Run the Fullstack Next.js Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 5. (Optional) Run the Dedicated Render Backend
```bash
npm run server
```
Runs the Express backend microservice on port 5000.

---

## Deployment Guide

### Deploying Client to Vercel
1. Import this repository into Vercel.
2. Set Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas URI.
   - `GROQ_API_KEY`: Your Groq API key (optional).
   - `NEXT_PUBLIC_API_URL`: (Optional, leave blank to use unified Next.js API, or set to your Render backend URL).
3. Deploy!

### Deploying Server to Render
1. Create a new Web Service on Render pointing to this repository.
2. Build Command: `npm install`
3. Start Command: `npm run server`
4. Set Environment Variables:
   - `MONGODB_URI`: Your MongoDB connection string.
   - `GROQ_API_KEY`: Your Groq API key.
5. In your Vercel client, set `NEXT_PUBLIC_API_URL` to your Render service URL (e.g. `https://atlas-backend.onrender.com`).

---

## Academic Report
The comprehensive 5 to 10 page academic laboratory report matching the college format is located in [REPORT.md](REPORT.md).
