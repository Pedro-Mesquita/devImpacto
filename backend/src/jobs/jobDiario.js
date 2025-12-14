// Job diário que roda às 23h
// Atualiza estoque, recalcula preços e marca produtos em alerta

// REMOVA imports mock:
/// const { findLoteById } = require('../repositories/loteRepository');
/// const { obterEstoqueAtualizado, atualizarEstoqueMockado } = require('../repositories/estoqueRepository');
/// const { obterConfigCliente, obterTodasConfiguracoes } = require('../models/ClienteConfiguracao');
/// const { atualizarStatusLote, obterStatusLote } = require('../repositories/loteStatusRepository');
/// const { avaliarStatusLote } = require('../services/processamentoDiarioService');

// USE o repository do Supabase:
const {
  getClientes,
  getClienteConfiguracao,
  getLotesByCliente,
  getEstoqueLote,
  atualizarStatusLote,          // atualiza lotes.status no banco
  inserirStatusHistorico,       // opcional: registra histórico
} = require('../repository/processamentoDiarioRepository');

const { calcularPrecoDinamicoComMercado } = require('../services/precoDinamicoService');

/**
 * Job diário: executa às 23h
 * 1. Busca vendas do dia
 * 2. Atualiza estoque (diminui quantidadeRestante)
 * 3. Recalcula preço dinâmico
 * 4. Avalia regras do cliente
 * 5. Atualiza status no banco (normal/alerta/distribuição/crítico)
 * 6. Retorna relatório de mudanças
 */
async function executarJobDiario() {
  const dataExecucao = new Date().toISOString();

  const clientes = await getClientes();
  const relatorios = [];

  for (const cliente of clientes) {
    const clienteId = cliente.id;
    const config = await getClienteConfiguracao(clienteId);
    const lotes = await getLotesByCliente(clienteId);

    const relatorio = {
      clienteId,
      nomeCliente: cliente.nome,
      dataProcessamento: dataExecucao,
      lotesProcessados: [],
      mudancasDeStatus: [],
      resumo: { total: 0, passaramParaAlerta: 0, voltaramParaNormal: 0 },
    };

    for (const lote of lotes) {
      const estoque = await getEstoqueLote(lote.id);
      if (!estoque) continue;

      const metrics = {
        totalEstoque: estoque.quantidade_inicial,
        vendidoDesdeEntrada: estoque.vendido_total,
      };

      const calc = calcularPrecoDinamicoComMercado(
        {
          id: lote.id,
          nomeProduto: lote.nome_produto,
          dataValidade: lote.data_validade,
          precoBase: Number(lote.preco_base),
        },
        metrics
      );

      // Calculate shelf life metrics
      // 1. Total shelf life (harvest to expiry)
      const validadeTotalDias = lote.data_colheita
        ? Math.ceil((new Date(lote.data_validade) - new Date(lote.data_colheita)) / (24*60*60*1000))
        : Math.ceil((new Date(lote.data_validade) - new Date()) / (24*60*60*1000));

      // 2. Days remaining until expiry (from today)
      const diasFaltamParaVencer = Math.max(0, Math.ceil((new Date(lote.data_validade) - new Date()) / (24*60*60*1000)));

      // 3. Days elapsed since harvest (from harvest to today, or 0 if no harvest date)
      const diasDesdeColheita = lote.data_colheita
        ? Math.max(0, Math.ceil((new Date() - new Date(lote.data_colheita)) / (24*60*60*1000)))
        : 0;

      // 4. Percentage of shelf life consumed
      const percentualUsado = validadeTotalDias > 0 ? ((diasDesdeColheita / validadeTotalDias) * 100) : 0;

      // Decision: if > 50% consumed, mark as alerta
      const novoStatus = percentualUsado > 50 ? 'alerta' : 'normal';

      if (lote.status !== novoStatus) {
        await atualizarStatusLote(lote.id, novoStatus, calc.precoAtualizado); // UPDATE lotes.status + preco_sugerido
        await inserirStatusHistorico(
          lote.id,
          lote.status,
          novoStatus,
          `Percentual usado: ${percentualUsado.toFixed(2)}%, dias restantes: ${diasFaltamParaVencer}`
        );
        relatorio.mudancasDeStatus.push({
          loteId: lote.id,
          nomeProduto: lote.nome_produto,
          statusAnterior: lote.status,
          statusNovo: novoStatus,
          motivo: `Percentual usado: ${percentualUsado.toFixed(2)}%, dias restantes: ${diasFaltamParaVencer}`,
        });
        if (novoStatus === 'alerta') relatorio.resumo.passaramParaAlerta++;
        if (novoStatus === 'normal') relatorio.resumo.voltaramParaNormal++;
      }

      relatorio.lotesProcessados.push({
        loteId: lote.id,
        nomeProduto: lote.nome_produto,
        precoBase: Number(lote.preco_base),
        precoAtualizado: calc.precoAtualizado,
        validadeTotalDias,
        diasFaltamParaVencer,
        diasDesdeColheita,
        percentualUsado: Number(percentualUsado.toFixed(2)),
        statusAtual: novoStatus,
        descontoTotal: Number(((1 - calc.precoAtualizado / Number(lote.preco_base)) * 100).toFixed(2)),
      });

      relatorio.resumo.total++;
    }

    relatorios.push(relatorio);
  }

  const resultado = {
    sucesso: true,
    dataExecucao,
    totalClientesProcessados: relatorios.length,
    relatorios,
  };

  return resultado;
}

module.exports = { executarJobDiario };
