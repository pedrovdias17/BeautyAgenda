// src/services/notificationService.ts

import { Appointment, Client, Professional, Service } from "../contexts/DataContext";
import { User } from "@supabase/supabase-js";

interface NewAppointmentData {
  newAppointment: Appointment;
  clientRecord: Client;
  serviceDetails?: Service;
  professionalDetails?: Professional;
  user: User;
}

export const sendNewAppointmentWebhook = (data: NewAppointmentData) => {
  // LOG 1: Confirma que a função foi chamada
  console.log("%c--- SERVIÇO DE NOTIFICAÇÃO ATIVADO ---", "color: orange; font-weight: bold;");

  const { newAppointment, clientRecord, serviceDetails, professionalDetails, user } = data;
        
  const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;

  // LOG 2: Mostra a URL que o Vite está lendo
  console.log("URL do Webhook que será usada:", webhookUrl);

  if (!webhookUrl) {
    console.error('ERRO FATAL: URL do webhook do n8n não configurada no arquivo .env.local!');
    return;
  }
  
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

  // LOG 3: Mostra exatamente os dados que estamos enviando
  console.log("Payload que será enviado para o n8n:", payload);

  fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(response => {
    if (response.ok) {
      console.log('%cSUCESSO: Webhook para n8n enviado!', 'color: lightgreen; font-weight: bold;');
    } else {
      console.error('FALHA: n8n respondeu com erro:', response.status, response.statusText);
    }
  }).catch(webhookError => {
    console.error('FALHA GRAVE: Erro de rede ou CORS ao tentar enviar webhook. Veja os detalhes abaixo:', webhookError);
  });
};