-- Criação da tabela de bloqueios de horário
CREATE TABLE IF NOT EXISTS bloqueios_horario (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  motivo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Garantir que o horário de início seja anterior ao horário de fim
  CONSTRAINT hora_inicio_antes_fim CHECK (hora_inicio < hora_fim)
);

-- Índices para melhorar a performance das consultas
CREATE INDEX IF NOT EXISTS idx_bloqueios_profissional ON bloqueios_horario(profissional_id);
CREATE INDEX IF NOT EXISTS idx_bloqueios_data ON bloqueios_horario(data);