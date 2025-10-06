import React, { useState, useEffect, FormEvent } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  CreditCard, 
  Clock, 
  Globe,
  Save,
  Copy,
  ExternalLink,
  Plus,
  Trash2,
  FileText,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Usuario } from '../lib/supabase';

function FormMessage({ type, text }: { type: 'success' | 'error', text: string }) {
  const baseClasses = "text-sm p-3 rounded-lg my-4";
  const typeClasses = type === 'success' ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  return <div className={`${baseClasses} ${typeClasses}`}>{text}</div>;
}

export default function Settings() {
  const { usuario, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  const [settings, setSettings] = useState({
    studioName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    customUrl: '',
    workingHours: {
      monday: { enabled: true, start: '08:00', end: '18:00', breaks: [] as {start: string, end: string}[] },
      tuesday: { enabled: true, start: '08:00', end: '18:00', breaks: [] as {start: string, end: string}[] },
      wednesday: { enabled: true, start: '08:00', end: '18:00', breaks: [] as {start: string, end: string}[] },
      thursday: { enabled: true, start: '08:00', end: '18:00', breaks: [] as {start: string, end: string}[] },
      friday: { enabled: true, start: '08:00', end: '18:00', breaks: [] as {start: string, end: string}[] },
      saturday: { enabled: false, start: '09:00', end: '13:00', breaks: [] as {start: string, end: string}[] },
      sunday: { enabled: false, start: '09:00', end: '13:00', breaks: [] as {start: string, end: string}[] }
    },
    blockedDates: [] as {date: string, profissional_id: string, motivo?: string}[],
    paymentKey: '',
    bookingSettings: {
      allowCancellation: true,
      cancellationHours: 24
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isKeyVisible, setIsKeyVisible] = useState(false);

  useEffect(() => {
    if (usuario) {
      setSettings(prev => ({
        ...prev,
        studioName: usuario.nome_studio || '',
        ownerName: usuario.nome || '',
        email: usuario.email || '',
        phone: usuario.telefone || '',
        address: usuario.endereco || '',
        customUrl: usuario.slug || '',
        workingHours: usuario.configuracoes?.workingHours || prev.workingHours,
        blockedDates: usuario.configuracoes?.blockedDates || [],
        paymentKey: usuario.configuracoes?.paymentKey || prev.paymentKey,
        bookingSettings: usuario.configuracoes?.bookingSettings || prev.bookingSettings,
      }));
    }
  }, [usuario]);

  const fullPublicUrl = `https://beauty-agenda.vercel.app/booking/${settings.customUrl}`;

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'availability', label: 'Disponibilidade', icon: Clock },
    { id: 'blockedTimes', label: 'Bloqueios de Horário', icon: Clock },
    { id: 'payments', label: 'Pagamentos', icon: CreditCard },
    { id: 'public', label: 'Página Pública', icon: Globe },
    { id: 'legal', label: 'Termos e Privacidade', icon: FileText }
  ];

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    const profileDataToUpdate = {
      nome_studio: settings.studioName,
      nome: settings.ownerName,
      telefone: settings.phone,
      endereco: settings.address,
      slug: settings.customUrl,
      configuracoes: {
        workingHours: settings.workingHours,
        blockedDates: settings.blockedDates,
        paymentKey: settings.paymentKey,
        bookingSettings: settings.bookingSettings
      }
    };
    
    const result = await updateProfile(profileDataToUpdate);

    if (result.success) {
      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
    } else {
      setMessage({ type: 'error', text: `Erro ao salvar: ${result.error}` });
    }
    
    setTimeout(() => setMessage(null), 5000);
    setIsSaving(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Link copiado!');
  };

  const weekDays = [
    { id: 'monday', label: 'Segunda-feira' }, { id: 'tuesday', label: 'Terça-feira' },
    { id: 'wednesday', label: 'Quarta-feira' }, { id: 'thursday', label: 'Quinta-feira' },
    { id: 'friday', label: 'Sexta-feira' }, { id: 'saturday', label: 'Sábado' },
    { id: 'sunday', label: 'Domingo' }
  ];

  // FUNÇÕES DE HORÁRIO COM ERRO DE DIGITAÇÃO CORRIGIDO
  const addBreak = (dayId: string) => {
    setSettings(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [dayId]: {
          ...prev.workingHours[dayId as keyof typeof prev.workingHours],
          breaks: [...(prev.workingHours[dayId as keyof typeof prev.workingHours].breaks || []), { start: '12:00', end: '13:00' }]
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
          breaks: (prev.workingHours[dayId as keyof typeof prev.workingHours].breaks || []).filter((_, i) => i !== breakIndex)
        }
      }
    }));
  };

  const copyScheduleToOtherDays = (sourceDay: string) => {
    const sourceSchedule = settings.workingHours[sourceDay as keyof typeof settings.workingHours];
    const newWorkingHours = { ...settings.workingHours };
    
    Object.keys(newWorkingHours).forEach(day => {
      if (day !== sourceDay && day !== 'saturday' && day !== 'sunday') {
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
        <button onClick={handleSave} disabled={isSaving} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-wait">
          <Save size={20} />
          <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
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
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === tab.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[600px]">
            {message && <FormMessage type={message.type} text={message.text} />}

            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Informações do Perfil</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Nome do Negócio</label><input type="text" value={settings.studioName} onChange={(e) => setSettings(prev => ({ ...prev, studioName: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg"/></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Nome do Proprietário</label><input type="text" value={settings.ownerName} onChange={(e) => setSettings(prev => ({ ...prev, ownerName: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg"/></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Email</label><input type="email" value={settings.email} disabled className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"/></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label><input type="tel" value={settings.phone} onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg"/></div>
                  <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label><input type="text" value={settings.address} onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg"/></div>
                  <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-2">URL Personalizada</label><div className="flex items-center"><input type="text" value={settings.customUrl} onChange={(e) => setSettings(prev => ({ ...prev, customUrl: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))} className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-l-lg"/><span className="px-4 py-2 bg-gray-100 border-t border-b border-r border-gray-300 rounded-r-lg text-gray-600">.agendpro.shop</span></div></div>
                </div>
              </div>
            )}

            {activeTab === 'availability' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Disponibilidade e Horários</h2>
                <div className="space-y-6">
                  {weekDays.map((day) => {
                    const dayId = day.id as keyof typeof settings.workingHours;
                    const daySchedule = settings.workingHours[dayId];
                    return (
                      <div key={day.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <input type="checkbox" checked={daySchedule.enabled} onChange={(e) => setSettings(prev => ({...prev, workingHours: {...prev.workingHours, [day.id]: { ...daySchedule, enabled: e.target.checked }}}))} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                            <h3 className="font-medium text-gray-900">{day.label}</h3>
                          </div>
                          <button onClick={() => copyScheduleToOtherDays(day.id)} className="text-sm text-blue-600 hover:text-blue-700 font-medium">Copiar para outros dias</button>
                        </div>
                        {daySchedule.enabled && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div><label className="block text-sm font-medium text-gray-700 mb-1">Abertura</label><input type="time" value={daySchedule.start} onChange={(e) => setSettings(prev => ({...prev, workingHours: {...prev.workingHours, [day.id]: { ...daySchedule, start: e.target.value }}}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg"/></div>
                              <div><label className="block text-sm font-medium text-gray-700 mb-1">Fechamento</label><input type="time" value={daySchedule.end} onChange={(e) => setSettings(prev => ({...prev, workingHours: {...prev.workingHours, [day.id]: { ...daySchedule, end: e.target.value }}}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg"/></div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-2"><label className="text-sm font-medium text-gray-700">Pausas/Intervalos</label><button onClick={() => addBreak(day.id)} className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"><Plus size={14} /><span>Adicionar pausa</span></button></div>
                              
                              {/* --- LINHA CORRIGIDA COM A "REDE DE SEGURANÇA" --- */}
                              {(daySchedule.breaks || []).map((breakTime, index) => (
                                <div key={index} className="flex items-center space-x-2 mb-2">
                                  <input type="time" value={breakTime.start} onChange={(e) => { const newBreaks = [...(daySchedule.breaks || [])]; newBreaks[index] = { ...breakTime, start: e.target.value }; setSettings(prev => ({...prev, workingHours: {...prev.workingHours, [day.id]: { ...daySchedule, breaks: newBreaks }}}));}} className="px-3 py-1 border border-gray-300 rounded text-sm"/>
                                  <span className="text-gray-500">até</span>
                                  <input type="time" value={breakTime.end} onChange={(e) => { const newBreaks = [...(daySchedule.breaks || [])]; newBreaks[index] = { ...breakTime, end: e.target.value }; setSettings(prev => ({...prev, workingHours: {...prev.workingHours, [day.id]: { ...daySchedule, breaks: newBreaks }}})); }} className="px-3 py-1 border border-gray-300 rounded text-sm"/>
                                  <button onClick={() => removeBreak(day.id, index)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Configurações de Pagamento</h2>
                <div className="mb-6"><label className="block text-sm font-medium text-gray-700 mb-2">Chave de API do Mercado Pago (Access Token)</label><div className="relative"><input type={isKeyVisible ? 'text' : 'password'} value={settings.paymentKey} onChange={(e) => setSettings(prev => ({ ...prev, paymentKey: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-10" placeholder="Cole seu Access Token de Produção aqui"/><button type="button" onClick={() => setIsKeyVisible(!isKeyVisible)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700">{isKeyVisible ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
                <div className="p-4 bg-yellow-50 rounded-lg"><h3 className="font-medium text-yellow-900 mb-2">Como configurar:</h3><ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside"><li>Acesse sua conta do Mercado Pago.</li><li>Vá em "Seu negócio" → "Configurações" → "Gestão e Administração" → "Credenciais".</li><li>Na seção "Credenciais de produção", clique em "Ativar credenciais".</li><li>Copie sua chave de acesso chamada **"Access Token"**.</li><li>Cole a chave no campo acima.</li></ol></div>
              </div>
            )}
            
            {activeTab === 'public' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Página Pública de Agendamentos</h2>
                <div className="space-y-6">
                  <div className="p-4 bg-green-50 rounded-lg"><h3 className="font-medium text-green-900 mb-2">Seu Link de Agendamento</h3><p className="text-sm text-green-700 mb-3">Este é o link para compartilhar com seus clientes.</p><div className="flex items-center space-x-3 p-3 bg-white rounded-lg border"><input type="text" value={fullPublicUrl} readOnly className="flex-1 bg-transparent text-sm text-gray-600 focus:outline-none"/><button onClick={() => copyToClipboard(fullPublicUrl)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"><Copy size={16} /></button><a href={fullPublicUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"><ExternalLink size={16} /></a></div></div>
                  <div className="p-4 bg-blue-50 rounded-lg"><h3 className="font-medium text-blue-900 mb-2">Como usar:</h3><ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside"><li>Copie o link acima.</li><li>Compartilhe no seu WhatsApp, Instagram, ou onde preferir.</li><li>Seus clientes poderão agendar diretamente por ele.</li></ol></div>
                </div>
              </div>
            )}

            {activeTab === 'blockedTimes' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Bloqueios de Horário</h2>
                <div className="space-y-6">
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-900 mb-3">Adicionar Novo Bloqueio</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
                        <input 
                          type="date" 
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          onChange={(e) => {
                            const selectedDate = e.target.value;
                            const tempBlock = document.getElementById('temp-block-date') as HTMLInputElement;
                            if (tempBlock) tempBlock.value = selectedDate;
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Motivo (opcional)</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          placeholder="Ex: Feriado, Folga, etc."
                          id="temp-block-reason"
                        />
                      </div>
                      <div className="flex items-end">
                        <button 
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          onClick={() => {
                            const dateInput = document.getElementById('temp-block-date') as HTMLInputElement;
                            const reasonInput = document.getElementById('temp-block-reason') as HTMLInputElement;
                            
                            if (dateInput && dateInput.value) {
                              const newBlock = {
                                date: dateInput.value,
                                profissional_id: usuario?.id || '',
                                motivo: reasonInput?.value || undefined
                              };
                              
                              setSettings(prev => ({
                                ...prev,
                                blockedDates: [...prev.blockedDates, newBlock]
                              }));
                              
                              // Limpar campos
                              if (reasonInput) reasonInput.value = '';
                            }
                          }}
                        >
                          Adicionar Bloqueio
                        </button>
                        <input type="hidden" id="temp-block-date" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Bloqueios Atuais</h3>
                    {settings.blockedDates.length === 0 ? (
                      <p className="text-gray-500 italic">Nenhum bloqueio de horário configurado.</p>
                    ) : (
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motivo</th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {settings.blockedDates.map((block, index) => (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(block.date).toLocaleDateString('pt-BR')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{block.motivo || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button 
                                    onClick={() => {
                                      setSettings(prev => ({
                                        ...prev,
                                        blockedDates: prev.blockedDates.filter((_, i) => i !== index)
                                      }));
                                    }}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    Remover
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'legal' && (
              <div>
                 <h2 className="text-xl font-semibold text-gray-900 mb-6">Termos de Uso e Política de Privacidade</h2>
                 <div className="p-4 bg-gray-50 rounded-lg">
                   <h3 className="font-medium text-gray-900 mb-3">Termos de Uso</h3>
                   <div className="text-sm text-gray-600 space-y-2"><p>Ao utilizar nossa plataforma, você concorda com os seguintes termos:</p><ul className="list-disc list-inside"><li>O uso da plataforma é destinado exclusivamente para fins comerciais legítimos.</li><li>É responsabilidade do usuário manter suas informações atualizadas.</li><li>Não é permitido o uso da plataforma para atividades ilegais ou prejudiciais.</li><li>Reservamo-nos o direito de suspender contas que violem estes termos.</li></ul></div>
                   <h3 className="font-medium text-gray-900 mt-4 mb-3">Política de Privacidade</h3>
                   <div className="text-sm text-gray-600 space-y-2"><p>Respeitamos sua privacidade e protegemos seus dados:</p><ul className="list-disc list-inside"><li>Coletamos apenas informações necessárias para o funcionamento do serviço.</li><li>Seus dados não são compartilhados com terceiros sem consentimento.</li><li>Utilizamos criptografia para proteger informações sensíveis.</li><li>Você pode solicitar a exclusão de seus dados a qualquer momento.</li></ul></div>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}