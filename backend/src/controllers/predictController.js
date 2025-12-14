/**
 * Controller para predições de IA
 * Recebe dados de produtos e retorna probabilidade + desconto ideal
 */

const { inicializarModelo, predict, calcularDescontoIdeal } = require('../ai/model');

class PredictController {
  /**
   * POST /api/predict
   * Body: { diasRestantes, estoqueVendido, demanda, categoria, precoBase }
   * Retorna: { probabilidadeVenderTudo, descontoIdeal }
   */
  async fazerPredicao(req, res) {
    try {
      const { diasRestantes, estoqueVendido, demanda, categoria, precoBase } = req.body;

      // Validação dos campos obrigatórios
      if (
        diasRestantes === undefined ||
        estoqueVendido === undefined ||
        !demanda ||
        !categoria ||
        precoBase === undefined
      ) {
        return res.status(400).json({
          error: 'Campos obrigatórios faltando',
          camposNecessarios: {
            diasRestantes: 'número (-1 a 20)',
            estoqueVendido: 'número (0 a 100)',
            demanda: 'string ("baixa", "media" ou "alta")',
            categoria: 'string ("fruta", "verdura" ou "legume")',
            precoBase: 'número',
          },
        });
      }

      // Validação dos valores
      if (typeof diasRestantes !== 'number' || diasRestantes < -1 || diasRestantes > 20) {
        return res.status(400).json({
          error: 'diasRestantes deve ser um número entre -1 e 20',
        });
      }

      if (typeof estoqueVendido !== 'number' || estoqueVendido < 0 || estoqueVendido > 100) {
        return res.status(400).json({
          error: 'estoqueVendido deve ser um número entre 0 e 100',
        });
      }

      if (!['baixa', 'media', 'alta'].includes(demanda.toLowerCase())) {
        return res.status(400).json({
          error: 'demanda deve ser "baixa", "media" ou "alta"',
        });
      }

      if (!['fruta', 'verdura', 'legume'].includes(categoria.toLowerCase())) {
        return res.status(400).json({
          error: 'categoria deve ser "fruta", "verdura" ou "legume"',
        });
      }

      if (typeof precoBase !== 'number' || precoBase <= 0) {
        return res.status(400).json({
          error: 'precoBase deve ser um número maior que 0',
        });
      }

      // Inicializa o modelo (carrega ou treina se necessário)
      const modelo = await inicializarModelo();

      // Prepara input
      const input = {
        diasRestantes,
        estoqueVendido,
        demanda: demanda.toLowerCase(),
        categoria: categoria.toLowerCase(),
        precoBase,
      };

      // Faz a predição
      const probabilidadeVenderTudo = await predict(input, modelo);

      // Calcula desconto ideal
      const descontoIdeal = calcularDescontoIdeal(probabilidadeVenderTudo);

      // Calcula preço com desconto
      const precoComDesconto = precoBase * (1 - descontoIdeal / 100);

      return res.status(200).json({
        input: {
          diasRestantes,
          estoqueVendido,
          demanda,
          categoria,
          precoBase,
        },
        resultado: {
          probabilidadeVenderTudo: Number(probabilidadeVenderTudo.toFixed(4)),
          descontoIdeal,
          precoComDesconto: Number(precoComDesconto.toFixed(2)),
          economia: Number((precoBase - precoComDesconto).toFixed(2)),
        },
        recomendacao: this._gerarRecomendacao(probabilidadeVenderTudo, diasRestantes),
      });
    } catch (error) {
      console.error('❌ Erro ao fazer predição:', error);
      return res.status(500).json({
        error: 'Erro ao processar predição',
        message: error.message,
      });
    }
  }

  /**
   * POST /api/predict/batch
   * Body: { produtos: [{ diasRestantes, estoqueVendido, ... }, ...] }
   * Retorna: array com predições para cada produto
   */
  async fazerPredicaoEmLote(req, res) {
    try {
      const { produtos } = req.body;

      if (!produtos || !Array.isArray(produtos) || produtos.length === 0) {
        return res.status(400).json({
          error: 'produtos deve ser um array não vazio',
        });
      }

      // Inicializa o modelo uma vez
      const modelo = await inicializarModelo();

      // Processa cada produto
      const resultados = [];
      for (const produto of produtos) {
        try {
          const input = {
            diasRestantes: produto.diasRestantes,
            estoqueVendido: produto.estoqueVendido,
            demanda: produto.demanda?.toLowerCase(),
            categoria: produto.categoria?.toLowerCase(),
            precoBase: produto.precoBase,
          };

          const probabilidadeVenderTudo = await predict(input, modelo);
          const descontoIdeal = calcularDescontoIdeal(probabilidadeVenderTudo);
          const precoComDesconto = produto.precoBase * (1 - descontoIdeal / 100);

          resultados.push({
            idProduto: produto.id || null,
            input,
            resultado: {
              probabilidadeVenderTudo: Number(probabilidadeVenderTudo.toFixed(4)),
              descontoIdeal,
              precoComDesconto: Number(precoComDesconto.toFixed(2)),
              economia: Number((produto.precoBase - precoComDesconto).toFixed(2)),
            },
          });
        } catch (error) {
          resultados.push({
            idProduto: produto.id || null,
            erro: error.message,
          });
        }
      }

      return res.status(200).json({
        total: produtos.length,
        sucesso: resultados.filter((r) => !r.erro).length,
        falhas: resultados.filter((r) => r.erro).length,
        resultados,
      });
    } catch (error) {
      console.error('❌ Erro ao fazer predição em lote:', error);
      return res.status(500).json({
        error: 'Erro ao processar predição em lote',
        message: error.message,
      });
    }
  }

  /**
   * GET /api/predict/status
   * Retorna status do modelo de IA
   */
  async obterStatus(req, res) {
    try {
      const modelo = await inicializarModelo();

      return res.status(200).json({
        status: 'online',
        modeloCarregado: !!modelo,
        versao: '1.0.0',
        mensagem: 'Modelo de IA pronto para predições',
      });
    } catch (error) {
      console.error('❌ Erro ao obter status:', error);
      return res.status(500).json({
        status: 'erro',
        error: error.message,
      });
    }
  }

  /**
   * Gera recomendação textual baseada na probabilidade
   */
  _gerarRecomendacao(probabilidade, diasRestantes) {
    if (probabilidade >= 0.75) {
      return 'ALTA probabilidade de vender tudo. Manter preço ou aplicar desconto mínimo.';
    } else if (probabilidade >= 0.50) {
      return 'MÉDIA-ALTA probabilidade de vender. Aplicar desconto moderado para garantir venda.';
    } else if (probabilidade >= 0.25) {
      return 'MÉDIA-BAIXA probabilidade de vender. Aplicar desconto significativo.';
    } else {
      if (diasRestantes <= 3) {
        return 'CRÍTICO: Baixa probabilidade + poucos dias. Aplicar desconto máximo ou doar.';
      }
      return 'BAIXA probabilidade de vender tudo. Aplicar desconto alto urgentemente.';
    }
  }
}

module.exports = new PredictController();
