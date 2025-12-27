-- Add rental pricing and restrictions to items table
ALTER TABLE items ADD COLUMN IF NOT EXISTS price_per_day DECIMAL(10, 2);
ALTER TABLE items ADD COLUMN IF NOT EXISTS price_per_week DECIMAL(10, 2);
ALTER TABLE items ADD COLUMN IF NOT EXISTS price_per_month DECIMAL(10, 2);
ALTER TABLE items ADD COLUMN IF NOT EXISTS min_rental_days INTEGER DEFAULT 1;
ALTER TABLE items ADD COLUMN IF NOT EXISTS max_rental_days INTEGER DEFAULT 30;
ALTER TABLE items ADD COLUMN IF NOT EXISTS rental_available BOOLEAN DEFAULT true;
ALTER TABLE items ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES users(id);

-- Update existing items with default pricing
UPDATE items SET 
  price_per_day = expected_price / 30,
  price_per_week = expected_price / 4,
  price_per_month = expected_price
WHERE price_per_day IS NULL;
