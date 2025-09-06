/*
  # Schema inicial do Beauty Agenda

  1. Novas Tabelas
    - `usuarios` - Dados dos usuários/profissionais
    - `servicos` - Serviços oferecidos
    - `profissionais` - Profissionais do estúdio
    - `agendamentos` - Agendamentos dos clientes
    - `clientes` - Dados dos clientes

  2. Segurança
    - Habilitar RLS em todas as tabelas
    - Políticas de acesso baseadas em autenticação
    - Controle de acesso por usuário

  3. Funcionalidades
    - Sistema de assinatura
    - Controle de trial
    - Status de pagamentos
    - Slugs personalizados
*/

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários (profissionais/estúdios)
CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  email text UNIQUE NOT NULL,
  nome text NOT NULL,
  nome_studio text NOT NULL,
  telefone text,
  endereco text,
  slug text UNIQUE NOT NULL,
  status_assinatura text DEFAULT 'trial' CHECK (status_assinatura IN ('trial', 'active', 'past_due', 'canceled')),
  trial_termina_em timestamptz DEFAULT (now() + interval '7 days'),
  assinatura_id text,
  mercado_pago_key text,
  configuracoes jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de profissionais
CREATE TABLE IF NOT EXISTS profissionais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  nome text NOT NULL,
  email text,
  telefone text,
  especialidades text[] DEFAULT '{}',
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de serviços
CREATE TABLE IF NOT EXISTS servicos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  profissional_id uuid REFERENCES profissionais(id) ON DELETE CASCADE,
  nome text NOT NULL,
  descricao text DEFAULT '',
  duracao integer NOT NULL DEFAULT 60,
  preco decimal(10,2) NOT NULL DEFAULT 0,
  requer_sinal boolean DEFAULT false,
  valor_sinal decimal(10,2) DEFAULT 0,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  nome text NOT NULL,
  telefone text NOT NULL,
  email text,
  total_agendamentos integer DEFAULT 0,
  ultima_visita timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(usuario_id, telefone)
);

-- Tabela de agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  cliente_id uuid REFERENCES clientes(id) ON DELETE CASCADE,
  servico_id uuid REFERENCES servicos(id) ON DELETE CASCADE,
  profissional_id uuid REFERENCES profissionais(id) ON DELETE CASCADE,
  data_agendamento date NOT NULL,
  hora_agendamento time NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  status_pagamento text DEFAULT 'pending' CHECK (status_pagamento IN ('pending', 'partial', 'paid')),
  valor_total decimal(10,2) NOT NULL DEFAULT 0,
  valor_sinal decimal(10,2) DEFAULT 0,
  pagamento_id text,
  observacoes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de horários de funcionamento
CREATE TABLE IF NOT EXISTS horarios_funcionamento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  dia_semana integer NOT NULL CHECK (dia_semana >= 0 AND dia_semana <= 6),
  ativo boolean DEFAULT true,
  hora_inicio time NOT NULL DEFAULT '08:00',
  hora_fim time NOT NULL DEFAULT '18:00',
  intervalos jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(usuario_id, dia_semana)
);

-- Habilitar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE horarios_funcionamento ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios
CREATE POLICY "Usuários podem ver seus próprios dados"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seus próprios dados"
  ON usuarios
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Políticas para profissionais
CREATE POLICY "Usuários podem gerenciar seus profissionais"
  ON profissionais
  FOR ALL
  TO authenticated
  USING (usuario_id = auth.uid());

-- Políticas para serviços
CREATE POLICY "Usuários podem gerenciar seus serviços"
  ON servicos
  FOR ALL
  TO authenticated
  USING (usuario_id = auth.uid());

-- Políticas para clientes
CREATE POLICY "Usuários podem gerenciar seus clientes"
  ON clientes
  FOR ALL
  TO authenticated
  USING (usuario_id = auth.uid());

-- Políticas para agendamentos
CREATE POLICY "Usuários podem gerenciar seus agendamentos"
  ON agendamentos
  FOR ALL
  TO authenticated
  USING (usuario_id = auth.uid());

-- Políticas para horários
CREATE POLICY "Usuários podem gerenciar seus horários"
  ON horarios_funcionamento
  FOR ALL
  TO authenticated
  USING (usuario_id = auth.uid());

-- Políticas públicas para agendamento online
CREATE POLICY "Permitir leitura pública de dados para agendamento"
  ON usuarios
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Permitir leitura pública de profissionais"
  ON profissionais
  FOR SELECT
  TO anon
  USING (ativo = true);

CREATE POLICY "Permitir leitura pública de serviços"
  ON servicos
  FOR SELECT
  TO anon
  USING (ativo = true);

CREATE POLICY "Permitir leitura pública de horários"
  ON horarios_funcionamento
  FOR SELECT
  TO anon
  USING (ativo = true);

-- Permitir inserção de agendamentos por usuários anônimos
CREATE POLICY "Permitir criação de agendamentos públicos"
  ON agendamentos
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Permitir criação de clientes públicos"
  ON clientes
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Funções auxiliares
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profissionais_updated_at BEFORE UPDATE ON profissionais FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_servicos_updated_at BEFORE UPDATE ON servicos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agendamentos_updated_at BEFORE UPDATE ON agendamentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_horarios_updated_at BEFORE UPDATE ON horarios_funcionamento FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para criar perfil de usuário após signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO usuarios (id, email, nome, nome_studio, slug)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'nome_studio', 'Meu Estúdio'),
    COALESCE(NEW.raw_user_meta_data->>'slug', LOWER(REPLACE(NEW.email, '@', '-')))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Inserir horários padrão para novos usuários
CREATE OR REPLACE FUNCTION create_default_schedule()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir horários de segunda a sexta (1-5)
  FOR i IN 1..5 LOOP
    INSERT INTO horarios_funcionamento (usuario_id, dia_semana, ativo, hora_inicio, hora_fim)
    VALUES (NEW.id, i, true, '08:00', '18:00');
  END LOOP;
  
  -- Sábado com horário reduzido
  INSERT INTO horarios_funcionamento (usuario_id, dia_semana, ativo, hora_inicio, hora_fim)
  VALUES (NEW.id, 6, true, '08:00', '16:00');
  
  -- Domingo fechado
  INSERT INTO horarios_funcionamento (usuario_id, dia_semana, ativo, hora_inicio, hora_fim)
  VALUES (NEW.id, 0, false, '08:00', '18:00');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER create_user_schedule
  AFTER INSERT ON usuarios
  FOR EACH ROW EXECUTE FUNCTION create_default_schedule();