const { listProdutos, listProdutosByCliente, createProduto } = require('../repositories/produtoRepository');
const { createLote } = require('../repositories/loteRepository');

async function getProdutos(req, res) {
  try {
    const produtos = await listProdutos();
    return res.json({ total: produtos.length, produtos });
  } catch (err) {
    console.error('Erro ao listar produtos:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

module.exports = { getProdutos };

async function getProdutosByCliente(req, res) {
  try {
    const { clienteId } = req.params;
    if (!clienteId) return res.status(400).json({ error: 'clienteId é obrigatório' });
    const produtos = await listProdutosByCliente(clienteId);
    return res.json({ total: produtos.length, produtos });
  } catch (err) {
    console.error('Erro ao listar produtos por cliente:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

module.exports.getProdutosByCliente = getProdutosByCliente;

// POST /api/produtos
// Body: { cliente_id, nome, categoria, data_colheita, data_validade, preco_base }
async function createProdutoComLote(req, res) {
  try {
    const { cliente_id, nome, categoria, data_colheita, data_validade, preco_base } = req.body;
    if (!cliente_id || !nome || !categoria || !data_validade || !preco_base) {
      return res.status(400).json({ error: 'Campos obrigatórios: cliente_id, nome, categoria, data_validade, preco_base' });
    }

    const produto = await createProduto({ nome, categoria, cliente_id });
    const lote = await createLote({
      cliente_id,
      produto_id: produto.id,
      data_colheita: data_colheita || null,
      data_validade,
      preco_base: Number(preco_base),
      status: 'normal',
    });

    return res.status(201).json({ produto, lote });
  } catch (err) {
    console.error('Erro ao criar produto/lote:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

module.exports.createProdutoComLote = createProdutoComLote;
