const { findLoteById } = require('../repositories/loteRepository');
const { calcularPrecoDinamico } = require('../services/precoDinamicoService');

async function getPrecoDinamico(req, res) {
  try {
    const { loteId } = req.params;
    const lote = await findLoteById(loteId);

    if (!lote) {
      return res.status(404).json({ error: 'Lote não encontrado' });
    }

    const resultado = calcularPrecoDinamico(lote);
    return res.json({
      loteId: lote.id,
      nomeProduto: lote.nomeProduto,
      precoBase: lote.precoBase,
      ...resultado,
    });
  } catch (err) {
    console.error('Erro ao calcular preço dinâmico:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

module.exports = { getPrecoDinamico };