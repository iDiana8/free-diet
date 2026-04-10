CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  height_cm NUMERIC(10, 2),
  weight_kg NUMERIC(10, 2),
  age_years INTEGER,
  target_calories NUMERIC(10, 2) NOT NULL DEFAULT 2000,
  target_protein NUMERIC(10, 2) NOT NULL DEFAULT 120,
  target_fat NUMERIC(10, 2) NOT NULL DEFAULT 70,
  target_carbs NUMERIC(10, 2) NOT NULL DEFAULT 220,
  target_water_ml NUMERIC(10, 2) NOT NULL DEFAULT 2000,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nutrition_products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  name_normalized TEXT,
  product_kind TEXT NOT NULL CHECK (product_kind IN ('food', 'drink', 'water')),
  unit_label TEXT NOT NULL,
  base_amount NUMERIC(10, 2) NOT NULL CHECK (base_amount > 0),
  calories NUMERIC(10, 2) NOT NULL CHECK (calories >= 0),
  protein NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (protein >= 0),
  fat NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (fat >= 0),
  carbs NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (carbs >= 0),
  allowed_sections TEXT[] NOT NULL,
  created_by_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_records (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE daily_records ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE daily_records ALTER COLUMN record_date SET NOT NULL;
ALTER TABLE daily_records ALTER COLUMN note SET DEFAULT '';

ALTER TABLE users ADD COLUMN IF NOT EXISTS target_calories NUMERIC(10, 2) NOT NULL DEFAULT 2000;
ALTER TABLE users ADD COLUMN IF NOT EXISTS target_protein NUMERIC(10, 2) NOT NULL DEFAULT 120;
ALTER TABLE users ADD COLUMN IF NOT EXISTS target_fat NUMERIC(10, 2) NOT NULL DEFAULT 70;
ALTER TABLE users ADD COLUMN IF NOT EXISTS target_carbs NUMERIC(10, 2) NOT NULL DEFAULT 220;
ALTER TABLE users ADD COLUMN IF NOT EXISTS target_water_ml NUMERIC(10, 2) NOT NULL DEFAULT 2000;
ALTER TABLE users ADD COLUMN IF NOT EXISTS height_cm NUMERIC(10, 2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(10, 2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS age_years INTEGER;
ALTER TABLE nutrition_products ADD COLUMN IF NOT EXISTS name_normalized TEXT;
ALTER TABLE nutrition_products ADD COLUMN IF NOT EXISTS created_by_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE nutrition_products ALTER COLUMN protein SET DEFAULT 0;
ALTER TABLE nutrition_products ALTER COLUMN fat SET DEFAULT 0;
ALTER TABLE nutrition_products ALTER COLUMN carbs SET DEFAULT 0;

UPDATE nutrition_products
SET name_normalized = LOWER(REGEXP_REPLACE(REPLACE(name, 'ё', 'е'), '[^[:alnum:]%]+', ' ', 'g'))
WHERE name_normalized IS NULL OR BTRIM(name_normalized) = '';

CREATE UNIQUE INDEX IF NOT EXISTS nutrition_products_unique_name_per_owner
ON nutrition_products (name_normalized, COALESCE(created_by_user_id, 0));

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'daily_records_record_date_key'
  ) THEN
    ALTER TABLE daily_records DROP CONSTRAINT daily_records_record_date_key;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'daily_records_user_id_record_date_key'
  ) THEN
    ALTER TABLE daily_records ADD CONSTRAINT daily_records_user_id_record_date_key UNIQUE (user_id, record_date);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS daily_entries (
  id SERIAL PRIMARY KEY,
  daily_record_id INTEGER NOT NULL REFERENCES daily_records(id) ON DELETE CASCADE,
  section_key TEXT NOT NULL CHECK (section_key IN ('breakfast', 'lunch', 'dinner', 'snacks', 'water', 'drinks')),
  product_id INTEGER NOT NULL REFERENCES nutrition_products(id),
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_health_metrics (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  blood_sugar_level NUMERIC(10, 2),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, record_date)
);
