// FILE: prisma/seed.ts
import { Pool } from "pg";
import { randomUUID } from "crypto";

const pool = new Pool({
  connectionString: "postgresql://localhost:5432/nirvaah_reserve",
});

async function main() {
  console.log("🌱 Seeding PostgreSQL database: nirvaah_reserve");

  await pool.query(`
    DROP TABLE IF EXISTS analytics_events CASCADE;
    DROP TABLE IF EXISTS pre_orders CASCADE;
    DROP TABLE IF EXISTS products CASCADE;
    DROP TABLE IF EXISTS admin_users CASCADE;

    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'ADMIN',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      price TEXT NOT NULL,
      old_price TEXT,
      image TEXT NOT NULL,
      features TEXT NOT NULL,
      is_combo BOOLEAN DEFAULT FALSE,
      category TEXT DEFAULT 'INDIVIDUAL',
      status TEXT DEFAULT 'ACTIVE',
      booking_price INTEGER DEFAULT 199, -- ✅ added
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS pre_orders (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      pincode TEXT NOT NULL,
      token_amount NUMERIC DEFAULT 199.0,
      token_paid BOOLEAN DEFAULT FALSE,
      payment_reference TEXT,
      status TEXT DEFAULT 'PENDING',
      tracking_id TEXT,
      shipping_partner TEXT,
      metadata TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS analytics_events (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      path TEXT NOT NULL,
      component_id TEXT,
      session_id TEXT,
      device_info TEXT,
      metadata TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  console.log("✅ Tables created");

  await pool.query(
    `INSERT INTO admin_users (id, email, password, name, role)
     VALUES ($1, $2, $3, $4, $5)`,
    [randomUUID(), "admin@nirvaah.com", "admin123", "Nirvaah Admin", "ADMIN"]
  );

  console.log("✅ Admin seeded → admin@nirvaah.com / admin123");

  // 🔥 PRODUCTS (minimal diff applied)
  const products = [
    // existing individuals (unchanged + booking_price added)
    {
      id: "the-wanderer",
      name: "The Wanderer",
      type: "SLING BAG",
      price: "₹1,499",
      old_price: "₹2,199",
      image: "https://res.cloudinary.com/dvy6lnr3j/image/upload/v1774447272/hero_section_bg_1_ky2xcj.png",
      features: JSON.stringify([
        "Genuine jute-leather blend",
        "Magnetic snap closure",
        "RFID-blocking pocket",
        "Adjustable crossbody strap",
        "Water-resistant lining",
      ]),
      is_combo: false,
      category: "INDIVIDUAL",
      booking_price: 199,
    },
    {
      id: "the-curator",
      name: "The Curator",
      type: "TOTE BAG",
      price: "₹1,799",
      old_price: "₹2,499",
      image: "https://res.cloudinary.com/dvy6lnr3j/image/upload/v1774447272/hero_section_bg_1_ky2xcj.png",
      features: JSON.stringify([
        "Open-weave jute exterior",
        "Leather-reinforced handles",
        "Interior zip pocket",
        'Laptop sleeve up to 13"',
        "Eco-conscious canvas lining",
      ]),
      is_combo: false,
      category: "INDIVIDUAL",
      booking_price: 199,
    },
    {
      id: "the-nomad",
      name: "The Nomad",
      type: "BACKPACK",
      price: "₹2,199",
      old_price: "₹2,999",
      image: "https://res.cloudinary.com/dvy6lnr3j/image/upload/v1774447272/hero_section_bg_1_ky2xcj.png",
      features: JSON.stringify([
        "Structured jute body",
        'Padded laptop compartment (15")',
        "Hidden back pocket",
        "Ergonomic leather straps",
        "Brass YKK zippers",
      ]),
      is_combo: false,
      category: "INDIVIDUAL",
      booking_price: 199,
    },

    // 🔥 NEW COMBOS (replaces old one)
    {
      id: "couple-combo",
      name: "Couple Combo",
      type: "COMBO",
      price: "₹3,499",
      old_price: "₹4,698",
      image: "https://res.cloudinary.com/dvy6lnr3j/image/upload/v1774447272/hero_section_bg_1_ky2xcj.png",
      features: JSON.stringify([
        "Backpack + Tote pairing",
        "Perfect for couples or shared use",
        "Save ₹1,199 vs individual",
        "Matching jute-leather aesthetic",
        "Gift-ready packaging"
      ]),
      is_combo: true,
      category: "COMBO",
      booking_price: 299,
    },
    {
      id: "urban-duo",
      name: "Urban Duo",
      type: "COMBO",
      price: "₹2,999",
      old_price: "₹3,298",
      image: "https://res.cloudinary.com/dvy6lnr3j/image/upload/v1774447272/hero_section_bg_1_ky2xcj.png",
      features: JSON.stringify([
        "Sling + Tote combination",
        "Perfect daily carry setup",
        "Lightweight + functional pairing",
        "Save ₹299 vs individual",
        "Minimal urban lifestyle combo"
      ]),
      is_combo: true,
      category: "COMBO",
      booking_price: 249,
    },
    {
      id: "travel-set",
      name: "Travel Set",
      type: "COMBO",
      price: "₹3,299",
      old_price: "₹3,698",
      image: "https://res.cloudinary.com/dvy6lnr3j/image/upload/v1774447272/hero_section_bg_1_ky2xcj.png",
      features: JSON.stringify([
        "Backpack + Sling pairing",
        "Ideal for travel and movement",
        "Quick-access + storage combo",
        "Save ₹399 vs individual",
        "Adventure-ready setup"
      ]),
      is_combo: true,
      category: "COMBO",
      booking_price: 299,
    },
    {
      id: "complete-set",
      name: "Complete Set",
      type: "COMBO",
      price: "₹4,499",
      old_price: "₹5,497",
      image: "https://res.cloudinary.com/dvy6lnr3j/image/upload/v1774447272/hero_section_bg_1_ky2xcj.png",
      features: JSON.stringify([
        "Sling + Tote + Backpack",
        "Full lifestyle collection",
        "Maximum utility across use-cases",
        "Save ₹998 vs individual",
        "Best value combo"
      ]),
      is_combo: true,
      category: "COMBO",
      booking_price: 399,
    },
  ];

  for (const p of products) {
    await pool.query(
      `INSERT INTO products 
      (id, name, type, price, old_price, image, features, is_combo, category, status, booking_price)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'ACTIVE',$10)`,
      [
        p.id,
        p.name,
        p.type,
        p.price,
        p.old_price,
        p.image,
        p.features,
        p.is_combo,
        p.category,
        p.booking_price,
      ]
    );
  }

  console.log(`✅ ${products.length} products seeded`);

  // 🔥 ORDERS (same count, only combo reference updated)
  const orders = [
    {
      productId: "the-wanderer", productName: "The Wanderer",
      fullName: "Arjun Sharma", email: "arjun@example.com", phone: "9876543210",
      address: "12 Park Street", city: "Kolkata", pincode: "700016",
      tokenPaid: true, status: "PENDING",
    },
    {
      productId: "the-curator", productName: "The Curator",
      fullName: "Priya Mehta", email: "priya@example.com", phone: "9123456780",
      address: "45 MG Road", city: "Bengaluru", pincode: "560001",
      tokenPaid: true, status: "PROCESSING",
    },
    {
      productId: "the-nomad", productName: "The Nomad",
      fullName: "Rohan Das", email: "rohan@example.com", phone: "9988776655",
      address: "7 Connaught Place", city: "Delhi", pincode: "110001",
      tokenPaid: false, status: "PENDING",
    },
    {
      productId: "couple-combo", productName: "Couple Combo", // ✅ updated
      fullName: "Sneha Iyer", email: "sneha@example.com", phone: "9000112233",
      address: "22 Anna Salai", city: "Chennai", pincode: "600002",
      tokenPaid: true, status: "DISPATCHED",
    },
  ];

  for (const o of orders) {
    await pool.query(
      `INSERT INTO pre_orders
         (id, product_id, product_name, full_name, email, phone, address,
          city, pincode, token_amount, token_paid, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,199,$10,$11)`,
      [randomUUID(), o.productId, o.productName, o.fullName, o.email,
       o.phone, o.address, o.city, o.pincode, o.tokenPaid, o.status]
    );
  }

  console.log(`✅ ${orders.length} sample orders seeded`);

  // ✅ OFFICES
  await pool.query(
    `INSERT INTO contact_offices 
    (id, office_name, address, city, state, country, pincode, phone, email)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [
      randomUUID(),
      "Nirvaah HQ",
      "12 Park Street",
      "Kolkata",
      "West Bengal",
      "India",
      "700016",
      "9876543210",
      "support@nirvaah.com"
    ]
  );

  // ✅ TESTIMONIALS
  const testimonials = [
    {
      name: "Arjun Sharma",
      role: "Traveler",
      content: "This backpack feels premium and sustainable.",
      image_url: "/images/user1.jpg",
    },
    {
      name: "Sneha Iyer",
      role: "Designer",
      content: "Finally something stylish and eco-friendly.",
      image_url: "/images/user2.jpg",
    },
  ];

  for (const t of testimonials) {
    await pool.query(
      `INSERT INTO testimonials
      (id, name, role, content, image_url)
      VALUES ($1,$2,$3,$4,$5)`,
      [randomUUID(), t.name, t.role, t.content, t.image_url]
    );
  }

  console.log(`✅ ${testimonials.length} sample testimonials seeded`);

  // analytics untouched
  const eventTypes = ["PAGE_VIEW", "CLICK", "INTENT_BOOK", "CONVERSION"];
  const components = ["hero-reserve-btn", "collection-reserve-btn", "navbar-reserve", "product-card-cta"];
  const sessions = ["sess_001", "sess_002", "sess_003", "sess_004", "sess_005"];

  for (let i = 0; i < 60; i++) {
    const daysAgo = Math.floor(Math.random() * 14);
    const hoursAgo = Math.floor(Math.random() * 24);
    const eventDate = new Date(Date.now() - daysAgo * 86400000 - hoursAgo * 3600000).toISOString();
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const component = eventType === "CLICK"
      ? components[Math.floor(Math.random() * components.length)]
      : null;
    const session = sessions[Math.floor(Math.random() * sessions.length)];

    await pool.query(
      `INSERT INTO analytics_events (id, event_type, path, component_id, session_id, created_at)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [randomUUID(), eventType, "/", component, session, eventDate]
    );
  }

  console.log("✅ 60 analytics events seeded");

  await pool.end();
  console.log("\n🎉 Done!");
}

main().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});