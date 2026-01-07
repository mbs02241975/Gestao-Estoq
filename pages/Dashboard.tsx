
import React, { useMemo } from 'react';
import { storageService } from '../services/storageService';
import { formatCurrency, formatDate } from '../utils';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Package,
  Calendar
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard: React.FC = () => {
  const products = storageService.getProducts();
  const transactions = storageService.getTransactions();

  const stats = useMemo(() => {
    const lowStock = products.filter(p => p.current_stock <= p.min_stock).length;
    const totalInventoryValue = products.reduce((acc, p) => acc + (p.current_stock * (p.average_price || p.unit_price)), 0);
    
    const today = new Date().toLocaleDateString('pt-BR');
    const exitsToday = transactions.filter(t => 
      t.type === 'saida' && 
      new Date(t.date).toLocaleDateString('pt-BR') === today
    ).length;
    const entriesToday = transactions.filter(t => 
      t.type === 'entrada' && 
      new Date(t.date).toLocaleDateString('pt-BR') === today
    ).length;

    return { lowStock, totalInventoryValue, exitsToday, entriesToday };
  }, [products, transactions]);

  const chartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('pt-BR');
      const dayLabel = d.toLocaleDateString('pt-BR', { weekday: 'short' });
      
      const dayTransactions = transactions.filter(t => 
        new Date(t.date).toLocaleDateString('pt-BR') === dateStr
      );

      const entradas = dayTransactions
        .filter(t => t.type === 'entrada')
        .reduce((acc, t) => acc + t.items.reduce((sum, item) => sum + item.quantity, 0), 0);

      const saidas = dayTransactions
        .filter(t => t.type === 'saida')
        .reduce((acc, t) => acc + t.items.reduce((sum, item) => sum + item.quantity, 0), 0);

      days.push({
        name: dayLabel,
        entradas,
        saidas,
      });
    }
    return days;
  }, [transactions]);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Patrimônio em Estoque" 
          value={formatCurrency(stats.totalInventoryValue)} 
          icon={Package} 
          color="blue" 
        />
        <StatCard 
          label="Produtos em Alerta" 
          value={stats.lowStock.toString()} 
          icon={AlertTriangle} 
          color="amber" 
          highlight={stats.lowStock > 0}
        />
        <StatCard 
          label="Saídas (Hoje)" 
          value={stats.exitsToday.toString()} 
          icon={TrendingDown} 
          color="red" 
        />
        <StatCard 
          label="Entradas (Hoje)" 
          value={stats.entriesToday.toString()} 
          icon={TrendingUp} 
          color="green" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Fluxo Semanal de Itens</h3>
              <p className="text-xs text-gray-400 font-medium">Quantidade total de produtos movimentados por dia.</p>
            </div>
            <Calendar className="text-blue-600" size={24} />
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#94a3b8' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="entradas" fill="#10b981" radius={[6, 6, 0, 0]} barSize={24} />
                <Bar dataKey="saidas" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
          <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-6">Atividades Recentes</h3>
          <div className="space-y-4">
            {transactions.slice(-5).reverse().map((t) => (
              <div key={t.id} className="group flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-md transition-all cursor-default">
                <div className={`p-3 rounded-xl ${
                  t.type === 'entrada' ? 'bg-green-100 text-green-600' : 
                  t.type === 'saida' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {t.type === 'entrada' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-gray-900 truncate capitalize">{t.type} em lote</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">{formatDate(t.date)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-gray-900">{t.items.length} itens</p>
                  <p className="text-[10px] text-gray-400 font-medium">{formatCurrency(t.total_value)}</p>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="py-20 text-center space-y-2">
                <Package className="mx-auto text-gray-200" size={48} />
                <p className="text-gray-400 text-sm font-medium italic">Nenhuma movimentação.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color, highlight = false }: any) => {
  const colorMap: any = {
    blue: 'bg-blue-600 text-white shadow-blue-500/20',
    green: 'bg-green-600 text-white shadow-green-500/20',
    red: 'bg-red-600 text-white shadow-red-500/20',
    amber: 'bg-amber-600 text-white shadow-amber-500/20',
  };

  return (
    <div className={`p-6 bg-white rounded-3xl border border-gray-200 shadow-sm transition-all hover:translate-y-[-4px] ${highlight ? 'ring-2 ring-amber-500 border-amber-500' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${colorMap[color]} shadow-lg`}>
          <Icon size={24} />
        </div>
      </div>
      <div>
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <h4 className="text-2xl font-black text-gray-900">{value}</h4>
      </div>
    </div>
  );
};

export default Dashboard;
