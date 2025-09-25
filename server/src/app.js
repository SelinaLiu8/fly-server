const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { db } = require('./config/index');
const pool = require('./db/db'); 
const routes = require('./routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

(async () => {
    try {
      const connection = await pool.getConnection();
      console.log(`✅ Connected to MySQL database: ${db.database}`);
      connection.release();
    } catch (err) {
      console.error('❌ Unable to connect to MySQL:', err.message);
      process.exit(1); // stop app if DB connection fails
    }
})();

app.use('/', routes);

// 404 handler for unknown routes
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// Global error handler
const { errorHandler } = require('./utils/errorHandler');
app.use(errorHandler);

module.exports = app;
