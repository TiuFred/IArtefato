-- ============================================================
-- IArtefato — SQL Migration v4
-- Upload de documentos por correção de grupo
-- Execute no Supabase SQL Editor após a migration v3
-- ============================================================

-- 1. Novas colunas em UploadedDocument
ALTER TABLE "UploadedDocument"
  ADD COLUMN IF NOT EXISTS "contentBase64"  TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "groupFeedbackId" TEXT;

-- 2. Índice para lookup por correção de grupo
CREATE INDEX IF NOT EXISTS "UploadedDocument_groupFeedbackId_idx"
  ON "UploadedDocument" ("groupFeedbackId");

-- 3. Chave estrangeira para GroupFeedback
ALTER TABLE "UploadedDocument"
  DROP CONSTRAINT IF EXISTS "UploadedDocument_groupFeedbackId_fkey";

ALTER TABLE "UploadedDocument"
  ADD CONSTRAINT "UploadedDocument_groupFeedbackId_fkey"
  FOREIGN KEY ("groupFeedbackId") REFERENCES "GroupFeedback"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================
-- FIM DA MIGRATION v4
-- ============================================================
