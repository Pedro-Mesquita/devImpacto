const express = require('express');
const router = express.Router({ mergeParams: true });
const { getVendidoTotalCliente, getQuantidadeInicialCliente } = require('../controllers/estoqueController');

// GET /api/clientes/:clienteId/estoque/vendido-total
router.get('/vendido-total', getVendidoTotalCliente);
router.get('/quantidade-inicial-total', getQuantidadeInicialCliente);

module.exports = router;
