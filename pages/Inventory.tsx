
import React, { useState, useMemo } from 'react';
import { storageService } from '../services/storageService';
import { Product, Role } from '../types';
import { Plus, Search, Filter, AlertCircle, Edit, Trash2, DollarSign, Tag } from 'lucide-react';
import { formatCurrency, generateId, getNextProductCode } from '../utils';
import { UNITS } from '../constants';

interface InventoryProps {
  userRole: Role;
}

const CATEGORIES = ["EPIs", "Escritório", "Ferramentas", "Informática", "Limpeza", "Manutenção", "Materiais Elétricos", "Mobiliário", "Outros"];

const Inventory: React.FC<InventoryProps> = ({ userRole }) => {
  const [products, setProducts] = useState<Product[]>(storageService.getProducts());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    specification: '',
    description: '',
    unit: 'un',
    min_stock: 0,
    current_stock: 0,
    unit_price: 0,
    category: CATEGORIES[0]
  });

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.specification?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const nextCode = useMemo(() => getNextProductCode(products), [products, isModalOpen]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.name) { setError('O nome do produto é obrigatório.'); return; }

    const newProduct: Product = {
      id: generateId(),
      code: nextCode,
      name: formData.name!,
      specification: formData.specification || '',
      description: formData.description || '',
      unit: formData.unit || 'un',
      min_stock: Number(formData.min_stock) || 0,
      current_stock: Number(formData.current_stock) || 0,
      unit_price: Number(formData.unit_price) || 0,
      average_price: Number(formData.unit_price) || 0,
      category: formData.category || CATEGORIES[0],
      created_at: new Date().toISOString(),
    };

    try {
      storageService.addProduct(newProduct);
      setProducts(storageService.getProducts());
      setIsModalOpen(false);
      setFormData({ name: '', specification: '', description: '', unit: 'un', min_stock: 0, current_stock: 0, unit_price: 0, category: CATEGORIES[0] });
    } catch (err: any) { setError(err.message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900">Catálogo de Produtos</h1><p className="text-gray-500">Valores calculados com base na média móvel de entradas.</p></div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg"><Plus size={20} /> Novo Produto</button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="text" placeholder="Pesquisar por nome, código ou tamanho..." className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black uppercase text-gray-400">
                <th className="px-6 py-4">Cód.</th>
                <th className="px-6 py-4">Produto / Especificação</th>
                <th className="px-6 py-4 text-right">Preço Médio</th>
                <th className="px-6 py-4 text-center">Saldo</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-blue-600 font-bold">{p.code}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{p.name}</div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black uppercase text-gray-400">{p.category}</span>
                      {p.specification && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">{p.specification}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right"><div className="font-black text-gray-900">{formatCurrency(p.average_price || p.unit_price)}</div><div className="text-[9px] text-gray-400 italic">Última entrada: {formatCurrency(p.unit_price)}</div></td>
                  <td className="px-6 py-4 text-center"><span className="font-black text-xl text-gray-900">{p.current_stock}</span> <span className="text-gray-400 text-[10px] font-bold uppercase">{p.unit}</span></td>
                  <td className="px-6 py-4">{p.current_stock <= p.min_stock ? <span className="bg-red-100 text-red-700 px-2 py-1 rounded-md text-[10px] font-black uppercase">Crítico</span> : <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-[10px] font-black uppercase">Normal</span>}</td>
                  <td className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-2 text-gray-300"><button className="hover:text-blue-600 transition-colors"><Edit size={18} /></button>{userRole === 'admin' && <button className="hover:text-red-600 transition-colors"><Trash2 size={18} /></button>}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-scaleUp overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50"><h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Novo Produto</h2><button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-3xl font-bold leading-none">&times;</button></div>
            <form onSubmit={handleSave} className="p-8 space-y-6">
              {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold flex items-center gap-2"><AlertCircle size={16} /> {error}</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Cód (Automático)</label><div className="w-full px-4 py-3 bg-blue-50 border border-blue-100 text-blue-700 rounded-xl font-mono font-bold text-center">{nextCode}</div></div>
                <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nome do Produto *</label><input type="text" required autoFocus className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1 flex items-center gap-1">
                    <Tag size={12} /> Especificação (Tam/Cor/Modelo)
                  </label>
                  <input type="text" placeholder="Ex: Tam 39, Cor Azul, 220V..." className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.specification} onChange={(e) => setFormData({...formData, specification: e.target.value})} />
                </div>
                
                <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Categoria</label><select className="w-full px-4 py-3 border border-gray-200 rounded-xl" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>{CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
                
                <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Descrição Adicional</label><textarea className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} /></div>
                
                <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Unidade de Medida</label>
                  <select className="w-full px-4 py-3 border border-gray-200 rounded-xl" value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})}>
                    {UNITS.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
                  </select>
                </div>
                
                <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Preço Inicial de Compra</label><div className="relative"><DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} /><input type="number" step="0.01" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl" value={formData.unit_price} onChange={(e) => setFormData({...formData, unit_price: Number(e.target.value)})} /></div></div>
                <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Estoque Mínimo (Alerta)</label><input type="number" className="w-full px-4 py-3 border border-gray-200 rounded-xl" value={formData.min_stock} onChange={(e) => setFormData({...formData, min_stock: Number(e.target.value)})} /></div>
              </div>
              <div className="pt-6 flex justify-end gap-4"><button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-3 text-gray-400 font-bold hover:text-gray-600">Cancelar</button><button type="submit" className="px-10 py-3 bg-blue-600 text-white rounded-xl font-black shadow-xl shadow-blue-500/20 hover:bg-blue-700 uppercase">Cadastrar</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
