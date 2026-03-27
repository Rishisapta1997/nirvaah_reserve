import pkg from "pg";
import { v4 as uuidv4 } from "uuid";

const { Pool } = pkg;

const pool = new Pool({
  connectionString: "postgresql://localhost:5432/nirvaah_reserve",
});

async function seed() {
  // PRODUCTS
  await pool.query(`
    INSERT INTO products 
    (id, name, type, price, old_price, image, features, is_combo, category, status)
    VALUES
    (
      '${uuidv4()}',
      'The Wanderer',
      'SLING BAG',
      '₹1,499',
      '₹2,199',
      '/images/sling.jpg',
      '["Adjustable strap","Magnetic clasp","RFID pocket"]',
      false,
      'INDIVIDUAL',
      'ACTIVE'
    ),
    (
      '${uuidv4()}',
      'The Sovereign',
      'TOTE BAG',
      '₹1,999',
      '₹2,799',
      '/images/tote.jpg',
      '["Structured base","Zip pocket","Water resistant"]',
      false,
      'INDIVIDUAL',
      'ACTIVE'
    ),
    (
      '${uuidv4()}',
      'The Pioneer',
      'BACKPACK',
      '₹2,499',
      '₹3,499',
      '/images/backpack.jpg',
      '["Laptop sleeve","Hidden pocket","Padded back"]',
      false,
      'INDIVIDUAL',
      'ACTIVE'
    );
  `);

  // ADMIN
  await pool.query(`
    INSERT INTO admins (id, email, password, name, role)
    VALUES (
      '${uuidv4()}',
      'admin@nirvaah.com',
      'admin123',
      'Admin',
      'ADMIN'
    )
    ON CONFLICT (email) DO NOTHING;
  `);

  console.log("✅ Clean seed complete");
  process.exit();
}

seed();