import { NextRequest, NextResponse } from "next/server";
import { getCachedDailyInsight, generateDailyInsight } from "@/lib/insights/generate-daily";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force") === "true";

    let insight = await getCachedDailyInsight();

    if (!insight || force) {
      insight = await generateDailyInsight(force);
    }

    return NextResponse.json({
      success: true,
      data: insight,
      generatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Daily insight API error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to get daily insights" },
      { status: 500 }
    );
  }
}