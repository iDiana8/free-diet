const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

function getNumberEnv(name, fallback) {
  const rawValue = process.env[name];

  if (!rawValue) {
    return fallback;
  }

  const parsedValue = Number(rawValue);

  if (Number.isNaN(parsedValue)) {
    throw new Error(`Invalid numeric env: ${name}`);
  }

  return parsedValue;
}

function getRequiredEnv(name, fallback) {
  const rawValue = process.env[name] || fallback;

  if (!rawValue) {
    throw new Error(`Missing env: ${name}`);
  }

  return rawValue;
}

function getConfig() {
  return {
    port: getNumberEnv('PORT', 4000),
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    authSecret: getRequiredEnv('AUTH_SECRET', 'change_me_long_random_secret'),
    db: {
      host: process.env.DB_HOST || 'localhost',
      port: getNumberEnv('DB_PORT', 5432),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'free_diet',
    },
  };
}

module.exports = {
  getConfig,
};
