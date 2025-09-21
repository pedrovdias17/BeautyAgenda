import React, { useState } from 'react';
import { Plus, Edit2, Trash2, User, Mail, Phone } from 'lucide-react';
import { useData, Professional } from '../contexts/DataContext';

export default function Professionals() {
  const { professionals, addProfessional, updateProfessional, deleteProfessional } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  
  // Estado do formulário, agora sem 'specialties'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // A lógica de 'specialties' foi removida daqui
    if (editingProfessional) {
      updateProfessional(editingProfessional.id, formData);
    } else {
      addProfessional(formData);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
    });
    setEditingProfessional(null);
    setIsModalOpen(false);
  };

  const handleEdit = (professional: Professional) => {
    setEditingProfessional(professional);
    // Popula o formulário sem 'specialties'
    setFormData({
      name: professional.name,
      email: professional.email,
      phone: professional.phone,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este profissional?')) {
      deleteProfessional(id);
    }
  };

  // As funções addSpecialty, removeSpecialty, e updateSpecialty foram removidas.

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profissionais</h1>
          <p className="text-gray-600">Gerencie sua equipe de profissionais</p>
        </div>
        <button
          onClick={() => {
            resetForm(); // Garante que o form esteja limpo ao abrir para um novo profissional
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Adicionar Profissional</span>
        </button>
      </div>

      {/* Professionals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {professionals.map((professional) => (
          <div key={professional.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{professional.name}</h3>
                  <div className="flex items-center space-x-1 text-sm text-gray-600 mt-1">
                    <Mail size={14} />
                    <span>{professional.email}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(professional)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(professional.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Phone size={14} />
              <span>{professional.phone}</span>
            </div>

            {/* A seção de 'Especialidades' foi removida daqui */}
          </div>
        ))}
      </div>

      {professionals.length === 0 && (
        <div className="text-center py-12">
          <User size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Nenhum profissional cadastrado</p>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Adicionar Primeiro Profissional
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {editingProfessional ? 'Editar Profissional' : 'Novo Profissional'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                <input
                  type="text" required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Nome do profissional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email" required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                <input
                  type="tel" required
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="(11) 99999-9999"
                />
              </div>

              {/* O campo de 'Especialidades' foi removido do formulário */}

              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={resetForm} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {editingProfessional ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}