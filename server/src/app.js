const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');

app.use('/', routes);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // logging

// 404 handler for unknown routes
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// Global error handler
const { errorHandler } = require('./utils/errorHandler');
app.use(errorHandler);

module.exports = app;
