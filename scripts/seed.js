// Seed script for Chaarpaisa database
import pool from '../lib/db.js';
import { hashPassword } from '../lib/auth.js';

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

    // Create owner user
    const ownerResult = await pool.query(`
      INSERT INTO users (name, email, password_hash, role, phone_number, verified)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, ['John Owner', 'owner@test.com', hashPassword('password123'), 'owner', '9876543211', true]);

    if (ownerResult.rows.length > 0) {
      const ownerId = ownerResult.rows[0].id;

      // Create sample items
      await pool.query(`
        INSERT INTO items (owner_id, name, category, description, location, expected_price, age, condition, status)
        VALUES 
        ($1, 'iPhone 13 Pro', 'Electronics', 'Excellent condition, 128GB, with original box', 'Mumbai', 50000, 1, 'like-new', 'listed'),
        ($1, 'Study Table', 'Furniture', 'Wooden study table with drawer', 'Bangalore', 3000, 2, 'good', 'listed'),
        ($1, 'Cricket Bat', 'Sports', 'Professional cricket bat, barely used', 'Delhi', 2500, 1, 'like-new', 'listed'),
        ($1, 'Power Drill', 'Tools', 'Bosch power drill with accessories', 'Pune', 4000, 3, 'good', 'listed')
      `, [ownerId]);

      console.log('✅ Sample items created');
    }

    // Create renter user
    await pool.query(`
      INSERT INTO users (name, email, password_hash, role, phone_number, verified)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
    `, ['Jane Renter', 'renter@test.com', hashPassword('password123'), 'renter', '9876543212', true]);

    console.log('✅ Renter user created');

    // Create seller user
    const sellerResult = await pool.query(`
      INSERT INTO users (name, email, password_hash, role, phone_number, verified)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, ['Bob Seller', 'seller@test.com', hashPassword('password123'), 'seller', '9876543213', true]);

    if (sellerResult.rows.length > 0) {
      const sellerId = sellerResult.rows[0].id;

      // Create seller profile
      await pool.query(`
        INSERT INTO seller_profiles (user_id, store_name, store_description, categories, location, verified)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT DO NOTHING
      `, [sellerId, 'Bob\'s Electronics Store', 'We deal in all kinds of electronics and gadgets', ['Electronics', 'Tools'], 'Mumbai', true]);

      console.log('✅ Seller profile created');
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nTest Credentials:');
    console.log('==================');
    console.log('Admin:  admin@chaarpaisa.com / admin123');
    console.log('Owner:  owner@test.com / password123');
    console.log('Renter: renter@test.com / password123');
    console.log('Seller: seller@test.com / password123');
    console.log('\nOTP for development: 123456');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await pool.end();
  }
}

seed();
