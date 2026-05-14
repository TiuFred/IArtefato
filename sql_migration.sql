-- ============================================================
-- IArtefato — SQL Migration
-- Execute no Supabase SQL Editor em ordem
-- ============================================================

-- 1. Tabela de usuários
CREATE TABLE IF NOT EXISTS "User" (
  "id"        TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "email"     TEXT        NOT NULL,
  "password"  TEXT        NOT NULL,
  "name"      TEXT        NOT NULL DEFAULT '',
  "isAdmin"   BOOLEAN     NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "User_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "User_email_key" UNIQUE ("email")
);

CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User" ("email");

-- 2. Tabela de atividades predefinidas
CREATE TABLE IF NOT EXISTS "Activity" (
  "id"          TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "subject"     TEXT        NOT NULL,
  "title"       TEXT        NOT NULL,
  "description" TEXT        NOT NULL,
  "maxScore"    FLOAT8      NOT NULL DEFAULT 10,
  "isActive"    BOOLEAN     NOT NULL DEFAULT true,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Activity_subject_idx" ON "Activity" ("subject");
CREATE INDEX IF NOT EXISTS "Activity_isActive_idx" ON "Activity" ("isActive");

-- 3. Trigger para atualizar updatedAt automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "Activity_updatedAt_trigger" ON "Activity";
CREATE TRIGGER "Activity_updatedAt_trigger"
  BEFORE UPDATE ON "Activity"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Adicionar coluna subject nas tabelas existentes (se ainda não existir)
ALTER TABLE "CorrectionCase"
  ADD COLUMN IF NOT EXISTS "subject" TEXT NOT NULL DEFAULT 'Geral';

ALTER TABLE "Simulation"
  ADD COLUMN IF NOT EXISTS "subject" TEXT NOT NULL DEFAULT 'Geral';

CREATE INDEX IF NOT EXISTS "CorrectionCase_subject_idx" ON "CorrectionCase" ("subject");
CREATE INDEX IF NOT EXISTS "Simulation_subject_idx"     ON "Simulation"     ("subject");

-- 5. Conta admin inicial
-- Email: admin@iartefato.com | Senha: admin123
-- IMPORTANTE: troque a senha logo após o primeiro login
INSERT INTO "User" ("id", "email", "password", "name", "isAdmin", "createdAt")
VALUES (
  gen_random_uuid()::text,
  'admin@iartefato.com',
  '$2b$10$3bhAviRoTMFIkiTTsE2mS.u2vIvLmK6inrpAKTklybrtNTT1StWDK',
  'Administrador',
  true,
  now()
)
ON CONFLICT ("email") DO NOTHING;

-- ============================================================
-- FIM DA MIGRATION
-- ============================================================
