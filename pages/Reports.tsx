
import React, { useState, useMemo } from 'react';
import { storageService } from '../services/storageService';
import { formatDate, formatCurrency } from '../utils';
// Added 'Package' to the imported icons from 'lucide-react'
import { FileText, Download, Printer, Search, Calendar, Filter, ArrowRight, MapPin, User, ChevronDown, ChevronUp, Package } from 'lucide-react';
import { SECTORS, RETURN_DESTINATIONS } from '../constants';

const Reports: React.FC = () => {
  const transactions = storageService.getTransactions();

  // Estados dos Filtros
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterSector, setFilterSector] = useState('Todos');
  const [filterRequester, setFilterRequester] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [filterType, setFilterType] = useState<'todos' | 'entrada' | 'saida' | 'devolucao'>('saida');
  
  // Controle de Visualização
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredData = useMemo(() => {
    return transactions.filter(t => {
      if (filterType !== 'todos' && t.type !== filterType) return false;
      if (startDate && new Date(t.date) < new Date(startDate)) return false;
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59);
        if (new Date(t.date) > end) return false;
      }
      if (filterSector !== 'Todos' && t.sector !== filterSector) return false;
      if (filterRequester && !t.requester?.toLowerCase().includes(filterRequester.toLowerCase())) return false;
      if (filterProject && !t.project_destination?.toLowerCase().includes(filterProject.toLowerCase())) return false;

      return true;
    }).reverse();
  }, [transactions, startDate, endDate, filterSector, filterRequester, filterProject, filterType]);

  const totals = useMemo(() => {
    return filteredData.reduce((acc, t) => acc + (t.total_value || 0), 0);
  }, [filteredData]);

  const totalItemsCount = useMemo(() => {
    return filteredData.reduce((acc, t) => acc + t.items.reduce((sum, item) => sum + item.quantity, 0), 0);
  }, [filteredData]);

  return (
    <div className="space-y-8 pb-12 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios Gerenciais</h1>
          <p className="text-gray-500">Busque por Projeto para saber o custo total de cada obra.</p>
        </div>
        <div className="flex gap-2">
           <button onClick={() => window.print()} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-all">
             <Printer size={18} /> Imprimir Resultado
           </button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6 no-print">
        <div className="flex items-center gap-2 text-blue-600 font-bold">
          <Filter size={18} /> Filtros Dinâmicos
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-4 lg:col-span-2">
             <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-1">De:</label><input type="date" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
                <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Até:</label><input type="date" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Setor</label><select className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" value={filterSector} onChange={e => setFilterSector(e.target.value)}><option value="Todos">Todos</option>{SECTORS.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
               <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Movimento</label><select className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold" value={filterType} onChange={e => setFilterType(e.target.value as any)}><option value="todos">Todos</option><option value="entrada">Entradas</option><option value="saida">Saídas</option><option value="devolucao">Devoluções</option></select></div>
             </div>
          </div>
          <div className="space-y-4 lg:col-span-2">
             <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Destino / Projeto</label><div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} /><input type="text" placeholder="Ex: Letreiro Droga X..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" value={filterProject} onChange={e => setFilterProject(e.target.value)} /></div></div>
             <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Requisitante</label><div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} /><input type="text" placeholder="Nome do funcionário..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" value={filterRequester} onChange={e => setFilterRequester(e.target.value)} /></div></div>
          </div>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 no-print">
        <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl flex items-center justify-between border-b-8 border-blue-500">
          <div><p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total Financeiro</p><div className="text-4xl font-black text-blue-400 leading-none">{formatCurrency(totals)}</div></div>
          <FileText size={48} className="text-slate-800" />
        </div>
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm flex items-center justify-between border-b-8 border-slate-100">
          <div><p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Volume de Materiais</p><div className="text-4xl font-black text-gray-900 leading-none">{totalItemsCount} <span className="text-lg text-gray-400">un</span></div></div>
          <Package size={48} className="text-gray-100" />
        </div>
      </div>

      {/* Tabela de Resultados */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center no-print">
          <h3 className="font-bold text-gray-700 text-sm">Resultados da Pesquisa</h3>
          <span className="text-[10px] bg-white border border-gray-200 text-gray-600 px-3 py-1 rounded-full font-black uppercase">{filteredData.length} registros</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white border-b border-gray-100 no-print">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase">Data</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase">Tipo</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase">Requisitante / Projeto</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase text-right">V. Total</th>
                <th className="px-6 py-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredData.map((t) => (
                <React.Fragment key={t.id}>
                  <tr 
                    onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                    className={`bg-white hover:bg-blue-50/50 transition-all cursor-pointer no-print ${expandedId === t.id ? 'bg-blue-50/30' : ''}`}
                  >
                    <td className="px-6 py-4 text-xs font-bold text-gray-500">{formatDate(t.date).split(',')[0]}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                        t.type === 'entrada' ? 'bg-green-100 text-green-700' :
                        t.type === 'saida' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                      }`}>{t.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-black text-gray-900 leading-tight">{t.requester || t.vendor || 'Sistema'}</div>
                      <div className="text-[10px] text-gray-400 uppercase font-black truncate max-w-xs">{t.project_destination || t.sector || t.destination || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-right"><div className="text-sm font-black text-gray-900">{formatCurrency(t.total_value)}</div></td>
                    <td className="px-6 py-4 text-center">{expandedId === t.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</td>
                  </tr>
                  
                  {/* Detalhamento Expandido */}
                  {(expandedId === t.id || window.matchMedia('print').matches) && (
                    <tr className={window.matchMedia('print').matches ? '' : 'bg-gray-50/30'}>
                      <td colSpan={5} className="px-6 py-6 border-b border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                             <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1">Materiais do Lote</h4>
                             <div className="space-y-2">
                               {t.items.map((item, i) => (
                                 <div key={i} className="flex justify-between text-sm">
                                   <div className="flex gap-2"><span className="font-black text-blue-600">{item.quantity}x</span><span className="text-gray-700 font-medium">{item.product_name}</span></div>
                                   <div className="text-gray-900 font-bold">{formatCurrency(item.total_price)}</div>
                                 </div>
                               ))}
                               <div className="pt-2 border-t border-gray-100 flex justify-between font-black text-gray-900">
                                 <span>TOTAL DO LOTE:</span>
                                 <span className="text-blue-600">{formatCurrency(t.total_value)}</span>
                               </div>
                             </div>
                          </div>
                          <div className="space-y-4 border-l border-gray-100 pl-8">
                             <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1">Identificação</h4>
                             <div className="grid grid-cols-2 gap-4 text-xs">
                               <div><p className="text-gray-400 mb-1">Setor / Área:</p><p className="font-bold">{t.sector || '-'}</p></div>
                               <div><p className="text-gray-400 mb-1">Destino Projeto:</p><p className="font-bold">{t.project_destination || '-'}</p></div>
                             </div>
                             {t.signature && (
                               <div className="pt-4 text-center border-t border-gray-100">
                                 <img src={t.signature} className="h-16 mx-auto mix-blend-multiply" alt="Assinatura Digital" />
                                 <p className="text-[8px] text-gray-400 font-black uppercase mt-1">Assinatura Digital Coletada</p>
                               </div>
                             )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {filteredData.length === 0 && (
                <tr><td colSpan={5} className="py-24 text-center text-gray-400 italic font-medium">Nenhum registro encontrado para os filtros aplicados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
