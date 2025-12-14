const { fetchLotesWithEstoque } = require('../repository/precoDinamicoRepository');
const { calcularPrecoDinamicoComMercado } = require('../services/precoDinamicoService');

// POST /preco-dinamico
// Body: { loteIds: ["1", "2", "3"] }
// Retorna array com preço sugerido, dias para vencer, e demanda de cada lote
const aiModel = require('../ai/model'); // Importa o modelo de IA

// POST /preco-dinamico
// Body: { loteIds: ["1", "2", "3"] }
// Retorna array com preço sugerido, dias para vencer, demanda E SCORE DE IA
async function getPrecoDinamico(req, res) {
  try {
    const { loteIds } = req.body;

    if (!loteIds || !Array.isArray(loteIds) || loteIds.length === 0) {
      return res.status(400).json({ error: 'loteIds é obrigatório e deve ser um array' });
    }
    const registros = await fetchLotesWithEstoque(loteIds);
    console.log('Recebido loteIds para preço dinâmico:', loteIds);
    console.log(`Encontrados ${registros.length} registros para cálculo de preço dinâmico.`);
    const resultados = registros.map(({ lote, produto, estoque, metrics }) => {
      const loteNormalizado = {
        id: lote.id,
        nomeProduto: produto?.nome || 'Produto',
        categoria: produto?.categoria || 'indefinido',
        precoBase: lote.preco_base,
        dataValidade: lote.data_validade,
      };
      console.log('Processando lote:', loteNormalizado);

      const m = {
        totalEstoque: estoque?.quantidade_inicial || 0,
        vendidoDesdeEntrada: estoque?.vendido_total || 0,
      };
      const calculo = calcularPrecoDinamicoComMercado(loteNormalizado, m);

      // 2. NOVO: Faz predição da IA
      const diasParaVencer = calculo.diasParaVencer;
      const percentualVendido = m.totalEstoque > 0 
        ? Math.round((m.vendidoDesdeEntrada / m.totalEstoque) * 100)
        : 0;

      const scoreIA = aiModel.predict({
        diasRestantes: diasParaVencer,
        estoqueVendido: percentualVendido,
        demanda: calculo.ofertaDemanda.avaliacao, // 'baixa', 'media', 'alta'
        categoria: loteNormalizado.categoria,
        precoBase: loteNormalizado.precoBase
      });

      // 3. NOVO: Ajusta o preço com base no score da IA
      const precoComAjusteIA = ajustarPrecoComScoreIA(
        calculo.precoAtualizado,
        scoreIA.probabilidadeVenderTudo
      );

      return {
        loteId: loteNormalizado.id,
        nomeProduto: loteNormalizado.nomeProduto,
        categoria: loteNormalizado.categoria,
        precoBase: loteNormalizado.precoBase,
        precoSugerido: calculo.precoAtualizado,
        
        // Preço original (sem IA)
        precoSugerido: calculo.precoAtualizado,
        
        // NOVO: Preço ajustado com IA
        precoComAjusteIA,
        scorePredictivo: scoreIA.probabilidadeVenderTudo.toFixed(2),
        descontoAjustadoPelaIA: scoreIA.descontoIdeal,
        
        // Dados auxiliares
        diasParaVencer: calculo.diasParaVencer,
        demanda: calculo.ofertaDemanda.avaliacao,
        percentualVendas: calculo.ofertaDemanda.percentualVendas,
        descontoValidade: calculo.descontoValidade,
        descontoTotal: calculo.descontoTotal,
      };
    });

    return res.json({
      total: resultados.length,
      resultados,
    });
  } catch (err) {
    console.error('Erro ao calcular preço dinâmico:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}



/**
 * Ajusta o preço com base no score de predição da IA
 * Score alto (0.75+) = desconto menor, preço mantém
 * Score baixo (<0.25) = desconto maior, preço cai mais
 */
function ajustarPrecoComScoreIA(precoBase, scorePredictivo) {
  let multiplicador = 1;

  if (scorePredictivo >= 0.75) {
    // Alta chance de vender = mantém preço mais alto
    multiplicador = 1.0; // sem desconto extra
  } else if (scorePredictivo >= 0.50) {
    // Média chance de vender = desconto moderado
    multiplicador = 0.90; // desconto de 10%
  } else if (scorePredictivo >= 0.25) {
    // Baixa chance de vender = desconto agressivo
    multiplicador = 0.75; // desconto de 25%
  } else {
    // Muito baixa chance = desconto máximo
    multiplicador = 0.60; // desconto de 40%
  }

  return Number((precoBase * multiplicador).toFixed(2));
}

module.exports = { getPrecoDinamico };