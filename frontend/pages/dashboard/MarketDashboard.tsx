import React from 'react';
import { Layout } from '../../components/Layout';
import { MetricCard, Card, CardHeader } from '../../components/Card';
import { Button } from '../../components/Button';
import { Package, Heart, CheckCircle, Users, AlertTriangle, TrendingUp, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', kg: 400 },
  { name: 'Fev', kg: 300 },
  { name: 'Mar', kg: 600 },
  { name: 'Abr', kg: 800 },
  { name: 'Mai', kg: 500 },
  { name: 'Jun', kg: 950 },
];

export const MarketDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout role="market">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-prato-dark">Visão Geral</h1>
          <p className="text-prato-muted">Bem-vindo, Supermercado Central</p>
        </div>
        <Button onClick={() => navigate('/market/new-product')} icon={<Plus size={20}/>}>
          Novo Produto
        </Button>
      </div>

      {/* Alerts */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-4">
          <div className="bg-orange-100 p-2 rounded-full text-prato-orange">
            <AlertTriangle size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-prato-dark">Atenção Necessária</h3>
            <p className="text-sm text-prato-muted mt-1">12 produtos vencem em menos de 48h. Considere criar ofertas sociais.</p>
          </div>
          <Button variant="outline" size="sm" className="border-orange-200 text-orange-700 hover:bg-orange-100">
            Ver Itens
          </Button>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-4">
           <div className="bg-blue-100 p-2 rounded-full text-blue-700">
             <TrendingUp size={24} />
           </div>
           <div className="flex-1">
             <h3 className="font-bold text-prato-dark">Alta Demanda</h3>
             <p className="text-sm text-prato-muted mt-1">Sua região tem 5 ONGs buscando frutas e legumes hoje.</p>
           </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          icon={<Package size={24} />}
          label="Estoque Crítico"
          value="87 itens"
          trend="+12%"
          trendType="warning"
        />
        <MetricCard
          icon={<Heart size={24} />}
          label="Doações / Ofertas"
          value="143"
          trend="+28%"
        />
        <MetricCard
          icon={<CheckCircle size={24} />}
          label="Descarte Evitado"
          value="2.3 ton"
          trend="+15%"
        />
        <MetricCard
          icon={<Users size={24} />}
          label="Famílias Impactadas"
          value="856"
          trend="+42%"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader title="Redistribuição (kg) - Últimos 6 Meses" />
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorKg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00C853" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#00C853" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Area type="monotone" dataKey="kg" stroke="#00C853" strokeWidth={3} fillOpacity={1} fill="url(#colorKg)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Quick List */}
        <Card>
          <CardHeader title="Últimas Saídas" />
          <div className="space-y-4">
            {[
              { name: 'Banana Prata', qtd: '15kg', entity: 'ONG Prato Cheio', time: 'Há 2h' },
              { name: 'Tomate Carmen', qtd: '30kg', entity: 'Cozinha Comunitária', time: 'Há 4h' },
              { name: 'Pão Francês', qtd: '5kg', entity: 'Abrigo Esperança', time: 'Há 5h' },
              { name: 'Iogurte Natural', qtd: '20un', entity: 'Escola Municipal', time: 'Ontem' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div>
                  <p className="font-semibold text-prato-dark">{item.name}</p>
                  <p className="text-xs text-prato-muted">{item.entity}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-prato-green">{item.qtd}</p>
                  <p className="text-xs text-gray-400">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="w-full mt-4 text-sm">Ver todo histórico</Button>
        </Card>
      </div>
    </Layout>
  );
};