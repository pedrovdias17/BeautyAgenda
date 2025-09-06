import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = await req.json()
    console.log('Webhook recebido:', body)

    // Verificar se é um webhook do Mercado Pago
    if (body.type === 'payment') {
      const paymentId = body.data.id
      
      // Buscar detalhes do pagamento no Mercado Pago
      // Aqui você faria uma chamada para a API do Mercado Pago
      // Por enquanto, vamos simular que o pagamento foi aprovado
      
      if (body.action === 'payment.created' || body.action === 'payment.updated') {
        // Atualizar o agendamento no banco
        const { data: agendamento, error: findError } = await supabaseClient
          .from('agendamentos')
          .select('*')
          .eq('pagamento_id', paymentId)
          .single()

        if (findError) {
          console.error('Erro ao buscar agendamento:', findError)
          return new Response(
            JSON.stringify({ error: 'Agendamento não encontrado' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Atualizar status do agendamento
        const { error: updateError } = await supabaseClient
          .from('agendamentos')
          .update({
            status: 'confirmed',
            status_pagamento: 'partial'
          })
          .eq('id', agendamento.id)

        if (updateError) {
          console.error('Erro ao atualizar agendamento:', updateError)
          return new Response(
            JSON.stringify({ error: 'Erro ao atualizar agendamento' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Aqui você pode adicionar lógica para:
        // - Enviar WhatsApp de confirmação
        // - Enviar email de confirmação
        // - Notificar o profissional

        console.log('Agendamento confirmado:', agendamento.id)
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro no webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})