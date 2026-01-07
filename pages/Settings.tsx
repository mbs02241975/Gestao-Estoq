
import React, { useState, useEffect } from 'react';
import { CompanySettings, User, Role } from '../types';
import { storageService } from '../services/storageService';
import { SUPABASE_SQL_SCHEMA } from '../constants';
import { Save, Database, Building, Cpu, Copy, CheckCircle2, UserPlus, Users, Trash2, Key } from 'lucide-react';

interface SettingsProps {
  settings: CompanySettings;
  onSave: (settings: CompanySettings) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSave }) => {
  const [formData, setFormData] = useState<CompanySettings>(settings);
  const [copied, setCopied] = useState(false);
  const [users, setUsers] = useState<User[]>(storageService.getUsers());
  
  // Novo Usuário
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<Role>('operador');

  const currentUser = JSON.parse(localStorage.getItem('gestorpro_session') || '{}') as User;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    alert('Configurações salvas!');
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (users.some(u => u.username === newUsername)) {
      alert('Usuário já existe.');
      return;
    }
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username: newUsername,
      name: newName,
      role: newRole,
      password: '123', // Senha padrão inicial
      isFirstAccess: true
    };
    const updatedUsers = [...users, newUser];
    storageService.saveUsers(updatedUsers);
    setUsers(updatedUsers);
    setNewUsername('');
    setNewName('');
    alert(`Usuário ${newUsername} criado com a senha padrão '123'`);
  };

  const deleteUser = (id: string) => {
    if (id === currentUser.id) {
      alert('Você não pode excluir a si mesmo.');
      return;
    }
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      storageService.deleteUser(id);
      setUsers(storageService.getUsers());
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações e Gestão</h1>
        <p className="text-gray-500">Administre usuários, empresa e infraestrutura.</p>
      </div>

      {/* Gerenciamento de Usuários (Apenas Admin) */}
      {(currentUser.role === 'admin' || currentUser.role === 'developer') && (
        <section className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-8 bg-slate-50 border-b border-gray-200 flex items-center gap-4">
            <div className="p-3 bg-blue-600 text-white rounded-2xl"><Users size={24} /></div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Operadores e Usuários</h2>
              <p className="text-sm text-gray-500">Cadastre e gerencie quem acessa o sistema.</p>
            </div>
          </div>
          <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Formulário Novo Usuário */}
            <div>
              <h3 className="text-sm font-black uppercase text-gray-400 mb-6 flex items-center gap-2"><UserPlus size={16} /> Novo Cadastro</h3>
              <form onSubmit={handleAddUser} className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Nome Completo</label>
                  <input type="text" required className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={newName} onChange={e => setNewName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Username (Login)</label>
                    <input type="text" required className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={newUsername} onChange={e => setNewUsername(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Nível de Acesso</label>
                    <select className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={newRole} onChange={e => setNewRole(e.target.value as any)}>
                      <option value="operador">Operador</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg">Criar Acesso</button>
                <p className="text-[10px] text-gray-400 text-center italic mt-2">Senha padrão para novos acessos: <span className="font-bold">123</span></p>
              </form>
            </div>

            {/* Listagem de Usuários */}
            <div>
              <h3 className="text-sm font-black uppercase text-gray-400 mb-6">Usuários Ativos</h3>
              <div className="space-y-3">
                {users.map(u => (
                  <div key={u.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${u.role === 'admin' ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-600'}`}><Key size={18} /></div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{u.name}</p>
                        <p className="text-[10px] text-gray-500 uppercase font-black">{u.username} • {u.role}</p>
                      </div>
                    </div>
                    {u.role !== 'developer' && (
                      <button onClick={() => deleteUser(u.id)} className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Configurações Técnicas (Apenas Developer) */}
      {currentUser.role === 'developer' && (
        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4"><div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Building size={24} /></div><h2 className="text-lg font-bold text-gray-800">Dados da Empresa</h2></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Razão Social</label><input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.companyName} onChange={(e) => setFormData({...formData, companyName: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Nome Fantasia</label><input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.tradeName} onChange={(e) => setFormData({...formData, tradeName: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Link para Logo (PNG/SVG)</label><input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.logoUrl} onChange={(e) => setFormData({...formData, logoUrl: e.target.value})} /></div>
            </div>
          </section>

          <section className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4"><div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Database size={24} /></div><h2 className="text-lg font-bold text-gray-800">Conexão Supabase</h2></div>
            <div className="grid grid-cols-1 gap-6">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Supabase URL</label><input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm" value={formData.supabaseUrl} onChange={(e) => setFormData({...formData, supabaseUrl: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Supabase Anon Key</label><input type="password" className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm" value={formData.supabaseKey} onChange={(e) => setFormData({...formData, supabaseKey: e.target.value})} /></div>
              <div className="p-6 bg-slate-900 rounded-2xl">
                <div className="flex justify-between mb-4"><h3 className="text-white font-bold text-sm">Schema SQL para o Banco</h3><button type="button" onClick={copyToClipboard} className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-lg border border-slate-700">{copied ? 'Copiado!' : 'Copiar SQL'}</button></div>
                <pre className="text-emerald-400 font-mono text-[10px] overflow-x-auto max-h-40 p-4 bg-black/30 rounded-lg">{SUPABASE_SQL_SCHEMA}</pre>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4"><div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Cpu size={24} /></div><h2 className="text-lg font-bold text-gray-800">IA - Gemini API</h2></div>
            <div className="flex gap-4">
              <input type="text" readOnly className="flex-1 px-4 py-2 border border-gray-100 bg-gray-50 text-gray-400 rounded-lg font-mono text-sm" value={formData.aiEndpoint} />
              <button type="button" onClick={() => window.open('https://ai.google.dev/gemini-api', '_blank')} className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700">Obter Chave</button>
            </div>
          </section>

          <div className="flex justify-end"><button type="submit" className="flex items-center gap-2 bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-xl hover:bg-blue-700 shadow-xl shadow-blue-500/30 transition-all"><Save size={24} /> Salvar Tudo</button></div>
        </form>
      )}
    </div>
  );
};

export default Settings;
