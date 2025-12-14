const express = require('express');
const router = express.Router();
const { listAlertLotes } = require('../controllers/ngoOffersController');

// GET /api/lotes/alerta
router.get('/lotes/alerta', listAlertLotes);

module.exports = router;
