CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
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
  product_kind TEXT NOT NULL CHECK (product_kind IN ('food', 'drink', 'water')),
  unit_label TEXT NOT NULL,
  base_amount NUMERIC(10, 2) NOT NULL CHECK (base_amount > 0),
  calories NUMERIC(10, 2) NOT NULL CHECK (calories >= 0),
  protein NUMERIC(10, 2) NOT NULL CHECK (protein >= 0),
  fat NUMERIC(10, 2) NOT NULL CHECK (fat >= 0),
  carbs NUMERIC(10, 2) NOT NULL CHECK (carbs >= 0),
  allowed_sections TEXT[] NOT NULL,
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

INSERT INTO nutrition_products (name, product_kind, unit_label, base_amount, calories, protein, fat, carbs, allowed_sections)
SELECT *
FROM (
  VALUES
    ('Овсяная каша', 'food', 'г', 100, 88, 3.0, 1.7, 15.0, ARRAY['breakfast', 'snacks']),
    ('Омлет', 'food', 'г', 100, 154, 11.0, 11.0, 2.0, ARRAY['breakfast', 'lunch']),
    ('Гречка', 'food', 'г', 100, 110, 4.2, 1.1, 21.3, ARRAY['lunch', 'dinner']),
    ('Куриная грудка', 'food', 'г', 100, 165, 31.0, 3.6, 0.0, ARRAY['lunch', 'dinner']),
    ('Творог 5%', 'food', 'г', 100, 121, 17.0, 5.0, 1.8, ARRAY['breakfast', 'snacks']),
    ('Банан', 'food', 'г', 100, 89, 1.1, 0.3, 22.8, ARRAY['breakfast', 'snacks']),
    ('Овощной салат', 'food', 'г', 100, 45, 1.5, 2.1, 6.5, ARRAY['lunch', 'dinner']),
    ('Суп овощной', 'food', 'г', 100, 38, 1.2, 1.0, 5.6, ARRAY['lunch', 'dinner']),
    ('Орехи', 'food', 'г', 100, 610, 20.0, 53.0, 11.0, ARRAY['snacks']),
    ('Йогурт натуральный', 'food', 'г', 100, 63, 5.0, 2.0, 7.0, ARRAY['breakfast', 'snacks']),
    ('Вода', 'water', 'мл', 100, 0, 0, 0, 0, ARRAY['water']),
    ('Минеральная вода', 'water', 'мл', 100, 0, 0, 0, 0, ARRAY['water']),
    ('Чай без сахара', 'drink', 'мл', 100, 1, 0, 0, 0.2, ARRAY['drinks']),
    ('Кофе американо', 'drink', 'мл', 100, 2, 0.2, 0.1, 0.0, ARRAY['drinks']),
    ('Апельсиновый сок', 'drink', 'мл', 100, 45, 0.7, 0.2, 10.4, ARRAY['drinks'])
) AS source (name, product_kind, unit_label, base_amount, calories, protein, fat, carbs, allowed_sections)
WHERE NOT EXISTS (SELECT 1 FROM nutrition_products);
