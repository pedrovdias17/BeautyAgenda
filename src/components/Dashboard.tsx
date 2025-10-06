import React from 'react';
import { useData } from '../contexts/DataContext';
import { 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle,
  Settings as SettingsIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { appointments, clients } = useData();
  const navigate = useNavigate();

  // --- 1. LÓGICA DE CÁLCULO DAS MÉTRICAS (CORRIGIDA PARA O MÊS ATUAL) ---
  const now = new Date();
  const todayISO = now.toISOString().split('T')[0];
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0 = Janeiro, 11 = Dezembro

  // Filtra agendamentos apenas para o mês e ano correntes
  const appointmentsThisMonth = appointments.filter(apt => {
    const aptDate = new Date(apt.data_agendamento + 'T00:00:00');
    return aptDate.getFullYear() === currentYear && aptDate.getMonth() === currentMonth;
  });

  // Agendamentos de hoje (continua como estava, é diário)
  const todayAppointments = appointments.filter(apt => apt.data_agendamento === todayISO);

  // Métrica 'Concluídos (mês)' - CORRIGIDA
  const completedAppointmentsThisMonth = appointmentsThisMonth.filter(apt => apt.status === 'completed');

  // Métrica 'Faturamento (mês)' - CORRIGIDA
  // Soma o valor_total apenas de agendamentos concluídos no mês atual.
  const totalRevenueThisMonth = completedAppointmentsThisMonth.reduce((sum, apt) => {
    return sum + (apt.valor_total || 0);
  }, 0);

  // Métrica 'Taxa de Conclusão' - CORRIGIDA E MAIS PRECISA
  // Calcula a taxa baseada nos agendamentos que tiveram um desfecho (concluído ou cancelado) no mês.
  const relevantAppointmentsThisMonth = appointmentsThisMonth.filter(
    apt => apt.status === 'completed' || apt.status === 'cancelled'
  );

  const completionRateThisMonth = relevantAppointmentsThisMonth.length > 0 
    ? Math.round((completedAppointmentsThisMonth.length / relevantAppointmentsThisMonth.length) * 100)
    : 0;

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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel Administrativo</h1>
        <p className="text-gray-600">Visão geral do seu negócio em tempo real</p>
      </div>

      {/* Stats Grid - Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Agendamentos Hoje" value={todayAppointments.length} icon={Calendar} color="blue" />
        <StatCard title="Concluídos (mês)" value={completedAppointmentsThisMonth.length} icon={CheckCircle} color="green" />
        <StatCard title="Faturamento (mês)" value={`R$ ${totalRevenueThisMonth.toFixed(2).replace('.', ',')}`} icon={DollarSign} color="purple" />
        <StatCard title="Taxa de Conclusão" value={`${completionRateThisMonth}%`} icon={TrendingUp} color="orange" />
      </div>

      {/* Content Grid - Ações e Agendamentos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna da Esquerda: Ações */}
        <div className="lg:col-span-1 space-y-6">
          <ActionCard title="Ver Agenda" subtitle="Visualize e gerencie agendamentos" icon={Calendar} color="blue" path="/schedule" />
          <ActionCard title="Clientes" subtitle="Gerencie sua base de clientes" icon={Users} color="purple" path="/clients" />
          <ActionCard title="Configurações" subtitle="Ajuste seu perfil e negócio" icon={SettingsIcon} color="gray" path="/settings" />
        </div>

        {/* Coluna da Direita: Agendamentos de Hoje */}
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
                  .slice(0, 5) // Mostra no máximo 5 agendamentos aqui
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