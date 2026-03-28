import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://localhost:5432/nirvaah_reserve",
});

pool.on("connect", () => console.log("✅ Connected to Postgres"));
pool.on("error", (err) => console.error("❌ DB error:", err));