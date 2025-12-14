import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Lock, User, ArrowRight } from 'lucide-react';
import { Button } from '../../components/Button';
import { UserRole } from '../../types';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<UserRole | 'public'>('public');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      if (role === 'market') navigate('/market');
      else if (role === 'ngo') navigate('/ngo');
      else if (role === 'beneficiary') navigate('/beneficiary');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-prato-light p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 md:p-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Heart className="w-12 h-12 text-prato-green fill-prato-green" />
          </div>
          <h2 className="text-2xl font-bold text-prato-dark">Bem-vindo de volta</h2>
          <p className="text-prato-muted">Acesse sua conta para continuar impactando.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-prato-dark mb-1">Perfil (Demo)</label>
            <select 
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-prato-green focus:border-transparent outline-none transition-all"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              <option value="public" disabled>Selecione um perfil...</option>
              <option value="market">Mercado / Distribuidor</option>
              <option value="ngo">Entidade Social (ONG)</option>
              <option value="beneficiary">Beneficiário (CadUnico)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-prato-dark mb-1">CPF ou CNPJ</label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="000.000.000-00"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-prato-green focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-prato-dark mb-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-prato-green focus:border-transparent outline-none transition-all"
              />
            </div>
            <div className="text-right mt-2">
              <a href="#" className="text-sm text-prato-green hover:underline">Esqueceu a senha?</a>
            </div>
          </div>

          <Button type="submit" fullWidth className="w-full" loading={loading} icon={<ArrowRight size={20}/>}>
            Entrar
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-prato-muted">
            Ainda não tem conta? <a href="#" className="text-prato-green font-semibold hover:underline">Cadastre-se</a>
          </p>
        </div>
      </div>
    </div>
  );
};