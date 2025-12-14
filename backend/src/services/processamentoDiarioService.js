// Core da aplicação: processa lotes diáriamente e dispara regras

const {
  getClienteConfiguracao,
  getLotesByCliente,
  getEstoqueLote,
  getVendaDoDia,
  atualizarStatusLote,
  inserirNotificacao,
} = require('../repository/processamentoDiarioRepository');
const { calcularPrecoDinamicoComMercado } = require('./precoDinamicoService');
const { diasEntreDatas } = require('./precoDinamicoService');

/**
 * Calcula o percentual de dias restantes em relação ao total de dias de validade
 * Exemplo: 5 dias restantes de 10 dias totais = 50%
 */
function calcularPercentualDiasRestantes(diasParaVencer, diasTotaisValidade) {
  if (diasTotaisValidade <= 0) return 0;
  return diasParaVencer / diasTotaisValidade;
}

/**
 * Determina se um lote deve ser ativado para distribuição/notificação
 * baseado na configuração do cliente
 */
function avaliarStatusLote(lote, config, calculo) {
  const diasParaVencer = calculo.diasParaVencer;
  const diasTotaisValidade = lote.validadeDias;
  const percentualDiasRestantes = calcularPercentualDiasRestantes(diasParaVencer, diasTotaisValidade);

  const regraPreco = {
    percentualDiasAtivacaoAlerta: (config.percentual_dias_alerta ?? 50) / 100,
    percentualDiasAtivacaoDistribuicao: (config.percentual_dias_distribuicao ?? 30) / 100,
    percentualDiasAtivacaoCritico: (config.percentual_dias_critico ?? 10) / 100,
  };

  let status = 'normal';
  let prioridade = 0;

  if (percentualDiasRestantes <= regraPreco.percentualDiasAtivacaoCritico) {
    status = 'critico';
    prioridade = 3;
  } else if (percentualDiasRestantes <= regraPreco.percentualDiasAtivacaoDistribuicao) {
    status = 'distribuicao';
    prioridade = 2;
  } else if (percentualDiasRestantes <= regraPreco.percentualDiasAtivacaoAlerta) {
    status = 'alerta';
    prioridade = 1;
  }

  return {
    status,
    prioridade,
    percentualDiasRestantes: Number((percentualDiasRestantes * 100).toFixed(2)),
    ativarDistribuicao: status === 'distribuicao' || status === 'critico',
    ativarNotificacao: status !== 'normal',
    aplicarPrecoSocial: status === 'critico' || status === 'distribuicao',
  };
}

/**
 * Processa todos os lotes de um cliente e retorna preços recalculados + status
 */
async function processarLotesCliente(clienteId, loteIds) {
  const config = await getClienteConfiguracao(clienteId);
  if (!config) {
    return { erro: 'Cliente não encontrado', clienteId };
  }

  const lotesCliente = await getLotesByCliente(clienteId);
  const loteSet = new Set(loteIds);
  const lotesFiltrados = lotesCliente.filter((l) => loteSet.has(l.id));

  const resultados = [];
  const lotesPorStatus = {
    normal: [],
    alerta: [],
    distribuicao: [],
    critico: [],
  };

  for (const lote of lotesFiltrados) {
    const estoque = await getEstoqueLote(lote.id);
    const hoje = new Date();
    const dataVenda = hoje.toISOString().slice(0, 10);
    const vendidoHoje = await getVendaDoDia(lote.id, dataVenda);

    const loteNormalizado = {
      id: lote.id,
      nomeProduto: '', // opcional, não usado aqui
      categoria: '',
      precoBase: lote.preco_base,
      dataValidade: lote.data_validade,
      validadeDias: (() => {
        const dc = lote.data_colheita;
        if (dc) return diasEntreDatas(lote.data_validade, dc);
        return 30; // fallback
      })(),
    };

    const metrics = {
      totalEstoque: estoque?.quantidade_inicial || 0,
      vendidoDesdeEntrada: estoque?.vendido_total || 0,
    };

    const calculo = calcularPrecoDinamicoComMercado(loteNormalizado, metrics);

    const statusLote = avaliarStatusLote(loteNormalizado, config, calculo);

    const resultado = {
      loteId: loteNormalizado.id,
      nomeProduto: loteNormalizado.nomeProduto,
      categoria: loteNormalizado.categoria,
      precoBase: loteNormalizado.precoBase,
      precoSugerido: calculo.precoAtualizado,
      diasParaVencer: calculo.diasParaVencer,
      percentualDiasRestantes: statusLote.percentualDiasRestantes,
      demanda: calculo.ofertaDemanda.avaliacao,
      descontoTotal: calculo.descontoTotal,
      vendidoHoje,
      vendidoDesdeEntrada: metrics.vendidoDesdeEntrada,
      percentualVendas: calculo.ofertaDemanda.percentualVendas,
      // Status e ações
      status: statusLote.status,
      prioridade: statusLote.prioridade,
      ativarDistribuicao: statusLote.ativarDistribuicao,
      ativarNotificacao: statusLote.ativarNotificacao,
      aplicarPrecoSocial: statusLote.aplicarPrecoSocial,
    };

    resultados.push(resultado);
    lotesPorStatus[statusLote.status].push(resultado);
  }

  return {
    clienteId,
    nomeCliente: undefined,
    processadoEm: new Date().toISOString(),
    resumo: {
      total: resultados.length,
      normal: lotesPorStatus.normal.length,
      alerta: lotesPorStatus.alerta.length,
      distribuicao: lotesPorStatus.distribuicao.length,
      critico: lotesPorStatus.critico.length,
    },
    lotesPorStatus,
    resultados,
  };
}

module.exports = { processarLotesCliente, avaliarStatusLote, calcularPercentualDiasRestantes };
