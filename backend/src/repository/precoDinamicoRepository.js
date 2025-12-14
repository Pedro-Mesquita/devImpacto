const { getSupabaseServiceRoleClient } = require('../services/suapabase');

/**
 * Repository para o controller de preço dinâmico.
 * Fornece dados necessários para cálculo: lote, produto e estoque.
 */
async function fetchLotesWithEstoque(loteIds) {
  console.log('\n📦 [REPOSITORY] Iniciando fetchLotesWithEstoque');
  console.log('   IDs recebidos:', loteIds);
  
  const supabase = getSupabaseServiceRoleClient();

  try {
    // 1. Busca Lotes
    console.log('\n🔍 [REPOSITORY] Buscando lotes...');
    const { data: lotes, error: lotesError } = await supabase
      .from('lotes')
      .select('id, cliente_id, produto_id, data_colheita, data_validade, preco_base, status, atualizado_em')
      .in('id', loteIds);
    
    if (lotesError) {
      console.error('❌ [REPOSITORY] Erro ao buscar lotes:', lotesError);
      throw lotesError;
    }
    
    console.log(`✅ [REPOSITORY] ${lotes?.length || 0} lotes encontrados`);
    lotes?.forEach(l => {
      console.log(`   - Lote ${l.id}: produto_id=${l.produto_id}, preço=${l.preco_base}, vencimento=${l.data_validade}`);
    });

    if (!lotes || lotes.length === 0) {
      console.warn('⚠️  [REPOSITORY] Nenhum lote encontrado para os IDs fornecidos');
      return [];
    }

    // 2. Busca Produtos
    console.log('\n🔍 [REPOSITORY] Buscando produtos...');
    const produtoIds = Array.from(new Set(lotes.map((l) => l.produto_id)));
    console.log(`   IDs únicos de produtos: ${produtoIds.join(', ')}`);
    
    const { data: produtos, error: produtosError } = await supabase
      .from('produtos')
      .select('id, nome, categoria');
    
    if (produtosError) {
      console.error('❌ [REPOSITORY] Erro ao buscar produtos:', produtosError);
      throw produtosError;
    }
    
    console.log(`✅ [REPOSITORY] ${produtos?.length || 0} produtos encontrados`);
    produtos?.forEach(p => {
      console.log(`   - Produto ${p.id}: ${p.nome} (${p.categoria})`);
    });
    
    const produtosById = new Map(produtos.map((p) => [p.id, p]));

    // 3. Busca Estoque
    console.log('\n🔍 [REPOSITORY] Buscando estoque dos lotes...');
    const { data: estoques, error: estoqueError } = await supabase
      .from('estoque_lote')
      .select('lote_id, quantidade_inicial, quantidade_atual, vendido_total')
      .in('lote_id', loteIds);
    
    if (estoqueError) {
      console.error('❌ [REPOSITORY] Erro ao buscar estoque:', estoqueError);
      throw estoqueError;
    }
    
    console.log(`✅ [REPOSITORY] ${estoques?.length || 0} registros de estoque encontrados`);
    estoques?.forEach(e => {
      console.log(`   - Lote ${e.lote_id}: ${e.vendido_total}/${e.quantidade_inicial} vendido`);
    });
    
    const estoqueByLote = new Map(estoques.map((e) => [e.lote_id, e]));

    // 4. Compose resultado
    console.log('\n🔗 [REPOSITORY] Compondo resultado final...');
    const resultado = lotes.map((lote) => {
      const produto = produtosById.get(lote.produto_id) || null;
      const estoque = estoqueByLote.get(lote.id) || null;
      const percentualVendas = estoque && estoque.quantidade_inicial > 0
        ? Number(((estoque.vendido_total / estoque.quantidade_inicial) * 100).toFixed(2))
        : 0;
      
      console.log(`   ✓ Lote ${lote.id}: ${produto?.nome || 'PRODUTO NÃO ENCONTRADO'} (${percentualVendas}% vendido)`);
      
      return {
        lote,
        produto,
        estoque,
        metrics: {
          percentualVendas,
        },
      };
    });

    console.log(`\n✅ [REPOSITORY] fetchLotesWithEstoque completo. ${resultado.length} registros processados\n`);
    return resultado;
  } catch (error) {
    console.error('❌ [REPOSITORY] Erro geral em fetchLotesWithEstoque:', error);
    throw error;
  }
}

module.exports = {
  fetchLotesWithEstoque,
};
