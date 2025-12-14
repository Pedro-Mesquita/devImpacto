const memoriaLotes = [
  {
    id: '1',
    nomeProduto: 'Tomate',
    dataColheita: '2025-12-05',
    dataValidade: '2025-12-20',
    precoBase: 10.0,
  },
  {
    id: '2',
    nomeProduto: 'Banana',
    dataColheita: '2025-12-10',
    dataValidade: '2025-12-15',
    precoBase: 8.5,
  },
  {
    id: '3',
    nomeProduto: 'Iogurte',
    dataColheita: '2025-12-01',
    dataValidade: '2025-12-14',
    precoBase: 6.9,
  },
];

async function findLoteById(loteId) {
  return memoriaLotes.find((l) => String(l.id) === String(loteId)) || null;
}

module.exports = { findLoteById };