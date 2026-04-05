export interface DailyMetrics {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
  avgOrderValue: number;
  newCustomers: number;
  topProducts: Array<{ name: string; orders: number; revenue: number }>;
  inventoryAlerts: Array<{ product: string; stock: number; daysLeft: number }>;
}

export interface WeeklyMetrics {
  startDate: string;
  endDate: string;
  dailyMetrics: DailyMetrics[];
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  avgDailyRevenue: number;
  topProducts: Array<{ name: string; orders: number; revenue: number; growth: number }>;
  peakDays: string[];
  inventoryAlerts: Array<{ product: string; stock: number; daysLeft: number }>;
}

export interface MonthlyMetrics {
  startDate: string;
  endDate: string;
  weeklyMetrics: WeeklyMetrics[];
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  avgDailyRevenue: number;
  revenueGrowth: number;
  orderGrowth: number;
  topProducts: Array<{ name: string; orders: number; revenue: number; share: number }>;
  categoryPerformance: Array<{ category: string; revenue: number; orders: number }>;
  inventoryAlerts: Array<{ product: string; stock: number; critical: boolean }>;
}

export const SYSTEM_PROMPT = `You are a senior business analyst for Nirvaah Bags, a premium leather bags company in India.
You have deep knowledge of:
- E-commerce operations and sales optimization
- Inventory management and supply chain
- Customer behavior and retention strategies
- Digital marketing ROI and channel optimization
- Seasonal trends and festival season planning (Diwali, Holi, wedding season, etc.)
- Indian consumer psychology and purchasing patterns

Your response style:
- Be specific and actionable with numbers and percentages
- Prioritize by impact and urgency
- Consider local Indian market context
- Always provide reasoning behind recommendations
- Think step-by-step

Generate insights in JSON format as requested.`;

export const DAILY_INSIGHT_PROMPT = (metrics: DailyMetrics) => `Analyze yesterday's performance and provide actionables for today for Nirvaah Bags.

## Yesterday's Performance (${metrics.date})
- Revenue: ₹${metrics.revenue.toLocaleString('en-IN')}
- Orders: ${metrics.orders}
- Customers: ${metrics.customers}
- Average Order Value: ₹${metrics.avgOrderValue.toLocaleString('en-IN')}
- New Customers: ${metrics.newCustomers}

## Top Selling Products Yesterday
${metrics.topProducts.map(p => `- ${p.name}: ${p.orders} orders (₹${p.revenue.toLocaleString('en-IN')})`).join('\n')}

## Inventory Alerts
${metrics.inventoryAlerts.length > 0 
  ? metrics.inventoryAlerts.map(a => `- ${a.product}: ${a.stock} units left (${a.daysLeft} days at current rate)`).join('\n')
  : '- No critical alerts'}

## Your Task
Provide a JSON response with today's actionables:

{
  "date": "${metrics.date}",
  "yesterday_summary": "2-3 sentence summary of yesterday's performance",
  "today_predictions": {
    "expected_revenue": "estimated range in ₹",
    "expected_orders": "estimated range",
    "confidence": "high/medium/low based on patterns"
  },
  "actionables": [
    {
      "priority": "high|medium|low",
      "task": "specific actionable task",
      "reason": "why this is important",
      "expected_impact": "revenue or operational impact",
      "deadline": "today/this evening/urgent"
    }
  ],
  "risks": [
    {
      "risk": "potential risk",
      "likelihood": "high/medium/low",
      "mitigation": "what to do about it"
    }
  ],
  "opportunities": [
    {
      "opportunity": "market or operational opportunity",
      "potential": "estimated impact",
      "action": "recommended action"
    }
  ]
}

Generate ONLY valid JSON, no additional text.`;

export const WEEKLY_INSIGHT_PROMPT = (metrics: WeeklyMetrics) => `Analyze the week's performance and provide strategic recommendations for the next 7 days for Nirvaah Bags.

## Week Overview (${metrics.startDate} to ${metrics.endDate})
- Total Revenue: ₹${metrics.totalRevenue.toLocaleString('en-IN')}
- Total Orders: ${metrics.totalOrders}
- Total Customers: ${metrics.totalCustomers}
- Average Daily Revenue: ₹${metrics.avgDailyRevenue.toLocaleString('en-IN')}

## Daily Breakdown
${metrics.dailyMetrics.map(d => `- ${d.date}: ₹${d.revenue.toLocaleString('en-IN')} (${d.orders} orders)`).join('\n')}

## Peak Sales Days This Week
${metrics.peakDays.join(', ') || 'Data not available'}

## Top Products This Week
${metrics.topProducts.map(p => `- ${p.name}: ${p.orders} orders, ₹${p.revenue.toLocaleString('en-IN')}${p.growth ? `, ${p.growth > 0 ? '+' : ''}${p.growth}%` : ''}`).join('\n')}

## Inventory Alerts
${metrics.inventoryAlerts.length > 0 
  ? metrics.inventoryAlerts.map(a => `- ${a.product}: ${a.stock} units left (${a.daysLeft} days) - ${a.stock <= 5 ? 'CRITICAL' : 'needs attention'}`).join('\n')
  : '- No critical alerts'}

## Your Task
Provide a JSON response with next week's strategic plan:

{
  "week_start": "${metrics.startDate}",
  "week_end": "${metrics.endDate}",
  "weekly_summary": "2-3 sentence summary of this week's performance",
  "next_week_predictions": {
    "revenue_estimate": "₹X-Y lakhs range",
    "growth projection": "percentage vs this week",
    "peak_days": ["Saturday", "Sunday"],
    "confidence": "high/medium/low"
  },
  "actionables": [
    {
      "priority": "high|medium|low",
      "task": "specific task for this week",
      "timeline": "Day 1-2 / Day 3-4 / Day 5-7",
      "reason": "strategic reason",
      "expected_impact": "quantified impact"
    }
  ],
  "inventory_actions": [
    {
      "product": "product name",
      "action": "restock/promote/discontinue",
      "urgency": "immediate/this week/next week",
      "quantity": "recommended quantity"
    }
  ],
  "risks": [
    {
      "risk": "potential issue",
      "likelihood": "high/medium/low",
      "mitigation": "prevention plan"
    }
  ],
  "opportunities": [
    {
      "opportunity": "market opportunity",
      "timeline": "when to act",
      "potential": "estimated value",
      "action": "next steps"
    }
  ]
}

Generate ONLY valid JSON, no additional text.`;

export const MONTHLY_INSIGHT_PROMPT = (metrics: MonthlyMetrics) => `Analyze the month's performance and provide a growth strategy for the next 30 days for Nirvaah Bags.

## Month Overview (${metrics.startDate} to ${metrics.endDate})
- Total Revenue: ₹${metrics.totalRevenue.toLocaleString('en-IN')}
- Total Orders: ${metrics.totalOrders}
- Total Customers: ${metrics.totalCustomers}
- Average Daily Revenue: ₹${metrics.avgDailyRevenue.toLocaleString('en-IN')}
- Revenue Growth: ${metrics.revenueGrowth > 0 ? '+' : ''}${metrics.revenueGrowth}% vs previous month
- Order Growth: ${metrics.orderGrowth > 0 ? '+' : ''}${metrics.orderGrowth}% vs previous month

## Top Products This Month
${metrics.topProducts.map(p => `- ${p.name}: ${p.orders} orders (₹${p.revenue.toLocaleString('en-IN')}), ${p.share.toFixed(1)}% of total revenue`).join('\n')}

## Category Performance
${metrics.categoryPerformance.map(c => `- ${c.category}: ₹${c.revenue.toLocaleString('en-IN')} (${c.orders} orders)`).join('\n')}

## Inventory Status
${metrics.inventoryAlerts.map(a => `- ${a.product}: ${a.stock} units left${a.critical ? ' - CRITICAL' : ''}`).join('\n')}

## Upcoming Considerations
- Festival seasons (Diwali, Holi, etc.)
- Wedding season in India
- Weekend vs weekday patterns
- Marketing channel performance

## Your Task
Provide a JSON response with 30-day strategic plan:

{
  "month": "${metrics.startDate.split('-')[1]}-${metrics.startDate.split('-')[0]}",
  "period": "${metrics.startDate} to ${metrics.endDate}",
  "monthly_summary": "2-3 sentence performance summary",
  "growth_strategy": {
    "revenue_target": "₹X crores next month",
    "growth_rate": "percentage target",
    "key_levers": ["lever1", "lever2", "lever3"]
  },
  "actionables": [
    {
      "priority": "high|medium|low",
      "category": "operations|marketing|inventory|customer|financial",
      "task": "strategic task for this month",
      "timeline": "Week 1|Week 2|Week 3|Week 4",
      "investment": "estimated cost if any",
      "expected_roi": "expected return",
      "success_metric": "how to measure"
    }
  ],
  "inventory_strategy": [
    {
      "product": "product name",
      "current_stock": "units",
      "action": "restock quantity",
      "timing": "immediate/this week/this month",
      "investment": "estimated cost"
    }
  ],
  "marketing_recommendations": [
    {
      "channel": "platform name",
      "budget_allocation": "percentage or amount",
      "strategy": "what to do",
      "expected_roi": "estimated return"
    }
  ],
  "risks": [
    {
      "risk": "potential risk",
      "likelihood": "high/medium/low",
      "impact": "estimated damage",
      "mitigation": "prevention plan"
    }
  ],
  "opportunities": [
    {
      "opportunity": "market opportunity",
      "timing": "when",
      "potential": "estimated value",
      "investment": "required investment",
      "action_plan": "how to capture"
    }
  ]
}

Generate ONLY valid JSON, no additional text.`;

export const REPORT_SYSTEM_PROMPT = `You are an expert business analyst and report writer for Nirvaah Bags, a premium leather bags company in India.
Create clear, professional reports that:
- Use Indian numbering (lakhs, crores)
- Highlight key metrics and trends
- Provide actionable insights
- Are formatted for easy reading`;

export const DAILY_REPORT_PROMPT = (metrics: DailyMetrics) => `Create a daily performance report for Nirvaah Bags for ${metrics.date}.

## Today's Numbers
- Revenue: ₹${metrics.revenue.toLocaleString('en-IN')}
- Orders: ${metrics.orders}
- Customers: ${metrics.customers}
- AOV: ₹${metrics.avgOrderValue.toLocaleString('en-IN')}
- New Customers: ${metrics.newCustomers}

## Top Products
${metrics.topProducts.slice(0, 3).map(p => `- ${p.name}: ${p.orders} orders`).join('\n')}

## Alerts
${metrics.inventoryAlerts.length > 0 
  ? metrics.inventoryAlerts.map(a => `⚠️ ${a.product}: ${a.stock} units`).join('\n')
  : '✅ No critical alerts'}

Create a concise HTML-ready report with:
- Key metrics summary
- Top performing products
- Inventory alerts
- Quick recommendations
Format as clean HTML with inline styles.`;

export const WEEKLY_REPORT_PROMPT = (metrics: WeeklyMetrics) => `Create a weekly performance report for Nirvaah Bags for the week of ${metrics.startDate} to ${metrics.endDate}.

## Week Summary
- Revenue: ₹${metrics.totalRevenue.toLocaleString('en-IN')}
- Orders: ${metrics.totalOrders}
- Customers: ${metrics.totalCustomers}
- Daily Average: ₹${metrics.avgDailyRevenue.toLocaleString('en-IN')}
- Peak Days: ${metrics.peakDays.join(', ')}

## Top Products
${metrics.topProducts.slice(0, 5).map(p => `- ${p.name}: ${p.orders} orders (₹${p.revenue.toLocaleString('en-IN')})`).join('\n')}

## Daily Breakdown
${metrics.dailyMetrics.map(d => `| ${d.date} | ₹${d.revenue.toLocaleString('en-IN')} | ${d.orders} |`).join('\n')}

## Alerts
${metrics.inventoryAlerts.map(a => `⚠️ ${a.product}: ${a.stock} units (${a.daysLeft} days)`).join('\n')}

Create a comprehensive HTML report with:
- Executive summary
- Key metrics
- Trend analysis
- Top products
- Inventory status
- Recommendations for next week
Format as clean HTML with inline styles.`;

export const MONTHLY_REPORT_PROMPT = (metrics: MonthlyMetrics) => `Create a monthly business report for Nirvaah Bags for ${metrics.startDate} to ${metrics.endDate}.

## Month Overview
- Revenue: ₹${metrics.totalRevenue.toLocaleString('en-IN')}
- Orders: ${metrics.totalOrders}
- Customers: ${metrics.totalCustomers}
- Growth: ${metrics.revenueGrowth > 0 ? '+' : ''}${metrics.revenueGrowth}%
- AOV: ₹${(metrics.totalRevenue / metrics.totalOrders).toLocaleString('en-IN')}

## Top Products by Revenue
${metrics.topProducts.map(p => `- ${p.name}: ₹${p.revenue.toLocaleString('en-IN')} (${p.share.toFixed(1)}%)`).join('\n')}

## Category Breakdown
${metrics.categoryPerformance.map(c => `- ${c.category}: ₹${c.revenue.toLocaleString('en-IN')}`).join('\n')}

## Inventory Alerts
${metrics.inventoryAlerts.map(a => `${a.critical ? '🔴' : '🟡'} ${a.product}: ${a.stock} units`).join('\n')}

Create a comprehensive HTML business report with:
- Executive summary
- Key performance indicators
- Revenue analysis
- Product performance
- Category analysis
- Inventory health
- Customer insights
- Strategic recommendations for next month
Format as professional HTML with inline styles.`;