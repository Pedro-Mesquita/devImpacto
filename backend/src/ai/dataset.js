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

/**
 * Gerenciador de Dataset
 * Busca histórico de vendas do banco de dados para treinar a IA
 */

const { getSupabaseServiceRoleClient } = require('../services/suapabase');

/**
 * Busca dataset completo do banco de dados
 * @param {number} versaoModelo - Versão do modelo (padrão: 1)
 * @returns {Promise<Array>} Array com registros do histórico
 */
async function buscarDatasetDoBanco(versaoModelo = 1) {
  const supabase = getSupabaseServiceRoleClient();

  console.log(`\n📚 [DATASET] Buscando histórico de vendas do banco (v${versaoModelo})...`);

  try {
    const { data, error } = await supabase
      .from('ia_training_dataset')
      .select('*')
      .eq('versao_modelo', versaoModelo)
      .order('id', { ascending: true });

    if (error) {
      console.error('❌ [DATASET] Erro ao buscar:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.warn('⚠️  [DATASET] Nenhum registro encontrado no banco');
      return [];
    }

    // Transforma de volta para formato original
    const dataset = data.map(item => ({
      diasRestantes: item.dias_restantes,
      estoqueVendido: item.estoque_vendido,
      demanda: item.demanda,
      categoria: item.categoria,
      precoBase: item.preco_base,
      vendeuTudo: item.vendeu_tudo
    }));

    console.log(`✅ [DATASET] ${dataset.length} registros carregados do banco\n`);

    return dataset;
  } catch (error) {
    console.error('❌ [DATASET] Erro ao buscar dataset:', error);
    throw error;
  }
}

/**
 * Busca estatísticas do dataset
 */
async function obterEstatisticasDataset(versaoModelo = 1) {
  const supabase = getSupabaseServiceRoleClient();

  console.log(`\n📊 [DATASET] Buscando estatísticas do banco...`);

  try {
    const { data, error } = await supabase
      .from('ia_training_dataset')
      .select('vendeu_tudo, categoria, demanda, dias_restantes, estoque_vendido')
      .eq('versao_modelo', versaoModelo);

    if (error) throw error;

    if (!data || data.length === 0) {
      return null;
    }

    const totalRegistros = data.length;
    const vendeuTudo = data.filter(d => d.vendeu_tudo === 1).length;
    const naoVendeu = data.filter(d => d.vendeu_tudo === 0).length;

    const categorias = {};
    const demandas = {};

    data.forEach(d => {
      categorias[d.categoria] = (categorias[d.categoria] || 0) + 1;
      demandas[d.demanda] = (demandas[d.demanda] || 0) + 1;
    });

    const stats = {
      totalRegistros,
      vendeuTudo,
      naoVendeu,
      percentualBalanceamento: {
        vendeuTudo: ((vendeuTudo / totalRegistros) * 100).toFixed(2) + '%',
        naoVendeu: ((naoVendeu / totalRegistros) * 100).toFixed(2) + '%'
      },
      porCategoria: categorias,
      porDemanda: demandas,
      mediadiasRestantes: (data.reduce((sum, d) => sum + d.dias_restantes, 0) / totalRegistros).toFixed(2),
      mediaEstoqueVendido: (data.reduce((sum, d) => sum + d.estoque_vendido, 0) / totalRegistros).toFixed(2)
    };

    console.log('✅ [DATASET] Estatísticas carregadas\n');
    return stats;
  } catch (error) {
    console.error('❌ [DATASET] Erro ao obter estatísticas:', error);
    throw error;
  }
}

/**
 * Verifica se banco tem dados
 */
async function bancoTemDados(versaoModelo = 1) {
  const supabase = getSupabaseServiceRoleClient();

  try {
    const { count, error } = await supabase
      .from('ia_training_dataset')
      .select('*', { count: 'exact', head: true })
      .eq('versao_modelo', versaoModelo);

    if (error) return false;
    return count > 0;
  } catch (error) {
    return false;
  }
}

module.exports = {
  buscarDatasetDoBanco,
  obterEstatisticasDataset,
  bancoTemDados,
};
