const { Pool } = require('pg');
const { getConfig } = require('./lib/config');

const config = getConfig();

const pool = new Pool(config.db);

module.exports = pool;
