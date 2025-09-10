@@ .. @@
 -- Inserir usuários de teste
 INSERT INTO usuarios (id, email, nome, nome_studio, slug, status_assinatura, trial_termina_em, mercado_pago_key, configuracoes) VALUES
-  ('11111111-1111-1111-1111-111111111111', 'maria@salaobela.com', 'Maria Silva', 'Salão Bela Vista', 'salao-bela-vista', 'trial', NOW() + INTERVAL '14 days', 'TEST-1234567890-maria', '{"theme": "light", "notifications": true}'),
-  ('22222222-2222-2222-2222-222222222222', 'carlos@studiomoderno.com', 'Carlos Oliveira', 'Studio Moderno', 'studio-moderno', 'active', NOW() + INTERVAL '30 days', 'TEST-1234567890-carlos', '{"theme": "dark", "notifications": true}'),
-  ('33333333-3333-3333-3333-333333333333', 'ana@espacobela.com', 'Ana Costa', 'Espaço Bela Arte', 'espaco-bela-arte', 'trial', NOW() + INTERVAL '5 days', 'TEST-1234567890-ana', '{"theme": "light", "notifications": false}');
+  ('11111111-1111-1111-1111-111111111111', 'maria@agendpro.demo', 'Maria Silva', 'Salão Bela Vista', 'salao-bela-vista', 'trial', NOW() + INTERVAL '14 days', 'TEST-1234567890-maria', '{"theme": "light", "notifications": true}'),
+  ('22222222-2222-2222-2222-222222222222', 'carlos@agendpro.demo', 'Carlos Oliveira', 'Studio Moderno', 'studio-moderno', 'active', NOW() + INTERVAL '30 days', 'TEST-1234567890-carlos', '{"theme": "dark", "notifications": true}'),
+  ('33333333-3333-3333-3333-333333333333', 'ana@agendpro.demo', 'Ana Costa', 'Espaço Bela Arte', 'espaco-bela-arte', 'trial', NOW() + INTERVAL '5 days', 'TEST-1234567890-ana', '{"theme": "light", "notifications": false}');