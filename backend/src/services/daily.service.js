const { createEmptyEntriesMap, buildDashboard, groupEntries } = require('./nutrition.service');

async function getProducts(pool) {
  const result = await pool.query(`
    SELECT
      id,
      name,
      product_kind,
      unit_label,
      base_amount,
      calories,
      protein,
      fat,
      carbs,
      allowed_sections
    FROM nutrition_products
    ORDER BY name ASC
  `);

  return result.rows;
}

async function getUserTargets(pool, userId) {
  const result = await pool.query(
    `
      SELECT
        target_calories AS calories,
        target_protein AS protein,
        target_fat AS fat,
        target_carbs AS carbs,
        target_water_ml AS water_ml
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [userId],
  );

  return result.rows[0] || null;
}

async function getDailyRecord(pool, userId, date) {
  const result = await pool.query(
    'SELECT id, record_date, note FROM daily_records WHERE user_id = $1 AND record_date = $2 LIMIT 1',
    [userId, date],
  );

  return result.rows[0] || null;
}

async function getEntries(pool, dailyRecordId) {
  if (!dailyRecordId) {
    return [];
  }

  const result = await pool.query(
    `
      SELECT id, section_key, product_id, amount
      FROM daily_entries
      WHERE daily_record_id = $1
      ORDER BY id ASC
    `,
    [dailyRecordId],
  );

  return result.rows;
}

async function getHealthMetrics(pool, userId, date) {
  const result = await pool.query(
    `
      SELECT blood_pressure_systolic, blood_pressure_diastolic, blood_sugar_level
      FROM daily_health_metrics
      WHERE user_id = $1 AND record_date = $2
      LIMIT 1
    `,
    [userId, date],
  );

  const metrics = result.rows[0];

  if (!metrics) {
    return {
      blood_pressure_systolic: null,
      blood_pressure_diastolic: null,
      blood_sugar_level: null,
    };
  }

  return {
    blood_pressure_systolic:
      metrics.blood_pressure_systolic === null ? null : Number(metrics.blood_pressure_systolic),
    blood_pressure_diastolic:
      metrics.blood_pressure_diastolic === null ? null : Number(metrics.blood_pressure_diastolic),
    blood_sugar_level:
      metrics.blood_sugar_level === null ? null : Number(metrics.blood_sugar_level),
  };
}

function createProductsById(products) {
  const productsById = {};

  for (const product of products) {
    productsById[product.id] = {
      ...product,
      base_amount: Number(product.base_amount),
      calories: Number(product.calories),
      protein: Number(product.protein),
      fat: Number(product.fat),
      carbs: Number(product.carbs),
    };
  }

  return productsById;
}

async function getDailyPayload(pool, userId, date) {
  const [products, targets, dailyRecord, healthMetrics] = await Promise.all([
    getProducts(pool),
    getUserTargets(pool, userId),
    getDailyRecord(pool, userId, date),
    getHealthMetrics(pool, userId, date),
  ]);

  const entries = await getEntries(pool, dailyRecord?.id);
  const productsById = createProductsById(products);
  const dashboard = buildDashboard(entries, productsById, targets);

  return {
    date,
    note: dailyRecord?.note || '',
    products,
    entries: groupEntries(entries, productsById),
    health_metrics: healthMetrics,
    dashboard,
  };
}

async function saveDailyPayload(pool, userId, date, payload) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const dailyRecordResult = await client.query(
      `
        INSERT INTO daily_records (user_id, record_date, note)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, record_date)
        DO UPDATE SET note = EXCLUDED.note, updated_at = NOW()
        RETURNING id
      `,
      [userId, date, payload.note.trim()],
    );

    const dailyRecordId = dailyRecordResult.rows[0].id;

    await client.query('DELETE FROM daily_entries WHERE daily_record_id = $1', [dailyRecordId]);

    for (const entry of payload.entries) {
      await client.query(
        `
          INSERT INTO daily_entries (daily_record_id, section_key, product_id, amount)
          VALUES ($1, $2, $3, $4)
        `,
        [dailyRecordId, entry.section_key, entry.product_id, entry.amount],
      );
    }

    await client.query(
      `
        INSERT INTO daily_health_metrics (
          user_id,
          record_date,
          blood_pressure_systolic,
          blood_pressure_diastolic,
          blood_sugar_level,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, NOW())
        ON CONFLICT (user_id, record_date)
        DO UPDATE SET
          blood_pressure_systolic = EXCLUDED.blood_pressure_systolic,
          blood_pressure_diastolic = EXCLUDED.blood_pressure_diastolic,
          blood_sugar_level = EXCLUDED.blood_sugar_level,
          updated_at = NOW()
      `,
      [
        userId,
        date,
        payload.health_metrics?.blood_pressure_systolic ?? null,
        payload.health_metrics?.blood_pressure_diastolic ?? null,
        payload.health_metrics?.blood_sugar_level ?? null,
      ],
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  return getDailyPayload(pool, userId, date);
}

async function getCatalogPayload(pool, userId) {
  const [products, targets] = await Promise.all([getProducts(pool), getUserTargets(pool, userId)]);

  return {
    products,
    targets,
    entries: createEmptyEntriesMap(),
  };
}

module.exports = {
  getDailyPayload,
  saveDailyPayload,
  getCatalogPayload,
};
