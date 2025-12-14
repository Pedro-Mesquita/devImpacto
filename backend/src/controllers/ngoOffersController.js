const { getSupabaseServiceRoleClient } = require('../services/suapabase');

function supabase() {
  return getSupabaseServiceRoleClient();
}

// GET /api/lotes/alerta
async function listAlertLotes(req, res) {
  try {
    const { data: lotes, error } = await supabase()
      .from('lotes')
      .select('id, cliente_id, produto_id, data_colheita, data_validade, preco_base, status, preco_sugerido, criado_em, atualizado_em')
      .eq('status', 'alerta');
    if (error) throw error;

    const listaLotes = lotes || [];
    const produtoIds = Array.from(new Set(listaLotes.map(l => l.produto_id).filter(Boolean)));
    let produtos = [];
    if (produtoIds.length > 0) {
      const { data: prods, error: prodErr } = await supabase()
        .from('produtos')
        .select('id, nome, categoria')
        .in('id', produtoIds);
      if (prodErr) throw prodErr;
      produtos = prods || [];
    }
    const produtoMap = new Map(produtos.map(p => [p.id, p]));

    // Fetch available quantities from estoque_lote for these lotes
    const loteIds = listaLotes.map(l => l.id);
    let estoqueMap = new Map();
    if (loteIds.length > 0) {
      const { data: estoques, error: estoqueErr } = await supabase()
        .from('estoque_lote')
        .select('lote_id, quantidade_atual')
        .in('lote_id', loteIds);
      if (estoqueErr) {
        // do not throw; continue without quantities
        console.warn('[NGO Offers] estoque_lote fetch warning', estoqueErr);
      } else {
        estoqueMap = new Map((estoques || []).map(e => [e.lote_id, e]));
      }
    }

    const enriched = listaLotes.map(l => ({
      ...l,
      produto: produtoMap.get(l.produto_id) || null,
      quantidade_atual: estoqueMap.get(l.id)?.quantidade_atual ?? null,
    }));
    return res.json({ count: enriched.length, lotes: enriched });
  } catch (err) {
    console.error('[NGO Offers] listAlertLotes error', err);
    // Graceful fallback
    return res.json({ count: 0, lotes: [] });
  }
}

module.exports = { listAlertLotes };
