// src/hooks/useSubscriptionCheck.ts (Versão Corrigida para usar trial_termina_em)

import { useAuth } from '../contexts/AuthContext';

export function useSubscriptionCheck() {
  const { usuario } = useAuth();

  if (!usuario) {
    return {
      isTrialActive: false,
      hasActiveSubscription: false,
      subscriptionStatus: 'inactive',
      daysUntilExpiry: 0,
    };
  }

  // --- LÓGICA CORRIGIDA PARA USAR A DATA DO BANCO ---
  
  // 1. Pega a data de expiração diretamente da coluna 'trial_termina_em'
  const trialExpiryDate = new Date(usuario.trial_termina_em);
  
  // 2. Pega a data de hoje (zerando as horas para comparar só o dia)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 3. Verifica se o trial ainda está ativo comparando as datas
  const isTrialActive = trialExpiryDate >= today;

  // 4. Calcula quantos dias faltam (se ainda estiver ativo)
  const daysUntilExpiry = isTrialActive
    ? Math.ceil((trialExpiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  
  const hasActiveSubscription = usuario.status_assinatura === 'active';

  // O status retornado agora reflete a realidade do banco de dados
  const currentStatus = hasActiveSubscription ? 'active' : (isTrialActive ? 'trial' : 'expired');

  return {
    isTrialActive,
    hasActiveSubscription,
    subscriptionStatus: currentStatus,
    daysUntilExpiry,
  };
}