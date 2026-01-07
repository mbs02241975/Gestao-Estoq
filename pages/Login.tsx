
import React, { useState } from 'react';
import { User, Role } from '../types';
import { storageService } from '../services/storageService';
import { Package, ShieldCheck, User as UserIcon, Code, Lock, KeyRound } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showDevLogin, setShowDevLogin] = useState(false);
  const [devPassword, setDevPassword] = useState('');
  
  // Estados para Troca de Senha
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (showDevLogin) {
      if (devPassword === 'Mm88918675') {
        onLogin({ id: 'dev-master', username: 'dev', name: 'Máximo (Dev)', role: 'developer', isFirstAccess: false });
      } else {
        alert('Senha técnica incorreta.');
      }
      return;
    }

    const users = storageService.getUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      if (user.isFirstAccess) {
        setPendingUser(user);
      } else {
        onLogin(user);
      }
    } else {
      alert('Usuário ou senha incorretos.');
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingUser) return;
    if (newPassword !== confirmPassword) {
      alert('As senhas não coincidem.');
      return;
    }
    if (newPassword.length < 4) {
      alert('A nova senha deve ter pelo menos 4 caracteres.');
      return;
    }

    const updatedUser = { ...pendingUser, password: newPassword, isFirstAccess: false };
    storageService.updateUser(updatedUser);
    alert('Senha alterada com sucesso! Bem-vindo.');
    onLogin(updatedUser);
  };

  if (pendingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-scaleUp p-10">
          <div className="text-center mb-8">
            <div className="inline-flex p-4 bg-blue-100 text-blue-600 rounded-2xl mb-4"><KeyRound size={32} /></div>
            <h2 className="text-2xl font-black text-gray-900">Troca de Senha</h2>
            <p className="text-gray-500 text-sm">Este é seu primeiro acesso. Por favor, cadastre uma nova senha.</p>
          </div>
          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Nova Senha</label>
              <input type="password" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Confirmar Senha</label>
              <input type="password" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all">Definir Nova Senha</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-scaleUp">
        <div className="p-8 bg-blue-600 text-white text-center">
          <div className="inline-flex p-4 bg-white/20 rounded-2xl mb-4"><Package size={48} /></div>
          <h1 className="text-3xl font-black tracking-tight">GestorPro</h1>
          <p className="text-blue-100 font-medium opacity-80 mt-1">
            {showDevLogin ? 'Módulo de Configuração' : 'Controle de Estoque e Valores'}
          </p>
        </div>

        <form onSubmit={handleLogin} className="p-10 space-y-6">
          {showDevLogin ? (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Senha do Desenvolvedor</label>
              <input type="password" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={devPassword} onChange={(e) => setDevPassword(e.target.value)} autoFocus />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Usuário</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input type="text" required className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Seu nome de usuário" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input type="password" required className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
              </div>
            </>
          )}

          <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-black text-lg shadow-xl shadow-slate-200 transition-all mt-4">
            {showDevLogin ? 'Autenticar Técnico' : 'Entrar no Sistema'}
          </button>

          <div className="text-center pt-2">
            <button type="button" onClick={() => setShowDevLogin(!showDevLogin)} className="text-[10px] text-gray-400 hover:text-blue-500 transition-colors flex items-center justify-center gap-1 mx-auto uppercase tracking-tighter">
              <Code size={10} /> {showDevLogin ? 'Voltar para Login Padrão' : 'Acesso Técnico'}
            </button>
          </div>
        </form>
      </div>
      <div className="mt-8 text-[10px] sm:text-xs text-slate-500 text-center uppercase tracking-widest opacity-60">
        Desenvolvido por Máximo Batista • (71) 98286-2569
      </div>
    </div>
  );
};

export default Login;
