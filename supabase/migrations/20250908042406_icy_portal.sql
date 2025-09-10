/*
  # Inserir usuários de teste para AgendPro

  1. Usuários
    - Maria Silva (trial ativo)
    - Carlos Oliveira (assinatura ativa) 
    - Ana Costa (trial expirando)

  2. Profissionais para cada usuário
  3. Serviços variados
  4. Clientes de exemplo
  5. Agendamentos de teste
  6. Horários de funcionamento
*/

-- Inserir usuários de teste
INSERT INTO usuarios (id, email, nome, nome_studio, telefone, endereco, slug, status_assinatura, trial_termina_em, configuracoes, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'maria@agendpro.demo', 'Maria Silva', 'Salão Bela Vista', '(11) 99999-1111', 'Rua das Flores, 123 - São Paulo, SP', 'salao-bela-vista', 'trial', NOW() + INTERVAL '14 days', '{}', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'carlos@agendpro.demo', 'Carlos Oliveira', 'Studio Moderno', '(11) 99999-2222', 'Av. Paulista, 456 - São Paulo, SP', 'studio-moderno', 'active', NOW() + INTERVAL '30 days', '{}', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'ana@agendpro.demo', 'Ana Costa', 'Espaço Bela Arte', '(11) 99999-3333', 'Rua Augusta, 789 - São Paulo, SP', 'espaco-bela-arte', 'trial', NOW() + INTERVAL '5 days', '{}', NOW(), NOW());

-- Inserir profissionais
INSERT INTO profissionais (id, usuario_id, nome, email, telefone, especialidades, ativo, created_at, updated_at) VALUES
-- Profissionais do Salão Bela Vista (Maria)
('prof-001', '550e8400-e29b-41d4-a716-446655440001', 'Juliana Santos', 'juliana@agendpro.demo', '(11) 98888-1111', ARRAY['Corte Feminino', 'Coloração', 'Escova'], true, NOW(), NOW()),
('prof-002', '550e8400-e29b-41d4-a716-446655440001', 'Roberto Lima', 'roberto@agendpro.demo', '(11) 98888-1112', ARRAY['Corte Masculino', 'Barba', 'Bigode'], true, NOW(), NOW()),

-- Profissionais do Studio Moderno (Carlos)
('prof-003', '550e8400-e29b-41d4-a716-446655440002', 'Fernanda Costa', 'fernanda@agendpro.demo', '(11) 98888-2221', ARRAY['Manicure', 'Pedicure', 'Nail Art'], true, NOW(), NOW()),
('prof-004', '550e8400-e29b-41d4-a716-446655440002', 'Diego Alves', 'diego@agendpro.demo', '(11) 98888-2222', ARRAY['Massagem', 'Relaxamento', 'Drenagem'], true, NOW(), NOW()),

-- Profissionais do Espaço Bela Arte (Ana)
('prof-005', '550e8400-e29b-41d4-a716-446655440003', 'Camila Rodrigues', 'camila@agendpro.demo', '(11) 98888-3331', ARRAY['Micropigmentação', 'Design de Sobrancelhas'], true, NOW(), NOW()),
('prof-006', '550e8400-e29b-41d4-a716-446655440003', 'Lucas Ferreira', 'lucas@agendpro.demo', '(11) 98888-3332', ARRAY['Corte Moderno', 'Coloração Masculina'], true, NOW(), NOW());

-- Inserir serviços
INSERT INTO servicos (id, usuario_id, profissional_id, nome, descricao, duracao, preco, requer_sinal, valor_sinal, ativo, created_at, updated_at) VALUES
-- Serviços do Salão Bela Vista
('serv-001', '550e8400-e29b-41d4-a716-446655440001', 'prof-001', 'Corte + Escova', 'Corte feminino com lavagem e escova modeladora', 90, 85.00, true, 30.00, true, NOW(), NOW()),
('serv-002', '550e8400-e29b-41d4-a716-446655440001', 'prof-001', 'Coloração Completa', 'Coloração com produtos premium e tratamento', 180, 220.00, true, 80.00, true, NOW(), NOW()),
('serv-003', '550e8400-e29b-41d4-a716-446655440001', 'prof-001', 'Luzes + Matização', 'Mechas com matização personalizada', 240, 280.00, true, 100.00, true, NOW(), NOW()),
('serv-004', '550e8400-e29b-41d4-a716-446655440001', 'prof-002', 'Corte Masculino', 'Corte moderno com acabamento perfeito', 45, 50.00, false, 0.00, true, NOW(), NOW()),
('serv-005', '550e8400-e29b-41d4-a716-446655440001', 'prof-002', 'Barba + Bigode', 'Barba e bigode com navalha e produtos premium', 30, 35.00, false, 0.00, true, NOW(), NOW()),

-- Serviços do Studio Moderno
('serv-006', '550e8400-e29b-41d4-a716-446655440002', 'prof-003', 'Manicure Completa', 'Manicure com esmaltação e hidratação', 60, 45.00, false, 0.00, true, NOW(), NOW()),
('serv-007', '550e8400-e29b-41d4-a716-446655440002', 'prof-003', 'Nail Art Premium', 'Nail art personalizada com técnicas avançadas', 90, 80.00, true, 25.00, true, NOW(), NOW()),
('serv-008', '550e8400-e29b-41d4-a716-446655440002', 'prof-004', 'Massagem Relaxante', 'Massagem corporal completa 60min', 60, 120.00, true, 40.00, true, NOW(), NOW()),
('serv-009', '550e8400-e29b-41d4-a716-446655440002', 'prof-004', 'Drenagem Linfática', 'Drenagem linfática manual especializada', 90, 150.00, true, 50.00, true, NOW(), NOW()),

-- Serviços do Espaço Bela Arte
('serv-010', '550e8400-e29b-41d4-a716-446655440003', 'prof-005', 'Micropigmentação Sobrancelha', 'Micropigmentação fio a fio natural', 120, 400.00, true, 150.00, true, NOW(), NOW()),
('serv-011', '550e8400-e29b-41d4-a716-446655440003', 'prof-005', 'Design de Sobrancelhas', 'Design personalizado com henna', 45, 60.00, false, 0.00, true, NOW(), NOW()),
('serv-012', '550e8400-e29b-41d4-a716-446655440003', 'prof-006', 'Corte + Coloração', 'Corte moderno com coloração personalizada', 150, 180.00, true, 60.00, true, NOW(), NOW());

-- Inserir clientes
INSERT INTO clientes (id, usuario_id, nome, telefone, email, total_agendamentos, ultima_visita, created_at, updated_at) VALUES
-- Clientes do Salão Bela Vista
('cli-001', '550e8400-e29b-41d4-a716-446655440001', 'Patricia Mendes', '(11) 97777-1111', 'patricia@email.com', 3, '2025-01-15', NOW(), NOW()),
('cli-002', '550e8400-e29b-41d4-a716-446655440001', 'João Pedro', '(11) 97777-1112', 'joao@email.com', 2, '2025-01-10', NOW(), NOW()),

-- Clientes do Studio Moderno
('cli-003', '550e8400-e29b-41d4-a716-446655440002', 'Carla Souza', '(11) 97777-2221', 'carla@email.com', 4, '2025-01-18', NOW(), NOW()),
('cli-004', '550e8400-e29b-41d4-a716-446655440002', 'Ricardo Santos', '(11) 97777-2222', 'ricardo@email.com', 1, '2025-01-12', NOW(), NOW()),

-- Clientes do Espaço Bela Arte
('cli-005', '550e8400-e29b-41d4-a716-446655440003', 'Mariana Lima', '(11) 97777-3331', 'mariana@email.com', 2, '2025-01-16', NOW(), NOW()),
('cli-006', '550e8400-e29b-41d4-a716-446655440003', 'Felipe Costa', '(11) 97777-3332', 'felipe@email.com', 1, '2025-01-14', NOW(), NOW()),
('cli-007', '550e8400-e29b-41d4-a716-446655440003', 'Amanda Silva', '(11) 97777-3333', 'amanda@email.com', 3, '2025-01-19', NOW(), NOW());

-- Inserir agendamentos
INSERT INTO agendamentos (id, usuario_id, cliente_id, servico_id, profissional_id, data_agendamento, hora_agendamento, status, status_pagamento, valor_total, valor_sinal, observacoes, created_at, updated_at) VALUES
-- Agendamentos do Salão Bela Vista
('agend-001', '550e8400-e29b-41d4-a716-446655440001', 'cli-001', 'serv-001', 'prof-001', '2025-01-21', '10:00', 'confirmed', 'partial', 85.00, 30.00, 'Cliente preferencial', NOW(), NOW()),
('agend-002', '550e8400-e29b-41d4-a716-446655440001', 'cli-002', 'serv-004', 'prof-002', '2025-01-21', '14:00', 'pending', 'pending', 50.00, 0.00, '', NOW(), NOW()),
('agend-003', '550e8400-e29b-41d4-a716-446655440001', 'cli-001', 'serv-002', 'prof-001', '2025-01-22', '09:00', 'confirmed', 'partial', 220.00, 80.00, 'Coloração loiro', NOW(), NOW()),

-- Agendamentos do Studio Moderno
('agend-004', '550e8400-e29b-41d4-a716-446655440002', 'cli-003', 'serv-007', 'prof-003', '2025-01-21', '15:00', 'confirmed', 'partial', 80.00, 25.00, 'Nail art floral', NOW(), NOW()),
('agend-005', '550e8400-e29b-41d4-a716-446655440002', 'cli-004', 'serv-008', 'prof-004', '2025-01-22', '11:00', 'pending', 'pending', 120.00, 40.00, 'Primeira vez', NOW(), NOW()),

-- Agendamentos do Espaço Bela Arte
('agend-006', '550e8400-e29b-41d4-a716-446655440003', 'cli-005', 'serv-010', 'prof-005', '2025-01-23', '10:00', 'confirmed', 'partial', 400.00, 150.00, 'Micropigmentação retoque', NOW(), NOW()),
('agend-007', '550e8400-e29b-41d4-a716-446655440003', 'cli-007', 'serv-012', 'prof-006', '2025-01-21', '16:00', 'pending', 'pending', 180.00, 60.00, 'Mudança de visual', NOW(), NOW());

-- Inserir horários de funcionamento para todos os usuários
INSERT INTO horarios_funcionamento (id, usuario_id, dia_semana, ativo, hora_inicio, hora_fim, intervalos, created_at, updated_at) VALUES
-- Horários do Salão Bela Vista (Segunda a Sábado)
('hora-001-0', '550e8400-e29b-41d4-a716-446655440001', 1, true, '08:00', '18:00', '[{"start": "12:00", "end": "13:00"}]', NOW(), NOW()),
('hora-001-1', '550e8400-e29b-41d4-a716-446655440001', 2, true, '08:00', '18:00', '[{"start": "12:00", "end": "13:00"}]', NOW(), NOW()),
('hora-001-2', '550e8400-e29b-41d4-a716-446655440001', 3, true, '08:00', '18:00', '[{"start": "12:00", "end": "13:00"}]', NOW(), NOW()),
('hora-001-3', '550e8400-e29b-41d4-a716-446655440001', 4, true, '08:00', '18:00', '[{"start": "12:00", "end": "13:00"}]', NOW(), NOW()),
('hora-001-4', '550e8400-e29b-41d4-a716-446655440001', 5, true, '08:00', '18:00', '[{"start": "12:00", "end": "13:00"}]', NOW(), NOW()),
('hora-001-5', '550e8400-e29b-41d4-a716-446655440001', 6, true, '08:00', '16:00', '[]', NOW(), NOW()),
('hora-001-6', '550e8400-e29b-41d4-a716-446655440001', 0, false, '08:00', '18:00', '[]', NOW(), NOW()),

-- Horários do Studio Moderno (Segunda a Sábado)
('hora-002-0', '550e8400-e29b-41d4-a716-446655440002', 1, true, '09:00', '19:00', '[{"start": "13:00", "end": "14:00"}]', NOW(), NOW()),
('hora-002-1', '550e8400-e29b-41d4-a716-446655440002', 2, true, '09:00', '19:00', '[{"start": "13:00", "end": "14:00"}]', NOW(), NOW()),
('hora-002-2', '550e8400-e29b-41d4-a716-446655440002', 3, true, '09:00', '19:00', '[{"start": "13:00", "end": "14:00"}]', NOW(), NOW()),
('hora-002-3', '550e8400-e29b-41d4-a716-446655440002', 4, true, '09:00', '19:00', '[{"start": "13:00", "end": "14:00"}]', NOW(), NOW()),
('hora-002-4', '550e8400-e29b-41d4-a716-446655440002', 5, true, '09:00', '19:00', '[{"start": "13:00", "end": "14:00"}]', NOW(), NOW()),
('hora-002-5', '550e8400-e29b-41d4-a716-446655440002', 6, true, '09:00', '17:00', '[]', NOW(), NOW()),
('hora-002-6', '550e8400-e29b-41d4-a716-446655440002', 0, false, '09:00', '19:00', '[]', NOW(), NOW()),

-- Horários do Espaço Bela Arte (Terça a Sábado)
('hora-003-0', '550e8400-e29b-41d4-a716-446655440003', 1, false, '10:00', '20:00', '[]', NOW(), NOW()),
('hora-003-1', '550e8400-e29b-41d4-a716-446655440003', 2, true, '10:00', '20:00', '[{"start": "14:00", "end": "15:00"}]', NOW(), NOW()),
('hora-003-2', '550e8400-e29b-41d4-a716-446655440003', 3, true, '10:00', '20:00', '[{"start": "14:00", "end": "15:00"}]', NOW(), NOW()),
('hora-003-3', '550e8400-e29b-41d4-a716-446655440003', 4, true, '10:00', '20:00', '[{"start": "14:00", "end": "15:00"}]', NOW(), NOW()),
('hora-003-4', '550e8400-e29b-41d4-a716-446655440003', 5, true, '10:00', '20:00', '[{"start": "14:00", "end": "15:00"}]', NOW(), NOW()),
('hora-003-5', '550e8400-e29b-41d4-a716-446655440003', 6, true, '10:00', '18:00', '[]', NOW(), NOW()),
('hora-003-6', '550e8400-e29b-41d4-a716-446655440003', 0, false, '10:00', '20:00', '[]', NOW(), NOW());