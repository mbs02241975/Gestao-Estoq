
import React, { useState, useEffect, useMemo } from 'react';
import { storageService } from '../services/storageService';
import { Product, TransactionType, TransactionItem, User, Transaction } from '../types';
import { ShoppingCart, Plus, Trash2, Search, Check, Printer, Package, DollarSign, FileText, UserCheck, Tag } from 'lucide-react';
import { formatCurrency, generateId, formatDate } from '../utils';
import { SECTORS, RETURN_DESTINATIONS } from '../constants';
import SignaturePad from '../components/SignaturePad';

interface NewTransactionProps {
  user: User;
}

const NewTransaction: React.FC<NewTransactionProps> = ({ user }) => {
  const [type, setType] = useState<TransactionType>('saida');
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<TransactionItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);

  const [vendor, setVendor] = useState('');
  const [invoice, setInvoice] = useState('');
  const [destination, setDestination] = useState(RETURN_DESTINATIONS[0]);
  const [projectDestination, setProjectDestination] = useState('');
  const [requester, setRequester] = useState('');
  const [sector, setSector] = useState(SECTORS[0]);
  const [signature, setSignature] = useState('');
  const [termAccepted, setTermAccepted] = useState(false);

  const settings = storageService.getSettings();

  useEffect(() => {
    setAvailableProducts(storageService.getProducts());
  }, []);

  const filteredProducts = useMemo(() => {
    return availableProducts.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.specification?.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);
  }, [availableProducts, searchTerm]);

  const addToCart = (product: Product) => {
    if (cart.find(i => i.product_id === product.id)) return;
    setCart([...cart, {
      product_id: product.id,
      product_name: product.name,
      product_specification: product.specification, // Salva o tamanho atual
      quantity: 1,
      unit_price: type === 'entrada' ? (product.unit_price || 0) : (product.average_price || 0),
      total_price: type === 'entrada' ? (product.unit_price || 0) : (product.average_price || 0)
    }]);
    setSearchTerm('');
  };

  const updateCartItem = (productId: string, field: 'quantity' | 'unit_price', value: number) => {
    setCart(cart.map(item => {
      if (item.product_id === productId) {
        const updated = { ...item, [field]: value };
        updated.total_price = updated.quantity * updated.unit_price;
        return updated;
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const totalCart = cart.reduce((acc, item) => acc + item.total_price, 0);

  const handleSubmit = () => {
    if (cart.length === 0) return;
    if (type === 'entrada' && (!vendor || !invoice)) {
      alert('Fornecedor e Nota Fiscal são obrigatórios para entradas.');
      return;
    }
    if (type === 'saida') {
      if (!requester || !sector || !projectDestination) {
        alert('Requisitante, Setor e Destino/Projeto são obrigatórios para saídas.');
        return;
      }
      if (!signature) {
        alert('A assinatura do requisitante é obrigatória.');
        return;
      }
      if (!termAccepted) {
        alert('É necessário marcar a ciência do recebimento dos materiais.');
        return;
      }
    }
    
    const transaction: Transaction = {
      id: generateId(),
      type,
      date: new Date().toISOString(),
      vendor: type === 'entrada' ? vendor : undefined,
      invoice_number: type === 'entrada' ? invoice : undefined,
      destination: type === 'devolucao' ? destination : undefined,
      project_destination: type === 'saida' ? projectDestination : undefined,
      sector: type === 'saida' ? sector : undefined,
      requester: (type === 'saida' || type === 'devolucao') ? requester : undefined,
      total_value: totalCart,
      items: cart,
      created_by: user.name,
      signature: type === 'saida' ? signature : undefined
    };

    storageService.saveTransaction(transaction);
    setLastTransaction(transaction);
    setIsFinished(true);
    setAvailableProducts(storageService.getProducts());
  };

  const resetForm = () => {
    setCart([]);
    setVendor('');
    setInvoice('');
    setRequester('');
    setProjectDestination('');
    setSignature('');
    setTermAccepted(false);
    setIsFinished(false);
    setLastTransaction(null);
  };

  if (isFinished && lastTransaction) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mb-8 animate-fadeIn">
          <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-6 no-print">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 text-green-600 p-3 rounded-full"><Check size={32} /></div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Operação Concluída</h2>
                <p className="text-gray-500">Documento gerado e estoque atualizado.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => window.print()} className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200"><Printer size={18} /> Imprimir Relatório</button>
              <button onClick={resetForm} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700">Nova Movimentação</button>
            </div>
          </div>

          <div id="print-area" className="space-y-8 p-6 border-2 border-gray-200 rounded-xl relative overflow-hidden">
             {/* Marca d'água */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none rotate-12">
               <Package size={400} />
             </div>

             <div className="flex justify-between items-start mb-4 relative">
               <div className="flex items-center gap-4">
                 {settings.logoUrl && <img src={settings.logoUrl} className="h-12 object-contain" alt="Logo" />}
                 <div>
                   <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">{settings.tradeName}</h3>
                   <p className="text-xs text-gray-500 font-medium">{settings.companyName}</p>
                 </div>
               </div>
               <div className="text-right">
                 <p className="font-mono text-[10px] text-gray-400">ID: {lastTransaction.id}</p>
                 <p className="text-sm font-bold text-gray-800">{formatDate(lastTransaction.date)}</p>
               </div>
             </div>

             <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-6 relative">
                <div><p className="text-[10px] text-slate-400 font-black uppercase mb-1">Operação</p><p className="capitalize font-bold text-slate-800">{lastTransaction.type}</p></div>
                <div><p className="text-[10px] text-slate-400 font-black uppercase mb-1">{lastTransaction.type === 'entrada' ? 'Fornecedor' : 'Requisitante'}</p><p className="font-bold text-slate-800 truncate">{lastTransaction.vendor || lastTransaction.requester || '-'}</p></div>
                <div><p className="text-[10px] text-slate-400 font-black uppercase mb-1">Setor / Projeto</p><p className="font-bold text-slate-800">{lastTransaction.sector || lastTransaction.project_destination || lastTransaction.destination || '-'}</p></div>
                {lastTransaction.invoice_number && <div><p className="text-[10px] text-slate-400 font-black uppercase mb-1">Nota Fiscal</p><p className="font-bold text-slate-800">{lastTransaction.invoice_number}</p></div>}
             </div>

             <div className="relative">
               <table className="w-full text-sm">
                  <thead><tr className="border-b-2 border-slate-900"><th className="py-3 text-left">Especificação do Material / Tamanho</th><th className="py-3 text-center">Qtd</th><th className="py-3 text-right">Unitário</th><th className="py-3 text-right">Subtotal</th></tr></thead>
                  <tbody className="divide-y divide-slate-200">
                     {lastTransaction.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-3 text-slate-700">
                            <span className="font-bold">{item.product_name}</span>
                            {item.product_specification && <span className="ml-2 text-[10px] bg-slate-100 px-1 py-0.5 rounded font-black italic">({item.product_specification})</span>}
                          </td>
                          <td className="py-3 text-center font-bold">{item.quantity}</td>
                          <td className="py-3 text-right">{formatCurrency(item.unit_price)}</td>
                          <td className="py-3 text-right font-bold">{formatCurrency(item.total_price)}</td>
                        </tr>
                     ))}
                  </tbody>
                  <tfoot><tr className="border-t-2 border-slate-900 font-black"><td colSpan={3} className="py-4 text-right uppercase">Valor Total do Lote:</td><td className="py-4 text-right text-lg">{formatCurrency(lastTransaction.total_value)}</td></tr></tfoot>
               </table>
             </div>

             {lastTransaction.type === 'saida' && (
               <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-100 relative">
                 <p className="text-xs text-amber-800 leading-relaxed italic">
                   "Declaro ter plena ciência do recebimento dos materiais acima descritos para uso exclusivo no projeto/setor indicado, assumindo total responsabilidade pelo seu uso, zelo e guarda."
                 </p>
               </div>
             )}

             <div className="mt-12 pt-8 grid grid-cols-2 gap-12 relative">
                <div className="text-center">
                  <div className="border-t border-slate-400 pt-3">
                    <p className="text-xs font-black uppercase text-slate-900">{lastTransaction.created_by}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Responsável pela Emissão</p>
                  </div>
                </div>
                <div className="text-center flex flex-col items-center">
                  {lastTransaction.signature && (
                    <img src={lastTransaction.signature} className="h-16 mb-[-10px] mix-blend-multiply" alt="Assinatura" />
                  )}
                  <div className="w-full border-t border-slate-400 pt-3">
                    <p className="text-xs font-black uppercase text-slate-900">{lastTransaction.requester || lastTransaction.vendor || 'Recebedor'}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Assinatura Digital do Requisitante</p>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900">Movimentação em Lote</h1><p className="text-gray-500">Registre saídas com assinatura e destino por projeto.</p></div>
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
          {['saida', 'entrada', 'devolucao'].map(t => (
            <button key={t} onClick={() => { setType(t as any); setCart([]); setSignature(''); }} className={`px-5 py-2 rounded-lg text-sm font-black transition-all capitalize ${type === t ? (t === 'entrada' ? 'bg-green-600 text-white' : t === 'saida' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white') : 'text-gray-400 hover:bg-gray-50'}`}>{t}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><ShoppingCart size={20} className="text-blue-600" /> Seleção de Materiais</h3>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Procure por nome, código ou tamanho..." className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              {searchTerm && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl mt-2 z-50 overflow-hidden divide-y divide-gray-100">
                  {filteredProducts.map(p => (
                    <button key={p.id} onClick={() => addToCart(p)} className="w-full flex items-center justify-between p-4 hover:bg-blue-50 text-left">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900">{p.name}</p>
                          {p.specification && <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-black text-slate-500">{p.specification}</span>}
                        </div>
                        <p className="text-[10px] text-gray-400 uppercase font-black">Saldo: {p.current_stock} {p.unit} • Médio: {formatCurrency(p.average_price)}</p>
                      </div>
                      <Plus size={20} className="text-blue-600" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50"><tr className="text-[10px] font-black uppercase text-gray-400"><th className="p-4">Material / Tamanho</th><th className="p-4 text-center">Qtd</th><th className="p-4 text-right">Valor Unit.</th><th className="p-4 text-right">Subtotal</th><th className="p-4 w-10"></th></tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {cart.map((item) => (
                    <tr key={item.product_id}>
                      <td className="p-4">
                        <p className="font-bold text-gray-900">{item.product_name}</p>
                        {item.product_specification && <p className="text-[10px] text-blue-600 font-bold italic flex items-center gap-1"><Tag size={10} /> {item.product_specification}</p>}
                      </td>
                      <td className="p-4"><input type="number" min="1" className="w-20 mx-auto text-center p-2 bg-gray-50 border border-gray-200 rounded-lg font-bold" value={item.quantity} onChange={(e) => updateCartItem(item.product_id, 'quantity', Number(e.target.value))} /></td>
                      <td className="p-4 text-right">
                        <div className="relative inline-block w-28">
                          <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                          <input type="number" step="0.01" disabled={type !== 'entrada'} className={`w-full pl-6 pr-2 py-1.5 text-right rounded border text-sm font-bold ${type === 'entrada' ? 'bg-white border-blue-200' : 'bg-gray-100 border-transparent text-gray-500'}`} value={item.unit_price} onChange={(e) => updateCartItem(item.product_id, 'unit_price', Number(e.target.value))} />
                        </div>
                      </td>
                      <td className="p-4 text-right text-gray-900 font-bold">{formatCurrency(item.total_price)}</td>
                      <td className="p-4 text-center"><button onClick={() => removeFromCart(item.product_id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button></td>
                    </tr>
                  ))}
                  {cart.length === 0 && <tr><td colSpan={5} className="p-16 text-center text-gray-400 italic font-medium">Nenhum item selecionado.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><FileText size={20} className="text-blue-600" /> Dados do Lote</h3>
            <div className="space-y-4">
              {type === 'entrada' ? (
                <>
                  <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Fornecedor *</label><input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={vendor} onChange={(e) => setVendor(e.target.value)} /></div>
                  <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Nº Nota Fiscal *</label><input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={invoice} onChange={(e) => setInvoice(e.target.value)} /></div>
                </>
              ) : (
                <>
                  <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Nome do Requisitante *</label><input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={requester} onChange={(e) => setRequester(e.target.value)} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Setor *</label>
                      <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={sector} onChange={(e) => setSector(e.target.value)}>
                        {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Destino / Projeto *</label>
                      <input type="text" placeholder="Ex: Letreiro Droga X" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={projectDestination} onChange={(e) => setProjectDestination(e.target.value)} />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {type === 'saida' && (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><UserCheck size={20} className="text-blue-600" /> Assinatura Requisitante</h3>
              <SignaturePad onSave={setSignature} onClear={() => setSignature('')} />
              
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                <input type="checkbox" id="term" className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600" checked={termAccepted} onChange={e => setTermAccepted(e.target.checked)} />
                <label htmlFor="term" className="text-[11px] text-amber-900 leading-snug">
                  Declaro ter ciência dos materiais acima e assumo responsabilidade pelo uso.
                </label>
              </div>
            </div>
          )}

          <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-2xl space-y-6">
            <div className="flex justify-between items-end">
              <span className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Total Geral Bruto</span>
              <span className="text-4xl font-black text-blue-400 leading-none">{formatCurrency(totalCart)}</span>
            </div>
            <button onClick={handleSubmit} disabled={cart.length === 0} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-blue-500/20 transition-all uppercase tracking-tighter">Confirmar e Baixar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewTransaction;
