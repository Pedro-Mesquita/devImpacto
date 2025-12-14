import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { Card, CardHeader } from '../../components/Card';
import { Package } from 'lucide-react';

type Lote = {
  id: string;
  cliente_id: string;
  produto_id: string;
  data_colheita: string;
  data_validade: string;
  preco_base: string;
  status: string;
  preco_sugerido: string | null;
  criado_em: string;
};

export const MarketProducts: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lotes, setLotes] = useState<Lote[]>([]);

  useEffect(() => {
    const fetchLotes = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/clientes/b3ff7503-3832-44c6-97c2-b0f9bffdf3f0/lotes', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setLotes(json.lotes || []);
      } catch (e: any) {
        setError(e?.message || 'Falha ao carregar produtos');
      } finally {
        setLoading(false);
      }
    };
    fetchLotes();
  }, []);

  return (
    <Layout role="market">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-prato-dark flex items-center gap-2">
          <Package size={24} /> Meus Produtos
        </h1>
        <p className="text-prato-muted">Lista de produtos cadastrados no seu mercado.</p>
      </div>

      <Card>
        <CardHeader title="Lotes do Cliente" />
        <div className="p-4">
          {loading && <p className="text-prato-muted">Carregando...</p>}
          {error && (
            <p className="text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">{error}</p>
          )}
          {!loading && !error && lotes.length === 0 && (
            <p className="text-prato-muted">Nenhum produto encontrado.</p>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lotes.map((l) => (
              <div key={l.id} className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-prato-dark">Lote #{l.id.slice(0,8)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${l.status === 'alerta' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>{l.status}</span>
                </div>
                <p className="text-sm text-prato-muted">Validade: {new Date(l.data_validade).toLocaleDateString()}</p>
                <div className="mt-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-prato-muted">Preço base</span>
                    <span className={`${l.status === 'normal' ? '' : 'line-through text-gray-500'}`}>
                      R$ {Number(l.preco_base).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-prato-muted">Preço sugerido</span>
                    <span className="text-prato-green font-bold">{l.preco_sugerido ? `R$ ${Number(l.preco_sugerido).toFixed(2)}` : '—'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </Layout>
  );
};
