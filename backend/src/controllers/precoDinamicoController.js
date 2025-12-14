const { fetchLotesWithEstoque } = require('../repository/precoDinamicoRepository');
const { calcularPrecoDinamicoComMercado } = require('../services/precoDinamicoService');

// POST /preco-dinamico
// Body: { loteIds: ["1", "2", "3"] }
// Retorna array com preço sugerido, dias para vencer, e demanda de cada lote
async function getPrecoDinamico(req, res) {
  try {
    const { loteIds } = req.body;

    if (!loteIds || !Array.isArray(loteIds) || loteIds.length === 0) {
      return res.status(400).json({ error: 'loteIds é obrigatório e deve ser um array' });
    }
    const registros = await fetchLotesWithEstoque(loteIds);
    const resultados = registros.map(({ lote, produto, estoque, metrics }) => {
      const loteNormalizado = {
        id: lote.id,
        nomeProduto: produto?.nome || 'Produto',
        categoria: produto?.categoria || 'indefinido',
        precoBase: lote.preco_base,
        dataValidade: lote.data_validade,
      };
      const m = {
        totalEstoque: estoque?.quantidade_inicial || 0,
        vendidoDesdeEntrada: estoque?.vendido_total || 0,
      };
      const calculo = calcularPrecoDinamicoComMercado(loteNormalizado, m);
      return {
        loteId: loteNormalizado.id,
        nomeProduto: loteNormalizado.nomeProduto,
        categoria: loteNormalizado.categoria,
        precoBase: loteNormalizado.precoBase,
        precoSugerido: calculo.precoAtualizado,
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




module.exports = { getPrecoDinamico };