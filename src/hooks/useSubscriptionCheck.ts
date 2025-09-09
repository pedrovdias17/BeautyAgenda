import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function useSubscriptionCheck() {
  const { userProfile, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !userProfile) return;

    const now = new Date();
    const trialEnd = new Date(userProfile.trial_termina_em);

    // Verificar se o trial expirou e não tem assinatura ativa
    if (userProfile.status_assinatura === 'trial' && now > trialEnd) {
      // Em uma implementação real, isso seria atualizado via webhook
      navigate('/upgrade');
    }

    // Verificar se a assinatura está vencida
    if (userProfile.status_assinatura === 'past_due' || userProfile.status_assinatura === 'canceled') {
      navigate('/upgrade');
    }
  }, [userProfile, isAuthenticated, navigate]);

  const hasActiveSubscription = () => {
    if (!userProfile) return false;
    
    if (userProfile.status_assinatura === 'active') return true;
    
    if (userProfile.status_assinatura === 'trial') {
      const now = new Date();
      const trialEnd = new Date(userProfile.trial_termina_em);
      return now <= trialEnd;
    }
    
    return false;
  };

  const getDaysUntilExpiry = () => {
    if (!userProfile) return 0;
    
    if (userProfile.status_assinatura === 'trial') {
      const now = new Date();
      const trialEnd = new Date(userProfile.trial_termina_em);
      const diffTime = trialEnd.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays);
    }
    
    return 0;
  };

  return {
    hasActiveSubscription: hasActiveSubscription(),
    isTrialActive: userProfile?.status_assinatura === 'trial',
    daysUntilExpiry: getDaysUntilExpiry(),
    subscriptionStatus: userProfile?.status_assinatura
  };
}