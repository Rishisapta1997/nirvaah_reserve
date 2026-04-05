import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface ReportEmailOptions {
  to: string;
  subject: string;
  html: string;
  reportType: 'daily' | 'weekly' | 'monthly';
  data?: any;
}

export async function sendReportEmail(options: ReportEmailOptions): Promise<boolean> {
  try {
    const mailOptions: nodemailer.SendMailOptions = {
      from: `"Nirvaah Reports" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    let pdfGenerated = false;
    try {
      let pdfBuffer: Buffer | undefined;
      let filename = '';

      switch (options.reportType) {
        case 'daily':
          pdfBuffer = await generateDailyPDF(options.data);
          filename = `Nirvaah_Daily_Report_${options.data.date || new Date().toISOString().split('T')[0]}.pdf`;
          break;
        case 'weekly':
          pdfBuffer = await generateWeeklyPDF(options.data);
          filename = `Nirvaah_Weekly_Report_${options.data.startDate}_to_${options.data.endDate}.pdf`;
          break;
        case 'monthly':
          pdfBuffer = await generateMonthlyPDF(options.data);
          filename = `Nirvaah_Monthly_Report_${options.data.startDate}_to_${options.data.endDate}.pdf`;
          break;
      }

      if (pdfBuffer) {
        mailOptions.attachments = [
          {
            filename,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ];
        pdfGenerated = true;
      }
    } catch (pdfError: any) {
      console.warn('PDF generation failed, sending HTML only:', pdfError.message);
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent${pdfGenerated ? ' with PDF' : ' (HTML only)'}: ${info.messageId}`);
    return true;
  } catch (error: any) {
    console.error('❌ Email sending failed:', error.message);
    return false;
  }
}

import { generateDailyPDF, generateWeeklyPDF, generateMonthlyPDF } from '@/lib/pdf/puppeteer-generator';

function formatCurrency(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(2)} K`;
  return `₹${amount.toFixed(0)}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function generateDailyReportEmail(data: any): string {
  const { revenue, orders, topProducts, date, aov, customers, newCustomers } = data;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nirvaah Daily Report</title>
    </head>
    <body style="margin:0;padding:0;background-color:#f5f5f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#1a1a1a 0%,#2d2d2d 100%);padding:40px 40px 30px;text-align:center;">
                  <h1 style="margin:0;font-size:32px;font-weight:700;color:#ffffff;letter-spacing:4px;">NIRVAAH<span style="color:#cfa15f;">.</span></h1>
                  <p style="margin:12px 0 0;font-size:13px;color:#cfa15f;text-transform:uppercase;letter-spacing:2px;">Daily Performance Report</p>
                  <p style="margin:8px 0 0;font-size:12px;color:#888888;">${formatDate(date || new Date().toISOString().split('T')[0])}</p>
                </td>
              </tr>
              
              <!-- Key Metrics -->
              <tr>
                <td style="padding:30px 40px 20px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="33%" style="background:#fafafa;border-radius:12px;padding:20px;text-align:center;">
                        <p style="margin:0;font-size:28px;font-weight:700;color:#1a1a1a;">${formatCurrency(revenue || 0)}</p>
                        <p style="margin:8px 0 0;font-size:11px;color:#666666;text-transform:uppercase;letter-spacing:1px;">Revenue</p>
                      </td>
                      <td width="3%" style="width:3%;"></td>
                      <td width="30%" style="background:#fafafa;border-radius:12px;padding:20px;text-align:center;">
                        <p style="margin:0;font-size:28px;font-weight:700;color:#1a1a1a;">${orders || 0}</p>
                        <p style="margin:8px 0 0;font-size:11px;color:#666666;text-transform:uppercase;letter-spacing:1px;">Orders</p>
                      </td>
                      <td width="3%" style="width:3%;"></td>
                      <td width="30%" style="background:#fafafa;border-radius:12px;padding:20px;text-align:center;">
                        <p style="margin:0;font-size:28px;font-weight:700;color:#cfa15f;">${formatCurrency(aov || 0)}</p>
                        <p style="margin:8px 0 0;font-size:11px;color:#666666;text-transform:uppercase;letter-spacing:1px;">Avg Order Value</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Customer Stats -->
              <tr>
                <td style="padding:0 40px 30px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="50%" style="background:#fafafa;border-radius:12px;padding:16px;text-align:center;">
                        <p style="margin:0;font-size:20px;font-weight:700;color:#1a1a1a;">${customers || 0}</p>
                        <p style="margin:6px 0 0;font-size:10px;color:#666666;text-transform:uppercase;">Total Customers</p>
                      </td>
                      <td width="4%" style="width:4%;"></td>
                      <td width="46%" style="background:#fafafa;border-radius:12px;padding:16px;text-align:center;">
                        <p style="margin:0;font-size:20px;font-weight:700;color:#1a1a1a;">${newCustomers || 0}</p>
                        <p style="margin:6px 0 0;font-size:10px;color:#666666;text-transform:uppercase;">New Customers</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Top Products -->
              ${topProducts && topProducts.length > 0 ? `
              <tr>
                <td style="padding:0 40px 30px;">
                  <div style="background:#fafafa;border-radius:12px;padding:24px;">
                    <h3 style="margin:0 0 16px;font-size:14px;font-weight:600;color:#1a1a1a;text-transform:uppercase;letter-spacing:1px;">Top Selling Products</h3>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #eeeeee;font-size:13px;color:#333333;font-weight:500;">Product</td>
                        <td style="padding:12px 0;border-bottom:1px solid #eeeeee;font-size:13px;color:#666666;text-align:center;">Orders</td>
                        <td style="padding:12px 0;border-bottom:1px solid #eeeeee;font-size:13px;color:#cfa15f;text-align:right;font-weight:600;">Revenue</td>
                      </tr>
                      ${topProducts.slice(0, 5).map((p: any) => `
                      <tr>
                        <td style="padding:14px 0;border-bottom:1px solid #eeeeee;font-size:13px;color:#333333;">${p.name}</td>
                        <td style="padding:14px 0;border-bottom:1px solid #eeeeee;font-size:13px;color:#666666;text-align:center;">${p.orders}</td>
                        <td style="padding:14px 0;border-bottom:1px solid #eeeeee;font-size:13px;color:#cfa15f;text-align:right;font-weight:600;">${formatCurrency(p.revenue || 0)}</td>
                      </tr>
                      `).join('')}
                    </table>
                  </div>
                </td>
              </tr>
              ` : ''}
              
              <!-- Footer -->
              <tr>
                <td style="background:#1a1a1a;padding:24px 40px;text-align:center;">
                  <p style="margin:0;font-size:11px;color:#666666;">Generated by Nirvaah AI Insights</p>
                  <p style="margin:8px 0 0;font-size:11px;color:#444444;">Report sent to: ${process.env.REPORT_EMAIL}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export function generateWeeklyReportEmail(data: any): string {
  const { totalRevenue, totalOrders, avgDailyRevenue, peakDays, startDate, endDate, growthStrategy } = data;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nirvaah Weekly Report</title>
    </head>
    <body style="margin:0;padding:0;background-color:#f5f5f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#1a1a1a 0%,#2d2d2d 100%);padding:40px 40px 30px;text-align:center;">
                  <h1 style="margin:0;font-size:32px;font-weight:700;color:#ffffff;letter-spacing:4px;">NIRVAAH<span style="color:#cfa15f;">.</span></h1>
                  <p style="margin:12px 0 0;font-size:13px;color:#cfa15f;text-transform:uppercase;letter-spacing:2px;">Weekly Performance Report</p>
                  <p style="margin:8px 0 0;font-size:12px;color:#888888;">${formatDate(startDate || '')} - ${formatDate(endDate || '')}</p>
                </td>
              </tr>
              
              <!-- Key Metrics -->
              <tr>
                <td style="padding:30px 40px 20px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="33%" style="background:#fafafa;border-radius:12px;padding:20px;text-align:center;">
                        <p style="margin:0;font-size:26px;font-weight:700;color:#1a1a1a;">${formatCurrency(totalRevenue || 0)}</p>
                        <p style="margin:8px 0 0;font-size:11px;color:#666666;text-transform:uppercase;letter-spacing:1px;">Total Revenue</p>
                      </td>
                      <td width="3%" style="width:3%;"></td>
                      <td width="30%" style="background:#fafafa;border-radius:12px;padding:20px;text-align:center;">
                        <p style="margin:0;font-size:26px;font-weight:700;color:#1a1a1a;">${totalOrders || 0}</p>
                        <p style="margin:8px 0 0;font-size:11px;color:#666666;text-transform:uppercase;letter-spacing:1px;">Orders</p>
                      </td>
                      <td width="3%" style="width:3%;"></td>
                      <td width="30%" style="background:#fafafa;border-radius:12px;padding:20px;text-align:center;">
                        <p style="margin:0;font-size:26px;font-weight:700;color:#cfa15f;">${formatCurrency(avgDailyRevenue || 0)}</p>
                        <p style="margin:8px 0 0;font-size:11px;color:#666666;text-transform:uppercase;letter-spacing:1px;">Daily Average</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Highlights -->
              <tr>
                <td style="padding:0 40px 30px;">
                  <div style="background:linear-gradient(135deg,#cfa15f 0%,#a67c3d 100%);border-radius:12px;padding:24px;color:#ffffff;">
                    <h3 style="margin:0 0 16px;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:1px;opacity:0.9;">Week Highlights</h3>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.2);">
                          <span style="font-size:12px;opacity:0.8;">Peak Sales Days</span><br>
                          <span style="font-size:14px;font-weight:600;">${peakDays?.join(', ') || 'Saturday, Sunday'}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.2);">
                          <span style="font-size:12px;opacity:0.8;">Growth Projection</span><br>
                          <span style="font-size:14px;font-weight:600;">+10-18% next week</span>
                        </td>
                      </tr>
                      ${growthStrategy ? `
                      <tr>
                        <td style="padding:8px 0;">
                          <span style="font-size:12px;opacity:0.8;">Revenue Target</span><br>
                          <span style="font-size:14px;font-weight:600;">${growthStrategy.revenue_target}</span>
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background:#1a1a1a;padding:24px 40px;text-align:center;">
                  <p style="margin:0;font-size:11px;color:#666666;">Generated by Nirvaah AI Insights | Weekly Strategic Report</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export function generateMonthlyReportEmail(data: any): string {
  const { totalRevenue, totalOrders, growthStrategy, startDate, endDate } = data;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nirvaah Monthly Report</title>
    </head>
    <body style="margin:0;padding:0;background-color:#f5f5f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#1a1a1a 0%,#2d2d2d 100%);padding:40px 40px 30px;text-align:center;">
                  <h1 style="margin:0;font-size:32px;font-weight:700;color:#ffffff;letter-spacing:4px;">NIRVAAH<span style="color:#cfa15f;">.</span></h1>
                  <p style="margin:12px 0 0;font-size:13px;color:#cfa15f;text-transform:uppercase;letter-spacing:2px;">Monthly Business Report</p>
                  <p style="margin:8px 0 0;font-size:12px;color:#888888;">${formatDate(startDate || '')} - ${formatDate(endDate || '')}</p>
                </td>
              </tr>
              
              <!-- Hero Section -->
              <tr>
                <td style="padding:30px 40px 20px;">
                  <div style="background:linear-gradient(135deg,#cfa15f 0%,#a67c3d 100%);border-radius:16px;padding:32px;text-align:center;color:#ffffff;">
                    <p style="margin:0;font-size:14px;opacity:0.9;text-transform:uppercase;letter-spacing:1px;">Next Month Revenue Target</p>
                    <p style="margin:12px 0 0;font-size:36px;font-weight:700;">${growthStrategy?.revenue_target || '₹2.50 Cr'}</p>
                    <p style="margin:12px 0 0;font-size:14px;opacity:0.9;">Growth Rate: ${growthStrategy?.growth_rate || '+12%'}</p>
                  </div>
                </td>
              </tr>
              
              <!-- Key Metrics -->
              <tr>
                <td style="padding:0 40px 30px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="48%" style="background:#fafafa;border-radius:12px;padding:24px;text-align:center;">
                        <p style="margin:0;font-size:28px;font-weight:700;color:#1a1a1a;">${formatCurrency(totalRevenue || 0)}</p>
                        <p style="margin:8px 0 0;font-size:11px;color:#666666;text-transform:uppercase;letter-spacing:1px;">This Month Revenue</p>
                      </td>
                      <td width="4%" style="width:4%;"></td>
                      <td width="48%" style="background:#fafafa;border-radius:12px;padding:24px;text-align:center;">
                        <p style="margin:0;font-size:28px;font-weight:700;color:#1a1a1a;">${totalOrders || 0}</p>
                        <p style="margin:8px 0 0;font-size:11px;color:#666666;text-transform:uppercase;letter-spacing:1px;">Total Orders</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Key Levers -->
              ${growthStrategy?.key_levers ? `
              <tr>
                <td style="padding:0 40px 30px;">
                  <div style="background:#fafafa;border-radius:12px;padding:24px;">
                    <h3 style="margin:0 0 16px;font-size:14px;font-weight:600;color:#1a1a1a;text-transform:uppercase;letter-spacing:1px;">Key Growth Levers</h3>
                    <div style="display:flex;flex-wrap:wrap;gap:8px;">
                      ${growthStrategy.key_levers.map((lever: string) => `
                        <span style="display:inline-block;background:#cfa15f;color:#ffffff;padding:8px 16px;border-radius:20px;font-size:12px;font-weight:500;">${lever}</span>
                      `).join('')}
                    </div>
                  </div>
                </td>
              </tr>
              ` : ''}
              
              <!-- Footer -->
              <tr>
                <td style="background:#1a1a1a;padding:24px 40px;text-align:center;">
                  <p style="margin:0;font-size:11px;color:#666666;">Generated by Nirvaah AI Insights | Confidential - For Internal Use Only</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

// ============================================
// Customer Order Emails
// ============================================

export interface CustomerOrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  productName: string;
  productPrice: string;
  tokenAmount: string;
  totalAmount: string;
  orderDate: string;
  deliveryEstimate?: string;
}

export async function sendOrderConfirmationEmail(data: CustomerOrderEmailData): Promise<boolean> {
  try {
    const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/track/${data.orderNumber}`;
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - Nirvaah</title>
    </head>
    <body style="margin:0;padding:0;background-color:#f5f5f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#1a1a1a 0%,#2d2d2d 100%);padding:40px 40px 30px;text-align:center;">
                  <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;letter-spacing:4px;">NIRVAAH<span style="color:#cfa15f;">.</span></h1>
                  <p style="margin:12px 0 0;font-size:13px;color:#cfa15f;text-transform:uppercase;letter-spacing:2px;">Order Confirmed</p>
                </td>
              </tr>
              
              <!-- Welcome Message -->
              <tr>
                <td style="padding:30px 40px 20px;text-align:center;">
                  <h2 style="margin:0;font-size:20px;font-weight:600;color:#1a1a1a;">Thank you for your order, ${data.customerName}!</h2>
                  <p style="margin:12px 0 0;font-size:14px;color:#666666;">Your order has been confirmed and is being processed.</p>
                </td>
              </tr>
              
              <!-- Order Details -->
              <tr>
                <td style="padding:0 40px 30px;">
                  <div style="background:#fafafa;border-radius:12px;padding:24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:10px 0;border-bottom:1px solid #eeeeee;">
                          <span style="font-size:12px;color:#666666;text-transform:uppercase;">Order Number</span><br>
                          <span style="font-size:16px;font-weight:700;color:#1a1a1a;">${data.orderNumber}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;border-bottom:1px solid #eeeeee;">
                          <span style="font-size:12px;color:#666666;text-transform:uppercase;">Product</span><br>
                          <span style="font-size:14px;color:#1a1a1a;">${data.productName}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;border-bottom:1px solid #eeeeee;">
                          <span style="font-size:12px;color:#666666;text-transform:uppercase;">Token Paid</span><br>
                          <span style="font-size:16px;font-weight:700;color:#cfa15f;">${data.tokenAmount}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;">
                          <span style="font-size:12px;color:#666666;text-transform:uppercase;">Total Amount</span><br>
                          <span style="font-size:16px;font-weight:700;color:#1a1a1a;">${data.totalAmount}</span>
                        </td>
                      </tr>
                    </table>
                  </div>
                </td>
              </tr>
              
              <!-- Track Order Button -->
              <tr>
                <td style="padding:0 40px 30px;text-align:center;">
                  <a href="${trackingUrl}" style="display:inline-block;background:#cfa15f;color:#1a1a1a;padding:16px 32px;border-radius:30px;text-decoration:none;font-weight:600;font-size:14px;">Track Your Order</a>
                  <p style="margin:16px 0 0;font-size:12px;color:#666666;">Or visit: ${trackingUrl}</p>
                </td>
              </tr>
              
              <!-- What's Next -->
              <tr>
                <td style="padding:0 40px 30px;">
                  <div style="background:#fafafa;border-radius:12px;padding:24px;">
                    <h3 style="margin:0 0 12px;font-size:14px;font-weight:600;color:#1a1a1a;">What's Next?</h3>
                    <ul style="margin:0;padding:0 0 0 20;color:#666666;font-size:13px;line-height:1.8;">
                      <li>We'll process your token and confirm within 24 hours</li>
                      <li>You'll receive updates on your order status via email</li>
                      <li>Balance payment will be collected upon delivery</li>
                    </ul>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background:#1a1a1a;padding:24px 40px;text-align:center;">
                  <p style="margin:0;font-size:11px;color:#666666;">Questions? Reply to this email or contact us at nirvaahlifestyle@gmail.com</p>
                  <p style="margin:8px 0 0;font-size:11px;color:#444444;">© 2026 Nirvaah. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    const info = await transporter.sendMail({
      from: `"Nirvaah Orders" <${process.env.SMTP_USER}>`,
      to: data.customerEmail,
      subject: `✅ Order Confirmed - ${data.orderNumber} | Nirvaah`,
      html,
    });

    console.log(`✅ Order confirmation sent to ${data.customerEmail}`);
    return true;
  } catch (error: any) {
    console.error('❌ Order confirmation email failed:', error.message);
    return false;
  }
}

export interface OrderStatusUpdateEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: string;
  statusMessage: string;
  trackingUrl: string;
}

export async function sendOrderStatusUpdateEmail(data: OrderStatusUpdateEmailData): Promise<boolean> {
  const statusColors: Record<string, string> = {
    CONFIRMED: '#27ae60',
    PROCESSING: '#3498db',
    SHIPPED: '#9b59b6',
    DELIVERED: '#cfa15f',
    CANCELLED: '#e74c3c',
  };

  const color = statusColors[data.status] || '#666666';

  try {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Update - Nirvaah</title>
    </head>
    <body style="margin:0;padding:0;background-color:#f5f5f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#1a1a1a 0%,#2d2d2d 100%);padding:30px 40px;text-align:center;">
                  <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;letter-spacing:4px;">NIRVAAH<span style="color:#cfa15f;">.</span></h1>
                  <p style="margin:10px 0 0;font-size:12px;color:#cfa15f;text-transform:uppercase;letter-spacing:2px;">Order Status Update</p>
                </td>
              </tr>
              
              <!-- Status -->
              <tr>
                <td style="padding:30px 40px 20px;text-align:center;">
                  <div style="display:inline-block;background:${color};color:#ffffff;padding:12px 24px;border-radius:30px;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">
                    ${data.status}
                  </div>
                  <p style="margin:16px 0 0;font-size:14px;color:#666666;">${data.statusMessage}</p>
                </td>
              </tr>
              
              <!-- Order Number -->
              <tr>
                <td style="padding:0 40px 20px;text-align:center;">
                  <span style="font-size:12px;color:#666666;">Order</span>
                  <span style="font-size:16px;font-weight:700;color:#1a1a1a;margin-left:8px;">${data.orderNumber}</span>
                </td>
              </tr>
              
              <!-- Track Button -->
              <tr>
                <td style="padding:0 40px 30px;text-align:center;">
                  <a href="${data.trackingUrl}" style="display:inline-block;background:#cfa15f;color:#1a1a1a;padding:14px 28px;border-radius:30px;text-decoration:none;font-weight:600;font-size:14px;">Track Your Order</a>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background:#1a1a1a;padding:20px 40px;text-align:center;">
                  <p style="margin:0;font-size:11px;color:#666666;">Questions? Contact us at nirvaahlifestyle@gmail.com</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    const info = await transporter.sendMail({
      from: `"Nirvaah Updates" <${process.env.SMTP_USER}>`,
      to: data.customerEmail,
      subject: `📦 Order ${data.status} - ${data.orderNumber} | Nirvaah`,
      html,
    });

    console.log(`✅ Status update sent to ${data.customerEmail}`);
    return true;
  } catch (error: any) {
    console.error('❌ Status update email failed:', error.message);
    return false;
  }
}