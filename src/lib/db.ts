import { Pool } from "pg";

// password - vRB3UAEfjS4wIxTM

// if (!process.env.DATABASE_URL) {
//   throw new Error("DATABASE_URL is missing");
// }

export const pool = new Pool({
  connectionString: "postgresql://aws-1-ap-south-1.pooler.supabase.com:5432/postgres?user=postgres.doklwobzhcahpzbonhes&password=vRB3UAEfjS4wIxTM",
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on("connect", () => console.log("✅ Connected to Postgres"));
pool.on("error", (err) => console.error("❌ DB error:", err));


