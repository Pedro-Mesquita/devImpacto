# 🤖 Módulo de IA - Predição de Vendas

Sistema de Machine Learning usando TensorFlow.js para prever probabilidade de venda de produtos perecíveis e calcular desconto ideal.

## 📋 Estrutura dos Arquivos

```
backend/
├── src/
│   ├── ai/
│   │   ├── dataset.js          # Gerador de dataset mockado (300 registros)
│   │   └── model.js            # Modelo TensorFlow.js (rede neural)
│   ├── controllers/
│   │   └── predictController.js # Controller das rotas de predição
│   └── routes/
│       └── predictRoutes.js     # Rotas da API de predição
├── model/                       # Modelo treinado salvo (gerado automaticamente)
│   ├── model.json
│   └── weights.bin
└── package.json
```

## 🚀 Instalação

```bash
cd backend
npm install @tensorflow/tfjs-node
```

## 📊 Como Funciona

### 1. Dataset
- Gera automaticamente 300 registros de produtos com características variadas
- Balanceado: 50% venderam tudo, 50% não venderam
- Features: dias restantes, estoque vendido, demanda, categoria, preço base

### 2. Modelo de IA
- **Arquitetura**: Rede Neural Feedforward
  - Camada de entrada: 6 features
  - Camada oculta 1: 16 neurônios + ReLU
  - Camada oculta 2: 8 neurônios + ReLU
  - Dropout: 20% (evita overfitting)
  - Camada de saída: 1 neurônio + Sigmoid (probabilidade 0-1)
- **Treinamento**: 100 epochs, batch size 32
- **Loss**: Binary Crossentropy
- **Optimizer**: Adam (learning rate 0.001)

### 3. Cálculo de Desconto
Baseado na probabilidade predita:
- **≥ 0.75** → desconto **0% a 10%** (alta chance de vender)
- **≥ 0.50** → desconto **10% a 25%** (média-alta chance)
- **≥ 0.25** → desconto **25% a 50%** (média-baixa chance)
- **< 0.25** → desconto **50% a 70%** (baixa chance, urgente)

## 🔌 API Endpoints

### 1. POST `/api/predict`
Predição para um único produto.

**Request:**
```json
{
  "diasRestantes": 5,
  "estoqueVendido": 30,
  "demanda": "baixa",
  "categoria": "fruta",
  "precoBase": 13
}
```

**Response:**
```json
{
  "input": {
    "diasRestantes": 5,
    "estoqueVendido": 30,
    "demanda": "baixa",
    "categoria": "fruta",
    "precoBase": 13
  },
  "resultado": {
    "probabilidadeVenderTudo": 0.3421,
    "descontoIdeal": 38,
    "precoComDesconto": 8.06,
    "economia": 4.94
  },
  "recomendacao": "MÉDIA-BAIXA probabilidade de vender. Aplicar desconto significativo."
}
```

### 2. POST `/api/predict/batch`
Predição para múltiplos produtos de uma vez.

**Request:**
```json
{
  "produtos": [
    {
      "id": "prod_1",
      "diasRestantes": 10,
      "estoqueVendido": 70,
      "demanda": "alta",
      "categoria": "verdura",
      "precoBase": 13
    },
    {
      "id": "prod_2",
      "diasRestantes": 2,
      "estoqueVendido": 15,
      "demanda": "baixa",
      "categoria": "fruta",
      "precoBase": 13
    }
  ]
}
```

**Response:**
```json
{
  "total": 2,
  "sucesso": 2,
  "falhas": 0,
  "resultados": [
    {
      "idProduto": "prod_1",
      "resultado": {
        "probabilidadeVenderTudo": 0.8234,
        "descontoIdeal": 8,
        "precoComDesconto": 11.96,
        "economia": 1.04
      }
    },
    {
      "idProduto": "prod_2",
      "resultado": {
        "probabilidadeVenderTudo": 0.1523,
        "descontoIdeal": 58,
        "precoComDesconto": 5.46,
        "economia": 7.54
      }
    }
  ]
}
```

### 3. GET `/api/predict/status`
Verifica se o modelo está carregado e funcionando.

**Response:**
```json
{
  "status": "online",
  "modeloCarregado": true,
  "versao": "1.0.0",
  "mensagem": "Modelo de IA pronto para predições"
}
```

## 📝 Validações

### Campos obrigatórios:
- `diasRestantes` (number, -1 a 20)
- `estoqueVendido` (number, 0 a 100 - percentual)
- `demanda` (string: "baixa", "media" ou "alta")
- `categoria` (string: "fruta", "verdura" ou "legume")
- `precoBase` (number, > 0)

## 🧪 Testando a API

### Teste 1: Produto com alta probabilidade de vender
```bash
curl -X POST http://localhost:3000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "diasRestantes": 15,
    "estoqueVendido": 80,
    "demanda": "alta",
    "categoria": "legume",
    "precoBase": 13
  }'
```

### Teste 2: Produto crítico (vence em breve + baixa venda)
```bash
curl -X POST http://localhost:3000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "diasRestantes": 2,
    "estoqueVendido": 10,
    "demanda": "baixa",
    "categoria": "fruta",
    "precoBase": 13
  }'
```

### Teste 3: Verificar status do modelo
```bash
curl http://localhost:3000/api/predict/status
```

## 🔄 Fluxo de Funcionamento

1. **Primeira requisição**: 
   - Modelo não existe → treina automaticamente com 300 registros
   - Salva em `/backend/model/`
   - Tempo: ~30-60 segundos

2. **Requisições seguintes**: 
   - Carrega modelo do disco
   - Predições instantâneas (< 100ms)

3. **Re-treinar**: 
   - Delete a pasta `/backend/model/`
   - Próxima requisição treina novo modelo

## 🎯 Features Implementadas

✅ Geração automática de dataset balanceado (300 registros)  
✅ Rede neural com 2 camadas ocultas + dropout  
✅ Normalização de dados (0-1)  
✅ One-hot encoding para categoria  
✅ Salvamento e carregamento automático do modelo  
✅ Cálculo de desconto baseado em probabilidade  
✅ Validação completa de inputs  
✅ Suporte a predição em lote (batch)  
✅ Endpoint de status do modelo  
✅ Tratamento de erros robusto  
✅ Logs informativos durante treinamento  
✅ Código modular e comentado  

## 🛠️ Tecnologias

- **TensorFlow.js** (@tensorflow/tfjs-node)
- **Node.js** (CommonJS)
- **Express.js**

## 📈 Próximos Passos (Melhorias Futuras)

- [ ] Adicionar mais features (histórico de vendas, sazonalidade)
- [ ] Implementar validação cruzada (k-fold)
- [ ] Criar dashboard de métricas do modelo
- [ ] Adicionar logs de predições para melhorar dataset
- [ ] Implementar retreinamento periódico com dados reais
- [ ] Adicionar testes unitários
- [ ] Otimizar hiperparâmetros (grid search)
- [ ] Adicionar explicabilidade (SHAP values)

## 🐛 Troubleshooting

### Erro: "Cannot find module '@tensorflow/tfjs-node'"
```bash
npm install @tensorflow/tfjs-node
```

### Modelo demora muito para treinar
- Normal na primeira vez (~30-60s)
- Após treinar, o modelo é salvo e carrega instantaneamente

### Predições imprecisas
- Modelo usa dataset mockado
- Para produção: treinar com dados reais de vendas

---

**Desenvolvido para HackaImpacto** 🌱
