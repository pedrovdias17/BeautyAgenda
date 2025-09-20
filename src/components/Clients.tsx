import React, { useState } from 'react';
import { Search, User, Phone, Mail, Calendar, Filter } from 'lucide-react';
import { useData } from '../contexts/DataContext';

export default function Clients() {
  const { clients } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('nome');

  const filteredClients = clients.filter(client =>
    (client.nome?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (client.telefone || '').includes(searchTerm) ||
    (client.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const sortedClients = [...filteredClients].sort((a, b) => {
    switch (sortBy) {
      case 'nome':
        return (a.nome || '').localeCompare(b.nome || '');
      case 'total_agendamentos':
        return (b.total_agendamentos || 0) - (a.total_agendamentos || 0);
      case 'ultima_visita':
        // Adiciona uma verificação para garantir que as datas são válidas
        if (!a.ultima_visita) return 1;
        if (!b.ultima_visita) return -1;
        return new Date(b.ultima_visita).getTime() - new Date(a.ultima_visita).getTime();
      default:
        return 0;
    }
  });
  
  // Função para formatar a data, tratando casos nulos
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      // Adiciona 'T00:00:00' para evitar problemas de fuso horário que podem mudar o dia
      return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
    } catch (e) {
      return 'Data inválida';
    }
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
              <option value="nome">Ordem Alfabética</option>
              <option value="total_agendamentos">Mais Agendamentos</option>
              <option value="ultima_visita">Última Visita</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedClients.map((client) => (
          <div key={client.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{client.nome}</h3>
                    <p className="text-sm text-gray-500">{client.total_agendamentos} agendamentos</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone size={14} />
                  <span>{client.telefone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail size={14} />
                  <span className="truncate">{client.email || 'Não informado'}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar size={14} />
                  <span>Última visita: {formatDate(client.ultima_visita)}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end items-center mt-4 pt-4 border-t border-gray-100">
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Ver detalhes
              </button>
            </div>
          </div>
        ))}
      </div>

      {sortedClients.length === 0 && (
        <div className="text-center py-12">
          <User size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
          </p>
        </div>
      )}
    </div>
  );
}
