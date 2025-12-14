const { getSupabaseServiceRoleClient } = require('../services/suapabase');

/**
 * Repository para o controller de processamento diário.
 * Operações: clientes, lotes, estoque, vendas, status, histórico e notificações.
 */

function supabase() {
  return getSupabaseServiceRoleClient();
}

// Clientes
async function getClientes() {
  const { data, error } = await supabase().from('clientes').select('id, nome, email');
  if (error) throw error;
  return data || [];
}

async function getClienteConfiguracao(clienteId) {
  const { data, error } = await supabase()
    .from('cliente_configuracao')
    .select('cliente_id, percentual_dias_alerta, percentual_dias_distribuicao, percentual_dias_critico')
    .eq('cliente_id', clienteId)
    .single();
  if (error) throw error;
  return data;
}

// Lotes
async function getLotesByCliente(clienteId) {
  const { data, error } = await supabase()
    .from('lotes')
    .select('id, produto_id, data_colheita, data_validade, preco_base, status')
    .eq('cliente_id', clienteId);
  if (error) throw error;
  return data || [];
}

async function getEstoqueLote(loteId) {
  const { data, error } = await supabase()
    .from('estoque_lote')
    .select('lote_id, quantidade_inicial, quantidade_atual, vendido_total')
    .eq('lote_id', loteId)
    .single();
  if (error) throw error;
  return data;
}

// Vendas diárias
async function registrarVendaDia(loteId, dataVenda, quantidade) {
  const { data, error } = await supabase()
    .from('vendas_diarias')
    .upsert({ lote_id: loteId, data_venda: dataVenda, quantidade }, { onConflict: 'lote_id,data_venda' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function getVendaDoDia(loteId, dataVenda) {
  const { data, error } = await supabase()
    .from('vendas_diarias')
    .select('quantidade')
    .eq('lote_id', loteId)
    .eq('data_venda', dataVenda)
    .maybeSingle();
  if (error) throw error;
  return data ? data.quantidade : 0;
}

// Estoque
async function atualizarEstoqueLote(loteId, quantidadeAtual, vendidoTotal) {
  const { data, error } = await supabase()
    .from('estoque_lote')
    .update({ quantidade_atual: quantidadeAtual, vendido_total: vendidoTotal, atualizado_em: new Date().toISOString() })
    .eq('lote_id', loteId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Soma vendido_total por lote_id para todos os lotes de um cliente
async function getVendidoTotalPorCliente(clienteId) {
  // Primeiro busca os IDs dos lotes do cliente
  const { data: lotes, error: lotesErr } = await supabase()
    .from('lotes')
    .select('id')
    .eq('cliente_id', clienteId);
  if (lotesErr) throw lotesErr;
  const loteIds = (lotes || []).map(l => l.id);
  if (!loteIds.length) {
    return [];
  }
  // Depois busca estoque_lote filtrando pelos lote_ids
  const { data: estoque, error: estoqueErr } = await supabase()
    .from('estoque_lote')
    .select('lote_id, vendido_total')
    .in('lote_id', loteIds);
  if (estoqueErr) throw estoqueErr;
  const agregados = new Map();
  for (const row of estoque || []) {
    const key = row.lote_id;
    const atual = agregados.get(key) || 0;
    agregados.set(key, atual + (Number(row.vendido_total) || 0));
  }
  return Array.from(agregados.entries()).map(([lote_id, vendido_total_sum]) => ({ lote_id, vendido_total_sum }));
}

// Soma quantidade_inicial por lote_id para todos os lotes de um cliente
async function getQuantidadeInicialPorCliente(clienteId) {
  const { data: lotes, error: lotesErr } = await supabase()
    .from('lotes')
    .select('id')
    .eq('cliente_id', clienteId);
  if (lotesErr) throw lotesErr;
  const loteIds = (lotes || []).map(l => l.id);
  if (!loteIds.length) {
    return [];
  }
  const { data: estoque, error: estoqueErr } = await supabase()
    .from('estoque_lote')
    .select('lote_id, quantidade_inicial')
    .in('lote_id', loteIds);
  if (estoqueErr) throw estoqueErr;
  const agregados = new Map();
  for (const row of estoque || []) {
    const key = row.lote_id;
    const atual = agregados.get(key) || 0;
    agregados.set(key, atual + (Number(row.quantidade_inicial) || 0));
  }
  return Array.from(agregados.entries()).map(([lote_id, quantidade_inicial_sum]) => ({ lote_id, quantidade_inicial_sum }));
}

// Status de lote
async function atualizarStatusLote(loteId, statusNovo, precoSugeridoAtual = null) {
  // Obter status anteriorconsole
  console.log('[Repo] atualizando status do lote', { loteId, statusNovo, precoSugeridoAtual });

  const { data: lote, error: loteErr } = await supabase()
    .from('lotes')
    .select('id, status')
    .eq('id', loteId)
    .single();
  if (loteErr) {
    console.error('[Repo] erro ao buscar lote antes do update', loteErr);
    throw loteErr;
  }
  console.log('[Repo] lote antes do update', lote);

  // Atualizar
  const payload = {
    status: statusNovo,
    atualizado_em: new Date().toISOString(),
  };
  if (precoSugeridoAtual !== null && Number.isFinite(Number(precoSugeridoAtual))) {
    payload.preco_sugerido = Number(precoSugeridoAtual);
  }

  const { data, error } = await supabase()
    .from('lotes')
    .update(payload)
    .eq('id', loteId)
    .select();

  if (error) {
    console.error('[Repo] erro ao atualizar status do lote', { loteId, statusNovo, error });
    throw error;
  }
  if (!data || data.length === 0) {
    console.warn('[Repo] nenhum registro atualizado em lotes', { loteId, statusNovo });
  }

  // Registrar histórico
  try {
    await inserirStatusHistorico(loteId, lote.status, statusNovo, `Atualização automática diária`);
  } catch (histErr) {
    console.warn('[Repo] falha ao inserir histórico de status', histErr);
  }
  return Array.isArray(data) ? data[0] : data;
}

async function inserirStatusHistorico(loteId, statusAnterior, statusNovo, motivo) {
  const { data, error } = await supabase()
    .from('lote_status_historico')
    .insert({ lote_id: loteId, status_anterior: statusAnterior, status_novo: statusNovo, motivo })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Notificações
async function inserirNotificacao(clienteId, loteId, tipo, mensagem) {
  const { data, error } = await supabase()
    .from('notificacoes')
    .insert({ cliente_id: clienteId, lote_id: loteId, tipo, mensagem })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Execuções do job
async function registrarExecucaoJob({ sucesso = true, total_lotes = 0, total_alertas = 0, observacoes = null } = {}) {
  const { data, error } = await supabase()
    .from('processamento_execucoes')
    .insert({ sucesso, total_lotes, total_alertas, observacoes })
    .select()
    .single();
  if (error) throw error;
  return data;
}

module.exports = {
  getClientes,
  getClienteConfiguracao,
  getLotesByCliente,
  getEstoqueLote,
  registrarVendaDia,
  atualizarEstoqueLote,
  atualizarStatusLote,
  inserirStatusHistorico,
  inserirNotificacao,
  registrarExecucaoJob,
  getVendaDoDia,
  getVendidoTotalPorCliente,
  getQuantidadeInicialPorCliente,
};
