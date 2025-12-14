/**
 * Gerador de Dataset Mockado
 * Gera 300 registros simulados de vendas de produtos com suas características
 */

/**
 * Gera um número aleatório entre min e max (inclusivo)
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Gera um número aleatório float entre min e max
 */
function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Escolhe um elemento aleatório de um array
 */
function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Determina se um produto vendeu tudo baseado em heurísticas
 * Regras:
 * - Dias negativos = vencido = não vende tudo (0)
 * - Mais dias + alta demanda + já vendido muito = provável vender tudo
 * - Poucos dias + baixa demanda + pouco vendido = improvável vender tudo
 */
function calcularVendeuTudo(diasRestantes, estoqueVendido, demanda, categoria) {
  // Produto vencido nunca vende tudo
  if (diasRestantes < 0) return 0;

  // Pontuação baseada em fatores
  let score = 0;

  // Fator 1: Dias restantes (mais dias = melhor)
  if (diasRestantes >= 15) score += 3;
  else if (diasRestantes >= 10) score += 2;
  else if (diasRestantes >= 5) score += 1;
  else score += 0; // menos de 5 dias não adiciona pontos

  // Fator 2: Estoque já vendido (quanto mais vendido, melhor)
  if (estoqueVendido >= 70) score += 4;
  else if (estoqueVendido >= 50) score += 3;
  else if (estoqueVendido >= 30) score += 2;
  else if (estoqueVendido >= 10) score += 1;

  // Fator 3: Demanda
  if (demanda === 'alta') score += 3;
  else if (demanda === 'media') score += 2;
  else score += 1; // baixa

  // Fator 4: Categoria (frutas vencem mais rápido, legumes duram mais)
  if (categoria === 'legume') score += 1;
  else if (categoria === 'verdura') score += 0.5;

  // Adiciona um pouco de aleatoriedade (±1 ponto)
  score += randomFloat(-1, 1);

  // Score máximo possível: ~12
  // Threshold: >= 7 = vendeu tudo
  return score >= 7 ? 1 : 0;
}

/**
 * Gera o dataset completo com 300 registros
 */
function gerarDataset(quantidade = 300) {
  const dataset = [];
  const categorias = ['fruta', 'verdura', 'legume'];
  const demandas = ['baixa', 'media', 'alta'];

  for (let i = 0; i < quantidade; i++) {
    const diasRestantes = randomInt(-1, 20);
    const estoqueVendido = randomInt(0, 100);
    const demanda = randomChoice(demandas);
    const categoria = randomChoice(categorias);
    const precoBase = 13;

    const vendeuTudo = calcularVendeuTudo(
      diasRestantes,
      estoqueVendido,
      demanda,
      categoria
    );

    dataset.push({
      diasRestantes,
      estoqueVendido,
      demanda,
      categoria,
      precoBase,
      vendeuTudo,
    });
  }

  return dataset;
}

/**
 * Gera dataset balanceado (50% vendeu tudo, 50% não vendeu)
 * Mais útil para treinar modelos sem viés
 */
function gerarDatasetBalanceado(quantidade = 300) {
  const dataset = [];
  const categorias = ['fruta', 'verdura', 'legume'];
  const demandas = ['baixa', 'media', 'alta'];
  
  let vendeuTudoCount = 0;
  let naoVendeuCount = 0;
  const metade = quantidade / 2;

  while (dataset.length < quantidade) {
    const diasRestantes = randomInt(-1, 20);
    const estoqueVendido = randomInt(0, 100);
    const demanda = randomChoice(demandas);
    const categoria = randomChoice(categorias);
    const precoBase = 13;

    const vendeuTudo = calcularVendeuTudo(
      diasRestantes,
      estoqueVendido,
      demanda,
      categoria
    );

    // Balanceamento: só aceita se ainda precisa desse tipo
    if (vendeuTudo === 1 && vendeuTudoCount < metade) {
      dataset.push({
        diasRestantes,
        estoqueVendido,
        demanda,
        categoria,
        precoBase,
        vendeuTudo,
      });
      vendeuTudoCount++;
    } else if (vendeuTudo === 0 && naoVendeuCount < metade) {
      dataset.push({
        diasRestantes,
        estoqueVendido,
        demanda,
        categoria,
        precoBase,
        vendeuTudo,
      });
      naoVendeuCount++;
    }
  }

  // Embaralha o dataset
  return dataset.sort(() => Math.random() - 0.5);
}

module.exports = {
  gerarDataset,
  gerarDatasetBalanceado,
};
