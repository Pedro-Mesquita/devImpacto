const express = require('express');
const { getProdutos, getProdutosByCliente, createProdutoComLote } = require('../controllers/produtoController');
const { getLotesByCliente } = require('../controllers/loteController');

const router = express.Router();

router.get('/produtos', getProdutos);
router.get('/clientes/:clienteId/produtos', getProdutosByCliente);
router.get('/clientes/:clienteId/lotes', getLotesByCliente);
router.post('/produtos', createProdutoComLote);

module.exports = router;
