const { getSupabaseServiceRoleClient } = require('../services/suapabase');

/**
 * Repository para o controller de preço dinâmico.
 * Fornece dados necessários para cálculo: lote, produto e estoque.
 */
async function fetchLotesWithEstoque(loteIds) {
  const supabase = getSupabaseServiceRoleClient();

  // Lotes
  const { data: lotes, error: lotesError } = await supabase
    .from('lotes')
    .select('id, cliente_id, produto_id, data_colheita, data_validade, preco_base, status, atualizado_em')
    .in('id', loteIds);
  if (lotesError) throw lotesError;

  if (!lotes || lotes.length === 0) return [];

  // Produtos
  const produtoIds = Array.from(new Set(lotes.map((l) => l.produto_id)));
  const { data: produtos, error: produtosError } = await supabase
    .from('produtos')
    .select('id, nome, categoria');
  if (produtosError) throw produtosError;
  const produtosById = new Map(produtos.map((p) => [p.id, p]));

  // Estoque
  const { data: estoques, error: estoqueError } = await supabase
    .from('estoque_lote')
    .select('lote_id, quantidade_inicial, quantidade_atual, vendido_total')
    .in('lote_id', loteIds);
  if (estoqueError) throw estoqueError;
  const estoqueByLote = new Map(estoques.map((e) => [e.lote_id, e]));

  // Compose
  return lotes.map((lote) => {
    const produto = produtosById.get(lote.produto_id) || null;
    const estoque = estoqueByLote.get(lote.id) || null;
    const percentualVendas = estoque && estoque.quantidade_inicial > 0
      ? Number(((estoque.vendido_total / estoque.quantidade_inicial) * 100).toFixed(2))
      : 0;
    return {
      lote,
      produto,
      estoque,
      metrics: {
        percentualVendas,
      },
    };
  });
}

module.exports = {
  fetchLotesWithEstoque,
};
