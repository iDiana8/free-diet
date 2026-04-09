const { createPasswordSalt, hashPassword, createToken } = require('../lib/crypto');

function normalizeUserRow(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    height_cm: user.height_cm === null ? null : Number(user.height_cm),
    weight_kg: user.weight_kg === null ? null : Number(user.weight_kg),
    age_years: user.age_years === null ? null : Number(user.age_years),
    target_calories: Number(user.target_calories),
    target_protein: Number(user.target_protein),
    target_fat: Number(user.target_fat),
    target_carbs: Number(user.target_carbs),
    target_water_ml: Number(user.target_water_ml),
  };
}

function buildAuthResponse(user, authSecret) {
  const normalizedUser = normalizeUserRow(user);
  const token = createToken(
    {
      user_id: normalizedUser.id,
      email: normalizedUser.email,
      name: normalizedUser.name,
    },
    authSecret,
  );

  return {
    token,
    user: normalizedUser,
  };
}

async function registerUser(pool, payload, authSecret) {
  const email = payload.email.trim().toLowerCase();
  const name = payload.name.trim();
  const passwordSalt = createPasswordSalt();
  const passwordHash = hashPassword(payload.password, passwordSalt);

  const result = await pool.query(
    `
      INSERT INTO users (
        name,
        email,
        password_hash,
        password_salt,
        height_cm,
        weight_kg,
        age_years,
        target_calories,
        target_protein,
        target_fat,
        target_carbs,
        target_water_ml
      )
      VALUES ($1, $2, $3, $4, NULL, NULL, NULL, 2000, 120, 70, 220, 2000)
      RETURNING id, name, email, height_cm, weight_kg, age_years, target_calories, target_protein, target_fat, target_carbs, target_water_ml
    `,
    [name, email, passwordHash, passwordSalt],
  );

  return buildAuthResponse(result.rows[0], authSecret);
}

async function loginUser(pool, payload, authSecret) {
  const email = payload.email.trim().toLowerCase();

  const result = await pool.query(
    `
      SELECT
        id,
        name,
        email,
        password_hash,
        password_salt,
        height_cm,
        weight_kg,
        age_years,
        target_calories,
        target_protein,
        target_fat,
        target_carbs,
        target_water_ml
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [email],
  );

  const user = result.rows[0];

  if (!user) {
    return null;
  }

  const passwordHash = hashPassword(payload.password, user.password_salt);

  if (passwordHash !== user.password_hash) {
    return null;
  }

  return buildAuthResponse(user, authSecret);
}

async function getCurrentUser(pool, userId) {
  const result = await pool.query(
    `
      SELECT id, name, email, height_cm, weight_kg, age_years, target_calories, target_protein, target_fat, target_carbs, target_water_ml
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [userId],
  );

  if (!result.rows[0]) {
    return null;
  }

  return normalizeUserRow(result.rows[0]);
}

async function updateCurrentUser(pool, userId, payload) {
  const result = await pool.query(
    `
      UPDATE users
      SET
        height_cm = $2,
        weight_kg = $3,
        age_years = $4
      WHERE id = $1
      RETURNING id, name, email, height_cm, weight_kg, age_years, target_calories, target_protein, target_fat, target_carbs, target_water_ml
    `,
    [userId, payload.height_cm ?? null, payload.weight_kg ?? null, payload.age_years ?? null],
  );

  if (!result.rows[0]) {
    return null;
  }

  return normalizeUserRow(result.rows[0]);
}

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  updateCurrentUser,
};
