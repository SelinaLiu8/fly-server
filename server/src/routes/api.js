const express = require('express');
const router = express.Router();
const crisprController = require('../controllers/controller');

// Example: GET /api/gene/:name
router.get('/gene/:name', crisprController.getGene);