import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos do banco de dados
export interface UserProfile {
  nome: string;
  nome_studio: string;
  telefone?: string;
  endereco?: string;
  slug: string;
  status_assinatura: 'trial' | 'active' | 'past_due' | 'canceled';
  trial_termina_em: string;
  assinatura_id?: string;
  mercado_pago_key?: string;
  configuracoes: Record<string, any>;
}

export interface Profissional {
  id: string;
  user_id: string;
  nome: string;
  email?: string;
  telefone?: string;
  especialidades: string[];
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Servico {
  id: string;
  user_id: string;
  profissional_id: string;
  nome: string;
  descricao: string;
  duracao: number;
  preco: number;
  requer_sinal: boolean;
  valor_sinal: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Cliente {
  id: string;
  user_id: string;
  nome: string;
  telefone: string;
  email?: string;
  total_agendamentos: number;
  ultima_visita?: string;
  created_at: string;
  updated_at: string;
}

export interface Agendamento {
  id: string;
  user_id: string;
  cliente_id: string;
  servico_id: string;
  profissional_id: string;
  data_agendamento: string;
  hora_agendamento: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  status_pagamento: 'pending' | 'partial' | 'paid';
  valor_total: number;
  valor_sinal: number;
  pagamento_id?: string;
  observacoes: string;
  created_at: string;
  updated_at: string;
}

export interface HorarioFuncionamento {
  id: string;
  user_id: string;
  dia_semana: number;
  ativo: boolean;
  hora_inicio: string;
  hora_fim: string;
  intervalos: Array<{ start: string; end: string }>;
  created_at: string;
  updated_at: string;
}

// Funções auxiliares para trabalhar com perfil do usuário
export const getUserProfile = (user: any): UserProfile => {
  const metadata = user?.user_metadata || {};
  return {
    nome: metadata.nome || '',
    nome_studio: metadata.nome_studio || '',
    telefone: metadata.telefone || '',
    endereco: metadata.endereco || '',
    slug: metadata.slug || '',
    status_assinatura: metadata.status_assinatura || 'trial',
    trial_termina_em: metadata.trial_termina_em || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    assinatura_id: metadata.assinatura_id || '',
    mercado_pago_key: metadata.mercado_pago_key || '',
    configuracoes: metadata.configuracoes || {}
  };
};

export const updateUserProfile = async (updates: Partial<UserProfile>) => {
  const { data, error } = await supabase.auth.updateUser({
    data: updates
  });
  return { data, error };
};