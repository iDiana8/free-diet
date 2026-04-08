const express = require('express');
const cors = require('cors');
const { getConfig } = require('./lib/config');
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const catalogRoutes = require('./routes/catalog.routes');
const dailyRoutes = require('./routes/daily.routes');

const config = getConfig();
const app = express();

app.use(cors({ origin: config.clientUrl }));
app.use(express.json({ limit: '1mb' }));

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/daily', dailyRoutes);

app.use((request, response) => {
  response.status(404).json({ message: 'Маршрут не найден' });
});

module.exports = app;
