import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  DollarSign, 
  Check, 
  Scissors,
  MapPin,
  Star
} from 'lucide-react';
import { useData } from '../contexts/DataContext';

export default function PublicBooking() {
  const { studioId } = useParams();
  const { services, professionals, addAppointment } = useData();
  
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState('');
  const [selectedProfessional, setSelectedProfessional] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [clientData, setClientData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dados do estúdio (normalmente viriam da API)
  const studioInfo = {
    name: 'AgendPro Demo',
    address: 'Rua das Flores, 123 - São Paulo, SP',
    phone: '(11) 99999-9999',
    rating: 4.8,
    reviews: 127
  };

  const selectedServiceData = services.find(s => s.id === selectedService);
  const selectedProfessionalData = professionals.find(p => p.id === selectedProfessional);
  const signalAmount = selectedServiceData?.requiresSignal ? selectedServiceData.signalAmount : 0;
  const requiresPayment = selectedServiceData?.requiresSignal || false;

  // Gerar horários disponíveis (simulado)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 60) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // --- LÓGICA DE FILTRO CORRIGIDA ---
  const availableProfessionals = (() => {
    // Se nenhum serviço estiver selecionado, mostra todos os profissionais.
    if (!selectedService) {
      return professionals;
    }
    // Encontra o serviço específico que foi selecionado.
    const service = services.find(s => s.id === selectedService);
    // Se o serviço não for encontrado, retorna uma lista vazia por segurança.
    if (!service) {
      return [];
    }
    // Filtra a lista de profissionais para retornar APENAS aquele que está ligado ao serviço.
    return professionals.filter(p => p.id === service.professionalId);
  })();

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    const service = services.find(s => s.id === serviceId);
    // Pré-seleciona o profissional correto ao escolher o serviço
    if (service) {
      setSelectedProfessional(service.professionalId);
    }
  };

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async () => {
    if (!selectedService || !selectedProfessional || !selectedDate || !selectedTime) {
      alert('Por favor, preencha todos os dados do agendamento.');
      return;
    }
    setIsSubmitting(true);
    
    try {
      await addAppointment({
        clientName: clientData.name,
        clientPhone: clientData.phone,
        clientEmail: clientData.email,
        servico_id: selectedService,
        profissional_id: selectedProfessional,
        data_agendamento: selectedDate,
        hora_agendamento: selectedTime,
        status: 'pending',
        status_pagamento: 'pending',
        valor_sinal: signalAmount
      });
      
      setStep(5);
    } catch (error) {
      console.error('Falha ao criar agendamento:', error);
      alert('Erro ao criar agendamento. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = () => {
    alert('Redirecionando para o pagamento via Mercado Pago...');
    setStep(6);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center">
              <Scissors size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{studioInfo.name}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <MapPin size={16} />
                  <span>{studioInfo.address}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star size={16} className="text-yellow-500" />
                  <span>{studioInfo.rating} ({studioInfo.reviews} avaliações)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span className={step >= 1 ? 'text-blue-600 font-medium' : ''}>Serviço</span>
            <span className={step >= 2 ? 'text-blue-600 font-medium' : ''}>Profissional</span>
            <span className={step >= 3 ? 'text-blue-600 font-medium' : ''}>Data & Hora</span>
            <span className={step >= 4 ? 'text-blue-600 font-medium' : ''}>Seus Dados</span>
            <span className={step >= 5 ? 'text-blue-600 font-medium' : ''}>Pagamento</span>
          </div>
          <div className="mt-2 h-2 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${((step - 1) / 4) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {/* Step 1: Selecionar Serviço */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Escolha seu serviço</h2>
              <div className="space-y-4">
                {services.map((service) => {
                  const professional = professionals.find(p => p.id === service.professionalId);
                  return (
                    <button
                      key={service.id}
                      onClick={() => handleServiceSelect(service.id)}
                      className={`w-full p-4 border rounded-lg text-left transition-colors ${
                        selectedService === service.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{service.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Clock size={14} />
                              <span>{service.duration} min</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <User size={14} />
                              <span>{professional?.name}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">
                            R$ {service.price.toLocaleString()}
                          </div>
                          {service.requiresSignal && (
                            <div className="text-sm text-gray-500">
                              Sinal: R$ {service.signalAmount}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleNext}
                  disabled={!selectedService}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Selecionar Profissional */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Escolha o profissional</h2>
              <div className="space-y-4">
                {availableProfessionals.map((professional) => (
                  <button
                    key={professional.id}
                    onClick={() => setSelectedProfessional(professional.id)}
                    className={`w-full p-4 border rounded-lg text-left transition-colors ${
                      selectedProfessional === professional.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <User size={20} className="text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{professional.name}</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {professional.specialties.map((specialty, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-6 flex justify-between">
                <button onClick={handleBack} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">Voltar</button>
                <button onClick={handleNext} disabled={!selectedProfessional} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Continuar</button>
              </div>
            </div>
          )}

          {/* Step 3: Selecionar Data e Hora */}
          {step === 3 && (
             <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Escolha data e horário</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
                  <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Horário</label>
                  <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Selecione um horário</option>
                    {timeSlots.map((time) => (<option key={time} value={time}>{time}</option>))}
                  </select>
                </div>
              </div>
              {selectedDate && selectedTime && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Resumo do Agendamento</h3>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p><strong>Serviço:</strong> {selectedServiceData?.name}</p>
                    <p><strong>Profissional:</strong> {selectedProfessionalData?.name}</p>
                    <p><strong>Data:</strong> {new Date(selectedDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                    <p><strong>Horário:</strong> {selectedTime}</p>
                    <p><strong>Duração:</strong> {selectedServiceData?.duration} minutos</p>
                    <p><strong>Valor:</strong> R$ {selectedServiceData?.price.toLocaleString()}</p>
                    {requiresPayment && (<p><strong>Sinal:</strong> R$ {signalAmount}</p>)}
                  </div>
                </div>
              )}
              <div className="mt-6 flex justify-between">
                <button onClick={handleBack} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">Voltar</button>
                <button onClick={handleNext} disabled={!selectedDate || !selectedTime} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Continuar</button>
              </div>
            </div>
          )}

          {/* Step 4: Dados do Cliente */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Seus dados</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome completo</label>
                  <input type="text" required value={clientData.name} onChange={(e) => setClientData(prev => ({ ...prev, name: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Digite seu nome completo"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
                  <input type="tel" required value={clientData.phone} onChange={(e) => setClientData(prev => ({ ...prev, phone: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="(11) 99999-9999"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input type="email" required value={clientData.email} onChange={(e) => setClientData(prev => ({ ...prev, email: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="seu@email.com"/>
                </div>
              </div>
              <div className="mt-6 flex justify-between">
                <button onClick={handleBack} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">Voltar</button>
                <button onClick={handleSubmit} disabled={!clientData.name || !clientData.phone || !clientData.email || isSubmitting} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  {isSubmitting ? 'Criando...' : 'Confirmar Agendamento'}
                </button>
              </div>
            </div>
          )}

          {/* Step 5 e 6: Confirmação e Pagamento */}
          {(step === 5 || step === 6) && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={32} />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {step === 5 && !requiresPayment ? 'Agendamento Confirmado!' : 'Tudo certo!'}
                {step === 5 && requiresPayment && 'Agendamento Criado!'}
              </h2>
              <p className="text-gray-600 mb-6">
                {step === 5 && requiresPayment && `Para confirmar seu agendamento, é necessário pagar o sinal de R$ ${signalAmount}.`}
                {step === 5 && !requiresPayment && 'Seu agendamento foi criado com sucesso.'}
                {step === 6 && 'Seu agendamento foi confirmado e o sinal foi pago com sucesso.'}
              </p>
              
              <div className="p-4 bg-green-50 rounded-lg mb-6">
                 <h3 className="font-medium text-green-900 mb-2">Seu Agendamento</h3>
                 <div className="text-sm text-green-800 space-y-1">
                   <p><strong>Data:</strong> {new Date(selectedDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                   <p><strong>Horário:</strong> {selectedTime}</p>
                   <p><strong>Serviço:</strong> {selectedServiceData?.name}</p>
                   <p><strong>Profissional:</strong> {selectedProfessionalData?.name}</p>
                 </div>
              </div>

              {step === 5 && requiresPayment && (
                <button onClick={handlePayment} className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                  <DollarSign size={20} />
                  <span>Pagar Sinal - R$ {signalAmount}</span>
                </button>
              )}

              {(step === 6 || (step === 5 && !requiresPayment)) && (
                <button onClick={() => window.close()} className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors">Fechar</button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}