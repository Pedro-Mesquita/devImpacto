/**
 * Script para criar tabela de histórico de vendas e preenchê-la
 * Execute uma vez: node scripts/criarDatasetVendas.js
 */

const { getSupabaseServiceRoleClient } = require('../backend/src/services/suapabase');
const { gerarDatasetBalanceado } = require('../backend/src/ai/dataset');

async function criarTabelaVendas() {
  const supabase = getSupabaseServiceRoleClient();

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 [SETUP] Criando tabela de histórico de vendas');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // 1. Criar tabela
    console.log('🔨 [SETUP] Criando tabela ia_training_dataset...');
    
    const { error: createError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS ia_training_dataset (
          id BIGSERIAL PRIMARY KEY,
          dias_restantes INT NOT NULL,
          estoque_vendido INT NOT NULL CHECK (estoque_vendido >= 0 AND estoque_vendido <= 100),
          demanda VARCHAR(20) NOT NULL CHECK (demanda IN ('baixa', 'media', 'alta')),
          categoria VARCHAR(20) NOT NULL CHECK (categoria IN ('fruta', 'verdura', 'legume')),
          preco_base DECIMAL(10, 2) NOT NULL,
          vendeu_tudo SMALLINT NOT NULL CHECK (vendeu_tudo IN (0, 1)),
          criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          versao_modelo INT DEFAULT 1
        );

        CREATE INDEX IF NOT EXISTS idx_vendeu_tudo ON ia_training_dataset(vendeu_tudo);
        CREATE INDEX IF NOT EXISTS idx_categoria ON ia_training_dataset(categoria);
        CREATE INDEX IF NOT EXISTS idx_demanda ON ia_training_dataset(demanda);
        CREATE INDEX IF NOT EXISTS idx_criado_em ON ia_training_dataset(criado_em);
      `
    });

    if (createError) {
      console.log('⚠️  [SETUP] Tabela pode já existir, continuando...');
    } else {
      console.log('✅ [SETUP] Tabela criada com sucesso\n');
    }

    // 2. Verifica se já tem dados
    const { data: existentes, error: checkError } = await supabase
      .from('ia_training_dataset')
      .select('count', { count: 'exact' });

    if (existentes && existentes.length > 0) {
      console.log('⚠️  [SETUP] Tabela já contém dados. Limpando...\n');
      
      const { error: deleteError } = await supabase
        .from('ia_training_dataset')
        .delete()
        .gte('id', 0);

      if (deleteError) throw deleteError;
      console.log('✅ [SETUP] Dados antigos removidos\n');
    }

    // 3. Gera dataset
    console.log('📚 [SETUP] Gerando 300 registros de histórico de vendas...');
    const dataset = gerarDatasetBalanceado(300);

    console.log(`✅ [SETUP] Dataset gerado:`);
    console.log(`   Total: ${dataset.length} registros`);
    console.log(`   Balanceamento: 50% vendeu tudo, 50% não vendeu\n`);

    // 4. Insere dados em chunks
    console.log('💾 [SETUP] Inserindo dados no banco...\n');

    const registros = dataset.map(item => ({
      dias_restantes: item.diasRestantes,
      estoque_vendido: item.estoqueVendido,
      demanda: item.demanda,
      categoria: item.categoria,
      preco_base: item.precoBase,
      vendeu_tudo: item.vendeuTudo,
      versao_modelo: 1
    }));

    const chunkSize = 100;
    let inserted = 0;

    for (let i = 0; i < registros.length; i += chunkSize) {
      const chunk = registros.slice(i, i + chunkSize);
      
      const { data, error } = await supabase
        .from('ia_training_dataset')
        .insert(chunk)
        .select();

      if (error) {
        console.error(`❌ [SETUP] Erro ao inserir chunk ${i/chunkSize + 1}:`, error);
        throw error;
      }

      inserted += chunk.length;
      const percentual = ((inserted / registros.length) * 100).toFixed(0);
      console.log(`   ✅ ${inserted}/${registros.length} (${percentual}%)`);
    }

    // 5. Verifica dados inseridos
    console.log('\n📊 [SETUP] Verificando dados inseridos...');

    const { data: stats, error: statsError } = await supabase
      .from('ia_training_dataset')
      .select('vendeu_tudo, categoria, demanda');

    if (statsError) throw statsError;

    const vendeuTudo = stats.filter(s => s.vendeu_tudo === 1).length;
    const naoVendeu = stats.filter(s => s.vendeu_tudo === 0).length;

    const categorias = {};
    const demandas = {};

    stats.forEach(s => {
      categorias[s.categoria] = (categorias[s.categoria] || 0) + 1;
      demandas[s.demanda] = (demandas[s.demanda] || 0) + 1;
    });

    console.log(`\n✅ [SETUP] SETUP CONCLUÍDO COM SUCESSO!\n`);
    console.log('📊 Resumo do Histórico de Vendas:');
    console.log(`   Total de registros: ${stats.length}`);
    console.log(`   Vendeu Tudo: ${vendeuTudo} (${((vendeuTudo/stats.length)*100).toFixed(1)}%)`);
    console.log(`   Não Vendeu: ${naoVendeu} (${((naoVendeu/stats.length)*100).toFixed(1)}%)`);
    console.log(`\n   Por Categoria:`);
    console.log(`      Fruta: ${categorias.fruta || 0}`);
    console.log(`      Verdura: ${categorias.verdura || 0}`);
    console.log(`      Legume: ${categorias.legume || 0}`);
    console.log(`\n   Por Demanda:`);
    console.log(`      Baixa: ${demandas.baixa || 0}`);
    console.log(`      Média: ${demandas.media || 0}`);
    console.log(`      Alta: ${demandas.alta || 0}`);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ [SETUP] ERRO FATAL:', error);
    console.error('Detalhes:', error.message);
    process.exit(1);
  }
}

// Executa o script
criarTabelaVendas();