import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

// --- INTERFACES (ATUALIZADAS) ---
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
  valor_total?: number;
  observacoes?: string; // CAMPO ADICIONADO
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
  observacoes?: string; // CAMPO ADICIONADO
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
  confirmAppointment: (id: string) => Promise<void>;
  cancelAppointment: (id: string) => Promise<void>;
  markAppointmentAsCompleted: (id: string) => Promise<void>;
  // NOVAS FUNÇÕES PARA OBSERVAÇÕES
  updateAppointmentNotes: (id: string, notes: string) => Promise<void>;
  updateClientNotes: (id: string, notes: string) => Promise<void>;
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

        // ATUALIZADO: Buscar a coluna 'observacoes'
        const { data: appointmentsData, error: appointmentsError } = await supabase.from('agendamentos').select('*').eq('usuario_id', user.id);
        if (appointmentsError) throw appointmentsError;
        setAppointments(appointmentsData || []);

        // ATUALIZADO: Buscar a coluna 'observacoes'
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

  const addProfessional = async (professional: Omit<Professional, 'id' | 'usuario_id'>) => { /* ...código sem alterações... */ };
  const updateProfessional = async (id: string, professional: Partial<Professional>) => { /* ...código sem alterações... */ };
  const deleteProfessional = async (id: string) => { /* ...código sem alterações... */ };
  const addService = async (service: Omit<Service, 'id' | 'usuario_id' | 'active'>) => { /* ...código sem alterações... */ };
  const updateService = async (id: string, service: Partial<Service>) => { /* ...código sem alterações... */ };
  const deleteService = async (id: string) => { /* ...código sem alterações... */ };
  const addAppointment = async (appointment: Omit<Appointment, 'id' | 'usuario_id' | 'cliente_id' | 'valor_total'>) => { /* ...código sem alterações... */ };
  const confirmAppointment = async (id: string) => { /* ...código sem alterações... */ };
  const cancelAppointment = async (id: string) => { /* ...código sem alterações... */ };
  const markAppointmentAsCompleted = async (id: string) => { /* ...código sem alterações... */ };

  // --- NOVAS FUNÇÕES PARA ATUALIZAR OBSERVAÇÕES ---
  const updateAppointmentNotes = async (id: string, notes: string) => {
    if (!user) return;
    const { error } = await supabase.from('agendamentos').update({ observacoes: notes }).eq('id', id);
    if (error) {
      console.error('Erro ao atualizar observações do agendamento:', error);
    } else {
      // Atualiza o estado localmente para uma resposta mais rápida da UI
      setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, observacoes: notes } : apt));
    }
  };

  const updateClientNotes = async (id: string, notes: string) => {
    if (!user) return;
    const { error } = await supabase.from('clientes').update({ observacoes: notes }).eq('id', id);
    if (error) {
      console.error('Erro ao atualizar observações do cliente:', error);
    } else {
      setClients(prev => prev.map(cli => cli.id === id ? { ...cli, observacoes: notes } : cli));
    }
  };


  return (
    <DataContext.Provider value={{
      professionals, services, appointments, clients, isLoading,
      fetchData, addProfessional, updateProfessional, deleteProfessional,
      addService, updateService, deleteService, addAppointment,
      confirmAppointment, cancelAppointment, markAppointmentAsCompleted,
      // Expondo as novas funções
      updateAppointmentNotes,
      updateClientNotes
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