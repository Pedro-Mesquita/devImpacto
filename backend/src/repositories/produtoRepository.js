const { getSupabaseServiceRoleClient } = require('../services/suapabase');

async function listProdutos() {
  const supabase = getSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from('produtos')
    .select('id, nome, categoria');
  if (error) throw error;
  return data || [];
}

async function listProdutosByCliente(clienteId) {
  const supabase = getSupabaseServiceRoleClient();
  if (!clienteId) return [];
  const { data, error } = await supabase
    .from('produtos')
    .select('id, nome, categoria, cliente_id')
    .eq('cliente_id', clienteId);
  if (error) throw error;
  return data || [];
}

module.exports = { listProdutos, listProdutosByCliente };

async function createProduto({ nome, categoria, cliente_id }) {
  const supabase = getSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from('produtos')
    .insert([{ nome, categoria, cliente_id }])
    .select('id, nome, categoria, cliente_id')
    .single();
  if (error) throw error;
  return data;
}

module.exports.createProduto = createProduto;
