import puppeteer from 'puppeteer';

interface ReportData {
  date?: string;
  startDate?: string;
  endDate?: string;
  revenue?: number;
  orders?: number;
  aov?: number;
  topProducts?: Array<{ name: string; orders: number; revenue: number }>;
  totalRevenue?: number;
  totalOrders?: number;
  avgDailyRevenue?: number;
  peakDays?: string[];
  growthStrategy?: {
    revenue_target: string;
    growth_rate: string;
    key_levers: string[];
  };
  inventoryAlerts?: Array<{ product: string; stock: number; daysLeft: number }>;
  customers?: number;
  newCustomers?: number;
  categoryPerformance?: Array<{ category: string; revenue: number; orders: number }>;
  dailyTrend?: Array<{ date: string; revenue: number; orders: number }>;
}

function formatCurrency(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(2)} K`;
  return `₹${amount.toFixed(0)}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function generateDailyHTML(data: ReportData): string {
  const topProductsHTML = (data.topProducts || []).map(p => `
    <tr>
      <td style="padding:14px;border-bottom:1px solid #eee;font-size:13px;color:#333;">${p.name}</td>
      <td style="padding:14px;border-bottom:1px solid #eee;font-size:13px;color:#666;text-align:center;">${p.orders}</td>
      <td style="padding:14px;border-bottom:1px solid #eee;font-size:13px;color:#cfa15f;text-align:right;font-weight:600;">${formatCurrency(p.revenue || 0)}</td>
    </tr>
  `).join('');

  const categoryHTML = (data.categoryPerformance || []).map(c => `
    <tr>
      <td style="padding:12px;border-bottom:1px solid #eee;font-size:13px;color:#333;">${c.category}</td>
      <td style="padding:12px;border-bottom:1px solid #eee;font-size:13px;color:#666;text-align:center;">${c.orders}</td>
      <td style="padding:12px;border-bottom:1px solid #eee;font-size:13px;color:#cfa15f;text-align:right;font-weight:600;">${formatCurrency(c.revenue)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; padding: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg,#1a1a1a 0%,#2d2d2d 100%); padding: 40px; text-align: center; }
        .logo { font-size: 32px; font-weight: bold; letter-spacing: 4px; color: white; }
        .logo span { color: #cfa15f; }
        .subtitle { color: #cfa15f; font-size: 14px; margin-top: 8px; text-transform: uppercase; letter-spacing: 2px; }
        .date { color: #888; font-size: 12px; margin-top: 8px; }
        
        .section { padding: 30px 40px; }
        .section-title { font-size: 14px; font-weight: 600; color: #1a1a1a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; border-bottom: 2px solid #cfa15f; padding-bottom: 8px; }
        
        .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }
        .metric { background: #fafafa; border-radius: 12px; padding: 20px; text-align: center; }
        .metric-value { font-size: 24px; font-weight: 700; color: #1a1a1a; }
        .metric-value.highlight { color: #cfa15f; }
        .metric-label { font-size: 10px; color: #666; text-transform: uppercase; margin-top: 6px; letter-spacing: 1px; }
        
        .metrics-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .metric-half { background: #fafafa; border-radius: 12px; padding: 16px; text-align: center; }
        .metric-half .metric-value { font-size: 20px; }
        
        table { width: 100%; border-collapse: collapse; background: #fafafa; border-radius: 12px; overflow: hidden; }
        th { background: #cfa15f; color: white; padding: 14px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
        th:last-child { text-align: right; }
        
        .footer { background: #1a1a1a; padding: 24px 40px; text-align: center; }
        .footer p { color: #666; font-size: 11px; }
        
        .alert-box { background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 16px; margin-top: 16px; }
        .alert-box h4 { color: #856404; font-size: 12px; margin-bottom: 8px; }
        .alert-item { color: #856404; font-size: 12px; padding: 4px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">NIRVAAH<span>.</span></div>
          <div class="subtitle">Daily Performance Report</div>
          <div class="date">${formatDate(data.date || new Date().toISOString().split('T')[0])}</div>
        </div>
        
        <div class="section">
          <div class="section-title">📊 Key Performance Metrics</div>
          <div class="metrics-grid">
            <div class="metric">
              <div class="metric-value">${formatCurrency(data.revenue || 0)}</div>
              <div class="metric-label">Revenue</div>
            </div>
            <div class="metric">
              <div class="metric-value">${data.orders || 0}</div>
              <div class="metric-label">Orders</div>
            </div>
            <div class="metric">
              <div class="metric-value">${formatCurrency(data.aov || 0)}</div>
              <div class="metric-label">Avg Order Value</div>
            </div>
            <div class="metric">
              <div class="metric-value highlight">${formatCurrency((data.revenue || 0) / Math.max(data.orders || 1, 1) * 30)}</div>
              <div class="metric-label">Monthly Run Rate</div>
            </div>
          </div>
          
          <div class="metrics-row">
            <div class="metric-half">
              <div class="metric-value">${data.customers || 0}</div>
              <div class="metric-label">Total Customers</div>
            </div>
            <div class="metric-half">
              <div class="metric-value">${data.newCustomers || 0}</div>
              <div class="metric-label">New Customers Today</div>
            </div>
          </div>
        </div>
        
        ${data.topProducts && data.topProducts.length > 0 ? `
        <div class="section">
          <div class="section-title">🏆 Top Selling Products</div>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th style="text-align:center">Orders</th>
                <th style="text-align:right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              ${topProductsHTML}
            </tbody>
          </table>
        </div>
        ` : ''}
        
        ${data.categoryPerformance && data.categoryPerformance.length > 0 ? `
        <div class="section">
          <div class="section-title">📦 Category Performance</div>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th style="text-align:center">Orders</th>
                <th style="text-align:right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              ${categoryHTML}
            </tbody>
          </table>
        </div>
        ` : ''}
        
        ${data.inventoryAlerts && data.inventoryAlerts.length > 0 ? `
        <div class="section">
          <div class="section-title">⚠️ Inventory Alerts</div>
          <div class="alert-box">
            <h4>⚠️ Low Stock Warning</h4>
            ${data.inventoryAlerts.map(a => `
              <div class="alert-item">• ${a.product}: ${a.stock} units (${a.daysLeft} days left at current rate)</div>
            `).join('')}
          </div>
        </div>
        ` : ''}
        
        <div class="footer">
          <p>Generated by Nirvaah AI Insights</p>
          <p>Report generated on: ${new Date().toLocaleString('en-IN')}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateWeeklyHTML(data: ReportData): string {
  const dailyTrendHTML = (data.dailyTrend || []).map(d => `
    <tr>
      <td style="padding:12px;border-bottom:1px solid #eee;font-size:12px;color:#333;">${formatDate(d.date)}</td>
      <td style="padding:12px;border-bottom:1px solid #eee;font-size:12px;color:#666;text-align:center;">${d.orders}</td>
      <td style="padding:12px;border-bottom:1px solid #eee;font-size:12px;color:#cfa15f;text-align:right;font-weight:600;">${formatCurrency(d.revenue)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; padding: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg,#1a1a1a 0%,#2d2d2d 100%); padding: 40px; text-align: center; }
        .logo { font-size: 32px; font-weight: bold; letter-spacing: 4px; color: white; }
        .logo span { color: #cfa15f; }
        .subtitle { color: #cfa15f; font-size: 14px; margin-top: 8px; text-transform: uppercase; letter-spacing: 2px; }
        .date { color: #888; font-size: 12px; margin-top: 8px; }
        
        .section { padding: 30px 40px; }
        .section-title { font-size: 14px; font-weight: 600; color: #1a1a1a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; border-bottom: 2px solid #cfa15f; padding-bottom: 8px; }
        
        .hero { background: linear-gradient(135deg,#cfa15f 0%,#a67c3d 100%); border-radius: 16px; padding: 32px; text-align: center; color: white; margin-bottom: 20px; }
        .hero-label { font-size: 14px; opacity: 0.9; }
        .hero-value { font-size: 32px; font-weight: 700; margin-top: 8px; }
        
        .metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .metric { background: #fafafa; border-radius: 12px; padding: 24px; text-align: center; }
        .metric-value { font-size: 28px; font-weight: 700; color: #1a1a1a; }
        .metric-value.highlight { color: #cfa15f; }
        .metric-label { font-size: 11px; color: #666; text-transform: uppercase; margin-top: 8px; letter-spacing: 1px; }
        
        table { width: 100%; border-collapse: collapse; background: #fafafa; border-radius: 12px; overflow: hidden; }
        th { background: #cfa15f; color: white; padding: 14px; text-align: left; font-size: 12px; text-transform: uppercase; }
        
        .strategy-box { background: #fafafa; border-radius: 12px; padding: 24px; }
        .strategy-item { margin: 12px 0; }
        .strategy-label { font-size: 11px; color: #666; text-transform: uppercase; }
        .strategy-value { font-size: 14px; color: #1a1a1a; font-weight: 500; }
        
        .lever { display: inline-block; background: #cfa15f; color: white; padding: 6px 14px; border-radius: 20px; font-size: 12px; margin: 4px; }
        
        .footer { background: #1a1a1a; padding: 24px 40px; text-align: center; }
        .footer p { color: #666; font-size: 11px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">NIRVAAH<span>.</span></div>
          <div class="subtitle">Weekly Performance Report</div>
          <div class="date">${formatDate(data.startDate || '')} - ${formatDate(data.endDate || '')}</div>
        </div>
        
        <div class="section">
          <div class="hero">
            <div class="hero-label">📈 Next Week Revenue Target</div>
            <div class="hero-value">${data.growthStrategy?.revenue_target || '₹40-45 Lakhs'}</div>
          </div>
          
          <div class="metrics-grid">
            <div class="metric">
              <div class="metric-value">${formatCurrency(data.totalRevenue || 0)}</div>
              <div class="metric-label">Total Revenue</div>
            </div>
            <div class="metric">
              <div class="metric-value">${data.totalOrders || 0}</div>
              <div class="metric-label">Total Orders</div>
            </div>
            <div class="metric">
              <div class="metric-value highlight">${formatCurrency(data.avgDailyRevenue || 0)}</div>
              <div class="metric-label">Daily Average</div>
            </div>
          </div>
        </div>
        
        ${data.dailyTrend && data.dailyTrend.length > 0 ? `
        <div class="section">
          <div class="section-title">📅 Daily Breakdown</div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th style="text-align:center">Orders</th>
                <th style="text-align:right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              ${dailyTrendHTML}
            </tbody>
          </table>
        </div>
        ` : ''}
        
        ${data.growthStrategy ? `
        <div class="section">
          <div class="section-title">🎯 Growth Strategy</div>
          <div class="strategy-box">
            <div class="strategy-item">
              <div class="strategy-label">Growth Projection</div>
              <div class="strategy-value">${data.growthStrategy.growth_rate}</div>
            </div>
            <div class="strategy-item">
              <div class="strategy-label">Peak Sales Days</div>
              <div class="strategy-value">${data.peakDays?.join(', ') || 'Saturday, Sunday'}</div>
            </div>
            <div class="strategy-item">
              <div class="strategy-label">Key Levers</div>
              <div class="strategy-value">
                ${(data.growthStrategy.key_levers || []).map(l => `<span class="lever">${l}</span>`).join('')}
              </div>
            </div>
          </div>
        </div>
        ` : ''}
        
        ${data.inventoryAlerts && data.inventoryAlerts.length > 0 ? `
        <div class="section">
          <div class="section-title">⚠️ Inventory Alerts</div>
          <div class="strategy-box" style="background:#fff3cd;border:1px solid #ffc107;">
            ${data.inventoryAlerts.map(a => `
              <div style="color:#856404;font-size:12px;padding:6px 0;">• ${a.product}: ${a.stock} units (${a.daysLeft} days)</div>
            `).join('')}
          </div>
        </div>
        ` : ''}
        
        <div class="footer">
          <p>Generated by Nirvaah AI Insights | Weekly Strategic Report</p>
          <p>Report generated on: ${new Date().toLocaleString('en-IN')}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateMonthlyHTML(data: ReportData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; padding: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg,#1a1a1a 0%,#2d2d2d 100%); padding: 40px; text-align: center; }
        .logo { font-size: 32px; font-weight: bold; letter-spacing: 4px; color: white; }
        .logo span { color: #cfa15f; }
        .subtitle { color: #cfa15f; font-size: 14px; margin-top: 8px; text-transform: uppercase; letter-spacing: 2px; }
        .date { color: #888; font-size: 12px; margin-top: 8px; }
        
        .section { padding: 30px 40px; }
        .section-title { font-size: 14px; font-weight: 600; color: #1a1a1a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; border-bottom: 2px solid #cfa15f; padding-bottom: 8px; }
        
        .hero { background: linear-gradient(135deg,#cfa15f 0%,#a67c3d 100%); border-radius: 16px; padding: 40px; text-align: center; color: white; margin-bottom: 20px; }
        .hero-label { font-size: 16px; opacity: 0.9; }
        .hero-value { font-size: 40px; font-weight: 700; margin-top: 12px; }
        .hero-sub { font-size: 14px; margin-top: 8px; opacity: 0.9; }
        
        .metrics-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .metric { background: #fafafa; border-radius: 12px; padding: 28px; text-align: center; }
        .metric-value { font-size: 28px; font-weight: 700; color: #1a1a1a; }
        .metric-value.highlight { color: #cfa15f; }
        .metric-label { font-size: 11px; color: #666; text-transform: uppercase; margin-top: 8px; letter-spacing: 1px; }
        
        .strategy-box { background: #fafafa; border-radius: 12px; padding: 24px; }
        .strategy-item { margin: 16px 0; }
        .strategy-label { font-size: 11px; color: #666; text-transform: uppercase; }
        .strategy-value { font-size: 15px; color: #1a1a1a; font-weight: 500; }
        
        .lever { display: inline-block; background: #cfa15f; color: white; padding: 8px 16px; border-radius: 20px; font-size: 13px; margin: 4px; }
        
        .footer { background: #1a1a1a; padding: 24px 40px; text-align: center; }
        .footer p { color: #666; font-size: 11px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">NIRVAAH<span>.</span></div>
          <div class="subtitle">Monthly Business Report</div>
          <div class="date">${formatDate(data.startDate || '')} - ${formatDate(data.endDate || '')}</div>
        </div>
        
        <div class="section">
          <div class="hero">
            <div class="hero-label">🎯 Next Month Revenue Target</div>
            <div class="hero-value">${data.growthStrategy?.revenue_target || '₹2.50 Crore'}</div>
            <div class="hero-sub">Growth Rate: ${data.growthStrategy?.growth_rate || '+12%'}</div>
          </div>
          
          <div class="metrics-grid">
            <div class="metric">
              <div class="metric-value highlight">${formatCurrency(data.totalRevenue || 0)}</div>
              <div class="metric-label">This Month Revenue</div>
            </div>
            <div class="metric">
              <div class="metric-value">${data.totalOrders || 0}</div>
              <div class="metric-label">Total Orders</div>
            </div>
            <div class="metric">
              <div class="metric-value">${formatCurrency((data.totalRevenue || 0) / Math.max(data.totalOrders || 1, 1))}</div>
              <div class="metric-label">Average Order Value</div>
            </div>
            <div class="metric">
              <div class="metric-value">${data.peakDays?.join(', ') || 'Weekend'}</div>
              <div class="metric-label">Peak Days</div>
            </div>
          </div>
        </div>
        
        ${data.growthStrategy ? `
        <div class="section">
          <div class="section-title">🚀 Growth Strategy & Key Levers</div>
          <div class="strategy-box">
            <div class="strategy-item">
              <div class="strategy-label">Strategic Focus Areas</div>
              <div class="strategy-value">
                ${(data.growthStrategy.key_levers || ['Aggressive bundling', 'Wedding campaign', 'Inventory optimization']).map(l => `<span class="lever">${l}</span>`).join('')}
              </div>
            </div>
            <div class="strategy-item">
              <div class="strategy-label">Growth Target</div>
              <div class="strategy-value">${data.growthStrategy.growth_rate} revenue increase</div>
            </div>
            <div class="strategy-item">
              <div class="strategy-label">Revenue Target</div>
              <div class="strategy-value" style="font-size:20px;color:#cfa15f;font-weight:700;">${data.growthStrategy.revenue_target}</div>
            </div>
          </div>
        </div>
        ` : ''}
        
        ${data.categoryPerformance && data.categoryPerformance.length > 0 ? `
        <div class="section">
          <div class="section-title">📦 Category Performance</div>
          <div class="strategy-box">
            ${data.categoryPerformance.map(c => `
              <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #eee;">
                <span style="color:#333;">${c.category}</span>
                <span style="color:#666;">${c.orders} orders | ${formatCurrency(c.revenue)}</span>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}
        
        ${data.inventoryAlerts && data.inventoryAlerts.length > 0 ? `
        <div class="section">
          <div class="section-title">⚠️ Inventory Status</div>
          <div class="strategy-box" style="background:#fff3cd;border:1px solid #ffc107;">
            ${data.inventoryAlerts.map(a => `
              <div style="color:#856404;font-size:13px;padding:8px 0;">• ${a.product}: ${a.stock} units remaining (${a.daysLeft} days at current rate)</div>
            `).join('')}
          </div>
        </div>
        ` : ''}
        
        <div class="footer">
          <p>Generated by Nirvaah AI Insights | Confidential - For Internal Use Only</p>
          <p>Report generated on: ${new Date().toLocaleString('en-IN')}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

async function generatePDFBuffer(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
    });
    
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

export async function generateDailyPDF(data: ReportData): Promise<Buffer> {
  return generatePDFBuffer(generateDailyHTML(data));
}

export async function generateWeeklyPDF(data: ReportData): Promise<Buffer> {
  return generatePDFBuffer(generateWeeklyHTML(data));
}

export async function generateMonthlyPDF(data: ReportData): Promise<Buffer> {
  return generatePDFBuffer(generateMonthlyHTML(data));
}