/*
  # Schema do AgendPro sem tabela usuarios
  
  1. Estrutura principal
    - Usa auth.users nativo do Supabase
    - Tabelas principais: profissionais, servicos, clientes, agendamentos, horarios_funcionamento
    - Perfis de usuário armazenados em auth.users.raw_user_meta_data
  
  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas baseadas em auth.uid()
    - Acesso público para agendamentos e leitura de dados
*/

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Tabela de profissionais
CREATE TABLE IF NOT EXISTS profissionais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
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
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  profissional_id uuid REFERENCES profissionais(id) ON DELETE CASCADE,
  nome text NOT NULL,
  descricao text DEFAULT '',
  duracao integer NOT NULL DEFAULT 60,
  preco numeric(10,2) NOT NULL DEFAULT 0,
  requer_sinal boolean DEFAULT false,
  valor_sinal numeric(10,2) DEFAULT 0,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text NOT NULL,
  telefone text NOT NULL,
  email text,
  total_agendamentos integer DEFAULT 0,
  ultima_visita timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, telefone)
);

-- Tabela de agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id uuid REFERENCES clientes(id) ON DELETE CASCADE,
  servico_id uuid REFERENCES servicos(id) ON DELETE CASCADE,
  profissional_id uuid REFERENCES profissionais(id) ON DELETE CASCADE,
  data_agendamento date NOT NULL,
  hora_agendamento time NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  status_pagamento text DEFAULT 'pending' CHECK (status_pagamento IN ('pending', 'partial', 'paid')),
  valor_total numeric(10,2) NOT NULL DEFAULT 0,
  valor_sinal numeric(10,2) DEFAULT 0,
  pagamento_id text,
  observacoes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de horários de funcionamento
CREATE TABLE IF NOT EXISTS horarios_funcionamento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  dia_semana integer NOT NULL CHECK (dia_semana >= 0 AND dia_semana <= 6),
  ativo boolean DEFAULT true,
  hora_inicio time NOT NULL DEFAULT '08:00',
  hora_fim time NOT NULL DEFAULT '18:00',
  intervalos jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, dia_semana)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS profissionais_user_id_idx ON profissionais(user_id);
CREATE INDEX IF NOT EXISTS servicos_user_id_idx ON servicos(user_id);
CREATE INDEX IF NOT EXISTS servicos_profissional_id_idx ON servicos(profissional_id);
CREATE INDEX IF NOT EXISTS clientes_user_id_idx ON clientes(user_id);
CREATE INDEX IF NOT EXISTS agendamentos_user_id_idx ON agendamentos(user_id);
CREATE INDEX IF NOT EXISTS agendamentos_data_idx ON agendamentos(data_agendamento);
CREATE INDEX IF NOT EXISTS horarios_user_id_idx ON horarios_funcionamento(user_id);

-- Triggers para updated_at
CREATE TRIGGER update_profissionais_updated_at
  BEFORE UPDATE ON profissionais
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_servicos_updated_at
  BEFORE UPDATE ON servicos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at
  BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agendamentos_updated_at
  BEFORE UPDATE ON agendamentos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_horarios_updated_at
  BEFORE UPDATE ON horarios_funcionamento
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para criar horários padrão
CREATE OR REPLACE FUNCTION create_default_schedule()
RETURNS TRIGGER AS $$
BEGIN
  -- Criar horários de segunda a sexta (8h às 18h)
  INSERT INTO horarios_funcionamento (user_id, dia_semana, ativo, hora_inicio, hora_fim)
  VALUES 
    (NEW.id, 1, true, '08:00', '18:00'), -- Segunda
    (NEW.id, 2, true, '08:00', '18:00'), -- Terça
    (NEW.id, 3, true, '08:00', '18:00'), -- Quarta
    (NEW.id, 4, true, '08:00', '18:00'), -- Quinta
    (NEW.id, 5, true, '08:00', '18:00'), -- Sexta
    (NEW.id, 6, true, '08:00', '16:00'), -- Sábado
    (NEW.id, 0, false, '08:00', '18:00'); -- Domingo (desabilitado)
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para criar horários padrão quando usuário se cadastra
CREATE OR REPLACE TRIGGER create_user_schedule
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_default_schedule();

-- RLS (Row Level Security)
ALTER TABLE profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE horarios_funcionamento ENABLE ROW LEVEL SECURITY;

-- Políticas para profissionais
CREATE POLICY "Usuários podem gerenciar seus profissionais"
  ON profissionais FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Permitir leitura pública de profissionais"
  ON profissionais FOR SELECT
  TO anon
  USING (ativo = true);

-- Políticas para serviços
CREATE POLICY "Usuários podem gerenciar seus serviços"
  ON servicos FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Permitir leitura pública de serviços"
  ON servicos FOR SELECT
  TO anon
  USING (ativo = true);

-- Políticas para clientes
CREATE POLICY "Usuários podem gerenciar seus clientes"
  ON clientes FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Permitir criação de clientes públicos"
  ON clientes FOR INSERT
  TO anon
  WITH CHECK (true);

-- Políticas para agendamentos
CREATE POLICY "Usuários podem gerenciar seus agendamentos"
  ON agendamentos FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Permitir criação de agendamentos públicos"
  ON agendamentos FOR INSERT
  TO anon
  WITH CHECK (true);

-- Políticas para horários
CREATE POLICY "Usuários podem gerenciar seus horários"
  ON horarios_funcionamento FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Permitir leitura pública de horários"
  ON horarios_funcionamento FOR SELECT
  TO anon
  USING (ativo = true);