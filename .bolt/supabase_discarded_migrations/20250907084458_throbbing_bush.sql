/*
  # Inserir usuários de teste

  1. Usuários de teste
    - Criar 3 usuários com diferentes status de assinatura
    - Incluir profissionais, serviços e agendamentos de exemplo
    - Configurar horários de funcionamento padrão

  2. Dados de exemplo
    - Profissionais com especialidades
    - Serviços com preços e durações variadas
    - Clientes e agendamentos para demonstração
    - Horários de funcionamento configurados
*/

-- Inserir usuários de teste
INSERT INTO usuarios (id, email, nome, nome_studio, slug, status_assinatura, trial_termina_em, telefone, endereco, mercado_pago_key) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'maria@salaobela.com', 'Maria Silva', 'Salão Bela Vista', 'salao-bela-vista', 'trial', now() + interval '14 days', '(11) 99999-1111', 'Rua das Flores, 123 - São Paulo, SP', 'TEST-1234567890-maria'),
  ('550e8400-e29b-41d4-a716-446655440002', 'carlos@studiomoderno.com', 'Carlos Oliveira', 'Studio Moderno', 'studio-moderno', 'active', now() + interval '30 days', '(11) 99999-2222', 'Av. Paulista, 456 - São Paulo, SP', 'TEST-0987654321-carlos'),
  ('550e8400-e29b-41d4-a716-446655440003', 'ana@espacobela.com', 'Ana Costa', 'Espaço Bela Arte', 'espaco-bela-arte', 'trial', now() + interval '5 days', '(11) 99999-3333', 'Rua Augusta, 789 - São Paulo, SP', 'TEST-1122334455-ana');

-- Inserir profissionais
INSERT INTO profissionais (id, usuario_id, nome, email, telefone, especialidades, ativo) VALUES
  -- Profissionais do Salão Bela Vista (Maria)
  ('prof-001', '550e8400-e29b-41d4-a716-446655440001', 'Juliana Santos', 'juliana@salaobela.com', '(11) 98888-1111', ARRAY['Corte Feminino', 'Coloração', 'Escova'], true),
  ('prof-002', '550e8400-e29b-41d4-a716-446655440001', 'Roberto Lima', 'roberto@salaobela.com', '(11) 98888-2222', ARRAY['Corte Masculino', 'Barba', 'Bigode'], true),
  
  -- Profissionais do Studio Moderno (Carlos)
  ('prof-003', '550e8400-e29b-41d4-a716-446655440002', 'Fernanda Rocha', 'fernanda@studiomoderno.com', '(11) 97777-1111', ARRAY['Manicure', 'Pedicure', 'Nail Art'], true),
  ('prof-004', '550e8400-e29b-41d4-a716-446655440002', 'Diego Alves', 'diego@studiomoderno.com', '(11) 97777-2222', ARRAY['Massagem', 'Drenagem', 'Relaxamento'], true),
  
  -- Profissionais do Espaço Bela Arte (Ana)
  ('prof-005', '550e8400-e29b-41d4-a716-446655440003', 'Camila Ferreira', 'camila@espacobela.com', '(11) 96666-1111', ARRAY['Micropigmentação', 'Design de Sobrancelhas'], true),
  ('prof-006', '550e8400-e29b-41d4-a716-446655440003', 'Lucas Martins', 'lucas@espacobela.com', '(11) 96666-2222', ARRAY['Corte', 'Coloração', 'Tratamentos'], true);

-- Inserir serviços
INSERT INTO servicos (id, usuario_id, profissional_id, nome, descricao, duracao, preco, requer_sinal, valor_sinal, ativo) VALUES
  -- Serviços do Salão Bela Vista
  ('serv-001', '550e8400-e29b-41d4-a716-446655440001', 'prof-001', 'Corte + Lavagem Feminino', 'Corte feminino com lavagem e finalização', 60, 80.00, true, 25.00, true),
  ('serv-002', '550e8400-e29b-41d4-a716-446655440001', 'prof-001', 'Coloração Completa', 'Coloração completa com produtos premium', 180, 200.00, true, 60.00, true),
  ('serv-003', '550e8400-e29b-41d4-a716-446655440001', 'prof-001', 'Escova Progressiva', 'Escova progressiva para alisamento', 240, 350.00, true, 100.00, true),
  ('serv-004', '550e8400-e29b-41d4-a716-446655440001', 'prof-002', 'Corte Masculino', 'Corte masculino tradicional', 45, 50.00, false, 0.00, true),
  ('serv-005', '550e8400-e29b-41d4-a716-446655440001', 'prof-002', 'Barba + Bigode', 'Barba e bigode com acabamento', 30, 35.00, false, 0.00, true),
  
  -- Serviços do Studio Moderno
  ('serv-006', '550e8400-e29b-41d4-a716-446655440002', 'prof-003', 'Manicure Completa', 'Manicure com esmaltação', 60, 45.00, false, 0.00, true),
  ('serv-007', '550e8400-e29b-41d4-a716-446655440002', 'prof-003', 'Pedicure + Spa', 'Pedicure com tratamento relaxante', 90, 65.00, true, 20.00, true),
  ('serv-008', '550e8400-e29b-41d4-a716-446655440002', 'prof-003', 'Nail Art Premium', 'Decoração artística nas unhas', 120, 120.00, true, 40.00, true),
  ('serv-009', '550e8400-e29b-41d4-a716-446655440002', 'prof-004', 'Massagem Relaxante', 'Massagem corporal completa', 90, 150.00, true, 50.00, true),
  
  -- Serviços do Espaço Bela Arte
  ('serv-010', '550e8400-e29b-41d4-a716-446655440003', 'prof-005', 'Micropigmentação Sobrancelha', 'Micropigmentação fio a fio', 180, 400.00, true, 150.00, true),
  ('serv-011', '550e8400-e29b-41d4-a716-446655440003', 'prof-005', 'Design de Sobrancelhas', 'Modelagem e design profissional', 45, 60.00, false, 0.00, true),
  ('serv-012', '550e8400-e29b-41d4-a716-446655440003', 'prof-006', 'Corte + Hidratação', 'Corte com tratamento hidratante', 90, 120.00, true, 35.00, true);

-- Inserir clientes
INSERT INTO clientes (id, usuario_id, nome, telefone, email, total_agendamentos, ultima_visita) VALUES
  -- Clientes do Salão Bela Vista
  ('cli-001', '550e8400-e29b-41d4-a716-446655440001', 'Patricia Mendes', '(11) 95555-1111', 'patricia@email.com', 3, '2025-01-15'),
  ('cli-002', '550e8400-e29b-41d4-a716-446655440001', 'João Pedro', '(11) 95555-2222', 'joao@email.com', 2, '2025-01-10'),
  ('cli-003', '550e8400-e29b-41d4-a716-446655440001', 'Mariana Luz', '(11) 95555-3333', 'mariana@email.com', 5, '2025-01-18'),
  
  -- Clientes do Studio Moderno
  ('cli-004', '550e8400-e29b-41d4-a716-446655440002', 'Beatriz Almeida', '(11) 94444-1111', 'beatriz@email.com', 4, '2025-01-12'),
  ('cli-005', '550e8400-e29b-41d4-a716-446655440002', 'Rafael Santos', '(11) 94444-2222', 'rafael@email.com', 1, '2025-01-08'),
  
  -- Clientes do Espaço Bela Arte
  ('cli-006', '550e8400-e29b-41d4-a716-446655440003', 'Larissa Costa', '(11) 93333-1111', 'larissa@email.com', 2, '2025-01-14'),
  ('cli-007', '550e8400-e29b-41d4-a716-446655440003', 'Gabriel Rocha', '(11) 93333-2222', 'gabriel@email.com', 1, '2025-01-16');

-- Inserir agendamentos
INSERT INTO agendamentos (id, usuario_id, cliente_id, servico_id, profissional_id, data_agendamento, hora_agendamento, status, status_pagamento, valor_total, valor_sinal, observacoes) VALUES
  -- Agendamentos do Salão Bela Vista
  ('agend-001', '550e8400-e29b-41d4-a716-446655440001', 'cli-001', 'serv-001', 'prof-001', '2025-01-21', '10:00', 'confirmed', 'partial', 80.00, 25.00, 'Cliente preferencial'),
  ('agend-002', '550e8400-e29b-41d4-a716-446655440001', 'cli-002', 'serv-004', 'prof-002', '2025-01-21', '14:00', 'pending', 'pending', 50.00, 0.00, ''),
  ('agend-003', '550e8400-e29b-41d4-a716-446655440001', 'cli-003', 'serv-002', 'prof-001', '2025-01-22', '09:00', 'confirmed', 'partial', 200.00, 60.00, 'Coloração loiro platinado'),
  
  -- Agendamentos do Studio Moderno
  ('agend-004', '550e8400-e29b-41d4-a716-446655440002', 'cli-004', 'serv-007', 'prof-003', '2025-01-21', '15:30', 'confirmed', 'partial', 65.00, 20.00, ''),
  ('agend-005', '550e8400-e29b-41d4-a716-446655440002', 'cli-005', 'serv-009', 'prof-004', '2025-01-23', '11:00', 'pending', 'pending', 150.00, 50.00, 'Primeira vez no studio'),
  
  -- Agendamentos do Espaço Bela Arte
  ('agend-006', '550e8400-e29b-41d4-a716-446655440003', 'cli-006', 'serv-010', 'prof-005', '2025-01-24', '13:00', 'confirmed', 'partial', 400.00, 150.00, 'Micropigmentação - sessão inicial'),
  ('agend-007', '550e8400-e29b-41d4-a716-446655440003', 'cli-007', 'serv-012', 'prof-006', '2025-01-21', '16:00', 'pending', 'pending', 120.00, 35.00, '');

-- Inserir horários de funcionamento padrão para todos os usuários
INSERT INTO horarios_funcionamento (usuario_id, dia_semana, ativo, hora_inicio, hora_fim, intervalos) VALUES
  -- Horários do Salão Bela Vista (Segunda a Sábado)
  ('550e8400-e29b-41d4-a716-446655440001', 1, true, '08:00', '18:00', '[{"start": "12:00", "end": "13:00"}]'),
  ('550e8400-e29b-41d4-a716-446655440001', 2, true, '08:00', '18:00', '[{"start": "12:00", "end": "13:00"}]'),
  ('550e8400-e29b-41d4-a716-446655440001', 3, true, '08:00', '18:00', '[{"start": "12:00", "end": "13:00"}]'),
  ('550e8400-e29b-41d4-a716-446655440001', 4, true, '08:00', '18:00', '[{"start": "12:00", "end": "13:00"}]'),
  ('550e8400-e29b-41d4-a716-446655440001', 5, true, '08:00', '18:00', '[{"start": "12:00", "end": "13:00"}]'),
  ('550e8400-e29b-41d4-a716-446655440001', 6, true, '08:00', '16:00', '[]'),
  ('550e8400-e29b-41d4-a716-446655440001', 0, false, '08:00', '18:00', '[]'),
  
  -- Horários do Studio Moderno (Segunda a Sábado)
  ('550e8400-e29b-41d4-a716-446655440002', 1, true, '09:00', '19:00', '[{"start": "12:30", "end": "13:30"}]'),
  ('550e8400-e29b-41d4-a716-446655440002', 2, true, '09:00', '19:00', '[{"start": "12:30", "end": "13:30"}]'),
  ('550e8400-e29b-41d4-a716-446655440002', 3, true, '09:00', '19:00', '[{"start": "12:30", "end": "13:30"}]'),
  ('550e8400-e29b-41d4-a716-446655440002', 4, true, '09:00', '19:00', '[{"start": "12:30", "end": "13:30"}]'),
  ('550e8400-e29b-41d4-a716-446655440002', 5, true, '09:00', '19:00', '[{"start": "12:30", "end": "13:30"}]'),
  ('550e8400-e29b-41d4-a716-446655440002', 6, true, '09:00', '17:00', '[]'),
  ('550e8400-e29b-41d4-a716-446655440002', 0, false, '09:00', '19:00', '[]'),
  
  -- Horários do Espaço Bela Arte (Terça a Sábado)
  ('550e8400-e29b-41d4-a716-446655440003', 1, false, '08:00', '18:00', '[]'),
  ('550e8400-e29b-41d4-a716-446655440003', 2, true, '08:30', '17:30', '[{"start": "12:00", "end": "13:00"}]'),
  ('550e8400-e29b-41d4-a716-446655440003', 3, true, '08:30', '17:30', '[{"start": "12:00", "end": "13:00"}]'),
  ('550e8400-e29b-41d4-a716-446655440003', 4, true, '08:30', '17:30', '[{"start": "12:00", "end": "13:00"}]'),
  ('550e8400-e29b-41d4-a716-446655440003', 5, true, '08:30', '17:30', '[{"start": "12:00", "end": "13:00"}]'),
  ('550e8400-e29b-41d4-a716-446655440003', 6, true, '08:30', '16:00', '[]'),
  ('550e8400-e29b-41d4-a716-446655440003', 0, false, '08:30', '17:30', '[]');