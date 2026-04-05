-- ============================================
-- NIRVAAH ENTERPRISE SCHEMA - Complete Backend
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

-- Users / Customers
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    full_name VARCHAR(200),
    password_hash VARCHAR(255),
    avatar_url TEXT,
    date_of_birth DATE,
    gender VARCHAR(20),
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    customer_type VARCHAR(20) DEFAULT 'RETAIL', -- RETAIL, WHOLESALE, VIP
    referral_code VARCHAR(20) UNIQUE,
    referred_by UUID REFERENCES customers(id),
    wallet_balance DECIMAL(12,2) DEFAULT 0,
    loyalty_points INT DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0,
    total_orders INT DEFAULT 0,
    tags TEXT[], -- Array of tags
    preferences JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    email_verified_at TIMESTAMPTZ,
    phone_verified_at TIMESTAMPTZ
);

-- Customer Addresses
CREATE TABLE IF NOT EXISTS customer_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    address_type VARCHAR(20) DEFAULT 'SHIPPING', -- SHIPPING, BILLING
    label VARCHAR(50), -- Home, Office, etc.
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company VARCHAR(200),
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'India',
    phone VARCHAR(20),
    is_default BOOLEAN DEFAULT false,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    delivery_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRODUCTS
-- ============================================

-- Categories
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    image_url TEXT,
    icon VARCHAR(50),
    display_order INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    meta_title VARCHAR(200),
    meta_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brands
CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo_url TEXT,
    description TEXT,
    website VARCHAR(255),
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    sku VARCHAR(50) UNIQUE,
    description TEXT,
    short_description VARCHAR(500),
    product_type VARCHAR(20) DEFAULT 'STANDARD', -- STANDARD, BUNDLE, VARIANT
    category_id UUID REFERENCES categories(id),
    brand_id UUID REFERENCES brands(id),
    
    -- Pricing
    base_price DECIMAL(12,2) NOT NULL,
    compare_price DECIMAL(12,2), -- Original price (for showing discount)
    cost_per_item DECIMAL(12,2), -- COGS
    booking_price DECIMAL(12,2), -- Token/booking amount
    
    -- Stock
    quantity INT DEFAULT 0,
    low_stock_threshold INT DEFAULT 10,
    is_tracked BOOLEAN DEFAULT true,
    allow_backorder BOOLEAN DEFAULT false,
    
    -- Media
    images JSONB DEFAULT '[]', -- Array of image URLs
    videos JSONB DEFAULT '[]',
    thumbnail_url TEXT,
    
    -- Attributes
    weight DECIMAL(10,2), -- in grams
    dimensions JSONB, -- { length, width, height }
    colors JSONB DEFAULT '[]',
    sizes JSONB DEFAULT '[]',
    materials JSONB DEFAULT '[]',
    attributes JSONB DEFAULT '{}',
    
    -- SEO
    meta_title VARCHAR(200),
    meta_description TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT, ACTIVE, ARCHIVED
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    -- Additional
    tags TEXT[],
    warranty_months INT DEFAULT 0,
    return_days INT DEFAULT 7,
    
    -- Analytics
    view_count INT DEFAULT 0,
    sold_count INT DEFAULT 0,
    rating_avg DECIMAL(3,2) DEFAULT 0,
    review_count INT DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Variants
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(50) UNIQUE,
    name VARCHAR(255),
    price DECIMAL(12,2) NOT NULL,
    compare_price DECIMAL(12,2),
    quantity INT DEFAULT 0,
    attributes JSONB NOT NULL, -- { color: "Red", size: "L" }
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Inventory Logs
CREATE TABLE IF NOT EXISTS inventory_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    change_type VARCHAR(20) NOT NULL, -- ADD, SELL, RETURN, ADJUST, DAMAGE
    quantity_change INT NOT NULL,
    quantity_before INT NOT NULL,
    quantity_after INT NOT NULL,
    reference_type VARCHAR(50), -- order, return, adjustment
    reference_id UUID,
    notes TEXT,
    performed_by UUID REFERENCES customers(id), -- Admin user ID
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ORDERS - Complete Order Management
-- ============================================

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(30) UNIQUE NOT NULL,
    
    -- Customer
    customer_id UUID REFERENCES customers(id),
    customer_name VARCHAR(200),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    
    -- Type
    order_type VARCHAR(20) DEFAULT 'PREORDER', -- PREORDER, REGULAR, INSTALLMENT
    source VARCHAR(20) DEFAULT 'WEBSITE', -- WEBSITE, APP, WHATSAPP, ADMIN
    
    -- Status
    status VARCHAR(30) DEFAULT 'PENDING', 
    -- PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED
    payment_status VARCHAR(20) DEFAULT 'PENDING',
    -- PENDING, PARTIAL, PAID, REFUNDED, FAILED
    fulfillment_status VARCHAR(20) DEFAULT 'UNFULFILLED',
    -- UNFULFILLED, PARTIALLY_FULFILLED, FULFILLED
    
    -- Addresses
    shipping_address JSONB,
    billing_address JSONB,
    
    -- Pricing
    subtotal DECIMAL(12,2) NOT NULL,
    discount_total DECIMAL(12,2) DEFAULT 0,
    coupon_discount DECIMAL(12,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    shipping_cost DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL,
    
    -- Payments
    token_amount DECIMAL(12,2), -- For preorders
    token_paid BOOLEAN DEFAULT false,
    token_payment_id UUID,
    balance_amount DECIMAL(12,2),
    balance_paid BOOLEAN DEFAULT false,
    balance_payment_id UUID,
    total_paid DECIMAL(12,2) DEFAULT 0,
    refund_amount DECIMAL(12,2) DEFAULT 0,
    
    -- Shipping
    shipping_method VARCHAR(50),
    shipping_partner VARCHAR(100),
    tracking_number VARCHAR(100),
    tracking_url TEXT,
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    
    -- Timeline
    notes TEXT,
    admin_notes TEXT,
    customer_notes TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    utm_data JSONB DEFAULT '{}',
    
    -- Timestamps
    confirmed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    sku VARCHAR(50),
    product_name VARCHAR(255) NOT NULL,
    variant_name VARCHAR(255),
    image_url TEXT,
    
    quantity INT NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    compare_price DECIMAL(12,2),
    discount DECIMAL(12,2) DEFAULT 0,
    tax_rate DECIMAL(5,2),
    tax_amount DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL,
    
    is_ready BOOLEAN DEFAULT true,
    is_shipped BOOLEAN DEFAULT false,
    shipped_quantity INT DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Status History
CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL,
    previous_status VARCHAR(30),
    notes TEXT,
    created_by UUID, -- Admin user
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Timeline Events
CREATE TABLE IF NOT EXISTS order_timeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    title VARCHAR(100),
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PAYMENTS
-- ============================================

-- Payments
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_number VARCHAR(30) UNIQUE NOT NULL,
    
    order_id UUID REFERENCES orders(id),
    customer_id UUID REFERENCES customers(id),
    
    payment_type VARCHAR(20) NOT NULL, -- TOKEN, BALANCE, FULL, REFUND
    payment_method VARCHAR(30) NOT NULL, -- CARD, UPI, NETBANKING, COD, WALLET
    payment_gateway VARCHAR(50), -- RAZORPAY, STRIPE, etc.
    gateway_transaction_id VARCHAR(100),
    
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, SUCCESS, FAILED, REFUNDED, CANCELLED
    gateway_response JSONB,
    
    receipt_url TEXT,
    failure_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ
);

-- Payment Refunds
CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    refund_number VARCHAR(30) UNIQUE NOT NULL,
    
    payment_id UUID REFERENCES payments(id),
    order_id UUID REFERENCES orders(id),
    
    amount DECIMAL(12,2) NOT NULL,
    reason TEXT,
    refund_method VARCHAR(30), -- ORIGINAL, WALLET
    gateway_refund_id VARCHAR(100),
    
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, PROCESSED, FAILED
    processed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID
);

-- ============================================
-- SHIPPING & FULFILLMENT
-- ============================================

-- Shipping Zones
CREATE TABLE IF NOT EXISTS shipping_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    countries TEXT[], -- Array of country codes
    states TEXT[], -- Array of state names
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shipping Methods
CREATE TABLE IF NOT EXISTS shipping_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zone_id UUID REFERENCES shipping_zones(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_type VARCHAR(20) DEFAULT 'FLAT', -- FLAT, WEIGHT_BASED, PRICE_BASED
    base_cost DECIMAL(12,2) DEFAULT 0,
    cost_per_kg DECIMAL(12,2),
    free_shipping_threshold DECIMAL(12,2),
    estimated_days VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shipments
CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_number VARCHAR(30) UNIQUE NOT NULL,
    order_id UUID REFERENCES orders(id),
    
    carrier VARCHAR(100),
    service VARCHAR(100),
    tracking_number VARCHAR(100),
    tracking_url TEXT,
    
    status VARCHAR(20) DEFAULT 'PREPARING', -- PREPARING, PICKED_UP, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED, RETURNED
    ship_date TIMESTAMPTZ,
    estimated_delivery DATE,
    actual_delivery TIMESTAMPTZ,
    
    weight DECIMAL(10,2),
    dimensions JSONB,
    
    manifest_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shipment Events
CREATE TABLE IF NOT EXISTS shipment_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    location VARCHAR(200),
    description TEXT,
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- COUPONS & PROMOTIONS
-- ============================================

-- Coupons
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL, -- PERCENTAGE, FIXED
    discount_value DECIMAL(12,2) NOT NULL,
    min_order_value DECIMAL(12,2),
    max_discount DECIMAL(12,2),
    
    usage_type VARCHAR(20) DEFAULT 'UNLIMITED', -- UNLIMITED, LIMITED
    total_uses_limit INT,
    uses_count INT DEFAULT 0,
    per_user_limit INT DEFAULT 1,
    
    applicable_products UUID[], -- Product IDs
    applicable_categories UUID[], -- Category IDs
    exclude_products UUID[],
    
    is_active BOOLEAN DEFAULT true,
    starts_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coupon Usage
CREATE TABLE IF NOT EXISTS coupon_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id),
    customer_id UUID REFERENCES customers(id),
    discount_amount DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RETURNS & EXCHANGES
-- ============================================

-- Return Requests
CREATE TABLE IF NOT EXISTS returns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    return_number VARCHAR(30) UNIQUE NOT NULL,
    order_id UUID REFERENCES orders(id),
    order_item_id UUID REFERENCES order_items(id),
    customer_id UUID REFERENCES customers(id),
    
    return_type VARCHAR(20) DEFAULT 'REFUND', -- REFUND, EXCHANGE
    reason VARCHAR(50) NOT NULL,
    description TEXT,
    
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, RECEIVED, PROCESSED, COMPLETED
    resolution_notes TEXT,
    
    refund_amount DECIMAL(12,2),
    refund_method VARCHAR(20), -- ORIGINAL, WALLET
    
    pickup_scheduled BOOLEAN DEFAULT false,
    pickup_date DATE,
    pickup_address JSONB,
    pickup_attempted BOOLEAN DEFAULT false,
    
    images JSONB DEFAULT '[]',
    
    admin_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- ============================================
-- REVIEWS & RATINGS
-- ============================================

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id),
    customer_id UUID REFERENCES customers(id),
    order_id UUID REFERENCES orders(id),
    
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    content TEXT,
    
    pros TEXT[],
    cons TEXT[],
    
    images JSONB DEFAULT '[]',
    video_url TEXT,
    
    is_verified_purchase BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    helpful_count INT DEFAULT 0,
    
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED, SPAM, REJECTED
    
    admin_reply TEXT,
    replied_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Review Reactions
CREATE TABLE IF NOT EXISTS review_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id),
    reaction VARCHAR(20), -- HELPFUL, NOT_HELPFUL
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(review_id, customer_id)
);

-- ============================================
-- CUSTOMER LOYALTY & REWARDS
-- ============================================

-- Loyalty Points Transactions
CREATE TABLE IF NOT EXISTS loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL, -- EARN, REDEEM, ADJUST, EXPIRE
    points INT NOT NULL,
    balance_after INT NOT NULL,
    
    reference_type VARCHAR(50), -- order, review, referral
    reference_id UUID,
    
    description TEXT,
    expires_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer Wallet Transactions
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL, -- CREDIT, DEBIT
    amount DECIMAL(12,2) NOT NULL,
    balance_after DECIMAL(12,2) NOT NULL,
    
    reference_type VARCHAR(50),
    reference_id UUID,
    
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MARKETING & CAMPAIGNS
-- ============================================

-- Campaigns
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(30) NOT NULL, -- EMAIL, SMS, PUSH, WHATSAPP
    status VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT, SCHEDULED, ACTIVE, PAUSED, COMPLETED
    
    subject VARCHAR(200),
    content TEXT,
    template_id VARCHAR(100),
    
    target_segment JSONB, -- { type: 'all' | 'segment', segment_id: '' }
    
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    
    stats JSONB DEFAULT '{"sent": 0, "delivered": 0, "opened": 0, "clicked": 0, "bounced": 0}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID
);

-- Email Lists / Segments
CREATE TABLE IF NOT EXISTS customer_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    conditions JSONB NOT NULL, -- { field: 'total_spent', operator: 'gt', value: 10000 }
    customer_count INT DEFAULT 0,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ANALYTICS - Comprehensive Tracking
-- ============================================

-- Page Views / Sessions
CREATE TABLE IF NOT EXISTS analytics_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(100) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id),
    
    source VARCHAR(50), -- direct, google, facebook, instagram
    medium VARCHAR(50),
    campaign VARCHAR(100),
    
    device_type VARCHAR(20), -- mobile, desktop, tablet
    browser VARCHAR(50),
    os VARCHAR(50),
    screen_resolution VARCHAR(50),
    
    ip_address VARCHAR(45),
    country VARCHAR(50),
    city VARCHAR(50),
    
    landing_page VARCHAR(500),
    exit_page VARCHAR(500),
    
    duration_seconds INT,
    page_views INT DEFAULT 0,
    
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    utm_content VARCHAR(100),
    utm_term VARCHAR(100),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Views
CREATE TABLE IF NOT EXISTS analytics_product_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(100),
    customer_id UUID REFERENCES customers(id),
    product_id UUID REFERENCES products(id),
    
    source VARCHAR(50),
    referrer VARCHAR(500),
    
    viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cart Events
CREATE TABLE IF NOT EXISTS analytics_cart_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(100),
    customer_id UUID REFERENCES customers(id),
    product_id UUID REFERENCES products(id),
    
    event_type VARCHAR(20) NOT NULL, -- ADD, REMOVE, UPDATE
    quantity INT,
    price DECIMAL(12,2),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Checkout Funnel
CREATE TABLE IF NOT EXISTS analytics_checkout (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(100),
    customer_id UUID REFERENCES customers(id),
    order_id UUID REFERENCES orders(id),
    
    step VARCHAR(50) NOT NULL, -- cart, checkout, payment, confirmation
    step_number INT,
    
    data JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Analytics Aggregates
CREATE TABLE IF NOT EXISTS analytics_daily (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL UNIQUE,
    
    -- Traffic
    sessions INT DEFAULT 0,
    unique_visitors INT DEFAULT 0,
    page_views INT DEFAULT 0,
    bounce_rate DECIMAL(5,2),
    avg_session_duration INT DEFAULT 0,
    
    -- Sales
    orders_count INT DEFAULT 0,
    orders_total DECIMAL(12,2) DEFAULT 0,
    token_payments_count INT DEFAULT 0,
    token_payments_total DECIMAL(12,2) DEFAULT 0,
    balance_payments_count INT DEFAULT 0,
    balance_payments_total DECIMAL(12,2) DEFAULT 0,
    
    -- Products
    products_viewed INT DEFAULT 0,
    add_to_cart_count INT DEFAULT 0,
    checkout_started INT DEFAULT 0,
    
    -- Conversion
    conversion_rate DECIMAL(5,2),
    cart_abandonment_rate DECIMAL(5,2),
    
    -- Sources
    sources JSONB DEFAULT '{}',
    top_products JSONB DEFAULT '[]',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ADMIN & USER MANAGEMENT
-- ============================================

-- Admin Users (Enhanced)
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    full_name VARCHAR(200),
    avatar_url TEXT,
    
    role VARCHAR(30) DEFAULT 'ADMIN', -- SUPER_ADMIN, ADMIN, MANAGER, STAFF, VIEWER
    permissions JSONB DEFAULT '[]',
    
    department VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Activity Log
CREATE TABLE IF NOT EXISTS admin_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES admin_users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    details JSONB DEFAULT '{}',
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS
-- ============================================

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_type VARCHAR(20) NOT NULL, -- CUSTOMER, ADMIN
    user_id UUID NOT NULL,
    
    type VARCHAR(50) NOT NULL, -- ORDER, PAYMENT, SHIPPING, SYSTEM
    title VARCHAR(200) NOT NULL,
    message TEXT,
    
    data JSONB DEFAULT '{}',
    action_url VARCHAR(500),
    
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email Queue
CREATE TABLE IF NOT EXISTS email_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    to_email VARCHAR(255) NOT NULL,
    to_name VARCHAR(200),
    from_email VARCHAR(255),
    from_name VARCHAR(200),
    
    subject VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    template_id VARCHAR(100),
    variables JSONB DEFAULT '{}',
    
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, SENT, FAILED
    send_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    failure_reason TEXT,
    
    attempts INT DEFAULT 0,
    max_attempts INT DEFAULT 3,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SUPPORT & TICKETS
-- ============================================

-- Support Tickets
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number VARCHAR(30) UNIQUE NOT NULL,
    
    customer_id UUID REFERENCES customers(id),
    order_id UUID REFERENCES orders(id),
    
    type VARCHAR(30) NOT NULL, -- ORDER, PAYMENT, PRODUCT, SHIPPING, GENERAL
    priority VARCHAR(20) DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, URGENT
    status VARCHAR(20) DEFAULT 'OPEN', -- OPEN, IN_PROGRESS, WAITING_CUSTOMER, RESOLVED, CLOSED
    
    subject VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    
    assigned_to UUID REFERENCES admin_users(id),
    
    resolution TEXT,
    rating INT,
    feedback TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ
);

-- Ticket Messages
CREATE TABLE IF NOT EXISTS ticket_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
    
    sender_type VARCHAR(20) NOT NULL, -- CUSTOMER, ADMIN
    sender_id UUID NOT NULL,
    
    message TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',
    
    is_internal BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CONTACTS & INQUIRIES (Existing)
-- ============================================

-- Contacts (Enhanced)
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    
    subject VARCHAR(200),
    message TEXT NOT NULL,
    
    source VARCHAR(50), -- WEBSITE, WHATSAPP, SOCIAL, REFERRAL
    status VARCHAR(20) DEFAULT 'NEW', -- NEW, CONTACTED, CONVERTED, CLOSED
    
    assigned_to UUID REFERENCES admin_users(id),
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact Offices
CREATE TABLE IF NOT EXISTS contact_offices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    office_name VARCHAR(200) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    pincode VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(255),
    map_link TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CONTENT & CMS
-- ============================================

-- Testimonials (Enhanced)
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    role VARCHAR(100),
    company VARCHAR(200),
    content TEXT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    
    image_url TEXT,
    video_url TEXT,
    
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    customer_id UUID REFERENCES customers(id),
    order_id UUID REFERENCES orders(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Banners
CREATE TABLE IF NOT EXISTS banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    subtitle VARCHAR(500),
    image_url TEXT NOT NULL,
    mobile_image_url TEXT,
    
    link_type VARCHAR(20), -- PRODUCT, CATEGORY, URL, NONE
    link_value VARCHAR(500),
    
    is_active BOOLEAN DEFAULT true,
    display_order INT DEFAULT 0,
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SETTINGS & CONFIGURATION
-- ============================================

-- Settings
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description VARCHAR(500),
    category VARCHAR(50),
    is_public BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- Customers indexes
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics_daily(date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_session ON analytics_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_product_views_product ON analytics_product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_analytics_product_views_date ON analytics_product_views(viewed_at DESC);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer ON reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating DESC);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(created_at DESC);

-- Returns indexes
CREATE INDEX IF NOT EXISTS idx_returns_order ON returns(order_id);
CREATE INDEX IF NOT EXISTS idx_returns_status ON returns(status);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_type, user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- ============================================
-- INITIAL DATA
-- ============================================

-- Insert default admin user (password: admin123)
INSERT INTO admin_users (id, email, password_hash, first_name, last_name, full_name, role) 
VALUES (uuid_generate_v4(), 'admin@nirvaah.com', '$2a$10$rQEY5xXqKqKqKqKqKqKqKeQEY5xXqKqKqKqKqKqKqKqKqKqKqKqKqKqK', 'Nirvaah', 'Admin', 'Nirvaah Admin', 'SUPER_ADMIN')
ON CONFLICT (email) DO NOTHING;

-- Insert default settings
INSERT INTO settings (key, value, category, description) VALUES
    ('site_name', '"Nirvaah"', 'general', 'Site name'),
    ('site_logo', '"/logo.png"', 'general', 'Site logo URL'),
    ('currency', '"INR"', 'general', 'Default currency'),
    ('currency_symbol', '"₹"', 'general', 'Currency symbol'),
    ('tax_rate', '18', 'tax', 'Default tax rate percentage'),
    ('free_shipping_threshold', '999', 'shipping', 'Free shipping order value'),
    ('low_stock_threshold', '10', 'inventory', 'Low stock alert threshold'),
    ('order_prefix', '"NIR"', 'orders', 'Order number prefix'),
    ('payment_prefix', '"PAY"', 'payments', 'Payment number prefix')
ON CONFLICT (key) DO NOTHING;

SELECT '✅ Enterprise Schema Created Successfully!' as status;