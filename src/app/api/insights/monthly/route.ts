import { NextRequest, NextResponse } from "next/server";
import { getCachedMonthlyInsight, generateMonthlyInsight } from "@/lib/insights/generate-monthly";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force") === "true";

    let insight = await getCachedMonthlyInsight();

    if (!insight || force) {
      insight = await generateMonthlyInsight(force);
    }

    return NextResponse.json({
      success: true,
      data: insight,
      generatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Monthly insight API error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to get monthly insights" },
      { status: 500 }
    );
  }
}