const { getVendidoTotalPorCliente, getQuantidadeInicialPorCliente } = require('../repository/processamentoDiarioRepository');

// GET /clientes/:clienteId/estoque/vendido-total
// Returns [{ lote_id, vendido_total_sum }]
async function getVendidoTotalCliente(req, res) {
  try {
    const { clienteId } = req.params;
    if (!clienteId) {
      return res.status(400).json({ error: 'clienteId é obrigatório' });
    }
    const totals = await getVendidoTotalPorCliente(clienteId);
    return res.json({ totalLotes: totals.length, vendidos: totals });
  } catch (err) {
    console.error('Erro ao obter vendido_total por cliente:', err);
    // Fallback: em erros de schema/relacionamento ou ambiente sem Supabase, retorna vazio
    const safeEmpty = { totalLotes: 0, vendidos: [] };
    if (err && (err.code === 'PGRST200' || err.message?.includes('relationship') || err.message?.includes('schema'))) {
      return res.json(safeEmpty);
    }
    return res.status(200).json(safeEmpty);
  }
}

module.exports = { getVendidoTotalCliente };

// GET /clientes/:clienteId/estoque/quantidade-inicial-total
// Returns [{ lote_id, quantidade_inicial_sum }]
async function getQuantidadeInicialCliente(req, res) {
  try {
    const { clienteId } = req.params;
    if (!clienteId) {
      return res.status(400).json({ error: 'clienteId é obrigatório' });
    }
    const totals = await getQuantidadeInicialPorCliente(clienteId);
    return res.json({ totalLotes: totals.length, quantidades: totals });
  } catch (err) {
    console.error('Erro ao obter quantidade_inicial por cliente:', err);
    const safeEmpty = { totalLotes: 0, quantidades: [] };
    if (err && (err.code === 'PGRST200' || err.message?.includes('relationship') || err.message?.includes('schema'))) {
      return res.json(safeEmpty);
    }
    return res.status(200).json(safeEmpty);
  }
}

module.exports.getQuantidadeInicialCliente = getQuantidadeInicialCliente;
