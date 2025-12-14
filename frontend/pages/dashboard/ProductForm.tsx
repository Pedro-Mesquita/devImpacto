import React, { useState } from 'react';
import { Layout } from '../../components/Layout';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Check, Info, Sparkles, AlertTriangle, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ProductForm: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Mock State
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    expiry: '',
    marketPrice: '8.50'
  });

  const handleSuggest = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 1500);
  };

  const handleConfirm = () => {
    navigate('/market');
  };

  return (
    <Layout role="market">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-prato-dark mb-6">
          {step === 1 ? 'Cadastrar Novo Produto' : 'Sugestão de Precificação Social'}
        </h1>

        {step === 1 && (
          <Card>
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSuggest(); }}>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-prato-dark">Nome do Produto</label>
                  <input 
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-prato-green outline-none"
                    placeholder="Ex: Tomate Italiano"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-prato-dark">Categoria</label>
                  <select className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-prato-green outline-none">
                    <option>Frutas</option>
                    <option>Legumes</option>
                    <option>Verduras</option>
                    <option>Padaria</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-prato-dark">Quantidade (kg/un)</label>
                  <input 
                    type="number" 
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-prato-green outline-none"
                    value={formData.quantity}
                    onChange={e => setFormData({...formData, quantity: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-medium text-prato-dark">Validade</label>
                   <input 
                    type="date" 
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-prato-green outline-none"
                    value={formData.expiry}
                    onChange={e => setFormData({...formData, expiry: e.target.value})}
                   />
                </div>
                 <div className="space-y-2">
                   <label className="text-sm font-medium text-prato-dark">Preço Mercado (R$)</label>
                   <input 
                    type="number" step="0.01"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-prato-green outline-none"
                    value={formData.marketPrice}
                    onChange={e => setFormData({...formData, marketPrice: e.target.value})}
                   />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-prato-dark">Estado de Conservação / Obs</label>
                <textarea 
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-prato-green outline-none h-24 resize-none"
                  placeholder="Ex: Maduros, ideais para molho. Embalagem levemente amassada."
                ></textarea>
              </div>

              <div className="pt-4 flex gap-4">
                <Button variant="outline" type="button" onClick={() => navigate('/market')}>Cancelar</Button>
                <Button type="submit" loading={loading} icon={<Sparkles size={18}/>}>
                  Gerar Sugestão Inteligente
                </Button>
              </div>
            </form>
          </Card>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Pricing Card */}
              <Card>
                <div className="flex items-center gap-2 mb-4 text-prato-green">
                  <Sparkles size={20} />
                  <h3 className="font-bold">IA Sugere: Preço Social</h3>
                </div>
                
                <div className="flex items-end gap-2 mb-6">
                  <div className="text-4xl font-bold text-prato-dark">R$ 2,50<span className="text-lg text-prato-muted font-normal">/kg</span></div>
                  <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-bold mb-2">-70%</div>
                </div>

                <div className="space-y-3 border-t border-gray-100 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-prato-muted">Preço Mercado:</span>
                    <span className="line-through decoration-red-500 decoration-2">R$ {formData.marketPrice}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-prato-muted">Validade:</span>
                    <span className="text-orange-600 font-medium">Vence em 2 dias</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-prato-muted">Impacto Potencial:</span>
                    <span className="text-prato-dark font-medium">~{Number(formData.quantity) * 4} Refeições</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
                  <Info size={16} className="inline mr-1 mb-0.5" />
                  Este preço cobre custos logísticos básicos e incentiva a retirada rápida por ONGs locais.
                </div>
              </Card>

              {/* Destination Match */}
              <Card>
                <h3 className="font-bold text-prato-dark mb-4">Destinos Recomendados</h3>
                <div className="space-y-3">
                  <div className="p-3 border border-green-200 bg-green-50 rounded-lg cursor-pointer hover:shadow-md transition-shadow relative">
                    <div className="absolute -top-2 -right-2 bg-prato-green text-white text-xs px-2 py-0.5 rounded-full">Top Match</div>
                    <h4 className="font-bold text-prato-dark">Cozinha Solidária São José</h4>
                    <p className="text-sm text-prato-muted">2.4 km de distância • Busca produtos para almoço de amanhã</p>
                    <div className="mt-2 text-xs font-semibold text-green-700">98% Compatibilidade</div>
                  </div>

                  <div className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:shadow-md transition-shadow opacity-70 hover:opacity-100">
                    <h4 className="font-bold text-prato-dark">Abrigo Esperança</h4>
                    <p className="text-sm text-prato-muted">5.1 km de distância</p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleConfirm} className="flex-1" icon={<Check size={20} />}>
                Publicar Oferta
              </Button>
              <Button variant="secondary" className="flex-1" icon={<Heart size={20} />}>
                Doar Gratuitamente (100% OFF)
              </Button>
              <Button variant="outline" onClick={() => setStep(1)} className="flex-none">
                Voltar
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};