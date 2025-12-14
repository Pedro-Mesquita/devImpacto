const { getSupabaseServiceRoleClient } = require('../services/suapabase');

/**
 * Repository para o controller de jobs (monitoramento de scheduler).
 * Foca em execuções registradas no banco.
 */

function supabase() {
  return getSupabaseServiceRoleClient();
}

async function getUltimaExecucao() {
  const { data, error } = await supabase()
    .from('processamento_execucoes')
    .select('id, executado_em, sucesso, total_lotes, total_alertas, observacoes')
    .order('executado_em', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

async function getExecucoes(limit = 20) {
  const { data, error } = await supabase()
    .from('processamento_execucoes')
    .select('id, executado_em, sucesso, total_lotes, total_alertas, observacoes')
    .order('executado_em', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

async function registrarExecucao({ sucesso = true, total_lotes = 0, total_alertas = 0, observacoes = null } = {}) {
  const { data, error } = await supabase()
    .from('processamento_execucoes')
    .insert({ sucesso, total_lotes, total_alertas, observacoes })
    .select()
    .single();
  if (error) throw error;
  return data;
}

module.exports = {
  getUltimaExecucao,
  getExecucoes,
  registrarExecucao,
};
