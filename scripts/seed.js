// Seed script for Chaarpaisa database
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://chaarpaisa_user:chaarpaisa123@localhost:5432/chaarpaisa',
  max: 20
});

function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

async function seed() {
  console.log('Starting database seed...');

  try {
    // Create admin user
    const adminResult = await pool.query(`
      INSERT INTO users (name, email, password_hash, role, phone_number, verified)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, ['Admin User', 'admin@chaarpaisa.com', hashPassword('admin123'), 'admin', '9876543210', true]);

    console.log('✅ Admin user created');

    // Create app users
    const appUser1Result = await pool.query(`
      INSERT INTO users (name, email, password_hash, role, phone_number, verified)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, ['Rajesh Kumar', 'rajesh@test.com', hashPassword('password123'), 'appusers', '9876543211', true]);

    const appUser2Result = await pool.query(`
      INSERT INTO users (name, email, password_hash, role, phone_number, verified)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, ['Priya Sharma', 'priya@test.com', hashPassword('password123'), 'appusers', '9876543212', true]);

    console.log('✅ App users created');

    // Create sample items for Rajesh (Riding Accessories)
    if (appUser1Result.rows.length > 0) {
      const user1Id = appUser1Result.rows[0].id;

      await pool.query(`
        INSERT INTO items (owner_id, name, category, subcategory, description, location, expected_price, rental_price_per_day, rental_days_min, rental_days_max, age, condition, status)
        VALUES 
        ($1, 'Royal Enfield Helmet - Black', 'Riding Accessories', 'Helmets', 'ISI certified full-face helmet, excellent condition', 'Bangalore', 3500, 100, 1, 30, 1, 'like-new', 'listed'),
        ($1, 'Alpinestars Riding Jacket', 'Riding Accessories', 'Riding Gear', 'Premium riding jacket with armor protection, size L', 'Bangalore', 8000, 200, 2, 15, 1, 'good', 'listed'),
        ($1, 'Riding Gloves - XL', 'Riding Accessories', 'Riding Gear', 'Waterproof riding gloves with knuckle protection', 'Bangalore', 1500, 50, 1, 30, 0, 'new', 'listed')
      `, [user1Id]);

      console.log('✅ Sample riding accessories created');
    }

    // Create sample items for Priya (Wedding)
    if (appUser2Result.rows.length > 0) {
      const user2Id = appUser2Result.rows[0].id;

      await pool.query(`
        INSERT INTO items (owner_id, name, category, subcategory, description, location, expected_price, rental_price_per_day, rental_days_min, rental_days_max, age, condition, status)
        VALUES 
        ($1, 'Designer Lehenga - Red Bridal', 'Wedding', 'Bridal Wear', 'Heavy embroidered bridal lehenga with dupatta, size M', 'Mumbai', 45000, 3000, 3, 7, 0, 'new', 'listed'),
        ($1, 'Sherwani - Cream with Gold Work', 'Wedding', 'Groom Wear', 'Designer sherwani with intricate gold embroidery, size 40', 'Mumbai', 35000, 2500, 3, 7, 0, 'like-new', 'listed'),
        ($1, 'Kundan Jewelry Set', 'Wedding', 'Jewelry', 'Complete bridal jewelry set with necklace, earrings, maang tikka', 'Mumbai', 25000, 2000, 2, 5, 1, 'good', 'listed'),
        ($1, 'Wedding Backdrop Decoration', 'Wedding', 'Decorations', 'Complete backdrop setup for photoshoot, floral theme', 'Delhi', 15000, 1500, 1, 3, 1, 'good', 'listed')
      `, [user2Id]);

      console.log('✅ Sample wedding items created');
    }

    // Create seller user
    const sellerResult = await pool.query(`
      INSERT INTO users (name, email, password_hash, role, phone_number, verified)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, ['Vikram Wedding Rentals', 'seller@test.com', hashPassword('password123'), 'seller', '9876543213', true]);

    if (sellerResult.rows.length > 0) {
      const sellerId = sellerResult.rows[0].id;

      // Create seller profile
      await pool.query(`
        INSERT INTO seller_profiles (user_id, store_name, store_description, categories, location, verified)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [sellerId, 'Vikram Wedding Rentals', 'Premium wedding attire and accessories for rent. Serving customers since 2015.', ['Wedding'], 'Mumbai', true]);

      // Create seller inventory items (these will be visible to appusers)
      await pool.query(`
        INSERT INTO items (owner_id, name, category, subcategory, description, location, expected_price, rental_price_per_day, rental_days_min, rental_days_max, stock_quantity, available_quantity, age, condition, status)
        VALUES 
        ($1, 'Premium Wedding Sherwani Collection', 'Wedding', 'Groom Wear', 'Exclusive designer sherwani collection with multiple styles', 'Mumbai', 40000, 2000, 2, 7, 5, 5, 0, 'new', 'listed'),
        ($1, 'Bridal Lehenga - Designer Collection', 'Wedding', 'Bridal Wear', 'Heavy embroidered designer lehengas in various colors', 'Mumbai', 60000, 3500, 3, 7, 3, 3, 0, 'new', 'listed'),
        ($1, 'Riding Helmet - Full Face ISI', 'Riding Accessories', 'Helmets', 'ISI certified full face helmets, multiple sizes available', 'Mumbai', 4000, 150, 1, 30, 10, 10, 0, 'new', 'listed'),
        ($1, 'Wedding Decoration Package', 'Wedding', 'Decorations', 'Complete wedding stage decoration with lights and flowers', 'Mumbai', 50000, 5000, 1, 3, 2, 2, 1, 'like-new', 'listed')
      `, [sellerId]);

      console.log('✅ Seller profile and inventory created');
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nTest Credentials:');
    console.log('==================');
    console.log('Admin:    admin@chaarpaisa.com / admin123');
    console.log('App User 1: rajesh@test.com / password123 (Riding Accessories)');
    console.log('App User 2: priya@test.com / password123 (Wedding Items)');
    console.log('Seller:   seller@test.com / password123');
    console.log('\nOTP for development: 123456');
    console.log('\nCategories:');
    console.log('- Riding Accessories (Helmets, Riding Gear, Bike Accessories)');
    console.log('- Wedding (Bridal Wear, Groom Wear, Jewelry, Decorations)');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

seed().then(() => {
  console.log('\n✅ Seed completed successfully');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Seed failed:', error);
  process.exit(1);
});
