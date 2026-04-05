-- =====================================================
-- NIRVAAH AUTOMATION & AI INSIGHTS TABLES
-- =====================================================

-- Automated Reports Storage
CREATE TABLE IF NOT EXISTS automated_reports (
    id TEXT PRIMARY KEY,
    report_type TEXT NOT NULL CHECK (report_type IN ('daily', 'weekly', 'monthly')),
    title TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    summary TEXT,
    generated_at TIMESTAMP DEFAULT NOW(),
    sent_at TIMESTAMP,
    status TEXT DEFAULT 'generated' CHECK (status IN ('generated', 'sent', 'failed'))
);

-- Report Schedules
CREATE TABLE IF NOT EXISTS report_schedules (
    id TEXT PRIMARY KEY,
    report_type TEXT NOT NULL CHECK (report_type IN ('daily', 'weekly', 'monthly')),
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
    schedule_time TIME DEFAULT '06:00:00',
    next_run TIMESTAMP,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Reorder Settings per Product
CREATE TABLE IF NOT EXISTS reorder_settings (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL UNIQUE,
    product_name TEXT,
    threshold INTEGER DEFAULT 10,
    alert_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Reorder Alerts
CREATE TABLE IF NOT EXISTS reorder_alerts (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    product_name TEXT,
    current_stock INTEGER,
    threshold INTEGER,
    predicted_days_left INTEGER,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'resolved', 'dismissed')),
    alert_type TEXT DEFAULT 'low_stock' CHECK (alert_type IN ('low_stock', 'out_of_stock', 'depletion_warning')),
    created_at TIMESTAMP DEFAULT NOW(),
    acknowledged_at TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Insights Cache (reduce LLM API calls)
CREATE TABLE IF NOT EXISTS insights_cache (
    id TEXT PRIMARY KEY,
    insight_type TEXT NOT NULL CHECK (insight_type IN ('daily', 'weekly', 'monthly')),
    period_key TEXT NOT NULL,
    prompt_hash TEXT,
    response JSONB DEFAULT '{}',
    data_used JSONB DEFAULT '{}',
    generated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(insight_type, period_key)
);

-- Insights History
CREATE TABLE IF NOT EXISTS insights_history (
    id TEXT PRIMARY KEY,
    insight_type TEXT NOT NULL CHECK (insight_type IN ('daily', 'weekly', 'monthly')),
    period_key TEXT NOT NULL,
    period_start DATE,
    period_end DATE,
    recommendations JSONB DEFAULT '[]',
    risks JSONB DEFAULT '[]',
    opportunities JSONB DEFAULT '[]',
    overall_score INTEGER,
    generated_at TIMESTAMP DEFAULT NOW()
);

-- Action Items from Insights
CREATE TABLE IF NOT EXISTS action_items (
    id TEXT PRIMARY KEY,
    insight_id TEXT,
    insight_type TEXT NOT NULL CHECK (insight_type IN ('daily', 'weekly', 'monthly')),
    description TEXT NOT NULL,
    category TEXT,
    priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'dismissed')),
    due_date DATE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Email Queue for Reports
CREATE TABLE IF NOT EXISTS email_queue (
    id TEXT PRIMARY KEY,
    report_id TEXT,
    recipient_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    created_at TIMESTAMP DEFAULT NOW(),
    sent_at TIMESTAMP,
    error_message TEXT
);

-- Daily Metrics Snapshot (for trend analysis)
CREATE TABLE IF NOT EXISTS daily_metrics_snapshots (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    revenue NUMERIC(15,2),
    orders INTEGER,
    customers INTEGER,
    avg_order_value NUMERIC(10,2),
    token_revenue NUMERIC(15,2),
    new_customers INTEGER,
    returning_customers INTEGER,
    top_products JSONB DEFAULT '[]',
    inventory_alerts JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_automated_reports_type ON automated_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_automated_reports_date ON automated_reports(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_reorder_alerts_status ON reorder_alerts(status);
CREATE INDEX IF NOT EXISTS idx_insights_cache_type ON insights_cache(insight_type, period_key);
CREATE INDEX IF NOT EXISTS idx_action_items_status ON action_items(status);
CREATE INDEX IF NOT EXISTS idx_action_items_priority ON action_items(priority);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_date ON daily_metrics_snapshots(date);

-- Insert default schedule settings
INSERT INTO report_schedules (id, report_type, frequency, schedule_time, next_run, enabled)
VALUES 
    ('daily', 'daily', 'daily', '06:00:00', NOW() + INTERVAL '1 day', true),
    ('weekly', 'weekly', 'weekly', '09:00:00', NOW() + INTERVAL '7 days', true),
    ('monthly', 'monthly', 'monthly', '10:00:00', NOW() + INTERVAL '30 days', true)
ON CONFLICT (id) DO NOTHING;

-- Insert default reorder settings for existing products
INSERT INTO reorder_settings (id, product_id, product_name, threshold, alert_enabled)
SELECT 
    'reorder_' || LOWER(REPLACE(name, ' ', '_')),
    id,
    name,
    10,
    true
FROM products
WHERE status = 'ACTIVE'
ON CONFLICT (product_id) DO NOTHING;

-- Create function to get today's metrics
CREATE OR REPLACE FUNCTION get_daily_metrics_summary()
RETURNS TABLE (
    revenue NUMERIC,
    orders INTEGER,
    customers INTEGER,
    avg_order_value NUMERIC,
    new_customers INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(total_amount), 0)::NUMERIC AS revenue,
        COUNT(*)::INTEGER AS orders,
        COUNT(DISTINCT customer_id)::INTEGER AS customers,
        COALESCE(AVG(total_amount), 0)::NUMERIC AS avg_order_value,
        COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE)::INTEGER AS new_customers
    FROM orders
    WHERE created_at >= CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Create function to get metrics for date range
CREATE OR REPLACE FUNCTION get_metrics_for_range(p_start_date DATE, p_end_date DATE)
RETURNS TABLE (
    date DATE,
    revenue NUMERIC,
    orders INTEGER,
    customers INTEGER,
    avg_order_value NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        created_at::date AS date,
        COALESCE(SUM(total_amount), 0)::NUMERIC AS revenue,
        COUNT(*)::INTEGER AS orders,
        COUNT(DISTINCT customer_id)::INTEGER AS customers,
        COALESCE(AVG(total_amount), 0)::NUMERIC AS avg_order_value
    FROM orders
    WHERE created_at::date BETWEEN p_start_date AND p_end_date
    GROUP BY created_at::date
    ORDER BY date ASC;
END;
$$ LANGUAGE plpgsql;