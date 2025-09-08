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

    const { usuarioId } = await req.json()

    // Buscar dados do usuário
    const { data: usuario, error: userError } = await supabaseClient
      .from('usuarios')
      .select('*')
      .eq('id', usuarioId)
      .single()

    if (userError) {
      return new Response(
        JSON.stringify({ error: 'Usuário não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Criar assinatura no Mercado Pago
    const subscriptionData = {
      reason: 'AgendPro - Assinatura Mensal',
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: 47.00,
        currency_id: 'BRL'
      },
      payer_email: usuario.email,
      back_url: `${req.headers.get('origin')}/assinatura/sucesso`,
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/webhook-assinatura`
    }

    // Usar chave de teste do Mercado Pago (em produção, usar chave real)
    const mpAccessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN') || 'TEST-1234567890-abcdef'

    const mpResponse = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mpAccessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscriptionData)
    })

    if (!mpResponse.ok) {
      const error = await mpResponse.text()
      console.error('Erro do Mercado Pago:', error)
      return new Response(
        JSON.stringify({ error: 'Erro ao criar assinatura' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const subscription = await mpResponse.json()

    // Atualizar usuário com ID da assinatura
    await supabaseClient
      .from('usuarios')
      .update({ 
        assinatura_id: subscription.id,
        status_assinatura: 'active'
      })
      .eq('id', usuarioId)

    return new Response(
      JSON.stringify({ 
        subscriptionUrl: subscription.init_point,
        subscriptionId: subscription.id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro ao criar assinatura:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})