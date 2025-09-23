const express = require('express');
const router = express.Router();
const Controller = require('../controllers/controller');

// Example: GET /api/gene/:name
router.get('/gene/:name', Controller.getGene);