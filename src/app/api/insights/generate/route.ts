import { NextRequest, NextResponse } from "next/server";
import { generateDailyInsight } from "@/lib/insights/generate-daily";
import { generateWeeklyInsight } from "@/lib/insights/generate-weekly";
import { generateMonthlyInsight } from "@/lib/insights/generate-monthly";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type = 'daily', force = true } = body;

    let insight;
    let generatedAt;

    switch (type) {
      case 'daily':
        insight = await generateDailyInsight(force);
        generatedAt = new Date().toISOString();
        break;
      case 'weekly':
        insight = await generateWeeklyInsight(force);
        generatedAt = new Date().toISOString();
        break;
      case 'monthly':
        insight = await generateMonthlyInsight(force);
        generatedAt = new Date().toISOString();
        break;
      default:
        return NextResponse.json(
          { success: false, error: "Invalid insight type. Use 'daily', 'weekly', or 'monthly'" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      type,
      data: insight,
      generatedAt,
    });
  } catch (err: any) {
    console.error("Insight generation API error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to generate insights" },
      { status: 500 }
    );
  }
}