// Mock de dados de estoque atualizados diariamente
// Simula o que viria de um sistema real de gestão de estoque

const estoquesMockados = {
  'cliente_001': {
    data: new Date().toISOString(),
    lotes: [
      // Lote 1: Morango - vendeu bastante hoje
      {
        loteId: '1',
        vendidoHoje: 15,
        vendidoDesdeEntrada: 8 + 15,  // 23 unidades vendidas
      },
      // Lote 2: Framboesa - vendeu pouco
      {
        loteId: '2',
        vendidoHoje: 2,
        vendidoDesdeEntrada: 16 + 2,
      },
      // Lote 3: Abobrinha - vendeu normal
      {
        loteId: '3',
        vendidoHoje: 8,
        vendidoDesdeEntrada: 12 + 8,
      },
      // Lote 4: Cenoura - vendeu bem
      {
        loteId: '4',
        vendidoHoje: 20,
        vendidoDesdeEntrada: 15 + 20,
      },
      // Lote 5: Rúcula - vencendo amanhã, vendeu pouco
      {
        loteId: '5',
        vendidoHoje: 5,
        vendidoDesdeEntrada: 15 + 5,
      },
      // Lote 6: Alface - vendeu bastante
      {
        loteId: '6',
        vendidoHoje: 25,
        vendidoDesdeEntrada: 60 + 25,
      },
      // Lote 7: Couve - vendeu moderado
      {
        loteId: '7',
        vendidoHoje: 10,
        vendidoDesdeEntrada: 20 + 10,
      },
      // Lote 8: Batata Doce - vendeu bem
      {
        loteId: '8',
        vendidoHoje: 18,
        vendidoDesdeEntrada: 50 + 18,
      },
      // Lote 9: Banana - vendeu muito
      {
        loteId: '9',
        vendidoHoje: 20,
        vendidoDesdeEntrada: 45 + 20,
      },
      // Lote 10: Tomate - vendeu bem
      {
        loteId: '10',
        vendidoHoje: 22,
        vendidoDesdeEntrada: 60 + 22,
      },
      // Lote 11: Maçã - vendeu normal
      {
        loteId: '11',
        vendidoHoje: 15,
        vendidoDesdeEntrada: 90 + 15,
      },
      // Lote 12: Laranja - vendeu bem
      {
        loteId: '12',
        vendidoHoje: 18,
        vendidoDesdeEntrada: 54 + 18,
      },
      // Lote 13: Batata Inglesa - vendeu pouco (estoque grande)
      {
        loteId: '13',
        vendidoHoje: 12,
        vendidoDesdeEntrada: 30 + 12,
      },
      // Lote 14: Melancia - crítico, vence amanhã
      {
        loteId: '14',
        vendidoHoje: 1,
        vendidoDesdeEntrada: 2 + 1,
      },
      // Lote 15: Abacaxi - nenhuma venda ainda
      {
        loteId: '15',
        vendidoHoje: 0,
        vendidoDesdeEntrada: 0,
      },
    ],
  },
  'cliente_002': {
    data: new Date().toISOString(),
    lotes: [
      // Exemplo de outro cliente
      {
        loteId: '1',
        vendidoHoje: 30,
        vendidoDesdeEntrada: 50,
      },
      {
        loteId: '2',
        vendidoHoje: 10,
        vendidoDesdeEntrada: 25,
      },
    ],
  },
};

async function obterEstoqueAtualizado(clienteId) {
  return estoquesMockados[clienteId] || null;
}

async function atualizarEstoqueMockado(clienteId, loteId, novoVendidoDesdeEntrada) {
  if (estoquesMockados[clienteId]) {
    const loteIndex = estoquesMockados[clienteId].lotes.findIndex((l) => l.loteId === loteId);
    if (loteIndex !== -1) {
      estoquesMockados[clienteId].lotes[loteIndex].vendidoDesdeEntrada = novoVendidoDesdeEntrada;
      estoquesMockados[clienteId].data = new Date().toISOString();
      return true;
    }
  }
  return false;
}

module.exports = { obterEstoqueAtualizado, atualizarEstoqueMockado, estoquesMockados };
