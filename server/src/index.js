require('dotenv').config();
const express = require('express');
const cors = require('cors');

if (!process.env.DATABASE_URL) {
  console.error('FATAL: DATABASE_URL environment variable is not set');
  process.exit(1);
}
if (!process.env.CORS_ORIGIN) {
  console.error('FATAL: CORS_ORIGIN environment variable is not set');
  process.exit(1);
}

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());

// Routes
app.use('/api/game-types',    require('./routes/gameTypes'));
app.use('/api/manufacturers', require('./routes/manufacturers'));
app.use('/api/games',         require('./routes/games'));
app.use('/api/players',       require('./routes/players'));
app.use('/api/sessions',      require('./routes/sessions'));
app.use('/api/stats',         require('./routes/stats'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;

// Only start listening when not in test mode
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Chuck Us the Meeples API running on port ${PORT}`);
  });
}

module.exports = app;
