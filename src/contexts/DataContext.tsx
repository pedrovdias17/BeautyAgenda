import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

// --- INTERFACES ---
export interface Professional {
  id: string;
  usuario_id: string;
  name: string;
  email: string;
  phone: string;
  specialties?: string[];
  avatar?: string;
}

export interface Service {
  id: string;
  usuario_id: string;
  name: string;
  professionalId: string;
  duration: number;
  price: number;
  description: string;
  requiresSignal: boolean;
  signalAmount: number;
  active: boolean;
}

export interface Appointment {
  id: string;
  usuario_id: string;
  cliente_id: string;
  servico_id: string;
  profissional_id: string;
  data_agendamento: string;
  hora_agendamento: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  status_pagamento: 'pending' | 'partial' | 'paid';
  valor_sinal?: number;
  valor_total?: number; // Adicionado para consistência
  clientName: string;
  clientPhone: string;
  clientEmail: string;
}

export interface Client {
  id: string;
  usuario_id: string;
  nome: string;
  telefone: string;
  email: string;
  total_agendamentos: number;
  ultima_visita: string;
}

// --- TIPO DO CONTEXTO (ATUALIZADO) ---
interface DataContextType {
  professionals: Professional[];
  services: Service[];
  appointments: Appointment[];
  clients: Client[];
  isLoading: boolean;
  fetchData: () => Promise<void>;
  addProfessional: (professional: Omit<Professional, 'id' | 'usuario_id'>) => Promise<void>;
  updateProfessional: (id: string, professional: Partial<Professional>) => Promise<void>;
  deleteProfessional: (id: string) => Promise<void>;
  addService: (service: Omit<Service, 'id' | 'usuario_id' | 'active'>) => Promise<void>;
  updateService: (id: string, service: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  addAppointment: (appointment: Omit<Appointment, 'id' | 'usuario_id' | 'cliente_id' | 'valor_total'>) => Promise<void>;
  // Funções de ação específicas
  confirmAppointment: (id: string) => Promise<void>;
  cancelAppointment: (id: string) => Promise<void>;
  markAppointmentAsCompleted: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) {
        setIsLoading(false);
        return;
    }
    setIsLoading(true);

    try {
        const { data: proData, error: proError } = await supabase.from('profissionais').select('*').eq('usuario_id', user.id);
        if (proError) throw proError;
        setProfessionals(proData || []);

        const { data: servicesData, error: servicesError } = await supabase.from('servicos').select('*').eq('usuario_id', user.id);
        if (servicesError) throw servicesError;
        setServices(servicesData || []);

        const { data: appointmentsData, error: appointmentsError } = await supabase.from('agendamentos').select('*').eq('usuario_id', user.id);
        if (appointmentsError) throw appointmentsError;
        setAppointments(appointmentsData || []);

        const { data: clientsData, error: clientsError } = await supabase.from('clientes').select('*').eq('usuario_id', user.id);
        if (clientsError) throw clientsError;
        setClients(clientsData || []);

    } catch (error) {
        console.error('Erro inesperado ao buscar dados:', error);
    } finally {
        setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
        fetchData();
    }
  }, [user, fetchData]);

  // --- Funções CRUD (Profissionais, Serviços) ---
  const addProfessional = async (professional: Omit<Professional, 'id' | 'usuario_id'>) => { /* ...código sem alterações... */ };
  const updateProfessional = async (id: string, professional: Partial<Professional>) => { /* ...código sem alterações... */ };
  const deleteProfessional = async (id: string) => { /* ...código sem alterações... */ };
  const addService = async (service: Omit<Service, 'id' | 'usuario_id' | 'active'>) => { /* ...código sem alterações... */ };
  const updateService = async (id: string, service: Partial<Service>) => { /* ...código sem alterações... */ };
  const deleteService = async (id: string) => { /* ...código sem alterações... */ };
  
  // --- Funções CRUD (Agendamentos) ---
  const addAppointment = async (appointment: Omit<Appointment, 'id' | 'usuario_id' | 'cliente_id' | 'valor_total'>) => {
    if (!user) return;
    const { data: clientResult, error: clientError } = await supabase.rpc('find_or_create_client', {
      p_owner_id: user.id, p_name: appointment.clientName, p_phone: appointment.clientPhone,
      p_email: appointment.clientEmail, p_last_visit: appointment.data_agendamento
    });
    if (clientError) { console.error('Erro ao criar/encontrar cliente:', clientError); return; }
    const clientId = clientResult;
    const serviceDetails = services.find(s => s.id === appointment.servico_id);
    const appointmentDataForDB = {
      usuario_id: user.id, cliente_id: clientId, servico_id: appointment.servico_id,
      profissional_id: appointment.profissional_id, data_agendamento: appointment.data_agendamento,
      hora_agendamento: appointment.hora_agendamento, status: appointment.status,
      status_pagamento: appointment.status_pagamento || (serviceDetails?.requiresSignal ? 'pending' : 'paid'),
      valor_sinal: appointment.valor_sinal, valor_total: serviceDetails?.price || 0
    };
    const { error } = await supabase.from('agendamentos').insert(appointmentDataForDB);
    if (error) { console.error('Erro ao adicionar agendamento:', error); return; }
    await fetchData();
  };

  const updateAppointmentStatus = async (id: string, status: 'confirmed' | 'pending' | 'cancelled' | 'completed') => {
    if (!user) return;
    const { error } = await supabase.from('agendamentos').update({ status: status }).eq('id', id);
    if (error) console.error('Erro ao atualizar status:', error); else await fetchData();
  };
  
  // --- 1. NOVAS FUNÇÕES DE AÇÃO ESPECÍFICAS ---
  const confirmAppointment = async (id: string) => {
    await updateAppointmentStatus(id, 'confirmed');
  };

  const cancelAppointment = async (id: string) => {
    await updateAppointmentStatus(id, 'cancelled');
  };

  const markAppointmentAsCompleted = async (id: string) => {
    if (!user) return;
    // Lógica para marcar como concluído e também como pago
    const { error } = await supabase.from('agendamentos').update({ status: 'completed', status_pagamento: 'paid' }).eq('id', id);
    if (error) console.error('Erro ao marcar como concluído:', error); else await fetchData();
  };

  return (
    <DataContext.Provider value={{
      professionals, services, appointments, clients, isLoading,
      fetchData, addProfessional, updateProfessional, deleteProfessional,
      addService, updateService, deleteService, addAppointment,
      // 2. EXPONDO AS NOVAS FUNÇÕES NO CONTEXTO
      confirmAppointment,
      cancelAppointment,
      markAppointmentAsCompleted
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}