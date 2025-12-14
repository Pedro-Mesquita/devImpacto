/**
 * Módulo de IA para predição de vendas
 * Treina uma rede neural para prever probabilidade de vender todo o estoque
 */

let tf;
try {
  tf = require('@tensorflow/tfjs-node');
} catch (e) {
  console.warn('[AI] @tensorflow/tfjs-node not available, using stub predictions. Install it to enable training.');
  tf = null;
}
const fs = require('fs');
const path = require('path');
const { gerarDatasetBalanceado } = require('./dataset');

const MODEL_PATH = path.join(__dirname, '../../model');

let model = null;
let aiEnabled = !!tf;

/**
 * Normaliza um valor entre min e max para 0-1
 */
function normalize(value, min, max) {
  return (value - min) / (max - min);
}

/**
 * Converte demanda em número: baixa=0, media=1, alta=2
 */
function demandaParaNumero(demanda) {
  const map = { baixa: 0, media: 1, alta: 2 };
  return map[demanda] || 1;
}

/**
 * Faz one-hot encoding da categoria
 */
function categoriaParaOneHot(categoria) {
  const categorias = ['fruta', 'verdura', 'legume'];
  return categorias.map((cat) => (cat === categoria ? 1 : 0));
}

/**
 * Cria a arquitetura da rede neural
 */
function criarModelo() {
  if (!tf) {
    throw new Error('TensorFlow not available');
  }
  console.log('🧠 [MODEL] Criando arquitetura da rede neural...');

  const modelo = tf.sequential({
    layers: [
      // Input: 6 features (diasRestantes, estoqueVendido, demanda, categoria[3], precoBase)
      tf.layers.dense({
        inputShape: [6],
        units: 16,
        activation: 'relu',
        name: 'hidden1',
      }),
      tf.layers.dropout({ rate: 0.2 }),

      tf.layers.dense({
        units: 8,
        activation: 'relu',
        name: 'hidden2',
      }),

      // Output: 1 feature (probabilidade 0-1)
      tf.layers.dense({
        units: 1,
        activation: 'sigmoid',
        name: 'output',
      }),
    ],
  });

  modelo.compile({
    optimizer: tf.train.adam(0.01),
    loss: 'binaryCrossentropy',
    metrics: ['accuracy'],
  });

  console.log('✅ [MODEL] Arquitetura criada com sucesso');
  modelo.summary();

  return modelo;
}

/**
 * Processa o dataset para formato de treino
 */
function processarDataset(dataset) {
  console.log('📊 [MODEL] Processando dataset...');

  const inputs = [];
  const outputs = [];

  dataset.forEach((item) => {
    // Normaliza inputs (0-1)
    const diasNorm = normalize(item.diasRestantes, -1, 20);
    const estoqueNorm = item.estoqueVendido / 100;
    const demandaNum = demandaParaNumero(item.demanda) / 2; // 0-1
    const categoriaOneHot = categoriaParaOneHot(item.categoria); // [fruta, verdura, legume]
    
    // NÃO incluir precoNorm aqui - já temos 6 features
    // Concatena tudo: [diasNorm, estoqueNorm, demandaNum, fruta, verdura, legume]
    const input = [
      diasNorm,           // feature 1
      estoqueNorm,        // feature 2
      demandaNum,         // feature 3
      ...categoriaOneHot, // features 4, 5, 6 (one-hot encoding)
    ];

    inputs.push(input);
    outputs.push([item.vendeuTudo]); // 0 ou 1
  });

  console.log(`✅ [MODEL] Dataset processado: ${inputs.length} exemplos`);
  console.log(`   Cada exemplo tem ${inputs[0].length} features`);

  return {
    inputs: tf.tensor2d(inputs),
    outputs: tf.tensor2d(outputs),
  };
}

/**
 * Treina o modelo com dados mockados
 */
async function trainModel() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🤖 [MODEL] Iniciando treinamento');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (!tf) {
    console.warn('[AI] Train skipped: TensorFlow not available');
    return;
  }
  try {
    // 1. Cria modelo
    model = criarModelo();

    // 2. Gera dataset
    console.log('📚 [MODEL] Gerando dataset balanceado...');
    const dataset = gerarDatasetBalanceado(300);
    console.log(`✅ [MODEL] Dataset gerado com ${dataset.length} registros\n`);

    // 3. Processa dataset
    const { inputs, outputs } = processarDataset(dataset);

    // 4. Treina
    console.log('🏋️  [MODEL] Iniciando treinamento...\n');
    const history = await model.fit(inputs, outputs, {
      epochs: 50,
      batchSize: 32,
      validationSplit: 0.2,
      verbose: 1,
      shuffle: true,
    });

    console.log('\n✅ [MODEL] Treinamento completo!');
    console.log(
      `   Acurácia final: ${(history.history.acc[history.history.acc.length - 1] * 100).toFixed(
        2
      )}%`
    );

    // 5. Salva modelo
    console.log('\n💾 [MODEL] Salvando modelo...');
    await salvarModelo();

    // Limpa tensors
    inputs.dispose();
    outputs.dispose();

    console.log('✅ [MODEL] Modelo salvo com sucesso!\n');
  } catch (error) {
    console.error('❌ [MODEL] Erro ao treinar:', error);
    throw error;
  }
}

/**
 * Salva o modelo treinado
 */
async function salvarModelo() {
  if (!model || !tf) {
    console.warn('⚠️  [MODEL] Modelo não foi criado');
    return;
  }

  try {
    const modelPath = `file://${MODEL_PATH}`;
    await model.save(modelPath);
    console.log(`✅ [MODEL] Modelo salvo em: ${MODEL_PATH}`);
  } catch (error) {
    console.error('❌ [MODEL] Erro ao salvar modelo:', error);
  }
}

/**
 * Carrega modelo treinado do disco
 */
async function carregarModelo() {
  if (!tf) {
    return false;
  }
  try {
    console.log('📂 [MODEL] Verificando modelo salvo...');

    const modelPath = `file://${MODEL_PATH}`;
    const indexPath = path.join(MODEL_PATH, 'model.json');

    if (fs.existsSync(indexPath)) {
      console.log('✅ [MODEL] Modelo encontrado, carregando...');
      model = await tf.loadLayersModel(modelPath + '/model.json');
      console.log('✅ [MODEL] Modelo carregado com sucesso!\n');
      return true;
    } else {
      console.log('⚠️  [MODEL] Modelo não encontrado, será necessário treinar\n');
      return false;
    }
  } catch (error) {
    console.error('❌ [MODEL] Erro ao carregar modelo:', error);
    return false;
  }
}

/**
 * Inicializa o modelo (carrega ou treina)
 */
async function inicializarModelo() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⚙️  [MODEL] Inicializando modelo de IA');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const modeloCarregado = await carregarModelo();

  if (!modeloCarregado) {
    console.log('🔄 [MODEL] Treinando novo modelo...');
    await trainModel();
  }

  if (!model) {
    aiEnabled = false;
  }
}

/**
 * Faz predição para um produto
 */
function predict(input) {
  console.log(`\n🔮 [MODEL] Fazendo predição...`);
  console.log('   Input recebido:', input);

  if (!aiEnabled || !tf || !model) {
    // Fallback heuristic when AI is disabled
    const prob = 0.5; // neutral default
    const descontoIdeal = calcularDescontoIdeal(prob);
    return { probabilidadeVenderTudo: prob, descontoIdeal };
  }

  try {
    // Normaliza inputs
    const diasNorm = normalize(input.diasRestantes, -1, 20);
    const estoqueNorm = input.estoqueVendido / 100;
    const demandaNum = demandaParaNumero(input.demanda) / 2;
    const categoriaOneHot = categoriaParaOneHot(input.categoria);

    // Mesmo padrão de features: 6 no total
    const inputArray = [
      diasNorm,           // feature 1
      estoqueNorm,        // feature 2
      demandaNum,         // feature 3
      ...categoriaOneHot, // features 4, 5, 6
    ];

    console.log('   Input normalizado:', inputArray);
    console.log(`   Total de features: ${inputArray.length}`);

    const inputTensor = tf.tensor2d([inputArray]);
    const prediction = model.predict(inputTensor);
    const probabilidade = prediction.dataSync()[0];

    console.log(`   Probabilidade de vender tudo: ${probabilidade.toFixed(4)}`);

    // Calcula desconto ideal
    const descontoIdeal = calcularDescontoIdeal(probabilidade);
    console.log(`   Desconto ideal: ${descontoIdeal}%\n`);

    // Limpa tensors
    inputTensor.dispose();
    prediction.dispose();

    return {
      probabilidadeVenderTudo: probabilidade,
      descontoIdeal: descontoIdeal,
    };
  } catch (error) {
    console.error('❌ [MODEL] Erro ao fazer predição:', error);
    throw error;
  }
}

/**
 * Calcula o desconto ideal baseado na probabilidade
 */
function calcularDescontoIdeal(probabilidade) {
  if (probabilidade >= 0.75) return 5; // 0-10%
  if (probabilidade >= 0.50) return 17; // 10-25%
  if (probabilidade >= 0.25) return 37; // 25-50%
  return 60; // 50-70%
}

// Inicializa o modelo quando o módulo é carregado
(async () => {
  try {
    await inicializarModelo();
  } catch (error) {
    console.warn('[AI] Inicialização de IA desabilitada ou falhou; continuando sem IA:', error.message);
    aiEnabled = false;
  }
})();

module.exports = {
  predict,
  trainModel,
  inicializarModelo,
  salvarModelo,
  carregarModelo,
};
