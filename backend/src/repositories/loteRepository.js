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

async function buscarPorCliente(clienteId) {
  const supabase = getSupabaseServiceRoleClient();
  try {
    const { data, error } = await supabase
      .from('lotes')
      .select('*')
      .eq('cliente_id', clienteId);
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar lotes por cliente:', error);
    throw error;
  }
}

async function buscarPorStatus(clienteId, status) {
  const supabase = getSupabaseServiceRoleClient();
  try {
    const { data, error } = await supabase
      .from('lotes')
      .select('*')
      .eq('cliente_id', clienteId)
      .eq('status', status);
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar lotes por status:', error);
    throw error;
  }
}

async function buscarPorId(loteId) {
  const supabase = getSupabaseServiceRoleClient();
  try {
    const { data, error } = await supabase
      .from('lotes')
      .select('*')
      .eq('id', loteId)
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao buscar lote por ID:', error);
    throw error;
  }
}

async function criar(lote) {
  const supabase = getSupabaseServiceRoleClient();
  try {
    const { data, error } = await supabase
      .from('lotes')
      .insert([lote])
      .select();
    if (error) throw error;
    return Array.isArray(data) ? data[0] : data;
  } catch (error) {
    console.error('Erro ao criar lote:', error);
    throw error;
  }
}

async function atualizar(loteId, atualizacoes) {
  const supabase = getSupabaseServiceRoleClient();
  try {
    const { data, error } = await supabase
      .from('lotes')
      .update(atualizacoes)
      .eq('id', loteId)
      .select();
    if (error) throw error;
    return Array.isArray(data) ? data[0] : data;
  } catch (error) {
    console.error('Erro ao atualizar lote:', error);
    throw error;
  }
}

async function deletar(loteId) {
  const supabase = getSupabaseServiceRoleClient();
  try {
    const { error } = await supabase
      .from('lotes')
      .delete()
      .eq('id', loteId);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao deletar lote:', error);
    throw error;
  }
}

module.exports.buscarPorCliente = buscarPorCliente;
module.exports.buscarPorStatus = buscarPorStatus;
module.exports.buscarPorId = buscarPorId;
module.exports.criar = criar;
module.exports.atualizar = atualizar;
module.exports.deletar = deletar;
