# NIRVAAH Enterprise System

## Complete Setup Instructions

### 1. Run the SQL Schema (Create All Tables)

Copy and run the contents of `sql/schema.sql` on your Supabase PostgreSQL database.

You can do this via:
- **Supabase SQL Editor**: Open your Supabase dashboard → SQL Editor → Paste the schema → Run

### 2. Seed 3-Month Realistic Data

Run the seed script to populate your database with realistic business data:

```bash
cd /Users/saptarshidhar/Rishi\ Sapta/nirvaah_reserve
npx tsx scripts/seed-data.ts
```

The seed script will create:
- 500 customers
- 15 products across 5 categories
- 800 orders over 90 days
- Reviews, returns, testimonials
- Daily analytics data

### 3. Start the Development Server

```bash
npm run dev
```

Then access:
- **Main Site**: http://localhost:3000
- **Enterprise Admin**: http://localhost:3000/admin

### 4. Admin Login

Use these credentials (created in seed):
- **Email**: admin@nirvaah.com
- **Password**: admin123

---

## What's Included

### Backend (Raw SQL APIs)
- ✅ `/api/analytics/enterprise` - Complete business analytics
- ✅ `/api/orders/enterprise` - Full order management with CRUD
- ✅ `/api/products/enterprise` - Product management
- ✅ `/api/customers/enterprise` - Customer database
- ✅ `/api/analytics/inventory` - Inventory tracking
- ✅ `/api/analytics/traffic` - Traffic analytics

### Enterprise Admin Panel
- ✅ **Dashboard** - Revenue, orders, customers, conversion funnel
- ✅ **Orders** - Full CRUD with status management, timeline
- ✅ **Products** - Grid view, add/edit/delete, categories
- ✅ **Customers** - List view, order history, lifetime value
- ✅ **Inventory** - Stock levels, reorder alerts, slow-moving items
- ✅ **Analytics** - Traffic, conversion, geographic data
- ✅ **Settings** - Configuration panel

### Database Schema (30+ Tables)
- Core: customers, customer_addresses
- Products: products, product_variants, categories, brands, inventory_logs
- Orders: orders, order_items, order_status_history, order_timeline
- Payments: payments, refunds
- Shipping: shipments, shipment_events, shipping_methods
- Marketing: coupons, coupon_usage, campaigns, customer_segments
- Analytics: analytics_sessions, analytics_daily, analytics_product_views
- Reviews: reviews, review_reactions
- Loyalty: loyalty_transactions, wallet_transactions
- Support: support_tickets, ticket_messages
- Content: testimonials, banners, contacts, contact_offices
- Admin: admin_users, admin_activity_log
- Notifications: notifications, email_queue
- Settings: settings