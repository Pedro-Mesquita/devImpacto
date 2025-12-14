// Controller para o processamento diário

const { processarLotesCliente } = require('../services/processamentoDiarioService');
const { getClientes } = require('../repository/processamentoDiarioRepository');

/**
 * POST /processamento-diario/cliente/:clienteId
 * Body: { loteIds: ["1", "2", "3"] }
 * Recalcula preços, avalia distribuição e retorna recomendações
 */
async function processarClientePorDia(req, res) {
  try {
    const { clienteId } = req.params;
    const { loteIds } = req.body;

    if (!loteIds || !Array.isArray(loteIds) || loteIds.length === 0) {
      return res.status(400).json({ error: 'loteIds é obrigatório e deve ser um array' });
    }

    const resultado = await processarLotesCliente(clienteId, loteIds);

    if (resultado.erro) {
      return res.status(404).json(resultado);
    }

    return res.json(resultado);
  } catch (err) {
    console.error('Erro ao processar lotes:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
 
/**
 * POST /processamento-diario/todos
 * Body: { clienteIds: ["cliente_001", "cliente_002"] }
 * Processa TODOS os clientes configurados
 */
async function processarTodosClientes(req, res) {
  try {
    const { clienteIds } = req.body;

    const clientes = await getClientes();
    const clientesParaProcessar = clienteIds
      ? clientes.filter((c) => clienteIds.includes(c.id))
      : clientes;

    if (clientesParaProcessar.length === 0) {
      return res.status(404).json({ error: 'Nenhum cliente encontrado' });
    }

    const resultados = [];

    for (const cliente of clientesParaProcessar) {
      // Processa um conjunto de lotes (exemplo: 1-15)
      const resultado = await processarLotesCliente(cliente.id, [
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
        '11',
        '12',
        '13',
        '14',
        '15',
      ]);

      resultados.push(resultado);
    }

    return res.json({
      processadoEm: new Date().toISOString(),
      totalClientes: resultados.length,
      clientes: resultados,
    });
  } catch (err) {
    console.error('Erro ao processar todos os clientes:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

module.exports = { processarClientePorDia, processarTodosClientes };
