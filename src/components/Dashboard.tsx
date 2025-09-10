import React from 'react';
import SubscriptionGuard from './SubscriptionGuard';
import { useSubscriptionCheck } from '../hooks/useSubscriptionCheck';
import { 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useData } from '../contexts/DataContext';

export default function Dashboard() {
  const { appointments, clients, services, professionals } = useData();
  const { isTrialActive, daysUntilExpiry } = useSubscriptionCheck();

  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(apt => apt.date === today);
  const confirmedAppointments = appointments.filter(apt => apt.status === 'confirmed');
  const totalRevenue = appointments
    .filter(apt => apt.paymentStatus === 'paid')
    .reduce((sum, apt) => {
      const service = services.find(s => s.id === apt.serviceId);
      return sum + (service?.price || 0);
    }, 0);
  
  const signalRevenue = appointments
    .filter(apt => apt.signalAmount)
    .reduce((sum, apt) => sum + (apt.signalAmount || 0), 0);

  const attendanceRate = appointments.length > 0 
    ? Math.round((appointments.filter(apt => apt.status === 'completed').length / appointments.length) * 100)
    : 0;

  const stats = [
    {
      title: 'Agendamentos Hoje',
      value: todayAppointments.length,
      icon: Calendar,
      color: 'blue',
      subtitle: `${confirmedAppointments.length} confirmados`
    },
    {
      title: 'Receita Total',
      value: `R$ ${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'green',
      subtitle: `R$ ${signalRevenue} em sinais`
    },
    {
      title: 'Total de Clientes',
      value: clients.length,
      icon: Users,
      color: 'purple',
      subtitle: 'Clientes cadastrados'
    },
    {
      title: 'Taxa Comparecimento',
      value: `${attendanceRate}%`,
      icon: TrendingUp,
      color: 'orange',
      subtitle: 'Últimos agendamentos'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'pending':
        return <Clock size={16} className="text-yellow-500" />;
      case 'cancelled':
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <AlertCircle size={16} className="text-gray-500" />;
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        {isTrialActive && daysUntilExpiry <= 5 && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2 text-yellow-800">
              <span className="font-medium">
                ⚠️ Seu trial expira em {daysUntilExpiry} dias. 
                <a href="/upgrade" className="underline ml-1">Faça upgrade agora!</a>
              </span>
            </div>
          </div>
        )}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Visão geral do seu negócio</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                  <Icon size={24} className={`text-${stat.color}-600`} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-sm font-medium text-gray-700 mb-1">{stat.title}</p>
              <p className="text-xs text-gray-500">{stat.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agendamentos de Hoje */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Agendamentos de Hoje</h2>
            <p className="text-sm text-gray-600 mt-1">{todayAppointments.length} agendamentos</p>
          </div>
          <div className="p-6">
            {todayAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum agendamento para hoje</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todayAppointments.slice(0, 5).map((appointment) => {
                  const service = services.find(s => s.id === appointment.serviceId);
                  const professional = professionals.find(p => p.id === appointment.professionalId);
                  
                  return (
                    <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {getStatusIcon(appointment.status)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{appointment.clientName}</p>
                          <p className="text-sm text-gray-600">{service?.name} • {professional?.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{appointment.time}</p>
                        <p className="text-xs text-gray-500">{getStatusText(appointment.status)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Resumo Financeiro */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Resumo Financeiro</h2>
            <p className="text-sm text-gray-600 mt-1">Receita e pagamentos</p>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-green-700">Receita Total</p>
                <p className="text-2xl font-bold text-green-900">R$ {totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign size={32} className="text-green-600" />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-blue-700">Sinais Recebidos</p>
                <p className="text-2xl font-bold text-blue-900">R$ {signalRevenue.toLocaleString()}</p>
              </div>
              <TrendingUp size={32} className="text-blue-600" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Pagos</p>
                <p className="text-lg font-bold text-gray-900">
                  {appointments.filter(apt => apt.paymentStatus === 'paid').length}
                </p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-lg font-bold text-gray-900">
                  {appointments.filter(apt => apt.paymentStatus === 'pending').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}