import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Store, User, Lock, Mail, Phone, MapPin, FileText, ArrowRight, Info, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../../components/Button';
import { cadastroService } from '../../services/cadastroService';

type TipoCadastro = 'vendedor' | 'cliente';

export const Cadastro: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tipoCadastro, setTipoCadastro] = useState<TipoCadastro | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Form states
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpfCnpj: '',
    senha: '',
    confirmarSenha: '',
    endereco: {
      rua: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
    },
    // Vendedor específico
    nomeEstabelecimento: '',
    percentualAlerta: 50,
    percentualDistribuicao: 30,
    percentualCritico: 10,
  });

  const validarForm = (): boolean => {
    // const novoErros: Record<string, string> = {};
    
    // if (!formData.nome.trim()) novoErros.nome = 'Nome é obrigatório';
    // if (!formData.email.trim()) novoErros.email = 'Email é obrigatório';
    // if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) novoErros.email = 'Email inválido';
    // if (!formData.telefone.trim()) novoErros.telefone = 'Telefone é obrigatório';
    // if (!formData.cpfCnpj.trim()) novoErros.cpfCnpj = 'CPF/CNPJ é obrigatório';
    // if (!formData.endereco.rua) novoErros.rua = 'Rua é obrigatória';
    // if (!formData.endereco.numero) novoErros.numero = 'Número é obrigatório';
    // if (!formData.endereco.bairro) novoErros.bairro = 'Bairro é obrigatório';
    // if (!formData.endereco.cidade) novoErros.cidade = 'Cidade é obrigatória';
    // if (!formData.endereco.estado) novoErros.estado = 'Estado é obrigatório';
    // if (!formData.senha) novoErros.senha = 'Senha é obrigatória';
    // if (formData.senha.length < 6) novoErros.senha = 'Senha deve ter pelo menos 6 caracteres';
    // if (formData.senha !== formData.confirmarSenha) novoErros.confirmarSenha = 'Senhas não conferem';
    
    // if (tipoCadastro === 'vendedor') {
    //   if (!formData.nomeEstabelecimento) novoErros.nomeEstabelecimento = 'Nome do estabelecimento é obrigatório';
    // }
    
    // setErrors(novoErros);
    return true; // Object.keys(novoErros).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // if (!validarForm()) {
    //   setMessage({ type: 'error', text: 'Preencha todos os campos corretamente' });
    //   return;
    // }

    setLoading(true);
    setMessage(null);

    try {
      const resultado = await cadastroService.criar({
        tipo: tipoCadastro || 'cliente',
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        cpfCnpj: formData.cpfCnpj,
        senha: formData.senha,
        endereco: formData.endereco,
        nomeEstabelecimento: formData.nomeEstabelecimento,
        percentualAlerta: formData.percentualAlerta,
        percentualDistribuicao: formData.percentualDistribuicao,
        percentualCritico: formData.percentualCritico,
      });

      if (resultado.success) {
        setMessage({ type: 'success', text: 'Cadastro realizado com sucesso! Redirecionando...' });
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setMessage({ type: 'error', text: resultado.message });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Erro ao realizar cadastro'
      });
    } finally {
      setLoading(false);
    }
  };

  const calcularDiaExemplo = (percentual: number, diasTotais: number = 10) => {
    return Math.ceil(diasTotais * (percentual / 100));
  };

  // Step 1: Choose type
  if (!tipoCadastro) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-prato-light p-4">
        <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Heart className="w-14 h-14 text-prato-green fill-prato-green" />
            </div>
            <h2 className="text-3xl font-bold text-prato-dark mb-2">Criar Nova Conta</h2>
            <p className="text-prato-muted">Escolha o tipo de cadastro para começar</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Vendedor Card */}
            <button
              onClick={() => setTipoCadastro('vendedor')}
              className="group p-8 rounded-2xl border-2 border-gray-200 hover:border-prato-green hover:shadow-xl transition-all duration-300 text-left bg-gradient-to-br from-white to-green-50/30"
            >
              <div className="bg-prato-green w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 transition-transform">
                <Store className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-prato-dark mb-3">Sou Vendedor</h3>
              <p className="text-prato-muted leading-relaxed mb-4">
                Mercados, distribuidores e estabelecimentos que desejam reduzir desperdício e impactar socialmente.
              </p>
              <ul className="space-y-2 text-sm text-prato-muted">
                <li className="flex items-start gap-2">
                  <span className="text-prato-green mt-0.5">✓</span>
                  <span>Cadastro de produtos próximos ao vencimento</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-prato-green mt-0.5">✓</span>
                  <span>Precificação dinâmica automática</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-prato-green mt-0.5">✓</span>
                  <span>Configuração personalizada de alertas</span>
                </li>
              </ul>
            </button>

            {/* Cliente Card */}
            <button
              onClick={() => setTipoCadastro('cliente')}
              className="group p-8 rounded-2xl border-2 border-gray-200 hover:border-prato-orange hover:shadow-xl transition-all duration-300 text-left bg-gradient-to-br from-white to-orange-50/30"
            >
              <div className="bg-prato-orange w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 transition-transform">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-prato-dark mb-3">Sou Cliente</h3>
              <p className="text-prato-muted leading-relaxed mb-4">
                ONGs, entidades sociais e beneficiários CadÚnico que buscam alimentos de qualidade com preços acessíveis.
              </p>
              <ul className="space-y-2 text-sm text-prato-muted">
                <li className="flex items-start gap-2">
                  <span className="text-prato-orange mt-0.5">✓</span>
                  <span>Acesso a alimentos com desconto social</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-prato-orange mt-0.5">✓</span>
                  <span>Notificações de produtos disponíveis</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-prato-orange mt-0.5">✓</span>
                  <span>Retirada com QR Code</span>
                </li>
              </ul>
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-prato-muted">
              Já tem uma conta? <button onClick={() => navigate('/login')} className="text-prato-green font-semibold hover:underline">Faça login</button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Form
  const isVendedor = tipoCadastro === 'vendedor';
  const corPrincipal = isVendedor ? 'prato-green' : 'prato-orange';

  return (
    <div className="min-h-screen flex items-center justify-center bg-prato-light p-4 py-12">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-8 md:p-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            {isVendedor ? (
              <Store className={`w-12 h-12 text-${corPrincipal} fill-${corPrincipal}`} />
            ) : (
              <Heart className={`w-12 h-12 text-${corPrincipal} fill-${corPrincipal}`} />
            )}
          </div>
          <h2 className="text-2xl font-bold text-prato-dark">
            Cadastro de {isVendedor ? 'Vendedor' : 'Cliente'}
          </h2>
          <p className="text-prato-muted">Preencha os dados para criar sua conta</p>
          <button
            onClick={() => setTipoCadastro(null)}
            className="text-sm text-prato-muted hover:text-prato-dark mt-2 underline"
          >
            ← Voltar para escolha
          </button>
        </div>

        {/* Mensagem de sucesso/erro */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            )}
            <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-prato-dark mb-1">
              {isVendedor ? 'Nome do Responsável' : 'Nome Completo'}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
              <input
                type="text"
                required
                placeholder="Digite seu nome"
                value={formData.nome}
                onChange={(e) => {
                  setFormData({ ...formData, nome: e.target.value });
                  // setErrors({ ...errors, nome: '' });
                }}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-prato-green focus:border-transparent outline-none transition-all border-gray-200`}
              />
            </div>
            {/* {errors.nome && <p className="text-xs text-red-600 mt-1">{errors.nome}</p>} */}
          </div>

          {/* Nome Estabelecimento (só vendedor) */}
          {isVendedor && (
            <div>
              <label className="block text-sm font-medium text-prato-dark mb-1">
                Nome do Estabelecimento
              </label>
              <div className="relative">
                <Store className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  required
                  placeholder="Ex: Mercado Central"
                  value={formData.nomeEstabelecimento}
                  onChange={(e) => setFormData({ ...formData, nomeEstabelecimento: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-prato-green focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          )}

          {/* Email e Telefone lado a lado */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-prato-dark mb-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  required
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-prato-green focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-prato-dark mb-1">Telefone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  required
                  placeholder="(11) 99999-9999"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-prato-green focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* CPF/CNPJ */}
          <div>
            <label className="block text-sm font-medium text-prato-dark mb-1">
              {isVendedor ? 'CNPJ' : 'CPF'}
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
              <input
                type="text"
                required
                placeholder={isVendedor ? '00.000.000/0000-00' : '000.000.000-00'}
                value={formData.cpfCnpj}
                onChange={(e) => setFormData({ ...formData, cpfCnpj: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-prato-green focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-prato-dark mb-1">
              <MapPin className="inline w-4 h-4 mr-1" />
              Endereço
            </label>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <input
                  type="text"
                  required
                  placeholder="Rua/Avenida"
                  value={formData.endereco.rua}
                  onChange={(e) => setFormData({ ...formData, endereco: { ...formData.endereco, rua: e.target.value } })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-prato-green focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <input
                  type="text"
                  required
                  placeholder="Número"
                  value={formData.endereco.numero}
                  onChange={(e) => setFormData({ ...formData, endereco: { ...formData.endereco, numero: e.target.value } })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-prato-green focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <input
                  type="text"
                  required
                  placeholder="Bairro"
                  value={formData.endereco.bairro}
                  onChange={(e) => setFormData({ ...formData, endereco: { ...formData.endereco, bairro: e.target.value } })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-prato-green focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <input
                  type="text"
                  required
                  placeholder="Cidade"
                  value={formData.endereco.cidade}
                  onChange={(e) => setFormData({ ...formData, endereco: { ...formData.endereco, cidade: e.target.value } })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-prato-green focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <select
                  required
                  value={formData.endereco.estado}
                  onChange={(e) => setFormData({ ...formData, endereco: { ...formData.endereco, estado: e.target.value } })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-prato-green focus:border-transparent outline-none transition-all"
                >
                  <option value="">Estado</option>
                  <option value="AC">AC</option>
                  <option value="AL">AL</option>
                  <option value="AP">AP</option>
                  <option value="AM">AM</option>
                  <option value="BA">BA</option>
                  <option value="CE">CE</option>
                  <option value="DF">DF</option>
                  <option value="ES">ES</option>
                  <option value="GO">GO</option>
                  <option value="MA">MA</option>
                  <option value="MT">MT</option>
                  <option value="MS">MS</option>
                  <option value="MG">MG</option>
                  <option value="PA">PA</option>
                  <option value="PB">PB</option>
                  <option value="PR">PR</option>
                  <option value="PE">PE</option>
                  <option value="PI">PI</option>
                  <option value="RJ">RJ</option>
                  <option value="RN">RN</option>
                  <option value="RS">RS</option>
                  <option value="RO">RO</option>
                  <option value="RR">RR</option>
                  <option value="SC">SC</option>
                  <option value="SP">SP</option>
                  <option value="SE">SE</option>
                  <option value="TO">TO</option>
                </select>
              </div>
            </div>
          </div>

          {/* Configuração de Alertas (só vendedor) */}
          {isVendedor && (
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 border border-green-100">
              <div className="flex items-start gap-3 mb-4">
                <Info className="w-5 h-5 text-prato-green mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-prato-dark mb-1">
                    Configure os Alertas de Validade
                  </h4>
                  <p className="text-sm text-prato-muted leading-relaxed">
                    Defina quando deseja receber alertas baseado na porcentagem de validade restante. Você pode ajustar essas configurações depois.
                  </p>
                </div>
              </div>

              {/* Alerta */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-prato-dark">
                    📢 Alerta Inicial
                  </label>
                  <span className="text-lg font-bold text-prato-green">
                    {formData.percentualAlerta}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={formData.percentualAlerta}
                  onChange={(e) => setFormData({ ...formData, percentualAlerta: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-prato-green"
                />
                <p className="text-xs text-prato-muted mt-2 bg-white/70 p-2 rounded">
                  <strong>Exemplo:</strong> Se um produto tem validade de 10 dias, o alerta será ativado quando restarem{' '}
                  <strong className="text-prato-green">{calcularDiaExemplo(formData.percentualAlerta, 10)} dias</strong> ({formData.percentualAlerta}% de 10 dias)
                </p>
              </div>

              {/* Distribuição */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-prato-dark">
                    🚚 Prioridade Distribuição
                  </label>
                  <span className="text-lg font-bold text-prato-orange">
                    {formData.percentualDistribuicao}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={formData.percentualDistribuicao}
                  onChange={(e) => setFormData({ ...formData, percentualDistribuicao: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-prato-orange"
                />
                <p className="text-xs text-prato-muted mt-2 bg-white/70 p-2 rounded">
                  <strong>Exemplo:</strong> Com 10 dias de validade, entrará em distribuição com{' '}
                  <strong className="text-prato-orange">{calcularDiaExemplo(formData.percentualDistribuicao, 10)} dias</strong> restantes
                </p>
              </div>

              {/* Crítico */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-prato-dark">
                    🔴 Estado Crítico
                  </label>
                  <span className="text-lg font-bold text-red-600">
                    {formData.percentualCritico}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={formData.percentualCritico}
                  onChange={(e) => setFormData({ ...formData, percentualCritico: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
                <p className="text-xs text-prato-muted mt-2 bg-white/70 p-2 rounded">
                  <strong>Exemplo:</strong> Ficará crítico quando restarem apenas{' '}
                  <strong className="text-red-600">{calcularDiaExemplo(formData.percentualCritico, 10)} dia(s)</strong>
                </p>
              </div>
            </div>
          )}

          {/* Senha */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-prato-dark mb-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-prato-green focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-prato-dark mb-1">Confirmar Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.confirmarSenha}
                  onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-prato-green focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <Button 
            type="submit" 
            fullWidth 
            loading={loading} 
            icon={<ArrowRight size={20}/>}
            className="mt-6"
          >
            Criar Conta
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <p className="text-prato-muted text-sm">
            Já tem uma conta? <button onClick={() => navigate('/login')} className="text-prato-green font-semibold hover:underline">Faça login</button>
          </p>
        </div>
      </div>
    </div>
  );
};
