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
  ExternalLink,
  Plus,
  Trash2,
  FileText,
  Shield
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
    customUrl: 'meu-studio',
    workingHours: {
      monday: { enabled: true, start: '08:00', end: '18:00', breaks: [] },
      tuesday: { enabled: true, start: '08:00', end: '18:00', breaks: [] },
      wednesday: { enabled: true, start: '08:00', end: '18:00', breaks: [] },
      thursday: { enabled: true, start: '08:00', end: '18:00', breaks: [] },
      friday: { enabled: true, start: '08:00', end: '18:00', breaks: [] },
      saturday: { enabled: true, start: '08:00', end: '16:00', breaks: [] },
      sunday: { enabled: false, start: '08:00', end: '18:00', breaks: [] }
    },
    paymentKey: 'TEST-1234567890-abcdef',
    notifications: {
      email: true,
      sms: false,
      whatsapp: true
    },
    bookingSettings: {
      allowCancellation: true,
      cancellationHours: 24
    }
  });

  const publicUrl = `${window.location.origin}/booking/${settings.customUrl}`;
  const fullPublicUrl = `https://${settings.customUrl}.beautyagenda.shop`;

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'booking', label: 'Agendamentos', icon: Clock },
    { id: 'payments', label: 'Pagamentos', icon: CreditCard },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'public', label: 'Página Pública', icon: Globe },
    { id: 'legal', label: 'Termos e Privacidade', icon: FileText }
  ];

  const handleSave = () => {
    // Aqui você salvaria as configurações
    alert('Configurações salvas com sucesso!');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Link copiado para a área de transferência!');
  };

  const copyFullUrlToClipboard = () => copyToClipboard(fullPublicUrl);

  const weekDays = [
    { id: 'monday', label: 'Segunda-feira' },
    { id: 'tuesday', label: 'Terça-feira' },
    { id: 'wednesday', label: 'Quarta-feira' },
    { id: 'thursday', label: 'Quinta-feira' },
    { id: 'friday', label: 'Sexta-feira' },
    { id: 'saturday', label: 'Sábado' },
    { id: 'sunday', label: 'Domingo' }
  ];

  const addBreak = (dayId: string) => {
    setSettings(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [dayId]: {
          ...prev.workingHours[dayId as keyof typeof prev.workingHours],
          breaks: [...prev.workingHours[dayId as keyof typeof prev.workingHours].breaks, { start: '12:00', end: '13:00' }]
        }
      }
    }));
  };

  const removeBreak = (dayId: string, breakIndex: number) => {
    setSettings(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [dayId]: {
          ...prev.workingHours[dayId as keyof typeof prev.workingHours],
          breaks: prev.workingHours[dayId as keyof typeof prev.workingHours].breaks.filter((_, i) => i !== breakIndex)
        }
      }
    }));
  };

  const copyScheduleToOtherDays = (sourceDay: string) => {
    const sourceSchedule = settings.workingHours[sourceDay as keyof typeof settings.workingHours];
    const newWorkingHours = { ...settings.workingHours };
    
    Object.keys(newWorkingHours).forEach(day => {
      if (day !== sourceDay) {
        newWorkingHours[day as keyof typeof newWorkingHours] = { ...sourceSchedule };
      }
    });
    
    setSettings(prev => ({ ...prev, workingHours: newWorkingHours }));
  };

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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL Personalizada
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={settings.customUrl}
                        onChange={(e) => setSettings(prev => ({ ...prev, customUrl: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <span className="text-gray-500">.beautyagenda.shop</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'booking' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Configurações de Agendamento</h2>
                
                <div className="space-y-6">
                  {weekDays.map((day) => {
                    const daySchedule = settings.workingHours[day.id as keyof typeof settings.workingHours];
                    return (
                      <div key={day.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={daySchedule.enabled}
                              onChange={(e) => setSettings(prev => ({
                                ...prev,
                                workingHours: {
                                  ...prev.workingHours,
                                  [day.id]: { ...daySchedule, enabled: e.target.checked }
                                }
                              }))}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <h3 className="font-medium text-gray-900">{day.label}</h3>
                          </div>
                          <button
                            onClick={() => copyScheduleToOtherDays(day.id)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Copiar para outros dias
                          </button>
                        </div>

                        {daySchedule.enabled && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Abertura
                                </label>
                                <input
                                  type="time"
                                  value={daySchedule.start}
                                  onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    workingHours: {
                                      ...prev.workingHours,
                                      [day.id]: { ...daySchedule, start: e.target.value }
                                    }
                                  }))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Fechamento
                                </label>
                                <input
                                  type="time"
                                  value={daySchedule.end}
                                  onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    workingHours: {
                                      ...prev.workingHours,
                                      [day.id]: { ...daySchedule, end: e.target.value }
                                    }
                                  }))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-gray-700">
                                  Pausas/Intervalos
                                </label>
                                <button
                                  onClick={() => addBreak(day.id)}
                                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
                                >
                                  <Plus size={14} />
                                  <span>Adicionar pausa</span>
                                </button>
                              </div>
                              {daySchedule.breaks.map((breakTime, index) => (
                                <div key={index} className="flex items-center space-x-2 mb-2">
                                  <input
                                    type="time"
                                    value={breakTime.start}
                                    onChange={(e) => {
                                      const newBreaks = [...daySchedule.breaks];
                                      newBreaks[index] = { ...breakTime, start: e.target.value };
                                      setSettings(prev => ({
                                        ...prev,
                                        workingHours: {
                                          ...prev.workingHours,
                                          [day.id]: { ...daySchedule, breaks: newBreaks }
                                        }
                                      }));
                                    }}
                                    className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                  <span className="text-gray-500">até</span>
                                  <input
                                    type="time"
                                    value={breakTime.end}
                                    onChange={(e) => {
                                      const newBreaks = [...daySchedule.breaks];
                                      newBreaks[index] = { ...breakTime, end: e.target.value };
                                      setSettings(prev => ({
                                        ...prev,
                                        workingHours: {
                                          ...prev.workingHours,
                                          [day.id]: { ...daySchedule, breaks: newBreaks }
                                        }
                                      }));
                                    }}
                                    className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                  <button
                                    onClick={() => removeBreak(day.id, index)}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
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
                        <h3 className="font-medium text-green-900">Link Personalizado</h3>
                        <p className="text-sm text-green-700">Seu link personalizado para clientes</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border mb-4">
                      <input
                        type="text"
                        value={fullPublicUrl}
                        readOnly
                        className="flex-1 bg-transparent text-sm text-gray-600 focus:outline-none"
                      />
                      <button
                        onClick={copyFullUrlToClipboard}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
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

            {activeTab === 'legal' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Termos de Uso e Política de Privacidade</h2>
                
                <div className="space-y-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-3">Termos de Uso</h3>
                    <div className="text-sm text-gray-600 space-y-2">
                      <p>Ao utilizar nossa plataforma, você concorda com os seguintes termos:</p>
                      <p>• O uso da plataforma é destinado exclusivamente para fins comerciais legítimos</p>
                      <p>• É responsabilidade do usuário manter suas informações atualizadas</p>
                      <p>• Não é permitido o uso da plataforma para atividades ilegais ou prejudiciais</p>
                      <p>• Reservamo-nos o direito de suspender contas que violem estes termos</p>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-3">Política de Privacidade</h3>
                    <div className="text-sm text-gray-600 space-y-2">
                      <p>Respeitamos sua privacidade e protegemos seus dados:</p>
                      <p>• Coletamos apenas informações necessárias para o funcionamento do serviço</p>
                      <p>• Seus dados não são compartilhados com terceiros sem consentimento</p>
                      <p>• Utilizamos criptografia para proteger informações sensíveis</p>
                      <p>• Você pode solicitar a exclusão de seus dados a qualquer momento</p>
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