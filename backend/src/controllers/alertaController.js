const alertaService = require('../services/alertaService');

class AlertaController {
  async listarLotesEmAlerta(req, res) {
    try {
      const { clienteId } = req.query;

      if (!clienteId) {
        return res.status(400).json({
          error: 'clienteId é obrigatório'
        });
      }

      const resultado = await alertaService.buscarLotesEmAlerta(clienteId);
      console.log('Lotes em alerta:', resultado);
      return res.status(200).json(resultado);
    } catch (error) {
      console.error('Erro ao buscar lotes em alerta:', error);
      return res.status(500).json({
        error: 'Erro ao buscar lotes em alerta',
        message: error.message
      });
    }
  }
}

module.exports = new AlertaController();