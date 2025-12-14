// Serviço de notificações
// Emite alertas quando um produto entra em status "alerta"

const notificacoesLog = [];

/**
 * Emite notificação para um produto em alerta
 * Em produção, conectaria a serviços reais: SendGrid, Twilio, Firebase, etc.
 */
async function emitirNotificacao(clienteId, lote, config, dadosAlerta) {
  const notificacao = {
    id: `notif_${Date.now()}`,
    clienteId,
    loteId: lote.id,
    nomeProduto: lote.nomeProduto,
    precoAtualizado: dadosAlerta.precoAtualizado,
    diasParaVencer: dadosAlerta.diasParaVencer,
    descontoTotal: dadosAlerta.descontoTotal,
    timestamp: new Date().toISOString(),
    canaisEnviados: [],
    status: 'enviado',
  };

  // Simular envio por diferentes canais
  const canais = config.config.canalNotificacao || ['email'];

  for (const canal of canais) {
    notificacao.canaisEnviados.push({
      canal,
      status: 'enviado',
      timestamp: new Date().toISOString(),
    });

    // Simular logs de envio
    console.log(`[NOTIFICAÇÃO] ${canal.toUpperCase()} enviado para cliente ${clienteId}`);
    console.log(`  Produto: ${lote.nomeProduto} (Lote ${lote.id})`);
    console.log(`  Preço: R$ ${dadosAlerta.precoAtualizado} (-${dadosAlerta.descontoTotal}%)`);
    console.log(`  Dias para vencer: ${dadosAlerta.diasParaVencer}`);
  }

  notificacoesLog.push(notificacao);
  return notificacao;
}

/**
 * Retorna histórico de notificações
 */
async function obterHistoricoNotificacoes(clienteId, loteId) {
  if (clienteId && loteId) {
    return notificacoesLog.filter((n) => n.clienteId === clienteId && n.loteId === loteId);
  } else if (clienteId) {
    return notificacoesLog.filter((n) => n.clienteId === clienteId);
  }
  return notificacoesLog;
}

/**
 * Limpa histórico (útil para testes)
 */
function limparHistoricoNotificacoes() {
  notificacoesLog.length = 0;
}

module.exports = {
  emitirNotificacao,
  obterHistoricoNotificacoes,
  limparHistoricoNotificacoes,
  notificacoesLog,
};
