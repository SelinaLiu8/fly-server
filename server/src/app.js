const express = require('express');
const cors = require('cors');

// Import routes
const apiRouter = require('./routes');  // routes/index.js

// Import global error handler (placeholder for now)
const { errorHandler } = require('./utils/errorHandler');

const app = express();

// Middleware
app.use(cors());             // Enable CORS
app.use(express.json());      // Parse JSON bodies

// Routes
app.use('/api', apiRouter);  // All routes mounted under /api

// Global error handler
app.use(errorHandler);       // Will catch errors from controllers

module.exports = app;