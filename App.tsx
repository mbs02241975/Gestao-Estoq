
import React, { useState, useEffect } from 'react';
import { AuthState, User, CompanySettings, Role } from './types';
import { storageService } from './services/storageService';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import NewTransaction from './pages/NewTransaction';
import TransactionHistory from './pages/TransactionHistory';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Manual from './pages/Manual';

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({ isAuthenticated: false, user: null });
  const [activePage, setActivePage] = useState('dashboard');
  const [settings, setSettings] = useState<CompanySettings>(storageService.getSettings());

  useEffect(() => {
    const savedUser = localStorage.getItem('gestorpro_session');
    if (savedUser) {
      setAuth({ isAuthenticated: true, user: JSON.parse(savedUser) });
    }
  }, []);

  const handleLogin = (user: User) => {
    setAuth({ isAuthenticated: true, user });
    localStorage.setItem('gestorpro_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setAuth({ isAuthenticated: false, user: null });
    localStorage.removeItem('gestorpro_session');
  };

  if (!auth.isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'inventory': return <Inventory userRole={auth.user?.role || 'operador'} />;
      case 'new_movement': return <NewTransaction user={auth.user!} />;
      case 'history': return <TransactionHistory />;
      case 'reports': return <Reports />;
      case 'manual': return <Manual />;
      case 'settings': 
        return auth.user?.role === 'developer' || auth.user?.role === 'admin'
          ? <Settings settings={settings} onSave={(s) => { setSettings(s); storageService.saveSettings(s); }} />
          : <div className="p-8 text-center text-red-500 font-bold">Acesso restrito.</div>;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans relative">
      <div className="no-print">
        <Sidebar 
          activePage={activePage} 
          setActivePage={setActivePage} 
          userRole={auth.user?.role || 'operador'} 
        />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="no-print">
          <Header 
            user={auth.user} 
            onLogout={handleLogout} 
            settings={settings}
          />
        </div>
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-16">
          {renderPage()}
        </main>

        {/* Rodapé Premium para Destaque do Desenvolvedor */}
        <footer className="no-print h-16 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border-t border-blue-900/30 flex flex-col items-center justify-center space-y-0.5">
          <p className="text-[9px] text-blue-400 font-black uppercase tracking-[0.3em]">Engenharia de Software & Suporte</p>
          <p className="text-xs text-slate-100 font-medium flex items-center gap-1.5">
            Desenvolvido por <span className="text-white font-black drop-shadow-sm">Máximo Batista</span> 
            <span className="text-blue-800">•</span>
            <a href="mailto:mbs1975@gmail.com.br" className="text-slate-300 hover:text-blue-400 transition-colors">mbs1975@gmail.com.br</a> 
            <span className="text-blue-800">•</span>
            WhatsApp: <span className="text-blue-400 font-bold">(71) 98286-2569</span>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
