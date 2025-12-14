// Controller para monitorar e testar o job diário

const { executarManualmente, obterUltimaExecucao, obterStatusJob } = require('../jobs/scheduler');

/**
 * GET /jobs/status
 * Retorna status do job diário (agendado, última execução, etc.)
 */
async function obterStatusJobHandler(req, res) {
  try {
    const status = obterStatusJob();
    return res.json(status);
  } catch (err) {
    console.error('Erro ao obter status:', err);
    return res.status(500).json({ erro: 'Erro ao obter status' });
  }
}

/**
 * GET /jobs/ultima-execucao
 * Retorna detalhes da última execução do job
 */
async function obterUltimaExecucaoHandler(req, res) {
  try {
    const execucao = obterUltimaExecucao();
    return res.json(execucao);
  } catch (err) {
    console.error('Erro ao obter última execução:', err);
    return res.status(500).json({ erro: 'Erro ao obter execução' });
  }
}

/**
 * POST /jobs/executar-agora
 * Executa job manualmente (útil para testes/debug)
 */
async function executarJobAgora(req, res) {
  try {
    console.log('[API] Iniciando execução manual do job...');
    const resultado = await executarManualmente();
    return res.json({
      mensagem: 'Job executado com sucesso',
      ...resultado,
    });
  } catch (err) {
    console.error('[API] Erro na execução manual:', err);
    return res.status(500).json({ 
      erro: 'Erro ao executar job',
      detalhes: err.message,
    });
  }
}

module.exports = {
  obterStatusJobHandler,
  obterUltimaExecucaoHandler,
  executarJobAgora,
};
