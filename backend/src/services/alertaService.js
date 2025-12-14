const loteRepository = require('../repositories/loteRepository');

class AlertaService {
  async buscarLotesEmAlerta(clienteId) {
    // Busca todos os lotes do cliente
    const todosLotesAlerta = await loteRepository.buscarPorStatus(clienteId, 'alerta');
    console.log('Todos os lotes do cliente:', todosLotesAlerta);
    if (!todosLotesAlerta || todosLotesAlerta.length === 0) {
      return [];
    }


    return todosLotesAlerta;};

}

module.exports = new AlertaService();