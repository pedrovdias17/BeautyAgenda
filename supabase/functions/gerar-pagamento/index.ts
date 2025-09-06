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

    const { agendamentoId, usuarioId } = await req.json()

    // Buscar dados do usuário e agendamento
    const { data: usuario, error: userError } = await supabaseClient
      .from('usuarios')
      .select('mercado_pago_key')
      .eq('id', usuarioId)
      .single()

    if (userError || !usuario?.mercado_pago_key) {
      return new Response(
        JSON.stringify({ error: 'Chave do Mercado Pago não configurada' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: agendamento, error: appointmentError } = await supabaseClient
      .from('agendamentos')
      .select(`
        *,
        servicos (nome, preco, valor_sinal),
        clientes (nome, email, telefone)
      `)
      .eq('id', agendamentoId)
      .single()

    if (appointmentError) {
      return new Response(
        JSON.stringify({ error: 'Agendamento não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Criar preferência de pagamento no Mercado Pago
    const paymentData = {
      items: [
        {
          title: `Sinal - ${agendamento.servicos.nome}`,
          quantity: 1,
          unit_price: agendamento.valor_sinal,
          currency_id: 'BRL'
        }
      ],
      payer: {
        name: agendamento.clientes.nome,
        email: agendamento.clientes.email,
        phone: {
          number: agendamento.clientes.telefone
        }
      },
      back_urls: {
        success: `${req.headers.get('origin')}/pagamento/sucesso`,
        failure: `${req.headers.get('origin')}/pagamento/erro`,
        pending: `${req.headers.get('origin')}/pagamento/pendente`
      },
      auto_return: 'approved',
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/webhook-pagamento`,
      external_reference: agendamentoId
    }

    // Fazer chamada para API do Mercado Pago
    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${usuario.mercado_pago_key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    })

    if (!mpResponse.ok) {
      const error = await mpResponse.text()
      console.error('Erro do Mercado Pago:', error)
      return new Response(
        JSON.stringify({ error: 'Erro ao criar pagamento' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const preference = await mpResponse.json()

    // Atualizar agendamento com ID do pagamento
    await supabaseClient
      .from('agendamentos')
      .update({ pagamento_id: preference.id })
      .eq('id', agendamentoId)

    return new Response(
      JSON.stringify({ 
        paymentUrl: preference.init_point,
        preferenceId: preference.id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro ao gerar pagamento:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})