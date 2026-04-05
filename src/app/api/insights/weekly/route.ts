import { NextRequest, NextResponse } from "next/server";
import { getCachedWeeklyInsight, generateWeeklyInsight } from "@/lib/insights/generate-weekly";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force") === "true";

    let insight = await getCachedWeeklyInsight();

    if (!insight || force) {
      insight = await generateWeeklyInsight(force);
    }

    return NextResponse.json({
      success: true,
      data: insight,
      generatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Weekly insight API error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to get weekly insights" },
      { status: 500 }
    );
  }
}