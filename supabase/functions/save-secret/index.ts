// supabase/functions/save-secret/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// --- Funções de Criptografia ---
const ENCRYPTION_KEY = Deno.env.get('ENCRYPTION_KEY')!
if (!ENCRYPTION_KEY) {
  throw new Error("ENCRYPTION_KEY não está definida nas variáveis de ambiente do Supabase.");
}

// Converte a chave base64 para um formato que a API de criptografia entende
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

// Função para criptografar o texto
async function encrypt(plaintext: string) {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12)); // Vetor de inicialização
  const encoded = new TextEncoder().encode(plaintext);
  
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    encoded
  );

  // Combina o IV e o texto criptografado para podermos descriptografar depois
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);
  
  // Converte para base64 para salvar como texto no banco
  return btoa(String.fromCharCode.apply(null, Array.from(combined)));
}

// --- Servidor da Edge Function ---
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name, secret } = await req.json()

    if (!secret) throw new Error("O segredo (secret) não pode estar vazio.");
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    const authHeader = req.headers.get('Authorization')!
    const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''))

    if (!user) throw new Error("Usuário não autenticado.");

    // 1. Criptografa o segredo AQUI DENTRO da função
    const encryptedSecret = await encrypt(secret);

    // 2. Salva o segredo já criptografado na nossa tabela
    const { error: upsertError } = await supabaseAdmin
      .from('user_secrets')
      .upsert({
        user_id: user.id,
        secret_name: name,
        encrypted_secret: encryptedSecret // Salva o texto em base64
      }, { onConflict: 'secret_name' }); // Corrigido onConflict

    if (upsertError) throw upsertError;

    return new Response(JSON.stringify({ message: `Segredo '${name}' salvo com sucesso!` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error("Erro na função save-secret:", error); 
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})