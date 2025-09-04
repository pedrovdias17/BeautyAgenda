import React, { useState } from 'react';
import { Search, User, Phone, Mail, Calendar, Filter } from 'lucide-react';
import { useData } from '../contexts/DataContext';

export default function Clients() {
  const { clients, appointments, services, professionals } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedClients = [...filteredClients].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'appointments':
        return b.appointments - a.appointments;
      case 'lastVisit':
        return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
      default:
        return 0;
    }
  });

  const getClientAppointments = (clientId: string) => {
    return appointments.filter(apt => 
      clients.find(c => c.id === clientId && c.phone === apt.clientPhone)
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Clientes</h1>
          <p className="text-gray-600">Gerencie seus clientes cadastrados</p>
        </div>
        <div className="text-sm text-gray-500">
          {clients.length} cliente(s) total
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center space-x-2 flex-1">
            <Search size={20} className="text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, telefone ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name">Ordem Alfabética</option>
              <option value="appointments">Mais Agendamentos</option>
              <option value="lastVisit">Última Visita</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedClients.map((client) => {
          const clientAppointments = getClientAppointments(client.id);
          const lastAppointment = clientAppointments
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
          const lastService = lastAppointment 
            ? services.find(s => s.id === lastAppointment.serviceId)
            : null;
          
          return (
            <div key={client.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{client.name}</h3>
                    <p className="text-sm text-gray-500">{client.appointments} agendamentos</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  Ativo
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone size={14} />
                  <span>{client.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail size={14} />
                  <span className="truncate">{client.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar size={14} />
                  <span>
                    Última visita: {new Date(client.lastVisit).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>

              {lastService && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-1">Último serviço:</p>
                  <p className="text-sm text-gray-600">{lastService.name}</p>
                </div>
              )}

              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  Cliente desde {new Date(client.lastVisit).toLocaleDateString('pt-BR')}
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Ver detalhes
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {sortedClients.length === 0 && (
        <div className="text-center py-12">
          <User size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {searchTerm 
              ? 'Nenhum cliente encontrado com os termos da busca'
              : 'Nenhum cliente cadastrado ainda'
            }
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Limpar busca
            </button>
          )}
        </div>
      )}

      {/* Stats Summary */}
      {clients.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Clientes</p>
                <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
              </div>
              <User size={32} className="text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Agendamentos Totais</p>
                <p className="text-2xl font-bold text-gray-900">
                  {clients.reduce((sum, client) => sum + client.appointments, 0)}
                </p>
              </div>
              <Calendar size={32} className="text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Média por Cliente</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(clients.reduce((sum, client) => sum + client.appointments, 0) / clients.length).toFixed(1)}
                </p>
              </div>
              <Filter size={32} className="text-purple-600" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}