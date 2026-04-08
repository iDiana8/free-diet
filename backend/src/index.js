const app = require('./app');
const { getConfig } = require('./lib/config');

const config = getConfig();

app.listen(config.port, () => {
  console.log(`Free Diet API started on http://localhost:${config.port}`);
});
