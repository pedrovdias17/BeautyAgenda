import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext'; // 1. Importar o useAuth
import { 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle,
  Settings as SettingsIcon,
  AlertTriangle // 2. Importar o ícone de alerta
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { appointments, clients, services } = useData();
  const { user, resendConfirmationEmail } = useAuth(); // 3. Pegar o 'user' e a nova função do AuthContext
  const navigate = useNavigate();
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  // --- LÓGICA DE CÁLCULO DAS MÉTRICAS ---
  const now = new Date();
  const todayISO = now.toISOString().split('T')[0];
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const appointmentsThisMonth = appointments.filter(apt => {
    const aptDate = new Date(apt.data_agendamento + 'T00:00:00');
    return aptDate.getFullYear() === currentYear && aptDate.getMonth() === currentMonth;
  });

  const todayAppointments = appointments.filter(apt => apt.data_agendamento === todayISO);
  const completedAppointmentsThisMonth = appointmentsThisMonth.filter(apt => apt.status === 'completed');

  const totalRevenueThisMonth = appointmentsThisMonth.reduce((sum, apt) => {
    if (apt.status === 'completed') {
      return sum + (apt.valor_total || 0);
    }
    if (apt.status === 'confirmed' && apt.status_pagamento === 'partial') {
      return sum + (apt.valor_sinal || 0);
    }
    return sum;
  }, 0);

  const relevantAppointmentsThisMonth = appointmentsThisMonth.filter(
    apt => apt.status === 'completed' || apt.status === 'cancelled'
  );
  const completionRateThisMonth = relevantAppointmentsThisMonth.length > 0 
    ? Math.round((completedAppointmentsThisMonth.length / relevantAppointmentsThisMonth.length) * 100)
    : 0;

  // 4. NOVA FUNÇÃO PARA REENVIAR O EMAIL
  const handleResendEmail = async () => {
    if (!user?.email) return;
    setIsResending(true);
    setResendMessage('');
    const { success, error } = await resendConfirmationEmail(user.email);
    if (success) {
      setResendMessage('Link de confirmação reenviado com sucesso!');
    } else {
      setResendMessage(error || 'Ocorreu um erro ao reenviar o email.');
    }
    setIsResending(false);
  };
  
  // --- COMPONENTES VISUAIS ---
  const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: React.ElementType, color: string }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <div className={`p-2 rounded-lg bg-${color}-100`}>
          <Icon size={20} className={`text-${color}-600`} />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
    </div>
  );

  const ActionCard = ({ title, subtitle, icon: Icon, color, path }: { title: string, subtitle: string, icon: React.ElementType, color: string, path: string }) => (
    <button onClick={() => navigate(path)} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-left hover:border-gray-300 transition-all w-full">
      <div className={`p-3 rounded-lg bg-${color}-100 inline-block mb-4`}>
        <Icon size={24} className={`text-${color}-600`} />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
    </button>
  );

  return (
    <div className="p-6">
      {/* 5. NOVO BANNER CONDICIONAL */}
      {user && !user.email_confirmed_at && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg mb-6" role="alert">
          <div className="flex">
            <div className="py-1"><AlertTriangle className="h-6 w-6 text-yellow-500 mr-4" /></div>
            <div>
              <p className="font-bold">Confirme seu endereço de email</p>
              <p className="text-sm">Para garantir o pleno funcionamento do AgendPro e habilitar sua página pública de agendamentos, por favor, clique no link que enviamos para <strong>{user.email}</strong>.</p>
              <div className="mt-2">
                <button onClick={handleResendEmail} disabled={isResending} className="text-sm font-medium text-yellow-800 hover:text-yellow-900 disabled:opacity-50">
                  {isResending ? 'Reenviando...' : 'Reenviar email de confirmação'}
                </button>
                {resendMessage && <span className="ml-4 text-sm">{resendMessage}</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel Administrativo</h1>
        <p className="text-gray-600">Visão geral do seu negócio em tempo real</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Agendamentos Hoje" value={todayAppointments.length} icon={Calendar} color="blue" />
        <StatCard title="Concluídos (mês)" value={completedAppointmentsThisMonth.length} icon={CheckCircle} color="green" />
        <StatCard title="Faturamento (mês)" value={`R$ ${totalRevenueThisMonth.toFixed(2).replace('.', ',')}`} icon={DollarSign} color="purple" />
        <StatCard title="Taxa de Conclusão" value={`${completionRateThisMonth}%`} icon={TrendingUp} color="orange" />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <ActionCard title="Ver Agenda" subtitle="Visualize e gerencie agendamentos" icon={Calendar} color="blue" path="/schedule" />
          <ActionCard title="Clientes" subtitle="Gerencie sua base de clientes" icon={Users} color="purple" path="/clients" />
          <ActionCard title="Configurações" subtitle="Ajuste seu perfil e negócio" icon={SettingsIcon} color="gray" path="/settings" />
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Agendamentos de Hoje</h2>
              <p className="text-sm text-gray-600 mt-1">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
              </p>
            </div>
            <button onClick={() => navigate('/schedule')} className="text-sm text-blue-600 font-medium hover:text-blue-700">
              Ver todos
            </button>
          </div>
          <div className="p-6">
            {todayAppointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum agendamento para hoje. Aproveite o dia!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todayAppointments
                  .sort((a, b) => (a.hora_agendamento || '').localeCompare(b.hora_agendamento || ''))
                  .slice(0, 5)
                  .map((appointment) => {
                    const client = clients.find(c => c.id === appointment.cliente_id);
                    return (
                      <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 text-gray-600">
                            <Clock size={20} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{client?.nome || 'Cliente não encontrado'}</p>
                            <p className="text-sm text-gray-600">{appointment.hora_agendamento}</p>
                          </div>
                        </div>
                        <div className="text-lg font-semibold text-gray-900">
                          R$ {(appointment.valor_total || 0).toFixed(2).replace('.', ',')}
                        </div>
                      </div>
                    );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}