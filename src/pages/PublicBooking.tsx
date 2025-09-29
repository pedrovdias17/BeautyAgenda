import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Professional, Service } from '../contexts/DataContext';
import { sendWebhook } from '../services/webhookService';
import { 
  Scissors, MapPin, Star, Clock, User, DollarSign, Check, Phone, Mail 
} from 'lucide-react';

interface StudioInfo {
  name: string;
  address: string;
  phone: string;
}

export default function PublicBooking() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [studioInfo, setStudioInfo] = useState<StudioInfo | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState('');
  const [selectedProfessional, setSelectedProfessional] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [clientData, setClientData] = useState({ name: '', phone: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!slug) {
      setIsLoading(false);
      return;
    }

    const fetchStudioData = async () => {
      setIsLoading(true);
      
      const { data: owner, error: ownerError } = await supabase
        .from('usuarios')
        .select('id, nome_studio, endereco, telefone')
        .eq('slug', slug)
        .single();

      if (ownerError || !owner) {
        console.error("Negócio não encontrado:", ownerError);
        setServices([]);
        setIsLoading(false);
        return;
      }

      setStudioInfo({
        name: owner.nome_studio,
        address: owner.endereco || 'Endereço não informado',
        phone: owner.telefone || 'Telefone não informado'
      });
      setOwnerId(owner.id);

      const { data: servicesData, error: servicesError } = await supabase
        .from('servicos')
        .select('*')
        .eq('usuario_id', owner.id)
        .eq('active', true);
        
      const { data: professionalsData, error: professionalsError } = await supabase
        .from('profissionais')
        .select('*')
        .eq('usuario_id', owner.id);

      if (servicesError || professionalsError) {
        console.error("Erro ao buscar serviços ou profissionais:", servicesError || professionalsError);
      } else {
        setServices(servicesData || []);
        setProfessionals(professionalsData || []);
      }

      setIsLoading(false);
    };

    fetchStudioData();
  }, [slug]);

  const selectedServiceData = services.find(s => s.id === selectedService);
  const selectedProfessionalData = professionals.find(p => p.id === selectedProfessional);
  const signalAmount = selectedServiceData?.requiresSignal ? selectedServiceData.signalAmount : 0;
  const requiresPayment = selectedServiceData?.requiresSignal || false;

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 17; hour++) { for (let minute = 0; minute < 60; minute += 60) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
    } }
    return slots;
  };
  const timeSlots = generateTimeSlots();

  const availableProfessionals = (() => {
    if (!selectedService) return professionals;
    const service = services.find(s => s.id === selectedService);
    if (!service) return [];
    return professionals.filter(p => p.id === service.professionalId);
  })();

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    const service = services.find(s => s.id === serviceId);
    if (service) { setSelectedProfessional(service.professionalId); }
  };

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  // Regex que remove tudo que não for letra (maiúscula ou minúscula) ou espaço
  const onlyText = value.replace(/[^a-zA-Z\s]/g, '');
  setClientData(prev => ({ ...prev, name: onlyText }));
};

const formatPhone = (value: string) => {
  if (!value) return "";
  // Remove tudo que não for dígito
  const digits = value.replace(/\D/g, '');
  // Aplica a máscara (XX) XXXXX-XXXX
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const formattedPhone = formatPhone(e.target.value);
  setClientData(prev => ({ ...prev, phone: formattedPhone }));
};

  const handleSubmit = async () => {
    if (!clientData.name || !clientData.phone) {
      alert('Por favor, preencha seu nome e telefone.');
      return;
    }
    if (clientData.email && !/\S+@\S+\.\S+/.test(clientData.email)) {
      alert('Por favor, digite um email válido.');
      return;
    }
    if (clientData.phone.replace(/\D/g, '').length < 10) {
      alert('Por favor, digite um telefone válido com DDD.');
      return;
    }
    if (!selectedService || !selectedProfessional || !selectedDate || !selectedTime || !ownerId) {
      alert('Por favor, preencha todos os dados do agendamento.');
      return;
    }
    setIsSubmitting(true);
    
    try {
      const { data: clientResult, error: clientError } = await supabase.rpc('find_or_create_client', {
        p_owner_id: ownerId,
        p_name: clientData.name,
        p_phone: clientData.phone,
        p_email: clientData.email,
        p_last_visit: selectedDate
      });
      if(clientError) throw clientError;

      const clientId = clientResult;
      
      const appointmentData = {
        usuario_id: ownerId,
        cliente_id: clientId,
        servico_id: selectedService,
        profissional_id: selectedProfessional,
        data_agendamento: selectedDate,
        hora_agendamento: selectedTime,
        status: 'pending',
        status_pagamento: requiresPayment ? 'pending' : 'paid',
        valor_sinal: signalAmount,
        valor_total: selectedServiceData?.price || 0
      };
      const { error: appointmentError } = await supabase.from('agendamentos').insert(appointmentData);
      if(appointmentError) throw appointmentError;
      
      // Enviar webhook com os dados do agendamento
      const webhookPayload = {
        appointment: {
          date: selectedDate,
          time: selectedTime,
          status: 'pending',
          paymentStatus: requiresPayment ? 'pending' : 'paid',
          signalAmount: signalAmount,
          totalAmount: selectedServiceData?.price || 0
        },
        client: {
          id: clientId,
          name: clientData.name,
          phone: clientData.phone,
          email: clientData.email
        },
        service: {
          id: selectedService,
          name: selectedServiceData?.name || '',
          description: selectedServiceData?.description,
          duration: selectedServiceData?.duration || 0,
          price: selectedServiceData?.price || 0,
          requiresSignal: selectedServiceData?.requiresSignal || false
        },
        professional: {
          id: selectedProfessional,
          name: selectedProfessionalData?.name || ''
        },
        studio: {
          name: studioInfo?.name || '',
          address: studioInfo?.address || '',
          phone: studioInfo?.phone || ''
        },
        timestamp: new Date().toISOString()
      };

      // Enviar webhook (não bloquear o fluxo se falhar)
      sendWebhook(webhookPayload).catch(error => {
        console.error('Falha ao enviar webhook:', error);
      });
      
      setStep(5);
    } catch (error: any) {
      console.error('Falha ao criar agendamento:', error);
      alert(`Erro ao criar agendamento: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando informações do negócio...</div>;
  }
  
  if (!isLoading && (!services || services.length === 0)) {
    return <div className="min-h-screen flex items-center justify-center p-4 text-center">Este negócio não foi encontrado ou não tem serviços disponíveis para agendamento online.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center"><Scissors size={24} /></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{studioInfo?.name}</h1>
              <p className="text-sm text-gray-600">{studioInfo?.address}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span className={step >= 1 ? 'text-blue-600 font-medium' : ''}>Serviço</span>
            <span className={step >= 2 ? 'text-blue-600 font-medium' : ''}>Profissional</span>
            <span className={step >= 3 ? 'text-blue-600 font-medium' : ''}>Data & Hora</span>
            <span className={step >= 4 ? 'text-blue-600 font-medium' : ''}>Seus Dados</span>
            <span className={step >= 5 ? 'text-blue-600 font-medium' : ''}>Pagamento</span>
          </div>
          <div className="mt-2 h-2 bg-gray-200 rounded-full">
            <div className="h-full bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${((step - 1) / 4) * 100}%` }} />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Escolha seu serviço</h2>
              <div className="space-y-4">
                {services.map((service) => {
                  const professional = professionals.find(p => p.id === service.professionalId);
                  return (
                    <button key={service.id} onClick={() => handleServiceSelect(service.id)} className={`w-full p-4 border rounded-lg text-left transition-colors ${selectedService === service.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{service.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <div className="flex items-center space-x-1"><Clock size={14} /><span>{service.duration} min</span></div>
                            <div className="flex items-center space-x-1"><User size={14} /><span>{professional?.name}</span></div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">R$ {service.price.toLocaleString()}</div>
                          {service.requiresSignal && (<div className="text-sm text-gray-500">Sinal: R$ {service.signalAmount}</div>)}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={handleNext} disabled={!selectedService} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">Continuar</button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Escolha o profissional</h2>
              <div className="space-y-4">
                {availableProfessionals.map((professional) => (
                  <button key={professional.id} onClick={() => setSelectedProfessional(professional.id)} className={`w-full p-4 border rounded-lg text-left transition-colors ${selectedProfessional === professional.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center"><User size={20} className="text-gray-600" /></div>
                      <div className="flex-1"><h3 className="font-medium text-gray-900">{professional.name}</h3></div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-6 flex justify-between">
                <button onClick={handleBack} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">Voltar</button>
                <button onClick={handleNext} disabled={!selectedProfessional} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">Continuar</button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Escolha data e horário</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Data</label><input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-2 border border-gray-300 rounded-lg"/></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Horário</label><select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg"><option value="">Selecione um horário</option>{timeSlots.map((time) => (<option key={time} value={time}>{time}</option>))}</select></div>
              </div>
              {selectedDate && selectedTime && ( <div className="mt-6 p-4 bg-blue-50 rounded-lg"> <h3 className="font-medium text-blue-900 mb-2">Resumo do Agendamento</h3> <div className="text-sm text-blue-800 space-y-1"> <p><strong>Serviço:</strong> {selectedServiceData?.name}</p><p><strong>Profissional:</strong> {selectedProfessionalData?.name}</p><p><strong>Data:</strong> {new Date(selectedDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p><p><strong>Horário:</strong> {selectedTime}</p></div></div>)}
              <div className="mt-6 flex justify-between">
                <button onClick={handleBack} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">Voltar</button>
                <button onClick={handleNext} disabled={!selectedDate || !selectedTime} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">Continuar</button>
              </div>
            </div>
          )}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Seus dados</h2>
              <div className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Nome completo</label><input type="text" required value={clientData.name} onChange={handleNameChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder='"Digite seu nome aqui'/></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label><input type="tel" required value={clientData.phone} onChange={handlePhoneChange} maxLength={15} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="(11) 99999-9999"/></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Email (opcional)</label><input type="email" value={clientData.email} onChange={(e) => setClientData(prev => ({ ...prev, email: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg"/></div>
              </div>
              <div className="mt-6 flex justify-between">
                <button onClick={handleBack} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">Voltar</button>
                <button onClick={handleSubmit} disabled={isSubmitting} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">{isSubmitting ? 'Criando...' : 'Confirmar Agendamento'}</button>
              </div>
            </div>
          )}
          {step >= 5 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><Check size={32} /></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Agendamento Confirmado!</h2>
              <p className="text-gray-600 mb-6">Seu agendamento foi criado com sucesso.</p>
              <div className="p-4 bg-green-50 rounded-lg mb-6">
                 <h3 className="font-medium text-green-900 mb-2">Seu Agendamento</h3>
                 <div className="text-sm text-green-800 space-y-1">
                   <p><strong>Data:</strong> {new Date(selectedDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                   <p><strong>Horário:</strong> {selectedTime}</p>
                   <p><strong>Serviço:</strong> {selectedServiceData?.name}</p>
                   <p><strong>Profissional:</strong> {selectedProfessionalData?.name}</p>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}