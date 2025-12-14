const { getSupabaseServiceRoleClient } = require('../services/suapabase');

async function listLotesByCliente(clienteId) {
  const supabase = getSupabaseServiceRoleClient();
  if (!clienteId) return [];
  const { data, error } = await supabase
    .from('lotes')
    .select('id, cliente_id, produto_id, data_colheita, data_validade, preco_base, status, preco_sugerido, criado_em')
    .eq('cliente_id', clienteId);
  if (error) throw error;
  return data || [];
}

module.exports = { listLotesByCliente };

async function createLote({ cliente_id, produto_id, data_colheita, data_validade, preco_base, status = 'normal' }) {
  const supabase = getSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from('lotes')
    .insert([{ cliente_id, produto_id, data_colheita, data_validade, preco_base, status }])
    .select('id, cliente_id, produto_id, data_colheita, data_validade, preco_base, status, preco_sugerido, criado_em')
    .single();
  if (error) throw error;
  return data;
}

module.exports.createLote = createLote;