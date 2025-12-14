const express = require('express');
const router = express.Router();
const alertaController = require('../controllers/alertaController');

// GET /api/alertas/lotes?clienteId=cliente_001
router.get('/lotes', alertaController.listarLotesEmAlerta);

module.exports = router;