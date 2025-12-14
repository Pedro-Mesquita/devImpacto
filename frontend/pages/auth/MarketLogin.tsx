import React, { useState } from 'react';
import { Layout } from '../../components/Layout';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MarketLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // TODO: integrate with backend auth API
      await new Promise((res) => setTimeout(res, 600));
      // Navigate to market dashboard on success
      navigate('/market');
    } catch (err: any) {
      setError('Falha ao autenticar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout role="public">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-2 mb-4 text-prato-green">
          <Store size={22} />
          <h1 className="text-2xl font-bold text-prato-dark">Login do Mercado</h1>
        </div>
        <Card>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded-lg text-sm">{error}</div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-prato-dark">E-mail</label>
              <input
                type="email"
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-prato-green outline-none"
                placeholder="exemplo@mercado.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-prato-dark">Senha</label>
              <input
                type="password"
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-prato-green outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="pt-2">
              <Button type="submit" fullWidth loading={loading}>Entrar</Button>
            </div>
          </form>
        </Card>
        <p className="mt-4 text-sm text-prato-muted">
          Não tem uma conta? <button className="underline" type="button" onClick={() => navigate('/login')}>Criar acesso</button>
        </p>
      </div>
    </Layout>
  );
};
