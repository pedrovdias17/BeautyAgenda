import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Briefcase, Clock, DollarSign, User } from 'lucide-react';
import { useData, Service } from '../contexts/DataContext';

export default function Services() {
  const { services, professionals, addService, updateService, deleteService } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    professionalId: '',
    duration: 60,
    price: 0,
    description: '',
    requiresSignal: false,
    signalAmount: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingService) {
      updateService(editingService.id, formData);
    } else {
      addService(formData);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      professionalId: '',
      duration: 60,
      price: 0,
      description: '',
      requiresSignal: false,
      signalAmount: 0
    });
    setEditingService(null);
    setIsModalOpen(false);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData(service);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
      deleteService(id);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
    return `${mins}min`;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Serviços</h1>
          <p className="text-gray-600">Gerencie os serviços oferecidos</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Adicionar Serviço</span>
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => {
          const professional = professionals.find(p => p.id === service.professionalId);
          
          return (
            <div key={service.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    <div className="flex items-center space-x-1 text-sm text-gray-600 mt-1">
                      <User size={14} />
                      <span>{professional?.name || 'Profissional não encontrado'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(service)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{service.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <Clock size={14} />
                  <span>{formatDuration(service.duration)}</span>
                </div>
                <div className="flex items-center space-x-1 text-lg font-semibold text-green-600">
                  <DollarSign size={16} />
                  <span>R$ {service.price.toLocaleString()}</span>
                </div>
              </div>

              {service.requiresSignal && (
                <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700 font-medium">
                    Sinal obrigatório: R$ {service.signalAmount}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {services.length === 0 && (
        <div className="text-center py-12">
          <Briefcase size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Nenhum serviço cadastrado</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Adicionar Primeiro Serviço
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {editingService ? 'Editar Serviço' : 'Novo Serviço'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Serviço
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Corte + Lavagem"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profissional
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duração (min)
                  </label>
                  <input
                    type="number"
                    required
                    min="15"
                    step="15"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preço (R$)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descrição do serviço..."
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.requiresSignal}
                      onChange={(e) => setFormData(prev => ({ ...prev, requiresSignal: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Exigir pagamento de sinal</span>
                  </label>
                </div>

                {formData.requiresSignal && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valor do sinal (R$)
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
              </div>

              <div className="flex space-x-3 pt-4">
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
                  {editingService ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}