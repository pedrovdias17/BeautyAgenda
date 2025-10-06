import React, { useState } from 'react';
import { Search, User, Phone, Mail, Calendar, Filter, Grid, List } from 'lucide-react';
import { useData } from '../contexts/DataContext';

export default function Clients() {
  const { clients } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('nome');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
        if (!a.ultima_visita) return 1;
        if (!b.ultima_visita) return -1;
        return new Date(b.ultima_visita).getTime() - new Date(a.ultima_visita).getTime();
      default:
        return 0;
    }
  });
  
  // FUNÇÃO ATUALIZADA E MAIS ROBUSTA
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Nenhuma visita';

    const date = new Date(dateString + 'T00:00:00');

    if (isNaN(date.getTime())) {
      const fallbackDate = new Date(dateString);
      if (isNaN(fallbackDate.getTime())) {
        return 'Formato de data inválido';
      }
      return fallbackDate.toLocaleDateString('pt-BR');
    }

    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
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
        <div className="flex flex-col md:flex-row gap-4 justify-between">
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
          <div className="flex items-center space-x-4">
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
            <div className="flex items-center space-x-1 border border-gray-300 rounded-lg p-1">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                <Grid size={18} />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                <List size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
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
                  <div className="flex items-center space-x-2 text-sm text-gray-600"><Phone size={14} /><span>{client.telefone}</span></div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600"><Mail size={14} /><span className="truncate">{client.email || 'Não informado'}</span></div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600"><Calendar size={14} /><span>Última visita: {formatDate(client.ultima_visita)}</span></div>
                </div>
              </div>
              <div className="flex justify-end items-center mt-4 pt-4 border-t border-gray-100">
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Ver detalhes</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contato</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Agend.</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Visita</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedClients.map((client) => (
                <tr key={client.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-4"><User size={18} /></div>
                      <div className="text-sm font-medium text-gray-900">{client.nome}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{client.telefone}</div>
                    <div className="text-sm text-gray-500 truncate">{client.email || 'Não informado'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{client.total_agendamentos}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(client.ultima_visita)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-700">Ver detalhes</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sortedClients.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100 mt-6">
          <User size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">{searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}</p>
        </div>
      )}
    </div>
  );
}