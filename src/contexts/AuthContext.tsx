import React from 'react';
import { 
  Home, 
  Users, 
  Briefcase, 
  Calendar, 
  MessageSquare, 
  Settings, 
  LogOut,
  Menu,
  Scissors,
  Crown,
  MessageCircle,
  FileText
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user, usuario } = useAuth();

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Profissionais', path: '/professionals' },
    { icon: Briefcase, label: 'Serviços', path: '/services' },
    { icon: Calendar, label: 'Agenda', path: '/schedule' },
    { icon: MessageSquare, label: 'Clientes', path: '/clients' },
    { icon: Settings, label: 'Configurações', path: '/settings' },
    { icon: FileText, label: 'Termos e Privacidade', path: '/legal' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/5511999999999?text=Olá! Preciso de ajuda com o Beauty Agenda', '_blank');
  };

  return (
    <div className={`fixed left-0 top-0 h-full bg-white shadow-xl transition-all duration-300 z-50 ${
      isOpen ? 'w-64' : 'w-16'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className={`flex items-center space-x-3 ${!isOpen && 'justify-center'}`}>
          <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center">
            <Scissors size={16} />
          </div>
          {isOpen && (
            <div>
              <h1 className="font-bold text-gray-900">AgendPro</h1>
              <p className="text-xs text-gray-500">{user?.studioName}</p>
            </div>
          )}
        </div>
        <button
          onClick={onToggle}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Menu size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Upgrade Button */}
      {isOpen && (
        <div className="p-4">
          <button
            onClick={() => navigate('/upgrade')}
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white py-3 px-4 rounded-lg font-medium hover:from-yellow-500 hover:to-yellow-700 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <Crown size={18} />
            <span>Fazer Upgrade</span>
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                  : 'text-gray-600 hover:bg-gray-50'
              } ${!isOpen && 'justify-center'}`}
            >
              <Icon size={20} />
              {isOpen && <span className="font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
        {/* WhatsApp Support */}
        <button
          onClick={handleWhatsApp}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-green-600 hover:bg-green-50 transition-colors mb-3 ${
            !isOpen && 'justify-center'
          }`}
        >
          <MessageCircle size={20} />
          {isOpen && <span className="font-medium">Suporte</span>}
        </button>

        {isOpen && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900 text-sm">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors ${
            !isOpen && 'justify-center'
          }`}
        >
          <LogOut size={20} />
          {isOpen && <span className="font-medium">Sair</span>}
        </button>
      </div>
    </div>
  );
}