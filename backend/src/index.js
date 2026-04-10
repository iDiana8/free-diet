const app = require('./app');
const pool = require('./db');
const { getConfig } = require('./lib/config');
const { syncNutritionCatalog } = require('./services/catalog.service');

const config = getConfig();

async function startServer() {
  try {
    await syncNutritionCatalog(pool);

    app.listen(config.port, () => {
      console.log(`Free Diet API started on http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error('Не удалось подготовить каталог продуктов', error);
    process.exit(1);
  }
}

startServer();
