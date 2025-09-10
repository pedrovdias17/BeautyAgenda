import React from 'react';
import { useSubscriptionCheck } from '../hooks/useSubscriptionCheck';
import { Crown, Calendar, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  feature?: string;
}

export default function SubscriptionGuard({ children, feature }: SubscriptionGuardProps) {
  const { hasActiveSubscription, isTrialActive, daysUntilExpiry, subscriptionStatus } = useSubscriptionCheck();
  const navigate = useNavigate();

  // Se tem assinatura ativa, mostrar conteúdo
  if (hasActiveSubscription) {
    return <>{children}</>;
  }

  // Se não tem acesso, mostrar bloqueio
  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
          {subscriptionStatus === 'trial' ? <Calendar size={32} /> : <Crown size={32} />}
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {subscriptionStatus === 'trial' 
            ? `Seu trial expira em ${daysUntilExpiry} dias`
            : 'Assinatura Necessária'
          }
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          {feature 
            ? `Para acessar ${feature}, você precisa de uma assinatura ativa.`
            : 'Esta funcionalidade requer uma assinatura ativa.'
          }
        </p>

        {subscriptionStatus === 'trial' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-2 text-blue-800">
              <AlertTriangle size={20} />
              <span className="font-medium">
                Aproveite os últimos {daysUntilExpiry} dias do seu trial gratuito!
              </span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            O que você ganha com a assinatura:
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Agendamentos ilimitados</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Lembretes automáticos</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Pagamento de sinais</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Suporte prioritário</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Relatórios detalhados</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Página pública personalizada</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/upgrade')}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Crown size={20} />
            <span>Fazer Upgrade Agora</span>
          </button>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}