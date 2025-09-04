import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, Filter, Search, Eye } from 'lucide-react';
import { useData } from '../contexts/DataContext';

export default function Schedule() {
  const { appointments, services, professionals } = useData();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

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
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Agenda</h1>
          <p className="text-gray-600">Gerencie seus agendamentos</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2">
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
    </div>
  );
}