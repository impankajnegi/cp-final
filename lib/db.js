import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
});

export default pool;

// Initialize database schema
export async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // Create ENUM types
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('appusers', 'seller', 'admin');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE item_status AS ENUM ('listed', 'accepted', 'locked', 'rented');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE offer_status AS ENUM ('pending', 'countered', 'accepted', 'rejected', 'locked');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role user_role NOT NULL DEFAULT 'renter',
        phone_number VARCHAR(20),
        verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create seller_profiles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS seller_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        store_name VARCHAR(255) NOT NULL,
        store_description TEXT,
        store_image TEXT,
        store_video TEXT,
        categories TEXT[],
        location VARCHAR(255),
        verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        location VARCHAR(255),
        expected_price DECIMAL(10, 2) NOT NULL,
        rental_price_per_day DECIMAL(10, 2),
        rental_days_min INTEGER,
        rental_days_max INTEGER,
        age INTEGER,
        condition VARCHAR(50),
        status item_status DEFAULT 'listed',
        barcode TEXT,
        images TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create offers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS offers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        item_id UUID REFERENCES items(id) ON DELETE CASCADE,
        seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
        owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
        offer_price DECIMAL(10, 2) NOT NULL,
        counter_price DECIMAL(10, 2),
        status offer_status DEFAULT 'pending',
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        offer_id UUID REFERENCES offers(id) ON DELETE CASCADE,
        sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create rentals table
    await client.query(`
      CREATE TABLE IF NOT EXISTS rentals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        item_id UUID REFERENCES items(id) ON DELETE CASCADE,
        renter_id UUID REFERENCES users(id) ON DELETE CASCADE,
        owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
        rental_price DECIMAL(10, 2) NOT NULL,
        payment_id TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        otp_verified BOOLEAN DEFAULT false,
        start_date DATE,
        end_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_items_owner ON items(owner_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_items_status ON items(status)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_items_category ON items(category)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_offers_item ON offers(item_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_offers_seller ON offers(seller_id)`);

    console.log('✅ Database schema initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}
