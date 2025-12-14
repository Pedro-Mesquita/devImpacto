const { listLotesByCliente } = require('../repositories/loteRepository');

async function getLotesByCliente(req, res) {
  try {
    const { clienteId } = req.params;
    if (!clienteId) return res.status(400).json({ error: 'clienteId é obrigatório' });
    const lotes = await listLotesByCliente(clienteId);
    return res.json({ total: lotes.length, lotes });
  } catch (err) {
    console.error('Erro ao listar lotes por cliente:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

module.exports = { getLotesByCliente };
