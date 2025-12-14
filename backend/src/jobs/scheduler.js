// Scheduler para rodar job diário às 23h usando node-cron

const cron = require('node-cron');
const { executarJobDiario } = require('./jobDiario');

// Variável global para armazenar última execução
let ultimaExecucaoJob = null;
let jobEmExecucao = false;

/**
 * Agenda job para rodar todos os dias às 23:00
 * Formato cron: minuto hora * * *
 * 0 23 * * * = 23:00 todos os dias
 */
function agendar() {
  const tarefa = cron.schedule('0 23 * * *', async () => {
    if (jobEmExecucao) {
      console.warn('[JOB] Job anterior ainda em execução, pulando...');
      return;
    }

    try {
      jobEmExecucao = true;
      console.log('[JOB] Iniciando execução programada às 23h...');
      
      const resultado = await executarJobDiario();
      ultimaExecucaoJob = {
        dataExecucao: resultado.dataExecucao,
        status: 'sucesso',
        totalClientesProcessados: resultado.totalClientesProcessados,
        relatorios: resultado.relatorios,
      };

      console.log('[JOB] Execução bem-sucedida');
    } catch (err) {
      console.error('[JOB] Erro na execução:', err);
      ultimaExecucaoJob = {
        dataExecucao: new Date().toISOString(),
        status: 'erro',
        erro: err.message,
      };
    } finally {
      jobEmExecucao = false;
    }
  });

  console.log('[SCHEDULER] Job diário agendado para rodar às 23:00 todos os dias');
  return tarefa;
}

/**
 * Executa job manualmente (útil para testes)
 */
async function executarManualmente() {
  if (jobEmExecucao) {
    return { erro: 'Job já está em execução' };
  }

  try {
    jobEmExecucao = true;
    const resultado = await executarJobDiario();
    ultimaExecucaoJob = {
      dataExecucao: resultado.dataExecucao,
      status: 'sucesso',
      totalClientesProcessados: resultado.totalClientesProcessados,
      relatorios: resultado.relatorios,
    };
    return resultado;
  } catch (err) {
    console.error('[JOB] Erro na execução manual:', err);
    ultimaExecucaoJob = {
      dataExecucao: new Date().toISOString(),
      status: 'erro',
      erro: err.message,
    };
    throw err;
  } finally {
    jobEmExecucao = false;
  }
}

/**
 * Retorna informações da última execução
 */
function obterUltimaExecucao() {
  return ultimaExecucaoJob || { mensagem: 'Nenhuma execução ainda' };
}

/**
 * Retorna status atual do job
 */
function obterStatusJob() {
  return {
    jobEmExecucao,
    ultimaExecucao: ultimaExecucaoJob,
    agendadoPara: '23:00 todos os dias',
  };
}

module.exports = {
  agendar,
  executarManualmente,
  obterUltimaExecucao,
  obterStatusJob,
};
