
import React from 'react';
import { User, CompanySettings } from '../types';
import { UserCircle, LogOut, Building2 } from 'lucide-react';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  settings: CompanySettings;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, settings }) => {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8">
      <div className="flex items-center gap-4">
        {settings.logoUrl ? (
          <img src={settings.logoUrl} alt="Logo" className="h-10 object-contain" />
        ) : (
          <div className="bg-blue-100 p-2 rounded text-blue-600">
            <Building2 size={24} />
          </div>
        )}
        <div className="hidden sm:block">
          <h2 className="text-lg font-semibold text-gray-800 leading-tight">{settings.tradeName}</h2>
          <p className="text-xs text-gray-500 uppercase font-medium">{settings.companyName}</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 text-right">
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
            <p className="text-xs text-blue-600 font-medium capitalize">{user?.role}</p>
          </div>
          <UserCircle size={32} className="text-gray-400" />
        </div>
        <button 
          onClick={onLogout}
          className="text-gray-400 hover:text-red-500 transition-colors"
          title="Sair"
        >
          <LogOut size={22} />
        </button>
      </div>
    </header>
  );
};

export default Header;
