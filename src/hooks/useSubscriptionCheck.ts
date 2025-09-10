import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function useSubscriptionCheck() {
  const { usuario, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !usuario) return;

    const now = new Date();
    const trialEnd = new Date(usuario.trial_termina_em);

    // Verificar se o trial expirou e não tem assinatura ativa
    if (usuario.status_assinatura === 'trial' && now > trialEnd) {
      // Atualizar status para expirado
      // Em uma implementação real, isso seria feito via API
      navigate('/upgrade');
    }

    // Verificar se a assinatura está vencida
    if (usuario.status_assinatura === 'past_due' || usuario.status_assinatura === 'canceled') {
      navigate('/upgrade');
    }
  }, [usuario, isAuthenticated, navigate]);

  const hasActiveSubscription = () => {
    if (!usuario) return false;
    
    if (usuario.status_assinatura === 'active') return true;
    
    if (usuario.status_assinatura === 'trial') {
      const now = new Date();
      const trialEnd = new Date(usuario.trial_termina_em);
      return now <= trialEnd;
    }
    
    return false;
  };

  const getDaysUntilExpiry = () => {
    if (!usuario) return 0;
    
    if (usuario.status_assinatura === 'trial') {
      const now = new Date();
      const trialEnd = new Date(usuario.trial_termina_em);
      const diffTime = trialEnd.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays);
    }
    
    return 0;
  };

  return {
    hasActiveSubscription: hasActiveSubscription(),
    isTrialActive: usuario?.status_assinatura === 'trial',
    daysUntilExpiry: getDaysUntilExpiry(),
    subscriptionStatus: usuario?.status_assinatura
  };
}