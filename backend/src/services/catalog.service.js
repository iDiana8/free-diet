const seedProducts = require('../data/nutrition-products.json');
const { normalizeProductName, buildProductConfigBySection } = require('../lib/product-catalog');
const { createRequestError } = require('../lib/errors');

const manualSeedProducts = [
  {
    name: 'Вода',
    product_kind: 'water',
    unit_label: 'мл',
    base_amount: 100,
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    allowed_sections: ['water'],
  },
  {
    name: 'Минеральная вода',
    product_kind: 'water',
    unit_label: 'мл',
    base_amount: 100,
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    allowed_sections: ['water'],
  },
];

function buildSeedProducts() {
  return [...manualSeedProducts, ...seedProducts].map((product) => ({
    ...product,
    name_normalized: normalizeProductName(product.name),
  }));
}

async function ensureNutritionProductsSchema(client) {
  await client.query(`
    ALTER TABLE nutrition_products
    ADD COLUMN IF NOT EXISTS name_normalized TEXT
  `);

  await client.query(`
    ALTER TABLE nutrition_products
    ADD COLUMN IF NOT EXISTS created_by_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
  `);

  await client.query(`
    ALTER TABLE nutrition_products
    ALTER COLUMN protein SET DEFAULT 0,
    ALTER COLUMN fat SET DEFAULT 0,
    ALTER COLUMN carbs SET DEFAULT 0
  `);

  await client.query(`
    UPDATE nutrition_products
    SET name_normalized = LOWER(REGEXP_REPLACE(REPLACE(name, 'ё', 'е'), '[^[:alnum:]%]+', ' ', 'g'))
    WHERE name_normalized IS NULL OR BTRIM(name_normalized) = ''
  `);

  await client.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS nutrition_products_unique_name_per_owner
    ON nutrition_products (name_normalized, COALESCE(created_by_user_id, 0))
  `);
}

async function syncNutritionCatalog(pool) {
  const client = await pool.connect();
  const products = buildSeedProducts();

  try {
    await client.query('BEGIN');
    await ensureNutritionProductsSchema(client);

    for (const product of products) {
      await client.query(
        `
          INSERT INTO nutrition_products (
            name,
            name_normalized,
            product_kind,
            unit_label,
            base_amount,
            calories,
            protein,
            fat,
            carbs,
            allowed_sections
          )
          SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
          WHERE NOT EXISTS (
            SELECT 1
            FROM nutrition_products
            WHERE name_normalized = $2
              AND created_by_user_id IS NULL
          )
        `,
        [
          product.name,
          product.name_normalized,
          product.product_kind,
          product.unit_label,
          product.base_amount,
          product.calories,
          product.protein,
          product.fat,
          product.carbs,
          product.allowed_sections,
        ],
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function getProducts(pool, userId) {
  const result = await pool.query(
    `
      SELECT
        id,
        name,
        name_normalized,
        product_kind,
        unit_label,
        base_amount,
        calories,
        protein,
        fat,
        carbs,
        allowed_sections,
        created_by_user_id
      FROM nutrition_products
      WHERE created_by_user_id IS NULL OR created_by_user_id = $1
      ORDER BY name ASC
    `,
    [userId],
  );

  return result.rows;
}

async function createUserProduct(pool, userId, payload) {
  const normalizedName = normalizeProductName(payload.name);
  const productConfig = buildProductConfigBySection(payload.section_key);

  const existingProductResult = await pool.query(
    `
      SELECT id
      FROM nutrition_products
      WHERE name_normalized = $1
        AND (created_by_user_id IS NULL OR created_by_user_id = $2)
      LIMIT 1
    `,
    [normalizedName, userId],
  );

  if (existingProductResult.rows[0]) {
    throw createRequestError('Такой продукт уже есть в каталоге. Выберите его из списка.');
  }

  const result = await pool.query(
    `
      INSERT INTO nutrition_products (
        name,
        name_normalized,
        product_kind,
        unit_label,
        base_amount,
        calories,
        protein,
        fat,
        carbs,
        allowed_sections,
        created_by_user_id
      )
      VALUES ($1, $2, $3, $4, 100, $5, $6, $7, $8, $9, $10)
      RETURNING
        id,
        name,
        name_normalized,
        product_kind,
        unit_label,
        base_amount,
        calories,
        protein,
        fat,
        carbs,
        allowed_sections,
        created_by_user_id
    `,
    [
      payload.name.trim(),
      normalizedName,
      productConfig.product_kind,
      productConfig.unit_label,
      payload.calories,
      payload.protein ?? 0,
      payload.fat ?? 0,
      payload.carbs ?? 0,
      productConfig.allowed_sections,
      userId,
    ],
  );

  return result.rows[0];
}

module.exports = {
  syncNutritionCatalog,
  getProducts,
  createUserProduct,
};
