import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // 1. Importamos o 'useLocation'
import { useSubscriptionCheck } from '../hooks/useSubscriptionCheck';
import { Crown, AlertTriangle } from 'lucide-react';

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

export default function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const { isTrialActive, hasActiveSubscription } = useSubscriptionCheck();
  const navigate = useNavigate();
  const location = useLocation(); // 2. Pegamos a localização atual do usuário

  // 3. Criamos nossa "lista VIP" de páginas que sempre podem ser acessadas
  const allowedPaths = ['/upgrade', '/settings', '/legal'];

  // 4. A nova regra de acesso:
  // Libera se o trial/assinatura estiver ativo OU se a página estiver na nossa lista VIP
  if (isTrialActive || hasActiveSubscription || allowedPaths.includes(location.pathname)) {
    return <>{children}</>;
  }

  // --- TELA DE BLOQUEIO (Se não tiver acesso E não estiver em uma página VIP) ---
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <AlertTriangle size={32} />
      </div>

      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Seu período de testes acabou
      </h1>
      
      <p className="text-gray-600 mb-8 max-w-md">
        Para continuar gerenciando seu negócio e ter acesso a todas as funcionalidades, por favor, faça o upgrade do seu plano.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => navigate('/upgrade')}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
        >
          <Crown size={20} />
          <span>Ver Planos e Fazer Upgrade</span>
        </button>
      </div>
    </div>
  );
}