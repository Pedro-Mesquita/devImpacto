import React from 'react';
import { Layout } from '../../components/Layout';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { QrCode, CreditCard, Search } from 'lucide-react';

export const BeneficiaryDashboard: React.FC = () => {
  return (
    <Layout role="beneficiary">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-prato-dark">Olá, Maria Silva</h1>
        
        {/* Credit Banner */}
        <div className="bg-gradient-to-r from-prato-dark to-[#1a3b5c] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10"></div>
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-gray-300 text-sm mb-1">Crédito Social Disponível</p>
              <h2 className="text-4xl font-bold mb-2">R$ 45,00</h2>
              <p className="text-xs opacity-70">Válido até 30/12/2024</p>
            </div>
            <CreditCard size={48} className="opacity-50" />
          </div>
        </div>

        {/* Voucher */}
        <Card className="border-l-4 border-l-prato-green">
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <div className="bg-white p-2 rounded-lg border-2 border-dashed border-gray-300">
              <QrCode size={120} />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold mb-2 inline-block">Disponível para Retirada</span>
              <h3 className="text-xl font-bold text-prato-dark">Cesta Básica Verde</h3>
              <p className="text-prato-muted mb-2">Mercado São Jorge • 800m</p>
              <p className="text-sm text-prato-dark font-medium">Horário: Hoje, 14h - 18h</p>
            </div>
            <Button>Ver Detalhes</Button>
          </div>
        </Card>

        {/* Action */}
        <div className="text-center py-8">
           <h3 className="font-bold text-prato-dark mb-4">Precisa de mais alimentos?</h3>
           <Button variant="outline" icon={<Search size={20} />}>Buscar Ofertas Próximas</Button>
        </div>
      </div>
    </Layout>
  );
};