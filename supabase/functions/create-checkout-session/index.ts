import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13.9.0?target=deno'

// Definindo os headers de CORS diretamente aqui para garantir
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Resposta para o "preflight request" do navegador, essencial para o CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { priceId, userId } = await req.json()

    // Garante que as variáveis de ambiente estão definidas
    const siteUrl = Deno.env.get('SITE_URL');
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!siteUrl || !stripeSecretKey) {
      throw new Error('Uma ou mais variáveis de ambiente (SITE_URL, STRIPE_SECRET_KEY) não estão definidas no Supabase.');
    }

    // Inicializa o Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-08-16',
      httpClient: Stripe.createFetchHttpClient(),
    })
    
    // Inicializa o cliente Admin do Supabase
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // --- LÓGICA CORRIGIDA AQUI ---
    // Em vez de usar a função de admin, fazemos uma consulta direta na tabela 'users' do schema 'auth'.
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('email')
      .inSchema('auth') // Especifica que a tabela está no schema 'auth'
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      throw new Error(`Usuário não encontrado no banco de dados: ${userError?.message}`);
    }
    const userEmail = userData.email;
    // --- FIM DA CORREÇÃO ---

    // Cria a sessão de checkout no Stripe
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

    // Retorna a URL da sessão para o frontend
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