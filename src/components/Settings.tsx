import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  CreditCard, 
  Clock, 
  Globe,
  Save,
  Eye,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    studioName: user?.studioName || 'Estúdio Beleza & Arte',
    ownerName: user?.name || 'João Silva',
    email: user?.email || 'joao@studio.com',
    phone: '(11) 99999-9999',
    address: 'Rua das Flores, 123 - São Paulo, SP',
    workingHours: {
      start: '08:00',
      end: '18:00'
    },
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    paymentKey: 'TEST-1234567890-abcdef',
    notifications: {
      email: true,
      sms: false,
      whatsapp: true
    },
    bookingSettings: {
      requireSignal: true,
      signalPercentage: 30,
      allowCancellation: true,
      cancellationHours: 24
    }
  });

  const publicUrl = `${window.location.origin}/booking/studio-123`;

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'booking', label: 'Agendamentos', icon: Clock },
    { id: 'payments', label: 'Pagamentos', icon: CreditCard },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'public', label: 'Página Pública', icon: Globe }
  ];

  const handleSave = () => {
    // Aqui você salvaria as configurações
    alert('Configurações salvas com sucesso!');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Link copiado para a área de transferência!');
  };

  const weekDays = [
    { id: 'monday', label: 'Segunda-feira' },
    { id: 'tuesday', label: 'Terça-feira' },
    { id: 'wednesday', label: 'Quarta-feira' },
    { id: 'thursday', label: 'Quinta-feira' },
    { id: 'friday', label: 'Sexta-feira' },
    { id: 'saturday', label: 'Sábado' },
    { id: 'sunday', label: 'Domingo' }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurações</h1>
          <p className="text-gray-600">Gerencie as configurações do seu estúdio</p>
        </div>
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Save size={20} />
          <span>Salvar Alterações</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {activeTab === 'profile' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Informações do Perfil</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Estúdio
                    </label>
                    <input
                      type="text"
                      value={settings.studioName}
                      onChange={(e) => setSettings(prev => ({ ...prev, studioName: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Proprietário
                    </label>
                    <input
                      type="text"
                      value={settings.ownerName}
                      onChange={(e) => setSettings(prev => ({ ...prev, ownerName: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={settings.phone}
                      onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Endereço
                    </label>
                    <input
                      type="text"
                      value={settings.address}
                      onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'booking' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Configurações de Agendamento</h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Horário de Abertura
                      </label>
                      <input
                        type="time"
                        value={settings.workingHours.start}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          workingHours: { ...prev.workingHours, start: e.target.value }
                        }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Horário de Fechamento
                      </label>
                      <input
                        type="time"
                        value={settings.workingHours.end}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          workingHours: { ...prev.workingHours, end: e.target.value }
                        }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Dias de Funcionamento
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {weekDays.map((day) => (
                        <label key={day.id} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.workingDays.includes(day.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSettings(prev => ({
                                  ...prev,
                                  workingDays: [...prev.workingDays, day.id]
                                }));
                              } else {
                                setSettings(prev => ({
                                  ...prev,
                                  workingDays: prev.workingDays.filter(d => d !== day.id)
                                }));
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{day.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.bookingSettings.requireSignal}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            bookingSettings: { ...prev.bookingSettings, requireSignal: e.target.checked }
                          }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Exigir pagamento de sinal</span>
                      </label>
                      {settings.bookingSettings.requireSignal && (
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Percentual do sinal (%)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={settings.bookingSettings.signalPercentage}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              bookingSettings: { ...prev.bookingSettings, signalPercentage: parseInt(e.target.value) }
                            }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.bookingSettings.allowCancellation}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            bookingSettings: { ...prev.bookingSettings, allowCancellation: e.target.checked }
                          }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Permitir cancelamento</span>
                      </label>
                      {settings.bookingSettings.allowCancellation && (
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cancelamento até (horas antes)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={settings.bookingSettings.cancellationHours}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              bookingSettings: { ...prev.bookingSettings, cancellationHours: parseInt(e.target.value) }
                            }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Configurações de Pagamento</h2>
                
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CreditCard size={24} className="text-blue-600" />
                      <div>
                        <h3 className="font-medium text-blue-900">Mercado Pago</h3>
                        <p className="text-sm text-blue-700">Configure sua chave de API do Mercado Pago</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chave de API do Mercado Pago
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={settings.paymentKey}
                        onChange={(e) => setSettings(prev => ({ ...prev, paymentKey: e.target.value }))}
                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="APP_USR-XXXXXXXXX..."
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <Eye size={20} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Esta chave será usada para processar os pagamentos dos sinais
                    </p>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h3 className="font-medium text-yellow-900 mb-2">Como configurar:</h3>
                    <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
                      <li>Acesse sua conta do Mercado Pago</li>
                      <li>Vá em "Seu negócio" → "Configurações" → "Gestão e Administração" → "Credenciais"</li>
                      <li>Copie sua chave de acesso (Access Token)</li>
                      <li>Cole a chave no campo acima</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Configurações de Notificações</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">Receber notificações por:</h3>
                    <div className="space-y-4">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications.email}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, email: e.target.checked }
                          }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <span className="font-medium text-gray-700">Email</span>
                          <p className="text-sm text-gray-500">Receba notificações por email sobre novos agendamentos</p>
                        </div>
                      </label>

                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications.sms}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, sms: e.target.checked }
                          }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <span className="font-medium text-gray-700">SMS</span>
                          <p className="text-sm text-gray-500">Receba notificações por SMS (taxas podem se aplicar)</p>
                        </div>
                      </label>

                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications.whatsapp}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, whatsapp: e.target.checked }
                          }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <span className="font-medium text-gray-700">WhatsApp</span>
                          <p className="text-sm text-gray-500">Receba notificações via WhatsApp</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'public' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Página Pública de Agendamentos</h2>
                
                <div className="space-y-6">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <Globe size={24} className="text-green-600" />
                      <div>
                        <h3 className="font-medium text-green-900">Link da Página de Agendamentos</h3>
                        <p className="text-sm text-green-700">Compartilhe este link com seus clientes</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
                      <input
                        type="text"
                        value={publicUrl}
                        readOnly
                        className="flex-1 bg-transparent text-sm text-gray-600 focus:outline-none"
                      />
                      <button
                        onClick={() => copyToClipboard(publicUrl)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        onClick={() => window.open(publicUrl, '_blank')}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <ExternalLink size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">Como usar:</h3>
                    <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                      <li>Copie o link acima</li>
                      <li>Compartilhe com seus clientes via WhatsApp, Instagram, etc.</li>
                      <li>Os clientes poderão agendar diretamente</li>
                      <li>Você receberá notificações de novos agendamentos</li>
                    </ol>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">QR Code</h4>
                      <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-sm text-gray-500">QR Code aqui</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Imprima este QR Code para facilitar o acesso
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Preview</h4>
                      <div className="border rounded-lg p-3 bg-gray-50">
                        <p className="text-sm font-medium">{settings.studioName}</p>
                        <p className="text-xs text-gray-600">Agende seu horário online</p>
                        <button className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          Ver página
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}