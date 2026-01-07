
import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ArrowLeftRight, 
  History, 
  FileBarChart, 
  Settings as SettingsIcon,
  BookOpen
} from 'lucide-react';
import { Role } from '../types';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  userRole: Role;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, userRole }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
    { id: 'inventory', label: 'Estoque', icon: Package },
    { id: 'new_movement', label: 'Movimentação', icon: ArrowLeftRight },
    { id: 'history', label: 'Histórico', icon: History },
    { id: 'reports', label: 'Relatórios', icon: FileBarChart },
  ];

  if (userRole === 'admin' || userRole === 'developer') {
    menuItems.push({ id: 'manual', label: 'Manual Operador', icon: BookOpen });
  }

  // Developer e Admin agora acessam configurações (Admin vê usuários, Dev vê API)
  if (userRole === 'developer' || userRole === 'admin') {
    menuItems.push({ id: 'settings', label: 'Configurações', icon: SettingsIcon });
  }

  return (
    <aside className="w-64 bg-slate-900 h-screen sticky top-0 flex flex-col text-slate-300 z-40">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Package className="text-blue-500" />
          GestorPro
        </h1>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activePage === item.id 
                ? 'bg-blue-600 text-white' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800 text-[10px] text-slate-500 text-center">
        v1.1.0 Stable
      </div>
    </aside>
  );
};

export default Sidebar;
