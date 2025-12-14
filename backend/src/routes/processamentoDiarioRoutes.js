// Rotas para processamento diário

const express = require('express');
const router = express.Router();
const { processarClientePorDia, processarTodosClientes } = require('../controllers/processamentoDiarioController');

// POST /processamento-diario/cliente/:clienteId
// Body: { loteIds: ["1", "2", "3"] }
router.post('/cliente/:clienteId', processarClientePorDia);

// POST /processamento-diario/todos
// Body: { clienteIds: ["cliente_001", "cliente_002"] } (opcional - processa todos se vazio)
router.post('/todos', processarTodosClientes);

module.exports = router;
