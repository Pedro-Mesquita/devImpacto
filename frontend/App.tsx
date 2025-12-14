import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Login } from './pages/auth/Login';
import { Cadastro } from './pages/auth/Cadastro';
import { MarketLogin } from './pages/auth/MarketLogin';
import { MarketProducts } from './pages/dashboard/MarketProducts';
import { MarketDashboard } from './pages/dashboard/MarketDashboard';
import { ProductForm } from './pages/dashboard/ProductForm';
import { NGODashboard } from './pages/dashboard/NGODashboard';
import { BeneficiaryDashboard } from './pages/dashboard/BeneficiaryDashboard';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/login/market" element={<MarketLogin />} />
        
        {/* Market Routes */}
        <Route path="/market" element={<MarketDashboard />} />
  <Route path="/market/products" element={<MarketProducts />} />
        <Route path="/login" element={<Login />} />
        
        {/* Market Routes */}
        <Route path="/market" element={<MarketDashboard />} />
        <Route path="/market/products" element={<MarketDashboard />} /> {/* Simplified */}
        <Route path="/market/new-product" element={<ProductForm />} />
        
        {/* NGO Routes */}
        <Route path="/ngo" element={<NGODashboard />} />
        <Route path="/ngo/offers" element={<NGODashboard />} />

        {/* Beneficiary Routes */}
        <Route path="/beneficiary" element={<BeneficiaryDashboard />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;