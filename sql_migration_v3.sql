-- ============================================================
-- IArtefato — SQL Migration v3
-- Novas funcionalidades: WAD por grupo + alocação de alunos
-- Execute no Supabase SQL Editor após a migration v2
-- ============================================================

-- 1. Novas colunas em GroupFeedback
ALTER TABLE "GroupFeedback"
  ADD COLUMN IF NOT EXISTS "wadText"     TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "wadFileName" TEXT NOT NULL DEFAULT '';

-- 2. GroupMember — alocação de alunos a grupos
CREATE TABLE IF NOT EXISTS "GroupMember" (
  "id"               TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "userId"           TEXT        NOT NULL,
  "groupName"        TEXT        NOT NULL,
  "projectContextId" TEXT        NOT NULL,
  "createdAt"        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "GroupMember_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "GroupMember_user_fkey"
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE,
  CONSTRAINT "GroupMember_project_fkey"
    FOREIGN KEY ("projectContextId") REFERENCES "ProjectContext" ("id") ON DELETE CASCADE,
  CONSTRAINT "GroupMember_userId_projectContextId_key"
    UNIQUE ("userId", "projectContextId")
);

CREATE INDEX IF NOT EXISTS "GroupMember_userId_idx"           ON "GroupMember" ("userId");
CREATE INDEX IF NOT EXISTS "GroupMember_groupName_idx"        ON "GroupMember" ("groupName");
CREATE INDEX IF NOT EXISTS "GroupMember_projectContextId_idx" ON "GroupMember" ("projectContextId");

-- ============================================================
-- FIM DA MIGRATION v3
-- ============================================================
