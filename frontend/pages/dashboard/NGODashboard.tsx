import React from 'react';
import { Layout } from '../../components/Layout';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { MapPin, Clock, ShoppingBag, ArrowRight } from 'lucide-react';

const offers = [
  { id: 1, product: 'Banana Nanica', qtd: '20kg', supplier: 'Mercado Central', dist: '1.2km', expiry: 'Vence Hoje', urgent: true, price: 'R$ 1,50/kg' },
  { id: 2, product: 'Pães Variados', qtd: '5kg', supplier: 'Padaria da Esquina', dist: '0.5km', expiry: 'Vence Amanhã', urgent: true, price: 'Grátis' },
  { id: 3, product: 'Abóbora Cabotiá', qtd: '35kg', supplier: 'Hortifruti Verde', dist: '3.8km', expiry: '4 dias', urgent: false, price: 'R$ 0,80/kg' },
  { id: 4, product: 'Iogurtes', qtd: '50un', supplier: 'Supermercado Dia', dist: '2.0km', expiry: '3 dias', urgent: false, price: 'R$ 0,50/un' },
];

export const NGODashboard: React.FC = () => {
  return (
    <Layout role="ngo">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-prato-dark">Ofertas Disponíveis</h1>
        <p className="text-prato-muted">Encontre alimentos próximos à sua entidade.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Map Placeholder */}
        <div className="lg:w-1/3 order-2 lg:order-1">
          <Card noPadding className="h-[400px] lg:h-[600px] bg-gray-100 flex items-center justify-center relative sticky top-24">
            <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/-46.6333,-23.5505,12,0/600x600?access_token=pk.xxx')] bg-cover bg-center opacity-50 grayscale" />
            <div className="relative z-10 text-center p-6 bg-white/90 backdrop-blur rounded-xl shadow-lg m-4">
              <MapPin className="w-10 h-10 text-prato-green mx-auto mb-2" />
              <h3 className="font-bold text-prato-dark">Mapa Interativo</h3>
              <p className="text-sm text-prato-muted mb-4">Visualize ofertas em tempo real</p>
              <Button size="sm" variant="outline">Expandir Mapa</Button>
            </div>
          </Card>
        </div>

        {/* List */}
        <div className="flex-1 order-1 lg:order-2 space-y-4">
          {offers.map((offer) => (
            <Card key={offer.id} className={`transition-all hover:shadow-md ${offer.urgent ? 'border-l-4 border-l-prato-orange' : 'border-l-4 border-l-transparent'}`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="text-gray-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                       <h3 className="text-lg font-bold text-prato-dark">{offer.product}</h3>
                       {offer.urgent && <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-bold">Urgente</span>}
                    </div>
                    <p className="text-sm text-prato-muted flex items-center gap-1 mt-1">
                      <MapPin size={14} /> {offer.supplier} • {offer.dist}
                    </p>
                    <div className="flex gap-3 mt-2 text-sm font-medium">
                      <span className="text-prato-dark">{offer.qtd}</span>
                      <span className={`${offer.urgent ? 'text-orange-600' : 'text-green-600'}`}>
                         <Clock size={14} className="inline mr-1" />{offer.expiry}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right w-full sm:w-auto flex flex-row sm:flex-col justify-between items-center sm:items-end border-t sm:border-0 pt-4 sm:pt-0 mt-2 sm:mt-0">
                  <div className="font-bold text-xl text-prato-green sm:mb-2">{offer.price}</div>
                  <Button size="sm">Reservar</Button>
                </div>
              </div>
            </Card>
          ))}
          
          <div className="text-center pt-4">
            <Button variant="ghost" icon={<ArrowRight size={16}/>}>Carregar mais ofertas</Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};