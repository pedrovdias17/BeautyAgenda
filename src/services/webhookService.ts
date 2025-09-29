interface WebhookPayload {
  appointment: {
    id?: string;
    date: string;
    time: string;
    status: string;
    paymentStatus: string;
    signalAmount: number;
    totalAmount: number;
  };
  client: {
    id?: string;
    name: string;
    phone: string;
    email?: string;
  };
  service: {
    id: string;
    name: string;
    description?: string;
    duration: number;
    price: number;
    requiresSignal: boolean;
  };
  professional: {
    id: string;
    name: string;
  };
  studio: {
    name: string;
    address: string;
    phone: string;
  };
  timestamp: string;
}

export const sendWebhook = async (payload: WebhookPayload): Promise<boolean> => {
  const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.warn('Webhook URL não configurada no arquivo .env');
    return false;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed with status: ${response.status}`);
    }

    console.log('Webhook enviado com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao enviar webhook:', error);
    return false;
  }
};