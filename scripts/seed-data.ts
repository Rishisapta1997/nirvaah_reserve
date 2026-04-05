import { Pool } from 'pg';

const pool = new Pool({
  connectionString: "postgresql://aws-1-ap-south-1.pooler.supabase.com:5432/postgres?user=postgres.doklwobzhcahpzbonhes&password=vRB3UAEfjS4wIxTM",
  ssl: { rejectUnauthorized: false },
});

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

function generateId(): string {
  // Generate a valid UUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function generateOrderNumber(): string {
  return `NIR${Date.now().toString(36).toUpperCase().substring(0, 6)}${randomInt(1000, 9999)}`;
}

const firstNames = ['Aarav', 'Aanya', 'Vihaan', 'Saanvi', 'Arjun', 'Pari', 'Reyansh', 'Myra', 'Ayaan', 'Kavya', 'Krishna', 'Ananya', 'Sai', 'Diya', 'Rohan', 'Ira', 'Aditya', 'Neha', 'Vivaan', 'Aadhya', 'Arnav', 'Aadhira', 'Kiana', 'Vivaan', 'Aria', 'Arihant'];
const lastNames = ['Sharma', 'Patel', 'Singh', 'Gupta', 'Kumar', 'Verma', 'Joshi', 'Mehta', 'Shah', 'Agarwal', 'Chopra', 'Malhotra', 'Khanna', 'Bhatia', 'Sinha', 'Iyer', 'Pillai', 'Reddy', 'Nair', 'Das'];
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Ahmedabad', 'Surat', 'Lucknow', 'Chandigarh', 'Indore', 'Coimbatore', 'Kochi'];
const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'Tamil Nadu', 'West Bengal', 'Rajasthan', 'Gujarat', 'Uttar Pradesh', 'Kerala'];
const orderStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const productNames = [
  'Nirvaah Executive Leather Bag', 'Nirvaah Classic Satchel', 'Nirvaah Premium Backpack', 'Nirvaah Travel Duffel', 'Nirvaah Messenger Bag',
  'Nirvaah Weekend Tote', 'Nirvaah Business Briefcase', 'Nirvaah Laptop Sleeve', 'Nirvaah Crossbody Bag', 'Nirvaah Wallet Collection',
  'Nirvaah Belt Set', 'Nirvaah Card Holder', 'Nirvaah Passport Holder', 'Nirvaah Key Organizer', 'Nirvaah Watch Box'
];

const productPrices = [2499, 3999, 5999, 7999, 9999, 12999, 14999, 17999, 19999, 24999];
const tokenAmount = 199;

const customerIds: string[] = [];
const productIds: string[] = [];

async function seed() {
  console.log('🌱 Starting 3-month seed data generation...\n');
  
  try {
    // 1. Create Categories
    console.log('📦 Creating categories...');
    const categoryNames = ['Leather Bags', 'Backpacks', 'Accessories', 'Travel Bags', 'Business Essentials'];
    const categoryIds: string[] = [];
    
    for (const name of categoryNames) {
      const id = generateId();
      categoryIds.push(id);
      await pool.query(
        `INSERT INTO categories (id, name, slug, is_active, sort_order) VALUES ($1, $2, $3, true, $4)
         ON CONFLICT DO NOTHING`,
        [id, name, name.toLowerCase().replace(/ /g, '-'), categoryIds.length]
      );
    }
    console.log(`  ✅ Created/Updated ${categoryNames.length} categories`);

    // 4. Get existing product IDs from database
    console.log('📦 Fetching existing products...');
    const productsResult = await pool.query('SELECT id FROM products');
    const existingProductIds = productsResult.rows.map(r => r.id);
    console.log(`  ✅ Found ${existingProductIds.length} existing products`);
    productIds.push(...existingProductIds);

    // 3. Get existing customer IDs from database
    console.log('👥 Fetching existing customers...');
    const customersResult = await pool.query('SELECT id FROM customers');
    const existingCustomerIds = customersResult.rows.map(r => r.id);
    console.log(`  ✅ Found ${existingCustomerIds.length} existing customers`);
    
    // Add those to our list
    customerIds.push(...existingCustomerIds);

    // 4. Create Orders (800 over 3 months)
    console.log('🛒 Creating 800 orders over 3 months...');
    let totalRevenue = 0;
    let tokenRevenue = 0;
    
    for (let i = 0; i < 800; i++) {
      const customerId = randomElement(customerIds);
      const productId = randomElement(productIds);
      
      const orderDaysAgo = randomInt(1, 90);
      const orderDate = new Date(Date.now() - orderDaysAgo * 24 * 60 * 60 * 1000);
      
      const status = randomElement(orderStatuses);
      const tokenPaid = status !== 'PENDING' && Math.random() > 0.1;
      const balancePaid = status === 'DELIVERED' || (status === 'SHIPPED' && Math.random() > 0.3);
      
      const productPrice = randomElement(productPrices);
      const quantity = randomInt(1, 3);
      const subtotal = productPrice * quantity;
      const discount = Math.random() > 0.8 ? randomInt(100, 500) : 0;
      const tax = Math.round((subtotal - discount) * 0.18);
      const shippingCost = subtotal > 999 ? 0 : randomInt(49, 99);
      const total = subtotal - discount + tax + shippingCost;
      
      if (tokenPaid) tokenRevenue += tokenAmount;
      if (balancePaid) totalRevenue += total - tokenAmount;
      
      await pool.query(
        `INSERT INTO orders (id, product_id, product_name, full_name, email, phone, address, city, pincode, token_amount, token_paid, status, total_amount, discount_amount, tax_amount, shipping_cost, customer_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
         ON CONFLICT DO NOTHING`,
        [
          generateId(),
          productId,
          randomElement(productNames),
          randomElement(firstNames) + ' ' + randomElement(lastNames),
          `customer${randomInt(1, 500)}@gmail.com`,
          `+91${randomInt(6000000000, 9999999999)}`,
          `${randomInt(1, 999)}, ${randomElement(['Main Road', 'MG Road', 'Civil Lines', 'Sector 15'])}`,
          randomElement(cities),
          String(randomInt(100000, 999999)),
          tokenAmount,
          tokenPaid,
          status,
          total,
          discount,
          tax,
          shippingCost,
          customerId,
          orderDate,
          orderDate
        ]
      );
    }
    console.log(`  ✅ Created 800 orders`);
    console.log(`  💰 Token Revenue: ₹${tokenRevenue.toLocaleString()}`);
    console.log(`  💰 Balance Revenue: ₹${totalRevenue.toLocaleString()}`);

    // 5. Create Reviews (200)
    console.log('⭐ Creating 200 reviews...');
    const reviewTitles = ['Amazing Quality!', 'Worth Every Penny', 'Exceeded Expectations', 'Perfect Gift', 'Great Value', 'Love it!', 'Premium Product', 'Best Purchase'];
    const reviewContents = [
      'The quality is outstanding. Very satisfied with my purchase.',
      'Beautiful design and excellent material. Highly recommend!',
      'Perfect for my needs. Great customer service too.',
      'Exceeded my expectations. Will buy again.',
      'Worth the investment. Premium quality feel.',
      'Amazing product! The leather is top notch.',
      'Great product at this price point. Very happy.',
      'Exactly as described. Fast delivery too.'
    ];
    
    for (let i = 0; i < 200; i++) {
      const productId = randomElement(productIds);
      const customerId = randomElement(customerIds);
      const rating = randomElement([4, 5, 5, 5, 4, 4, 3, 5]);
      
      const reviewDaysAgo = randomInt(1, 60);
      const createdAt = new Date(Date.now() - reviewDaysAgo * 24 * 60 * 60 * 1000);
      
      await pool.query(
        `INSERT INTO reviews (id, product_id, customer_id, rating, title, content, is_verified_purchase, is_approved, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, true, true, $7)
         ON CONFLICT DO NOTHING`,
        [
          generateId(),
          productId,
          customerId,
          rating,
          randomElement(reviewTitles),
          randomElement(reviewContents),
          createdAt
        ]
      );
    }
    console.log(`  ✅ Created 200 reviews`);

    // 6. Create Testimonials (20)
    console.log('💬 Creating 20 testimonials...');
    const testimonialContents = [
      'Nirvaah products have transformed my daily commute. The quality is unmatched!',
      'Best investment I made this year. The leather bags are exceptional.',
      'Customer service was amazing. Quick delivery and premium quality.',
      'The attention to detail in every product is remarkable. Highly recommended!',
      'I have been a loyal customer for months. Never disappointed with any purchase.',
      'Perfect blend of style and functionality. All my colleagues now use Nirvaah!',
      'The warranty and after-sales support is outstanding. Truly premium brand.',
      'Exceeded all my expectations. The craftsmanship is world-class.'
    ];
    
    for (let i = 0; i < 20; i++) {
      await pool.query(
        `INSERT INTO testimonials (id, name, role, content, rating, is_featured, created_at)
         VALUES ($1, $2, $3, $4, 5, true, $5)
         ON CONFLICT DO NOTHING`,
        [
          generateId(),
          randomElement(firstNames) + ' ' + randomElement(lastNames),
          randomElement(['CEO', 'Manager', 'Entrepreneur', 'Professional', 'Director']),
          randomElement(testimonialContents),
          new Date(Date.now() - randomInt(1, 60) * 24 * 60 * 60 * 1000)
        ]
      );
    }
    console.log(`  ✅ Created 20 testimonials`);

    // 7. Update customer stats
    console.log('👥 Updating customer statistics...');
    await pool.query(`
      UPDATE customers SET 
        total_orders = sub.cnt,
        total_spent = sub.spent
      FROM (
        SELECT customer_id, COUNT(*) as cnt, COALESCE(SUM(total_amount), 0) as spent
        FROM orders WHERE status != 'CANCELLED'
        GROUP BY customer_id
      ) sub
      WHERE customers.id = sub.customer_id
    `);
    console.log(`  ✅ Updated customer stats`);

    // Final summary
    const summary = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM customers) as customers,
        (SELECT COUNT(*) FROM products) as products,
        (SELECT COUNT(*) FROM orders) as orders,
        (SELECT COUNT(*) FROM reviews) as reviews,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status != 'CANCELLED') as total_revenue
    `);
    
    console.log('\n🎉 Seed Data Generation Complete!');
    console.log('=================================');
    console.log(`👥 Customers: ${summary.rows[0].customers}`);
    console.log(`📦 Products: ${summary.rows[0].products}`);
    console.log(`🛒 Orders: ${summary.rows[0].orders}`);
    console.log(`⭐ Reviews: ${summary.rows[0].reviews}`);
    console.log(`💰 Total Revenue: ₹${parseFloat(summary.rows[0].total_revenue || 0).toLocaleString()}`);
    console.log('\n✅ Database seeded with 3 months of realistic business data!');
    
  } catch (err) {
    console.error('❌ Seed error:', err);
  } finally {
    await pool.end();
  }
}

seed();