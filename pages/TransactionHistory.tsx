
import React, { useState } from 'react';
import { storageService } from '../services/storageService';
import { formatDate, formatCurrency } from '../utils';
import { Search, Filter, Eye, Download } from 'lucide-react';

const TransactionHistory: React.FC = () => {
  const transactions = storageService.getTransactions().reverse();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = transactions.filter(t => 
    t.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.requester?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.destination?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Histórico de Movimentações</h1>
          <p className="text-gray-500">Acompanhe todas as entradas e saídas realizadas.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por requisitante, destino ou fornecedor..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 text-gray-600 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter size={18} /> Filtros
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Origem/Destino</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Responsável</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Valor Total</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{formatDate(t.date)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                      t.type === 'entrada' ? 'bg-green-100 text-green-700' :
                      t.type === 'saida' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {t.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900">{t.destination || t.vendor || '-'}</div>
                    {t.invoice_number && <div className="text-xs text-gray-500">NF: {t.invoice_number}</div>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{t.requester || t.created_by}</td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">{formatCurrency(t.total_value)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3 text-gray-400">
                      <button className="hover:text-blue-600" title="Ver Detalhes"><Eye size={18} /></button>
                      <button className="hover:text-gray-900" title="Download Recibo"><Download size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-20 text-center text-gray-500">
              Nenhuma movimentação encontrada.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
