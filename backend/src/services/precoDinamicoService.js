function diasEntreDatas(dataFim, dataInicio) {
  const msPorDia = 24 * 60 * 60 * 1000;
  const diffMs = new Date(dataFim).setHours(0,0,0,0) - new Date(dataInicio).setHours(0,0,0,0);
  return Math.ceil(diffMs / msPorDia);
}

function calcularPrecoDinamico(lote, referencia = new Date()) {
  const { dataValidade, precoBase } = lote;
  const diasParaVencer = diasEntreDatas(dataValidade, referencia);

  let descontoAplicado = 0; 
  if (diasParaVencer <= 2) {
    descontoAplicado = 0.60;
  } else if (diasParaVencer <= 5) {
    descontoAplicado = 0.30;
  } else {
    descontoAplicado = 0.0;
  }

  const precoAtualizado = Number((precoBase * (1 - descontoAplicado)).toFixed(2));

  return {
    precoAtualizado,
    diasParaVencer,
    descontoAplicado,
  };
}

// Avaliação de oferta e demanda baseada em percentual de vendas
// metrics: { totalEstoque, vendidoDesdeEntrada }
// Retorna: { percentualVendas, avaliacao }
function avaliarOfertaDemanda(metrics) {
  const { totalEstoque, vendidoDesdeEntrada } = metrics || {};
  if (!totalEstoque || totalEstoque <= 0) {
    return { percentualVendas: 0, avaliacao: 'indefinido' };
  }

  const percentualVendas = Number(((vendidoDesdeEntrada / totalEstoque) * 100).toFixed(2));
  let avaliacao = 'media';

  // Regra: <=10% baixa, <=20% média, >30% alta
  if (percentualVendas <= 10) {
    avaliacao = 'baixa';
  } else if (percentualVendas <= 20) {
    avaliacao = 'media';
  } else if (percentualVendas > 30) {
    avaliacao = 'alta';
  } else {
    avaliacao = 'media';
  }

  return { percentualVendas, avaliacao };
}

// Calcula preço dinâmico considerando validade + oferta/demanda
// metrics: { totalEstoque, vendidoDesdeEntrada }
function calcularPrecoDinamicoComMercado(lote, metrics, referencia = new Date()) {
  const base = calcularPrecoDinamico(lote, referencia);
  const demanda = avaliarOfertaDemanda(metrics);

  // Ajuste simples:
  // - demanda baixa: aplica +10% de desconto adicional sobre o preço já descontado
  // - demanda média: sem ajuste
  // - demanda alta: reduz desconto em 10% (aumenta preço)
  let precoAjustado = base.precoAtualizado;

  if (demanda.avaliacao === 'baixa') {
    precoAjustado = Number((precoAjustado * 0.90).toFixed(2));
  } else if (demanda.avaliacao === 'alta') {
    precoAjustado = Number((precoAjustado / 0.90).toFixed(2));
  }

  return {
    precoAtualizado: precoAjustado,
    diasParaVencer: base.diasParaVencer,
    descontoAplicado: base.descontoAplicado,
    ofertaDemanda: demanda,
  };
}

// Índice de alerta 1..5 baseado em:
// - validadeDias: quantos dias a fruta pode ficar no mercado
// - diasNaPrateleira: há quantos dias está exposta
// - oferta/demanda (metrics: { totalEstoque, vendidoDesdeEntrada })
// Regras:
//   base pelo uso de validade (proximidade do vencimento):
//     <25% do tempo usado -> 1
//     <50%               -> 2
//     <75%               -> 3
//     <90%               -> 4
//     >=90%              -> 5
//   ajuste por demanda:
//     baixa -> +1 (cap 5)
//     media -> +0
//     alta  -> -1 (floor 1)
function calcularIndiceAlerta(validadeDias, diasNaPrateleira, metrics) {
  const total = Number(validadeDias);
  const naPrateleira = Number(diasNaPrateleira);

  // proteção básica
  if (!Number.isFinite(total) || total <= 0) {
    const demandaIndef = avaliarOfertaDemanda(metrics);
    return {
      indiceAlerta: 1,
      diasNaPrateleira: Number.isFinite(naPrateleira) ? naPrateleira : 0,
      diasParaVencer: 0,
      ofertaDemanda: demandaIndef,
      ocupacaoValidade: 0,
    };
  }

  const diasParaVencer = Math.max(0, total - (Number.isFinite(naPrateleira) ? naPrateleira : 0));
  const ocupacaoValidade = Math.max(0, Math.min(1, (Number.isFinite(naPrateleira) ? naPrateleira : 0) / total));

  let baseIndice;
  if (ocupacaoValidade < 0.25) baseIndice = 1;
  else if (ocupacaoValidade < 0.5) baseIndice = 2;
  else if (ocupacaoValidade < 0.75) baseIndice = 3;
  else if (ocupacaoValidade < 0.9) baseIndice = 4;
  else baseIndice = 5;

  const demanda = avaliarOfertaDemanda(metrics);
  let indiceAlerta = baseIndice;
  if (demanda.avaliacao === 'baixa') {
    indiceAlerta = Math.min(5, indiceAlerta + 1);
  } else if (demanda.avaliacao === 'alta') {
    indiceAlerta = Math.max(1, indiceAlerta - 1);
  }

  return {
    indiceAlerta,
    diasNaPrateleira: Number.isFinite(naPrateleira) ? naPrateleira : 0,
    diasParaVencer,
    ofertaDemanda: demanda,
    ocupacaoValidade,
  };
}

module.exports = { calcularPrecoDinamico, avaliarOfertaDemanda, calcularPrecoDinamicoComMercado, calcularIndiceAlerta };