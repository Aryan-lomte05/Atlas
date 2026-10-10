import { connectToDatabase } from "@/lib/db";
import { AgentTrace } from "@/lib/models/AgentTrace";
import { NextResponse } from "next/server";


export async function GET() {
  try {
    await connectToDatabase();
    if (!AgentTrace) {
      return NextResponse.json({ traces: [] });
    }

    const traces = await AgentTrace.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return NextResponse.json({ traces });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error querying traces";
    return NextResponse.json({ traces: [], error: msg }, { status: 500 });
  }
}
