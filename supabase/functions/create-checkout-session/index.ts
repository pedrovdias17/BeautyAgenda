import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13.9.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verificação das chaves movida para dentro do 'try'
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const siteUrl = Deno.env.get('SITE_URL');
    if (!stripeSecretKey || !siteUrl) {
      throw new Error('Uma ou mais variáveis de ambiente (STRIPE_SECRET_KEY, SITE_URL) não estão definidas no painel do Supabase.');
    }
    
    // Inicialização do Stripe movida para dentro do 'try'
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-08-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const { priceId, userId } = await req.json()
    if (!priceId || !userId) {
      throw new Error('priceId e userId são obrigatórios.');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('email')
      .inSchema('auth')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      throw new Error(`Usuário não encontrado: ${userError?.message}`);
    }
    const userEmail = userData.email;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      customer_email: userEmail,
      success_url: `${siteUrl}/payment/success`,
      cancel_url: `${siteUrl}/upgrade`,
    })

    return new Response(JSON.stringify({ sessionId: session.id, url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})