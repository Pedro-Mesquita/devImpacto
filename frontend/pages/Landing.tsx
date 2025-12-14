import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Heart, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';
import { Layout } from '../components/Layout';

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout role="public">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-green-50 to-blue-50 pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-prato-green/10 text-prato-green font-semibold text-sm">
             🌱 Tecnologia contra o desperdício
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-prato-dark mb-6 tracking-tight">
            Conectando alimentos frescos <br className="hidden md:block"/>
            <span className="text-prato-green">a quem mais precisa</span>
          </h1>
          <p className="text-xl text-prato-muted mb-10 max-w-2xl mx-auto">
            Uma plataforma inteligente que transforma risco de desperdício em oportunidade de nutrir vidas, conectando mercados a entidades sociais.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/login')} icon={<Store size={20}/>}>
              Sou Mercado
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/login')} icon={<Heart size={20}/>}>
              Sou Entidade
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-prato-dark mb-4">Como Funciona</h2>
            <p className="text-prato-muted">Simples, rápido e transparente.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: <Store className="w-10 h-10 text-white" />, 
                color: "bg-prato-green",
                title: "1. Cadastro Ágil", 
                desc: "Mercados cadastram produtos próximos ao vencimento em menos de 1 minuto." 
              },
              { 
                icon: <Heart className="w-10 h-10 text-white" />, 
                color: "bg-prato-orange",
                title: "2. Match Inteligente", 
                desc: "Nossa IA sugere o preço social ideal e notifica entidades próximas." 
              },
              { 
                icon: <CheckCircle className="w-10 h-10 text-white" />, 
                color: "bg-prato-dark",
                title: "3. Retirada Segura", 
                desc: "Geração de QR Code para retirada e registro automático do impacto social." 
              }
            ].map((step, i) => (
              <div key={i} className="group p-8 rounded-2xl bg-prato-light hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100">
                <div className={`${step.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg transform group-hover:-translate-y-2 transition-transform`}>
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-prato-dark mb-3">{step.title}</h3>
                <p className="text-prato-muted leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-prato-dark text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "12.5 ton", label: "Alimentos Salvos" },
              { value: "3.200", label: "Famílias Atendidas" },
              { value: "89%", label: "Redução de Desperdício" },
              { value: "R$ 45k", label: "Economia Gerada" }
            ].map((stat, i) => (
              <div key={i} className="p-4">
                <div className="text-4xl md:text-5xl font-bold text-prato-green mb-2">{stat.value}</div>
                <div className="text-gray-300 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};