// Classical Rule-Based Travel Agent (Part C College Benchmark)
// Characteristics:
// 1. Static rule matching (if/else keyword conditions)
// 2. No dynamic reasoning or tool orchestration loop
// 3. Zero contextual memory
// 4. Fixed predetermined templates

export interface ClassicalStep {
  type: "rule_eval" | "lookup" | "output";
  ruleName: string;
  matched: boolean;
  content: string;
  timestamp: number;
}

export interface ClassicalRunResult {
  goal: string;
  agentType: "Classical Rule-Based Agent";
  steps: ClassicalStep[];
  finalAnswer: string;
  totalRulesEvaluated: number;
  matchedRules: number;
  duration: number;
  limitationsEncountered: string[];
}

export function runClassicalAgent(goal: string): ClassicalRunResult {
  const startTime = Date.now();
  const lowerGoal = goal.toLowerCase();
  const steps: ClassicalStep[] = [];
  const limitations: string[] = [];

  // Step 1: Destination Rule Evaluation
  let matchedCity = "";
  const cities = ["tokyo", "kyoto", "paris", "bali", "goa", "dubai", "london", "singapore"];

  steps.push({
    type: "rule_eval",
    ruleName: "Rule 1: Destination Pattern Matcher",
    matched: true,
    content: `Evaluating text against hardcoded city registry: [${cities.join(", ")}]`,
    timestamp: Date.now(),
  });

  for (const c of cities) {
    if (lowerGoal.includes(c)) {
      matchedCity = c;
      break;
    }
  }

  if (!matchedCity) {
    limitations.push("Unknown destination: Classical agent cannot infer context or extract unseen city names.");
    steps.push({
      type: "lookup",
      ruleName: "Rule 1 Fallback",
      matched: false,
      content: "No recognized city keyword matched in rule table. Triggering generic fallback.",
      timestamp: Date.now(),
    });
    return {
      goal,
      agentType: "Classical Rule-Based Agent",
      steps,
      finalAnswer: "Error 404: Unknown destination in static database. Please specify one of: " + cities.join(", "),
      totalRulesEvaluated: 1,
      matchedRules: 0,
      duration: Date.now() - startTime,
      limitationsEncountered: limitations,
    };
  }

  steps.push({
    type: "lookup",
    ruleName: "Rule 2: Static Itinerary Lookup Table",
    matched: true,
    content: `Triggered hardcoded template for city: ${matchedCity.toUpperCase()}. No live APIs queried.`,
    timestamp: Date.now(),
  });

  // Step 2: Budget Parser Rule
  let budgetTier = "standard";
  steps.push({
    type: "rule_eval",
    ruleName: "Rule 3: Budget Keyword Evaluator",
    matched: true,
    content: "Evaluating for keywords: ['budget', 'cheap', 'luxury', 'expensive']",
    timestamp: Date.now(),
  });

  if (lowerGoal.includes("budget") || lowerGoal.includes("cheap") || lowerGoal.includes("hostel")) {
    budgetTier = "budget";
  } else if (lowerGoal.includes("luxury") || lowerGoal.includes("5-star") || lowerGoal.includes("resort")) {
    budgetTier = "luxury";
  }

  // Step 3: Hardcoded Template Construction
  const templates: Record<string, { days: string[]; estCost: string }> = {
    tokyo: {
      days: [
        "Day 1: Arrive at Narita/Haneda, check in, walk through Shibuya Crossing.",
        "Day 2: Visit Senso-ji temple in Asakusa and shop in Akihabara.",
        "Day 3: Meiji Shrine in the morning, Harajuku shopping in the afternoon.",
      ],
      estCost: budgetTier === "budget" ? "$600 - $800 USD" : "$1400 - $2200 USD",
    },
    kyoto: {
      days: [
        "Day 1: Fushimi Inari shrine 10,000 torii gates trail.",
        "Day 2: Kinkaku-ji (Golden Pavilion) and Arashiyama Bamboo Grove.",
        "Day 3: Gion district walking tour and Nishiki Market food stalls.",
      ],
      estCost: budgetTier === "budget" ? "$500 - $700 USD" : "$1200 - $1800 USD",
    },
    paris: {
      days: [
        "Day 1: Eiffel Tower observation deck and Seine river cruise.",
        "Day 2: Louvre Museum and stroll along Champs-Elysees to Arc de Triomphe.",
        "Day 3: Montmartre, Sacre-Coeur Basilica, and Latin Quarter cafes.",
      ],
      estCost: budgetTier === "budget" ? "$700 - $900 USD" : "$1600 - $2500 USD",
    },
    bali: {
      days: [
        "Day 1: Arrive in Denpasar, transfer to Ubud hotel, monkey forest visit.",
        "Day 2: Tegallalang rice terraces and Tirta Empul water temple.",
        "Day 3: Seminyak beach sunset and seafood dinner in Jimbaran Bay.",
      ],
      estCost: budgetTier === "budget" ? "$300 - $450 USD" : "$900 - $1500 USD",
    },
    goa: {
      days: [
        "Day 1: North Goa beaches (Anjuna, Vagator) and sunset cliff view.",
        "Day 2: Old Goa heritage churches (Bom Jesus) and Panaji Latin Quarter.",
        "Day 3: South Goa serene beaches (Palolem) and spice plantation tour.",
      ],
      estCost: budgetTier === "budget" ? "$150 - $250 USD" : "$450 - $800 USD",
    },
  };

  const selected = templates[matchedCity] || {
    days: ["Day 1: Arrival and orientation", "Day 2: Central city highlights", "Day 3: Departure"],
    estCost: "$500 - $1000 USD",
  };

  // Inspect limitation: cannot verify live weather
  if (lowerGoal.includes("weather") || lowerGoal.includes("rain") || lowerGoal.includes("temperature")) {
    limitations.push("Weather constraint ignored: Classical agent has no live API tool integration.");
  }
  if (lowerGoal.includes("flight") || lowerGoal.includes("airline")) {
    limitations.push("Flight specifics ignored: Static system cannot query airline schedules or calculate real-time fares.");
  }
  if (lowerGoal.includes("convert") || lowerGoal.includes("inr") || lowerGoal.includes("currency")) {
    limitations.push("Currency calculation ignored: No dynamic mathematical evaluator or live exchange rate adapter.");
  }

  const finalAnswer = `[Classical Agent Output - Static Rule Match]\nDestination: ${matchedCity.toUpperCase()}\nBudget Tier Detected: ${budgetTier.toUpperCase()}\nEstimated Cost: ${selected.estCost}\n\nFixed 3-Day Itinerary:\n${selected.days.join("\n")}\n\nNotice: This response was generated via deterministic if/else keyword matching without environmental reflection, tool execution, or contextual adjustments.`;

  steps.push({
    type: "output",
    ruleName: "Rule 4: Output Generator",
    matched: true,
    content: "Compiled static text from predefined lookup dictionary.",
    timestamp: Date.now(),
  });

  return {
    goal,
    agentType: "Classical Rule-Based Agent",
    steps,
    finalAnswer,
    totalRulesEvaluated: 4,
    matchedRules: 4,
    duration: Date.now() - startTime,
    limitationsEncountered: limitations,
  };
}
