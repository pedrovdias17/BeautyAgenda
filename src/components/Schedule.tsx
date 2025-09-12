import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, Filter, Search, Eye, X, User, Phone, Mail } from 'lucide-react';
import { useData } from '../contexts/DataContext';

export default function Schedule() {
  const { appointments, services, professionals, addAppointment } = useData();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    serviceId: '',
    professionalId: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    status: 'confirmed' as 'confirmed' | 'pending' | 'cancelled' | 'completed',
    paymentStatus: 'pending' as 'pending' | 'partial' | 'paid',
    signalAmount: 0,
    observations: ''
  });

  const filteredAppointments = appointments.filter(appointment => {
    const matchesDate = appointment.date === selectedDate;
    const matchesSearch = appointment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.clientPhone.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;
    
    return matchesDate && matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      confirmed: 'Confirmado',
      pending: 'Pendente',
      cancelled: 'Cancelado',
      completed: 'Concluído'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600';
      case 'partial': return 'text-orange-600';
      case 'pending': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPaymentStatusText = (status: string) => {
    const statusMap = {
      paid: 'Pago',
      partial: 'Sinal Pago',
      pending: 'Pendente'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const timeSlots = Array.from({ length: 11 }, (_, i) => {
    const hour = i + 8;
    return `${hour.toString().padStart(2, '0')}:00`;
  const resetForm = () => {
    setFormData({
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      serviceId: '',
      professionalId: '',
      date: new Date().toISOString().split('T')[0],
      time: '',
      status: 'confirmed',
      paymentStatus: 'pending',
      signalAmount: 0,
      observations: ''
    });
    setIsModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedService = services.find(s => s.id === formData.serviceId);
    const signalAmount = formData.paymentStatus === 'partial' || formData.paymentStatus === 'paid' 
      ? formData.signalAmount || (selectedService?.signalAmount || 0)
      : 0;

    addAppointment({
      clientName: formData.clientName,
      clientPhone: formData.clientPhone,
      clientEmail: formData.clientEmail,
      serviceId: formData.serviceId,
      professionalId: formData.professionalId,
      date: formData.date,
      time: formData.time,
      status: formData.status,
      paymentStatus: formData.paymentStatus,
      signalAmount
    });

    resetForm();
    alert('Agendamento criado com sucesso!');
  };

  const handleServiceChange = (serviceId: string) => {
    setFormData(prev => ({ ...prev, serviceId }));
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setFormData(prev => ({ 
        ...prev, 
        professionalId: service.professionalId,
        signalAmount: service.signalAmount
      }));
    }
  };

  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Agenda</h1>
          <p className="text-gray-600">Gerencie seus agendamentos</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Novo Agendamento</span>
        </button>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center space-x-2">
            <CalendarIcon size={20} className="text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-2 flex-1">
            <Search size={20} className="text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por cliente ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos</option>
              <option value="confirmed">Confirmados</option>
              <option value="pending">Pendentes</option>
              <option value="completed">Concluídos</option>
              <option value="cancelled">Cancelados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Schedule View */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            Agendamentos para {new Date(selectedDate).toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {filteredAppointments.length} agendamento(s)
          </p>
        </div>

        <div className="p-6">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Nenhum agendamento encontrado com os filtros aplicados'
                  : 'Nenhum agendamento para esta data'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((appointment) => {
                  const service = services.find(s => s.id === appointment.serviceId);
                  const professional = professionals.find(p => p.id === appointment.professionalId);
                  
                  return (
                    <div 
                      key={appointment.id} 
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="flex items-center space-x-1 text-lg font-semibold text-gray-900">
                              <Clock size={16} />
                              <span>{appointment.time}</span>
                            </div>
                            <p className="text-xs text-gray-500">
                              {service?.duration ? `${service.duration}min` : ''}
                            </p>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-gray-900">{appointment.clientName}</h3>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(appointment.status)}`}>
                                {getStatusText(appointment.status)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              {service?.name} • {professional?.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {appointment.clientPhone} • {appointment.clientEmail}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="text-lg font-semibold text-gray-900">
                              R$ {service?.price.toLocaleString() || 0}
                            </div>
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                              <Eye size={16} />
                            </button>
                          </div>
                          <p className={`text-sm font-medium ${getPaymentStatusColor(appointment.paymentStatus)}`}>
                            {getPaymentStatusText(appointment.paymentStatus)}
                            {appointment.signalAmount && (
                              <span className="text-gray-500">
                                {' '}(R$ {appointment.signalAmount})
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Novo Agendamento */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">Novo Agendamento</h2>
              <button
                onClick={resetForm}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Dados do Cliente */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Dados do Cliente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Cliente *
                    </label>
                    <div className="relative">
                      <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={formData.clientName}
                        onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nome completo do cliente"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone *
                    </label>
                    <div className="relative">
                      <Phone size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={formData.clientEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="cliente@email.com"
                      />
                    </div>
                  </div>
                </div>
              </div>
                      <input
              {/* Serviço e Profissional */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Serviço</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Serviço *
                    </label>
                    <select
                      required
                      value={formData.serviceId}
                      onChange={(e) => handleServiceChange(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecione um serviço</option>
                      {services.map((service) => {
                        const professional = professionals.find(p => p.id === service.professionalId);
                        return (
                          <option key={service.id} value={service.id}>
                            {service.name} - {professional?.name} (R$ {service.price})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                        type="tel"
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profissional *
                    </label>
                    <select
                      required
                      value={formData.professionalId}
                      onChange={(e) => setFormData(prev => ({ ...prev, professionalId: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecione um profissional</option>
                      {professionals.map((professional) => (
                        <option key={professional.id} value={professional.id}>
                          {professional.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
                        required
              {/* Data e Hora */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Data e Horário</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                        value={formData.clientPhone}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Horário *
                    </label>
                    <select
                      required
                      value={formData.time}
                      onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecione um horário</option>
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
                        onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
              {/* Status */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Status do Agendamento</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status do Agendamento
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="confirmed">Confirmado</option>
                      <option value="pending">Pendente</option>
                      <option value="completed">Concluído</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </div>
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status do Pagamento
                    </label>
                    <select
                      value={formData.paymentStatus}
                      onChange={(e) => setFormData(prev => ({ ...prev, paymentStatus: e.target.value as any }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="pending">Pendente</option>
                      <option value="partial">Sinal Pago</option>
                      <option value="paid">Pago Completo</option>
                    </select>
                  </div>
                </div>
              </div>
                        placeholder="(11) 99999-9999"
              {/* Valor do Sinal */}
              {(formData.paymentStatus === 'partial' || formData.paymentStatus === 'paid') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor do Sinal (R$)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.signalAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, signalAmount: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              )}
                      />
              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  value={formData.observations}
                  onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Observações adicionais sobre o agendamento..."
                />
              </div>
                    </div>
              {/* Resumo do Serviço Selecionado */}
              {formData.serviceId && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Resumo do Serviço</h4>
                  {(() => {
                    const service = services.find(s => s.id === formData.serviceId);
                    const professional = professionals.find(p => p.id === formData.professionalId);
                    return (
                      <div className="text-sm text-blue-800 space-y-1">
                        <p><strong>Serviço:</strong> {service?.name}</p>
                        <p><strong>Profissional:</strong> {professional?.name}</p>
                        <p><strong>Duração:</strong> {service?.duration} minutos</p>
                        <p><strong>Valor Total:</strong> R$ {service?.price.toLocaleString()}</p>
                        {service?.requiresSignal && (
                          <p><strong>Sinal Sugerido:</strong> R$ {service.signalAmount}</p>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
                  </div>
              {/* Botões */}
              <div className="flex space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Criar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}