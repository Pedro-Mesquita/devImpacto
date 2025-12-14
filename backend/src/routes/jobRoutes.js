// Rotas para monitorar jobs

const express = require('express');
const router = express.Router();
const {
  obterStatusJobHandler,
  obterUltimaExecucaoHandler,
  executarJobAgora,
} = require('../controllers/jobController');
const {executarJobDiario} = require('../jobs/jobDiario');

// GET /jobs/status
// Retorna status do job agendado
router.get('/status', obterStatusJobHandler);

// GET /jobs/ultima-execucao
// Retorna detalhes da última execução
router.get('/ultima-execucao', obterUltimaExecucaoHandler);

// POST /jobs/executar-agora
// Executa job manualmente (para testes)
router.post('/executar-agora', executarJobDiario);

module.exports = router;
