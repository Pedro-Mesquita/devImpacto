import React, { useEffect, useMemo, useState } from 'react';
import { Layout } from '../../components/Layout';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { MapPin, Clock, ShoppingBag, ArrowRight } from 'lucide-react';
import { Modal } from '../../components/Modal';

type Offer = {
  id: string;
  product: string;
  qtd: string;
  supplier: string;
  dist: string;
  expiry: string;
  urgent: boolean;
  price: string;
  maxQuantity?: number;
};

export const NGODashboard: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [purchaseStatus, setPurchaseStatus] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cartao' | 'pix' | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchOffers() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/lotes/alerta');
        if (!res.ok) throw new Error(`Erro ao carregar lotes de alerta (${res.status})`);
        const json = await res.json();
        const lotes = Array.isArray(json.lotes) ? json.lotes : [];
        // Map lotes to UI offers
  const mapped: Offer[] = lotes.map((l: any) => {
          const diasRestantes = (() => {
            const hoje = new Date();
            const validade = new Date(l.data_validade);
            const diff = Math.ceil((validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
            if (diff <= 0) return 'Vence Hoje';
            if (diff === 1) return 'Vence Amanhã';
            return `${diff} dias`;
          })();
          // Difference between validity date and current date, in days
          const diasAteValidade = (() => {
            const hoje = new Date();
            const validade = new Date(l.data_validade);
            const diffDays = Math.ceil((validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
            return diffDays;
          })();
          return {
            id: l.id,
            product: l.produto?.nome || 'Produto',
            qtd: l.preco_base ? `${Number(l.quantidade_atual).toFixed(2)} kg` : '—',
            supplier: l.cliente_id?.slice(0, 8) || 'Fornecedor',
            dist: '—',
            expiry: diasRestantes,
            // Only urgent when (data_validade - today) <= 3 days
            urgent: Number.isFinite(diasAteValidade) ? diasAteValidade <= 3 : false,
            price: (l.preco_sugerido ? `R$ ${Number(l.preco_sugerido).toFixed(2)}` : `R$ ${Number(l.preco_base || 0).toFixed(2)}`),
            // Use available quantity from enriched payload (quantidade_atual)
            maxQuantity: Number.isFinite(Number(l.quantidade_atual)) ? Number(l.quantidade_atual) : undefined,
          };
        });
        if (!cancelled) setOffers(mapped);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Erro ao carregar');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchOffers();
    return () => { cancelled = true; };
  }, []);

  return (
    <Layout role="ngo">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-prato-dark">Ofertas Disponíveis</h1>
        <p className="text-prato-muted">Encontre alimentos próximos à sua entidade.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Map Placeholder */}
        {/* List */}
        <div className="flex-1 order-1 lg:order-2 space-y-4">
          {loading && (
            <div className="text-prato-muted">Carregando ofertas…</div>
          )}
          {error && (
            <div className="text-red-600">{error}</div>
          )}
          {!loading && !error && offers.map((offer, idx) => (
            <Card key={offer.id} className={`transition-all hover:shadow-md ${offer.urgent ? 'border-l-4 border-l-prato-orange' : 'border-l-4 border-l-transparent'}`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {(() => {
                      const imgs = [
                        '/resources/cenoura.jpg',
                        '/resources/banana.jpg',
                        '/resources/batata.jpg',
                        '/resources/cebola.jpg',
                        '/resources/pera.jpeg',
                        '/resources/cenoura.jpg',
                        '/resources/batata.jpg',
                        '/resources/banana.jpg',
                      ];
                      const src = imgs[idx % imgs.length];
                      return (
                        <img src={src} alt={offer.product} className="w-12 h-12 object-contain" onError={(e) => {
                          // Fallback to icon if image not found
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }} />
                      );
                    })()}
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
                  <div className="font-bold text-xl text-prato-green leading-tight">{offer.price}</div>
                  <div className="text-xs text-prato-muted -mt-1 sm:mb-2">/kg</div>
                  <Button size="sm" onClick={() => { setSelectedOffer(offer); setQuantity(1); setPurchaseOpen(true); }}>Comprar</Button>
                </div>
              </div>
            </Card>
          ))}
          
        </div>
      </div>
    {/* Purchase Modal */}
    <Modal open={purchaseOpen} onClose={() => { setPurchaseOpen(false); setSelectedOffer(null); setPurchaseStatus(null); setPaymentMethod(null); }} title="Concluir Compra">
      <div className="space-y-4">
        {selectedOffer && (
          <div className="space-y-2">
            <div className="text-prato-dark font-semibold">Produto</div>
            <div className="text-prato-muted">{selectedOffer.product}</div>
            <div className="text-sm text-prato-muted">Preço: {selectedOffer.price}</div>
          </div>
        )}
        <div className="space-y-2">
          <label className="text-prato-dark font-semibold" htmlFor="quantity">Quantidade</label>
          <input
            id="quantity"
            type="number"
            min={1}
            max={selectedOffer?.maxQuantity || undefined}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-prato-green"
            value={quantity}
            onChange={(e) => {
              const val = Number(e.target.value) || 1;
              const clamped = selectedOffer?.maxQuantity ? Math.min(Math.max(1, val), selectedOffer.maxQuantity) : Math.max(1, val);
              setQuantity(clamped);
            }}
          />
          <p className="text-xs text-prato-muted">
            Informe a quantidade desejada{selectedOffer?.maxQuantity ? ` (máximo ${selectedOffer.maxQuantity})` : ''}.
          </p>
        </div>

        {/* Payment Method */}
        <div className="space-y-2">
          <div className="text-prato-dark font-semibold">Método de Pagamento</div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="cartao"
                checked={paymentMethod === 'cartao'}
                onChange={() => setPaymentMethod('cartao')}
              />
              <span>Cartão de Crédito</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="pix"
                checked={paymentMethod === 'pix'}
                onChange={() => setPaymentMethod('pix')}
              />
              <span>Pix</span>
            </label>
          </div>
          <p className="text-xs text-prato-muted">Selecione o método de pagamento para concluir.</p>
        </div>

        {/* Payment Details */}
        {paymentMethod === 'cartao' && (
          <div className="space-y-3">
            <div className="text-prato-dark font-semibold">Dados do Cartão</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm text-prato-muted" htmlFor="cardName">Nome no Cartão</label>
                <input id="cardName" type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-prato-green" placeholder="Ex.: Maria Silva" />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-prato-muted" htmlFor="cardNumber">Número do Cartão</label>
                <input id="cardNumber" type="text" inputMode="numeric" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-prato-green" placeholder="0000 0000 0000 0000" />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-prato-muted" htmlFor="cardExpiry">Validade</label>
                <input id="cardExpiry" type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-prato-green" placeholder="MM/AA" />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-prato-muted" htmlFor="cardCvv">CVV</label>
                <input id="cardCvv" type="password" inputMode="numeric" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-prato-green" placeholder="123" />
              </div>
            </div>
            <p className="text-xs text-prato-muted">Os dados são usados apenas para simulação nesta etapa.</p>
          </div>
        )}

        {paymentMethod === 'pix' && (
          <div className="space-y-3">
            <div className="text-prato-dark font-semibold">Pagamento via Pix</div>
            <div className="flex items-center justify-center">
              {/* Mocked QR Code image */}
              <div className="p-4 border border-gray-200 rounded-lg bg-white">
                <div className="w-40 h-40 bg-gray-200 flex items-center justify-center text-prato-muted">QR Code</div>
              </div>
            </div>
            <p className="text-xs text-prato-muted text-center">Escaneie o QR Code com seu app bancário (mock).</p>
          </div>
        )}
        {purchaseStatus && (
          <div className="text-sm text-prato-green">{purchaseStatus}</div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => { setPurchaseOpen(false); setSelectedOffer(null); }}>Cancelar</Button>
          <Button onClick={async () => {
            // TODO: Integrate with backend purchase/reservation endpoint
            try {
              if (!paymentMethod) {
                setPurchaseStatus('Selecione um método de pagamento (Cartão de Crédito ou Pix).');
                return;
              }
              if (selectedOffer?.maxQuantity && quantity > selectedOffer.maxQuantity) {
                setPurchaseStatus(`Quantidade acima do disponível (máximo ${selectedOffer.maxQuantity}).`);
                return;
              }
              setPurchaseStatus('Processando compra...');
              await new Promise(r => setTimeout(r, 800));
              setPurchaseStatus(`Compra concluída com sucesso! Método: ${paymentMethod === 'cartao' ? 'Cartão de Crédito' : 'Pix'}.`);
              setTimeout(() => {
                setPurchaseOpen(false);
                setSelectedOffer(null);
                setPurchaseStatus(null);
                setPaymentMethod(null);
              }, 1000);
            } catch (_) {
              setPurchaseStatus('Falha ao concluir a compra. Tente novamente.');
            }
          }}>Concluir</Button>
        </div>
      </div>
    </Modal>
    </Layout>
  );
};