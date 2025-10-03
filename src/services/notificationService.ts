// src/services/notificationService.ts

import { Appointment, Client, Professional, Service } from "../contexts/DataContext";
import { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase"; // 1. Importamos o cliente supabase

interface NewAppointmentData {
  newAppointment: Appointment;
  clientRecord: Client;
  serviceDetails?: Service;
  professionalDetails?: Professional;
  user: User;
}

export const sendNewAppointmentWebhook = async (data: NewAppointmentData) => {
  const { newAppointment, clientRecord, serviceDetails, professionalDetails, user } = data;
  
  console.log("%c--- SERVIÇO DE NOTIFICAÇÃO (via Edge Function) ---", "color: orange; font-weight: bold;");

  // O payload (pacote de dados) continua o mesmo
  const payload = {
    ownerId: user.id,
    appointmentId: newAppointment.id,
    appointmentDate: newAppointment.data_agendamento,
    appointmentTime: newAppointment.hora_agendamento,
    clientName: clientRecord.nome,
    clientPhone: clientRecord.telefone,
    clientEmail: clientRecord.email,
    serviceName: serviceDetails?.name || 'Serviço não encontrado',
    professionalName: professionalDetails?.name || 'Profissional não encontrado',
    requiresSignal: serviceDetails?.requiresSignal || false,
    signalAmount: serviceDetails?.signalAmount || 0,
    totalAmount: serviceDetails?.price || 0
  };

  console.log("Payload que será enviado para a Edge Function:", payload);

  try {
    // 2. A MÁGICA ESTÁ AQUI: Agora chamamos nossa função segura no Supabase
    const { data: result, error } = await supabase.functions.invoke('notify-n8n', {
      body: payload
    });

    if (error) {
      // Se a Edge Function retornar um erro, ele será capturado aqui
      throw error;
    }

    console.log('%cSUCESSO: Edge Function respondeu:', 'color: lightgreen; font-weight: bold;', result);

  } catch (error) {
    console.error('FALHA GRAVE: Erro ao chamar a Edge Function:', error);
  }
};