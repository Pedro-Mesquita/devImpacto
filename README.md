# HackaImpacto - Segurança Alimentar

Sistema inteligente que conecta mercados, produtores e pessoas em vulnerabilidade social, reduzindo desperdício de alimentos através de precificação dinâmica baseada na proximidade da validade.

## 📋 Visão Geral

O sistema monitora lotes de alimentos em tempo real, recalcula preços dinamicamente baseado em:
- **Dias para vencimento** (quanto mais perto de vencer, maior o desconto)
- **Oferta e Demanda** (produtos com baixa venda recebem desconto adicional)
- **Regras configuráveis por cliente** (cada mercado define seus limiares de ativação)

Quando um produto atinge o limiar configurado, o sistema automaticamente:
1. Reduz o preço dinamicamente
2. Dispara notificações para o cliente
3. Marca como "alerta" na base de dados
4. Oferece preço social para pessoas vulneráveis via CadÚnico

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    HACKAIMPACTO BACKEND                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ROTAS (Express)                                              │
│  ├─ POST  /api/preco-dinamico          → Cálculo sob demanda │
│  ├─ POST  /processamento-diario/...    → Processamento manual│
│  └─ GET   /api/jobs/*                  → Monitoramento      │
│                                                               │
│  CONTROLLERS                                                  │
│  ├─ precoDinamicoController            → Calcula N lotes    │
│  ├─ processamentoDiarioController      → Processa clientes  │
│  └─ jobController                      → Status scheduler   │
│                                                               │
│  SERVICES (Lógica de Negócio)                                 │
│  ├─ precoDinamicoService               → Fórmulas + demanda │
│  ├─ processamentoDiarioService         → Avalia status      │
│  ├─ notificacaoService                 → Dispara alertas    │
│  └─ supabase.js                        → Cliente Supabase   │
│                                                               │
│  REPOSITORIES (Supabase)                                      │
│  ├─ precoDinamicoRepository            → Lotes + estoque    │
│  ├─ processamentoDiarioRepository      → CRUD completo      │
│  └─ jobRepository                      → Execuções job      │
│                                                               │
│  DATABASE (PostgreSQL/Supabase)                               │
│  ├─ clientes                           → Dados clientes     │
│  ├─ cliente_configuracao               → Regras/thresholds  │
│  ├─ produtos                           → Catálogo produtos  │
│  ├─ lotes                              → Lotes + status     │
│  ├─ estoque_lote                       → Quantidade/vendas  │
│  ├─ vendas_diarias                     → Vendas por dia     │
│  ├─ lote_status_historico              → Histórico mudanças │
│  ├─ notificacoes                       → Alertas enviados   │
│  └─ processamento_execucoes            → Log de jobs        │
│                                                               │
│  JOBS & SCHEDULER                                             │
│  ├─ jobDiario.js                       → Executa 23h        │
│  └─ scheduler.js (node-cron)           → Agendador          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo Principal (23:00 Todos os Dias)

```
23:00 SCHEDULER ACIONADO
    ↓
[jobDiario.executarJobDiario()]
    ├─ Busca clientes (Supabase: SELECT * FROM clientes)
    ├─ Para cada cliente configurado:
    │   ├─ Busca configuração (SELECT FROM cliente_configuracao)
    │   ├─ Busca lotes (SELECT FROM lotes WHERE cliente_id)
    │   ├─ Para cada lote:
    │   │   ├─ Busca estoque (SELECT FROM estoque_lote)
    │   │   ├─ CALCULA métricas de shelf life:
    │   │   │   ├─ validadeTotalDias (colheita → vencimento)
    │   │   │   ├─ diasFaltamParaVencer (hoje → vencimento)
    │   │   │   ├─ diasDesdeColheita (colheita → hoje)
    │   │   │   └─ percentualUsado = (diasDesdeColheita / validadeTotalDias) × 100
    │   │   ├─ RECALCULA: preço dinâmico (validade + demanda)
    │   │   ├─ AVALIA: percentualUsado > 50% ?
    │   │   ├─ SE status mudou:
    │   │   │   ├─ UPDATE lotes SET status, preco_sugerido
    │   │   │   ├─ INSERT INTO lote_status_historico
    │   │   │   ├─ INSERT INTO notificacoes
    │   │   │   └─ DISPARA notificação (email/sms/app)
    │   │   └─ Adiciona ao relatório
    │   └─ Retorna relatório de mudanças
    │
    └─ Registra execução (INSERT INTO processamento_execucoes)
    ↓
NOTIFICAÇÕES EMITIDAS (email, SMS, push)
    ↓
FLUXO TERMINA - Aguarda próximo dia
```

---

## 📊 Fórmula de Cálculo de Preço Dinâmico

### 1. Desconto por Validade
```
Se dias_para_vencer > 5:    desconto = 0%
Se dias_para_vencer 5-2:    desconto = 30%
Se dias_para_vencer ≤ 2:    desconto = 60%
```

### 2. Avaliação de Oferta/Demanda
```
percentual_vendas = (vendido_desde_entrada / total_estoque) × 100

Se ≤ 10%:  demanda = "baixa"
Se 10-30%: demanda = "média"
Se > 30%:  demanda = "alta"
```

### 3. Fator de Ajuste por Mercado
```
fatorAjuste = 1 - (k1 × pressaoEstoque + k2 × log(razaoUrgencia))

Onde:
  - pressaoEstoque = (% em estoque) × (1 - dias/30)
  - razaoUrgencia = velocidade_necessária / velocidade_atual
  - k1 = 0.25 (peso pressão)
  - k2 = 0.10 (peso urgência)
  - Limites: 0.6 ≤ fatorAjuste ≤ 1.2
```

### 4. Preço Final
```
precoFinal = precoBase × (1 - descontoValidade) × fatorAjuste
descontoTotal = (precoBase - precoFinal) / precoBase × 100
```

---

## 🎯 Status e Regras

| Status | Trigger | Ação |
|--------|---------|------|
| **normal** | percentualUsado ≤ 50% | Sem notificação, preço base |
| **alerta** | percentualUsado > 50% | Notifica, reduz preço, destaca |

### Exemplo: Cálculo de Status

```
Produto: Morango
data_colheita: 2025-12-10
data_validade: 2025-12-21
Hoje: 2025-12-14

Cálculo:
- validadeTotalDias = 11 dias (10/12 → 21/12)
- diasDesdeColheita = 4 dias (10/12 → 14/12)
- diasFaltamParaVencer = 7 dias (14/12 → 21/12)
- percentualUsado = (4 / 11) × 100 = 36.36%

Resultado: 36.36% < 50% → Status: NORMAL

Se fosse data_colheita: 2025-12-05:
- diasDesdeColheita = 9 dias
- percentualUsado = (9 / 11) × 100 = 81.82%
- 81.82% > 50% → Status: ALERTA
```

---

## 📋 Dados no Banco (Supabase)

### Clientes (4)
- Cliente 1 - Mercado Central (30% ativação)
- Cliente 2 - Supermercado Regional (40% ativação)
- Cliente 3 - Rede Grande Premium (60% ativação)
- Cliente 4 - Varejo Especial (90% ativação)

### Lotes (15 produtos)
Todos com preço base **R$ 13.00**

**Frutas:**
- #1: Morango (3 dias, 8% vendido - CRÍTICO)
- #2: Framboesa (3 dias, 20% vendido)
- #3: Banana (7 dias, 45% vendido)
- #9: Maçã (30 dias, 45% vendido - IDEAL)
- #10: Laranja (21 dias, 30% vendido)

**Legumes:**
- #4: Abobrinha (14 dias, 8% vendido)
- #5: Cenoura (21 dias, 7.5% vendido)
- #6: Batata (30 dias, 20% vendido)
- #7: Batata Doce (30 dias, 20% vendido)
- #11: Tomate (14 dias, 40% vendido)
- #13: Batata Inglesa (30 dias, 6% vendido - ESTOQUE GRANDE)
- #14: Melancia (2 dias, 5% vendido - EMERGÊNCIA)
- #15: Abacaxi (10 dias, 0% vendido - SEM VENDA)

**Verduras:**
- #5: Rúcula (3 dias, 15% vendido)
- #6: Alface (5 dias, 50% vendido)
- #7: Couve (7 dias, 20% vendido)

### Vendas Diárias (Mock)
Atualizadas por simulação entre 0-20 unidades/dia por lote

---

## 🚀 Como Usar

### 1. Configurar Banco de Dados (Supabase)

1. Crie uma conta em [Supabase](https://supabase.com)
2. Crie um novo projeto
3. Execute o SQL schema (disponível no projeto) no SQL Editor
4. Execute o SQL seed data para popular as tabelas
5. Copie a URL e Service Role Key do projeto

### 2. Configurar Variáveis de Ambiente

Crie o arquivo `backend/.env`:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui
PORT=3000
```

### 3. Instalação

```bash
cd backend
npm install
```

### 4. Iniciar Servidor

```bash
npm run dev
# Servidor roda em http://localhost:3000
# Scheduler agendado para 23:00 todos os dias
```

### 5. Testar Cálculo de Preço (Sob Demanda)

```bash
# Use UUIDs reais do seu banco Supabase
curl -X POST http://localhost:3000/api/preco-dinamico \
  -H "Content-Type: application/json" \
  -d '{
    "loteIds": ["uuid-lote-1", "uuid-lote-2", "uuid-lote-3"]
  }'
```

**Resposta:**
```json
{
  "total": 3,
  "resultados": [
    {
      "loteId": "uuid-lote-1",
      "nomeProduto": "Morango Vermelho",
      "categoria": "fruta",
      "precoBase": 13.00,
      "precoSugerido": 3.60,
      "diasParaVencer": 2,
      "demanda": "baixa",
      "percentualVendas": 8,
      "descontoValidade": 60.00,
      "descontoTotal": 72.31
    }
  ]
}
```

### 6. Simular Execução do Job (AGORA)

```bash
curl -X POST http://localhost:3000/api/jobs/executar-agora
```

### 7. Verificar Status do Scheduler

```bash
curl http://localhost:3000/api/jobs/status
```

### 8. Histórico de Última Execução

```bash
curl http://localhost:3000/api/jobs/ultima-execucao
```

### 9. Processar Cliente Manualmente

```bash
# Use o UUID real do cliente do seu banco Supabase
curl -X POST http://localhost:3000/processamento-diario/cliente/uuid-cliente-1 \
  -H "Content-Type: application/json" \
  -d '{
    "loteIds": ["uuid-lote-1", "uuid-lote-2", "uuid-lote-3"]
  }'
```

### 10. Health Check

```bash
curl http://localhost:3000/health
```

---

## 📁 Estrutura de Pastas

```
backend/
├── src/
│   ├── index.js                          # Entry point + routes + dotenv
│   ├── controllers/
│   │   ├── precoDinamicoController.js    # Cálculo de preço
│   │   ├── processamentoDiarioController.js
│   │   └── jobController.js              # Monitoramento
│   ├── services/
│   │   ├── precoDinamicoService.js       # Fórmulas + demanda
│   │   ├── processamentoDiarioService.js # Avalia status
│   │   ├── notificacaoService.js         # Dispara alertas
│   │   └── supabase.js                   # Cliente Supabase
│   ├── repository/
│   │   ├── precoDinamicoRepository.js    # Lotes + estoque (Supabase)
│   │   ├── processamentoDiarioRepository.js # CRUD completo (Supabase)
│   │   └── jobRepository.js              # Execuções job (Supabase)
│   ├── routes/
│   │   ├── precoDinamicoRoutes.js
│   │   ├── processamentoDiarioRoutes.js
│   │   └── jobRoutes.js
│   └── jobs/
│       ├── jobDiario.js                  # Lógica 23h + cálculo 50%
│       └── scheduler.js                  # node-cron
├── .env                                  # Supabase credentials
├── package.json
└── package-lock.json
```

---

## 🔧 Endpoints

### Cálculo de Preço

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/preco-dinamico` | Calcula preço dinâmico para N lotes |

### Processamento Diário

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/processamento-diario/cliente/:clienteId` | Processa um cliente |
| POST | `/processamento-diario/todos` | Processa todos os clientes |

### Jobs & Scheduler

| Método | Endpoint | Descrição |
|--------|----------|--------|
| GET | `/api/jobs/status` | Status do scheduler |
| GET | `/api/jobs/ultima-execucao` | Detalhes última execução |
| POST | `/api/jobs/executar-agora` | Força execução imediata |

### Health

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/health` | Status do servidor |

---

## 📱 Cenários de Teste

### Cenário 1: Produto Crítico (Morango)
```json
POST /api/preco-dinamico
{
  "loteIds": ["1"]  // Morango: 2 dias, 8% vendido
}

Esperado:
- descontoTotal: ~70%
- Status: alerta
- Notificação: ativada
```

### Cenário 2: Produto em Alta Demanda (Banana)
```json
POST /api/preco-dinamico
{
  "loteIds": ["9"]  // Banana: 7 dias, 45% vendido
}

Esperado:
- descontoTotal: ~10-20%
- Status: normal
- Notificação: NÃO enviada
```

### Cenário 3: Estoque Gigante Parado (Batata Inglesa)
```json
POST /api/preco-dinamico
{
  "loteIds": ["13"]  // 500 unidades, 6% vendidas
}

Esperado:
- descontoTotal: ~30-40%
- Status: alerta (estoque pressiona)
- Notificação: ativada
```

### Cenário 4: Sem Nenhuma Venda (Abacaxi)
```json
POST /api/preco-dinamico
{
  "loteIds": ["15"]  // 0% vendido
}

Esperado:
- descontoTotal: ~50%+
- Status: alerta
- Notificação: crítica
```

---

## 🔮 Próximas Implementações

- [x] Banco de dados real (PostgreSQL/Supabase) ✅
- [x] Repository pattern com Supabase ✅
- [x] Cálculo de shelf life (50% threshold) ✅
- [x] Persistência de status e preço sugerido ✅
- [ ] Autenticação JWT
- [ ] Integração SendGrid (email real)
- [ ] Integração Twilio (SMS real)
- [ ] Firebase (push notifications)
- [ ] Dashboard web (React/Vue)
- [ ] Validação CadÚnico
- [ ] API móvel (React Native)
- [ ] Analytics & relatórios

---

## 📧 Contato

**Projeto:** HackaImpacto - Segurança Alimentar  
**GitHub:** https://github.com/Pedro-Mesquita/devImpacto  
**Data:** Dezembro 2025

---

## 📄 Licença

Este projeto é parte do HackaImpacto 2025 para reduzir desperdício de alimentos e combater insegurança alimentar.
