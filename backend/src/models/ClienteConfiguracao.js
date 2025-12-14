// Modelo de configuração simplificado: apenas 2 status
// normal: produto em estoque normal
// alerta: produto próximo de vencer, ativa notificações e desconto

const clientesConfig = {
  // Cliente 1: Pequeno mercado
  cliente_001: {
    id: 'cliente_001',
    nome: 'Mercado Central',
    regraPreco: {
      // % de dias restantes para ativar ALERTA
      percentualDiasAtivacaoAlerta: 0.50,  // 50% de dias restantes = ALERTA
    },
    config: {
      ativarNotificacoes: true,
      canalNotificacao: ['email', 'sms', 'app'],  // Canais de notificação
      descricao: 'Pequeno mercado - alerta em 50% da validade',
    },
  },

  // Cliente 2: Médio mercado
  cliente_002: {
    id: 'cliente_002',
    nome: 'Supermercado Regional',
    regraPreco: {
      percentualDiasAtivacaoAlerta: 0.60,  // Mais conservador
    },
    config: {
      ativarNotificacoes: true,
      canalNotificacao: ['email', 'app'],
      descricao: 'Médio mercado - alerta em 60% da validade',
    },
  },

  // Cliente 3: Grande rede
  cliente_003: {
    id: 'cliente_003',
    nome: 'Rede Grande Premium',
    regraPreco: {
      percentualDiasAtivacaoAlerta: 0.40,  // Mais agressivo
    },
    config: {
      ativarNotificacoes: true,
      canalNotificacao: ['email', 'sms', 'app', 'webhook'],
      descricao: 'Grande rede - alerta em 40% da validade',
    },
  },
};

async function obterConfigCliente(clienteId) {
  return clientesConfig[clienteId] || null;
}

async function obterTodasConfiguracoes() {
  return Object.values(clientesConfig);
}

module.exports = { obterConfigCliente, obterTodasConfiguracoes, clientesConfig };
