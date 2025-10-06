// supabase/functions/get-secret/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// --- Funções de Criptografia (agora com descriptografia) ---
const ENCRYPTION_KEY = Deno.env.get('ENCRYPTION_KEY')!
const N8N_SECRET_KEY = Deno.env.get('N8N_SECRET_KEY')!

if (!ENCRYPTION_KEY || !N8N_SECRET_KEY) {
  throw new Error("Variáveis de ambiente (ENCRYPTION_KEY ou N8N_SECRET_KEY) não estão definidas.");
}

async function getKey() {
  const keyData = atob(ENCRYPTION_KEY).split('').map(c => c.charCodeAt(0));
  return await crypto.subtle.importKey(
    "raw",
    new Uint8Array(keyData),
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

// Função para descriptografar o texto
async function decrypt(base64Ciphertext: string) {
  const key = await getKey();
  const combined = atob(base64Ciphertext).split('').map(c => c.charCodeAt(0));
  const combined_ui8a = new Uint8Array(combined);

  const iv = combined_ui8a.slice(0, 12);
  const ciphertext = combined_ui8a.slice(12);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
}


// --- Servidor da Edge Function ---
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Checagem de Segurança: A requisição veio do n8n?
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || authHeader.replace('Bearer ', '') !== N8N_SECRET_KEY) {
      return new Response(JSON.stringify({ error: "Não autorizado." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const { user_id } = await req.json();
    if (!user_id) throw new Error("O 'user_id' do profissional é obrigatório.");

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Buscar o segredo criptografado no banco de dados
    const { data: secretData, error: selectError } = await supabaseAdmin
      .from('user_secrets')
      .select('encrypted_secret')
      .eq('user_id', user_id)
      .single();
    
    if (selectError) throw new Error("Segredo não encontrado para este usuário.");

    // 3. Descriptografar o segredo
    const decryptedSecret = await decrypt(secretData.encrypted_secret);

    // 4. Retornar o segredo em texto plano para o n8n
    return new Response(JSON.stringify({ secret: decryptedSecret }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error("Erro na função get-secret:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})