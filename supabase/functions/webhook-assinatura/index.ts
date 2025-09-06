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
    console.log('Webhook de assinatura recebido:', body)

    // Webhook do Mercado Pago para assinaturas
    if (body.type === 'subscription') {
      const subscriptionId = body.data.id
      
      // Buscar usuário pela assinatura
      const { data: usuario, error: findError } = await supabaseClient
        .from('usuarios')
        .select('*')
        .eq('assinatura_id', subscriptionId)
        .single()

      if (findError) {
        console.error('Erro ao buscar usuário:', findError)
        return new Response(
          JSON.stringify({ error: 'Usuário não encontrado' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      let newStatus = usuario.status_assinatura

      // Mapear status do Mercado Pago para nosso sistema
      switch (body.action) {
        case 'subscription.authorized':
        case 'subscription.updated':
          newStatus = 'active'
          break
        case 'subscription.cancelled':
          newStatus = 'canceled'
          break
        case 'subscription.paused':
          newStatus = 'past_due'
          break
      }

      // Atualizar status da assinatura
      const { error: updateError } = await supabaseClient
        .from('usuarios')
        .update({
          status_assinatura: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', usuario.id)

      if (updateError) {
        console.error('Erro ao atualizar usuário:', updateError)
        return new Response(
          JSON.stringify({ error: 'Erro ao atualizar usuário' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log(`Status da assinatura atualizado para ${newStatus}:`, usuario.id)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro no webhook de assinatura:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})