/**
 * Rotas para predições de IA
 * Endpoints para calcular probabilidade de venda e desconto ideal
 */

const express = require('express');
const router = express.Router();
const predictController = require('../controllers/predictController');

// POST /api/predict
// Faz predição para um único produto
router.post('/', predictController.fazerPredicao);

// POST /api/predict/batch
// Faz predição para múltiplos produtos de uma vez
router.post('/batch', predictController.fazerPredicaoEmLote);

// GET /api/predict/status
// Verifica status do modelo de IA
router.get('/status', predictController.obterStatus);

module.exports = router;
