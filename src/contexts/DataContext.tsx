import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

// --- INTERFACES CORRIGIDAS ---
export interface Professional {
  id: string;
  usuario_id: string;
  name: string;
  email: string;
  phone: string;
  specialties: string[];
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

// --- TIPO DO CONTEXTO ---
interface DataContextType {
  professionals: Professional[];
  services: Service[];
  appointments: Appointment[];
  clients: Client[];
  isLoading: boolean;
  addProfessional: (professional: Omit<Professional, 'id' | 'usuario_id'>) => Promise<void>;
  updateProfessional: (id: string, professional: Partial<Professional>) => Promise<void>;
  deleteProfessional: (id: string) => Promise<void>;
  addService: (service: Omit<Service, 'id' | 'usuario_id' | 'active'>) => Promise<void>;
  updateService: (id: string, service: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  addAppointment: (appointment: Omit<Appointment, 'id' | 'usuario_id' | 'cliente_id'>) => Promise<void>;
  updateAppointment: (id: string, appointment: Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
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
        if (proError) console.error('Erro ao buscar profissionais:', proError);
        setProfessionals(proData || []);

        const { data: servicesData, error: servicesError } = await supabase.from('servicos').select('*').eq('usuario_id', user.id);
        if (servicesError) console.error('Erro ao buscar serviços:', servicesError);
        setServices(servicesData || []);

        const { data: appointmentsData, error: appointmentsError } = await supabase.from('agendamentos').select('*').eq('usuario_id', user.id);
        if (appointmentsError) console.error('Erro ao buscar agendamentos:', appointmentsError);
        setAppointments(appointmentsData || []);

        const { data: clientsData, error: clientsError } = await supabase.from('clientes').select('*').eq('usuario_id', user.id);
        if (clientsError) console.error('Erro ao buscar clientes:', clientsError);
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

  // --- Funções para Profissionais ---
  const addProfessional = async (professional: Omit<Professional, 'id' | 'usuario_id'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('profissionais').insert({ ...professional, usuario_id: user.id }).select();
    if (error) console.error('Erro ao adicionar profissional:', error);
    if (data) await fetchData();
  };

  const updateProfessional = async (id: string, professional: Partial<Professional>) => {
    if (!user) return;
    const { data, error } = await supabase.from('profissionais').update(professional).eq('id', id).select();
    if (error) console.error('Erro ao atualizar profissional:', error);
    if (data) await fetchData();
  };

  const deleteProfessional = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('profissionais').delete().eq('id', id);
    if (error) console.error('Erro ao deletar profissional:', error);
    else await fetchData();
  };
  
  // --- Funções para Serviços ---
  const addService = async (service: Omit<Service, 'id' | 'usuario_id' | 'active'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('servicos').insert({ ...service, usuario_id: user.id, active: true }).select();
    if (error) console.error('Erro ao adicionar serviço:', error);
    if (data) await fetchData();
  };

  const updateService = async (id: string, service: Partial<Service>) => {
    if (!user) return;
    const { data, error } = await supabase.from('servicos').update(service).eq('id', id).select();
    if (error) console.error('Erro ao atualizar serviço:', error);
    if (data) await fetchData();
  };

  const deleteService = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('servicos').delete().eq('id', id);
    if (error) console.error('Erro ao deletar serviço:', error);
    else await fetchData();
  };
  
  // --- Funções para Agendamentos e Clientes (LÓGICA CORRIGIDA) ---
  const addAppointment = async (appointment: Omit<Appointment, 'id' | 'usuario_id' | 'cliente_id'>) => {
    if (!user) return;
    
    let clientRecord = clients.find(c => c.telefone === appointment.clientPhone);
    
    if (!clientRecord) {
      const { data: newClientData, error: clientError } = await supabase
        .from('clientes')
        .insert({
          usuario_id: user.id,
          nome: appointment.clientName,
          telefone: appointment.clientPhone,
          email: appointment.clientEmail,
          total_agendamentos: 1,
          ultima_visita: appointment.data_agendamento,
        })
        .select()
        .single();

      if (clientError) {
        console.error('Erro ao criar novo cliente:', clientError);
        return;
      }
      clientRecord = newClientData;
    } else {
      const { error: updateError } = await supabase
        .from('clientes')
        .update({
          total_agendamentos: clientRecord.total_agendamentos + 1,
          ultima_visita: appointment.data_agendamento,
        })
        .eq('id', clientRecord.id);

      if (updateError) console.error('Erro ao atualizar cliente existente:', updateError);
    }

    if (clientRecord) {
      const serviceDetails = services.find(s => s.id === appointment.servico_id);
      const appointmentDataForDB = {
        usuario_id: user.id,
        cliente_id: clientRecord.id,
        servico_id: appointment.servico_id,
        profissional_id: appointment.profissional_id,
        data_agendamento: appointment.data_agendamento,
        hora_agendamento: appointment.hora_agendamento,
        status: appointment.status,
        status_pagamento: appointment.status_pagamento,
        valor_sinal: appointment.valor_sinal,
        valor_total: serviceDetails?.price || 0
      };

      const { data, error } = await supabase.from('agendamentos').insert(appointmentDataForDB).select();

      if (error) {
        console.error('Erro ao adicionar agendamento:', error);
      } else {
        console.log('Agendamento criado com sucesso:', data);
        await fetchData();
      }
    }
  };

  const updateAppointment = async (id: string, appointmentUpdate: Partial<Appointment>) => {
    if (!user) return;
    const { data, error } = await supabase.from('agendamentos').update(appointmentUpdate).eq('id', id).select();
    if (error) console.error('Erro ao atualizar agendamento:', error);
    if (data) await fetchData();
  };

  const deleteAppointment = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('agendamentos').delete().eq('id', id);
    if (error) console.error('Erro ao deletar agendamento:', error);
    else await fetchData();
  };

  return (
    <DataContext.Provider value={{
      professionals,
      services,
      appointments,
      clients,
      isLoading,
      addProfessional,
      updateProfessional,
      deleteProfessional,
      addService,
      updateService,
      deleteService,
      addAppointment,
      updateAppointment,
      deleteAppointment
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