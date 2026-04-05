import { NextRequest, NextResponse } from "next/server";
import { runDailyReport, runWeeklyReport, runMonthlyReport } from "@/lib/automations/reports";
import { sendReportEmail, generateDailyReportEmail } from "@/lib/email/sender";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, type } = body;

    if (action === 'test-email') {
      const testData = {
        date: new Date().toISOString().split('T')[0],
        revenue: 546250,
        orders: 22,
        aov: 24829,
        topProducts: [
          { name: 'Complete Set', orders: 8 },
          { name: 'The Curator', orders: 5 },
          { name: 'Urban Duo', orders: 3 },
        ],
      };

      const html = generateDailyReportEmail(testData);
      const sent = await sendReportEmail({
        to: process.env.REPORT_EMAIL || 'nirvaahlifestyle@gmail.com',
        subject: '🧪 Nirvaah Email Test - System Working!',
        html,
        reportType: 'daily',
        data: testData,
      });

      return NextResponse.json({
        success: sent,
        message: sent ? 'Test email sent successfully!' : 'Failed to send test email',
      });
    }

    if (action === 'send-report') {
      let sent = false;
      let reportType = type || 'daily';

      switch (reportType) {
        case 'daily':
          sent = await runDailyReport();
          break;
        case 'weekly':
          sent = await runWeeklyReport();
          break;
        case 'monthly':
          sent = await runMonthlyReport();
          break;
        default:
          return NextResponse.json(
            { success: false, error: 'Invalid report type' },
            { status: 400 }
          );
      }

      return NextResponse.json({
        success: sent,
        message: sent ? `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report sent successfully!` : 'Failed to send report',
        type: reportType,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action. Use test-email or send-report' },
      { status: 400 }
    );
  } catch (err: any) {
    console.error('Report API error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}