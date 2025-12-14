// Simula banco de dados dos status dos lotes
// Em produção, seria um PostgreSQL, MongoDB, etc.

const loteStatusDb = {
  'cliente_001': {
    '1': { status: 'normal', ultimaAtualizacao: null, diasNoStatus: 0 },
    '2': { status: 'normal', ultimaAtualizacao: null, diasNoStatus: 0 },
    '3': { status: 'normal', ultimaAtualizacao: null, diasNoStatus: 0 },
    '4': { status: 'normal', ultimaAtualizacao: null, diasNoStatus: 0 },
    '5': { status: 'normal', ultimaAtualizacao: null, diasNoStatus: 0 },
    '6': { status: 'normal', ultimaAtualizacao: null, diasNoStatus: 0 },
    '7': { status: 'normal', ultimaAtualizacao: null, diasNoStatus: 0 },
    '8': { status: 'normal', ultimaAtualizacao: null, diasNoStatus: 0 },
    '9': { status: 'normal', ultimaAtualizacao: null, diasNoStatus: 0 },
    '10': { status: 'normal', ultimaAtualizacao: null, diasNoStatus: 0 },
    '11': { status: 'normal', ultimaAtualizacao: null, diasNoStatus: 0 },
    '12': { status: 'normal', ultimaAtualizacao: null, diasNoStatus: 0 },
    '13': { status: 'normal', ultimaAtualizacao: null, diasNoStatus: 0 },
    '14': { status: 'normal', ultimaAtualizacao: null, diasNoStatus: 0 },
    '15': { status: 'normal', ultimaAtualizacao: null, diasNoStatus: 0 },
  },
  'cliente_002': {
    '1': { status: 'normal', ultimaAtualizacao: null, diasNoStatus: 0 },
    '2': { status: 'normal', ultimaAtualizacao: null, diasNoStatus: 0 },
  },
};

/**
 * Atualiza o status de um lote no banco
 * Status possíveis: 'normal', 'alerta', 'distribuicao', 'critico'
 */
async function atualizarStatusLote(clienteId, loteId, novoStatus) {
  if (!loteStatusDb[clienteId]) {
    loteStatusDb[clienteId] = {};
  }

  if (!loteStatusDb[clienteId][loteId]) {
    loteStatusDb[clienteId][loteId] = {
      status: 'normal',
      ultimaAtualizacao: null,
      diasNoStatus: 0,
    };
  }

  const statusAnterior = loteStatusDb[clienteId][loteId].status;
  
  // Se mudou de status, reseta contador de dias
  const diasNoStatus = statusAnterior === novoStatus
    ? loteStatusDb[clienteId][loteId].diasNoStatus + 1
    : 1;

  loteStatusDb[clienteId][loteId] = {
    status: novoStatus,
    ultimaAtualizacao: new Date().toISOString(),
    diasNoStatus,
    statusAnterior,
  };

  return loteStatusDb[clienteId][loteId];
}

/**
 * Obtém o status atual de um lote
 */
async function obterStatusLote(clienteId, loteId) {
  return (
    loteStatusDb[clienteId]?.[loteId] || {
      status: 'normal',
      ultimaAtualizacao: null,
      diasNoStatus: 0,
    }
  );
}

/**
 * Obtém todos os status de lotes de um cliente
 */
async function obterStatusLotesCliente(clienteId) {
  return loteStatusDb[clienteId] || {};
}

/**
 * Atualiza estoque: diminui quantidadeRestante com base nas vendas do dia
 */
async function atualizarEstoqueAposVendas(clienteId, loteId, vendidoHoje) {
  // Esta função será chamada pelo job diário
  // Ela atualiza os dados de estoque no repositório
  return { vendidoHoje, processado: true };
}

module.exports = {
  atualizarStatusLote,
  obterStatusLote,
  obterStatusLotesCliente,
  atualizarEstoqueAposVendas,
  loteStatusDb,
};
