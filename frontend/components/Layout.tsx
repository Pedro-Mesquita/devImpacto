import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, TrendingUp, BarChart, Settings, 
  Menu, X, Bell, User, LogOut, Home, ShoppingBag, Heart, Shield
} from 'lucide-react';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  role?: UserRole;
}

export const Layout: React.FC<LayoutProps> = ({ children, role = 'public' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  if (role === 'public') {
    return (
      <div className="min-h-screen bg-prato-light flex flex-col">
        <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <Link to="/" className="flex items-center gap-2">
                <img src="/resources/logo.png" alt="Prato Justo" className="w-8 h-8 object-contain" />
                <span className="text-xl font-bold text-prato-dark">Prato Justo</span>
              </Link>
              <div className="hidden md:flex space-x-8">
                <Link to="/" className="text-prato-dark hover:text-prato-green font-medium">Início</Link>
                <Link to="/#funciona" className="text-prato-muted hover:text-prato-green font-medium">Como Funciona</Link>
                <Link to="/login" className="px-4 py-2 text-prato-green font-semibold border border-prato-green rounded-lg hover:bg-prato-green hover:text-white transition-colors">
                  Entrar
                </Link>
              </div>
              <button className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
          {/* Mobile Menu */}
          {sidebarOpen && (
            <div className="md:hidden bg-white border-b border-gray-200 px-4 py-2 space-y-2">
               <Link to="/" className="block py-2 text-prato-dark">Início</Link>
               <Link to="/login" className="block py-2 text-prato-green font-bold">Entrar</Link>
            </div>
          )}
        </nav>
        <main className="flex-grow">{children}</main>
        <footer className="bg-prato-dark text-white py-8 mt-auto">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p>© 2024 Prato Justo. Tecnologia com impacto social.</p>
          </div>
        </footer>
      </div>
    );
  }

  // Dashboard Layout
  const getSidebarItems = () => {
    switch(role) {
      case 'market':
        return [
          { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/market' },
          { icon: <Package size={20} />, label: 'Meus Produtos', path: '/market/products' },
          { icon: <TrendingUp size={20} />, label: 'Nova Oferta', path: '/market/new-product' },
        ];
      case 'ngo':
        return [
          { icon: <Home size={20} />, label: 'Ofertas Disponíveis', path: '/ngo' },
        ];
      case 'beneficiary':
          return [
            { icon: <User size={20} />, label: 'Minha Conta', path: '/beneficiary' },
          ];
      default:
        return [];
    }
  };

  const navItems = getSidebarItems();

  return (
    <div className="min-h-screen bg-prato-light flex">
      {/* Sidebar Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <img src="/resources/logo.png" alt="Prato Justo" className="w-8 h-8 object-contain mr-2" />
          <span className="text-xl font-bold text-prato-dark">Prato Justo</span>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path 
                  ? 'bg-prato-green/10 text-prato-green font-semibold' 
                  : 'text-prato-muted hover:bg-gray-50 hover:text-prato-dark'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
          <div className="pt-8 mt-8 border-t border-gray-100">
             <Link to="/" className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg">
                <LogOut size={20} />
                Sair
             </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
          <button className="md:hidden text-prato-dark" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu />
          </button>
          <div className="flex items-center gap-4 ml-auto">
             <button className="relative p-2 text-prato-muted hover:text-prato-green transition-colors">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-prato-orange rounded-full"></span>
             </button>
             <div className="w-8 h-8 bg-prato-dark rounded-full flex items-center justify-center text-white font-bold">
                {role.charAt(0).toUpperCase()}
             </div>
          </div>
        </header>
        <main className="p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};