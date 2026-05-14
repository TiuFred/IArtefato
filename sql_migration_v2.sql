-- ============================================================
-- IArtefato — SQL Migration v2
-- Novas tabelas: Artefact Correction Models
-- Execute no Supabase SQL Editor após a migration v1
-- ============================================================

-- 1. Novas colunas em tabelas existentes (se ainda não existirem)
ALTER TABLE "CorrectionCase"
  ADD COLUMN IF NOT EXISTS "subjects"  TEXT[]    NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "activityId" TEXT;

ALTER TABLE "Activity"
  ADD COLUMN IF NOT EXISTS "updatedAt"  TIMESTAMPTZ NOT NULL DEFAULT now();

-- 2. ProjectContext
CREATE TABLE IF NOT EXISTS "ProjectContext" (
  "id"          TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "name"        TEXT        NOT NULL,
  "discipline"  TEXT        NOT NULL DEFAULT '',
  "description" TEXT        NOT NULL,
  "tapText"     TEXT        NOT NULL DEFAULT '',
  "globalRules" JSONB       NOT NULL DEFAULT '{}',
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "ProjectContext_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ProjectContext_name_idx"      ON "ProjectContext" ("name");
CREATE INDEX IF NOT EXISTS "ProjectContext_createdAt_idx" ON "ProjectContext" ("createdAt");

-- 3. ArtefactContext
CREATE TABLE IF NOT EXISTS "ArtefactContext" (
  "id"                   TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "artefactName"         TEXT        NOT NULL,
  "projectContextId"     TEXT        NOT NULL,
  "activityId"           TEXT,
  "description"          TEXT        NOT NULL,
  "wadText"              TEXT        NOT NULL DEFAULT '',
  "wodText"              TEXT        NOT NULL DEFAULT '',
  "expectedStructure"    TEXT        NOT NULL DEFAULT '',
  "explicitRequirements" TEXT[]      NOT NULL DEFAULT '{}',
  "implicitRequirements" TEXT[]      NOT NULL DEFAULT '{}',
  "deliverables"         TEXT[]      NOT NULL DEFAULT '{}',
  "createdAt"            TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"            TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "ArtefactContext_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ArtefactContext_project_fkey"
    FOREIGN KEY ("projectContextId") REFERENCES "ProjectContext" ("id") ON DELETE CASCADE,
  CONSTRAINT "ArtefactContext_activity_fkey"
    FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "ArtefactContext_artefactName_idx"     ON "ArtefactContext" ("artefactName");
CREATE INDEX IF NOT EXISTS "ArtefactContext_projectContextId_idx" ON "ArtefactContext" ("projectContextId");
CREATE INDEX IF NOT EXISTS "ArtefactContext_activityId_idx"       ON "ArtefactContext" ("activityId");

-- 4. UploadedDocument
CREATE TABLE IF NOT EXISTS "UploadedDocument" (
  "id"                TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "fileName"          TEXT        NOT NULL,
  "mimeType"          TEXT        NOT NULL,
  "documentType"      TEXT        NOT NULL,
  "textContent"       TEXT        NOT NULL,
  "preview"           TEXT        NOT NULL DEFAULT '',
  "projectContextId"  TEXT,
  "artefactContextId" TEXT,
  "createdAt"         TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "UploadedDocument_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "UploadedDocument_project_fkey"
    FOREIGN KEY ("projectContextId") REFERENCES "ProjectContext" ("id") ON DELETE CASCADE,
  CONSTRAINT "UploadedDocument_artefact_fkey"
    FOREIGN KEY ("artefactContextId") REFERENCES "ArtefactContext" ("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "UploadedDocument_documentType_idx"      ON "UploadedDocument" ("documentType");
CREATE INDEX IF NOT EXISTS "UploadedDocument_projectContextId_idx"  ON "UploadedDocument" ("projectContextId");
CREATE INDEX IF NOT EXISTS "UploadedDocument_artefactContextId_idx" ON "UploadedDocument" ("artefactContextId");

-- 5. GroupFeedback
CREATE TABLE IF NOT EXISTS "GroupFeedback" (
  "id"                  TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "groupName"           TEXT        NOT NULL,
  "activityDescription" TEXT        NOT NULL,
  "feedback"            TEXT        NOT NULL,
  "score"               FLOAT8      NOT NULL,
  "maxScore"            FLOAT8      NOT NULL DEFAULT 10,
  "artefactContextId"   TEXT        NOT NULL,
  "activityId"          TEXT,
  "correctionCaseId"    TEXT        UNIQUE,
  "createdAt"           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "GroupFeedback_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "GroupFeedback_artefact_fkey"
    FOREIGN KEY ("artefactContextId") REFERENCES "ArtefactContext" ("id") ON DELETE CASCADE,
  CONSTRAINT "GroupFeedback_activity_fkey"
    FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE SET NULL,
  CONSTRAINT "GroupFeedback_case_fkey"
    FOREIGN KEY ("correctionCaseId") REFERENCES "CorrectionCase" ("id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "GroupFeedback_artefactContextId_idx" ON "GroupFeedback" ("artefactContextId");
CREATE INDEX IF NOT EXISTS "GroupFeedback_activityId_idx"        ON "GroupFeedback" ("activityId");
CREATE INDEX IF NOT EXISTS "GroupFeedback_groupName_idx"         ON "GroupFeedback" ("groupName");

-- 6. ArtefactCorrectionModel
CREATE TABLE IF NOT EXISTS "ArtefactCorrectionModel" (
  "id"                TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "artefactName"      TEXT        NOT NULL,
  "projectContextId"  TEXT        NOT NULL,
  "artefactContextId" TEXT        NOT NULL,
  "inferredPrompt"    TEXT        NOT NULL,
  "inferredRules"     JSONB       NOT NULL DEFAULT '[]',
  "inferredPatterns"  JSONB       NOT NULL DEFAULT '[]',
  "detectedPenalties" JSONB       NOT NULL DEFAULT '[]',
  "correctionStyle"   JSONB       NOT NULL DEFAULT '{}',
  "rigorLevel"        TEXT        NOT NULL DEFAULT 'medium',
  "confidence"        INT         NOT NULL DEFAULT 0,
  "groupFeedbackCount" INT        NOT NULL DEFAULT 0,
  "generatedAt"       TIMESTAMPTZ NOT NULL DEFAULT now(),
  "createdAt"         TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"         TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "ArtefactCorrectionModel_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ArtefactCorrectionModel_project_fkey"
    FOREIGN KEY ("projectContextId") REFERENCES "ProjectContext" ("id") ON DELETE CASCADE,
  CONSTRAINT "ArtefactCorrectionModel_artefact_fkey"
    FOREIGN KEY ("artefactContextId") REFERENCES "ArtefactContext" ("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "ArtefactCorrectionModel_artefactName_idx"     ON "ArtefactCorrectionModel" ("artefactName");
CREATE INDEX IF NOT EXISTS "ArtefactCorrectionModel_projectContextId_idx" ON "ArtefactCorrectionModel" ("projectContextId");
CREATE INDEX IF NOT EXISTS "ArtefactCorrectionModel_artefactContextId_idx" ON "ArtefactCorrectionModel" ("artefactContextId");
CREATE INDEX IF NOT EXISTS "ArtefactCorrectionModel_generatedAt_idx"      ON "ArtefactCorrectionModel" ("generatedAt");

-- 7. updatedAt triggers para novas tabelas
DROP TRIGGER IF EXISTS "ProjectContext_updatedAt_trigger"         ON "ProjectContext";
DROP TRIGGER IF EXISTS "ArtefactContext_updatedAt_trigger"        ON "ArtefactContext";
DROP TRIGGER IF EXISTS "ArtefactCorrectionModel_updatedAt_trigger" ON "ArtefactCorrectionModel";

CREATE TRIGGER "ProjectContext_updatedAt_trigger"
  BEFORE UPDATE ON "ProjectContext"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER "ArtefactContext_updatedAt_trigger"
  BEFORE UPDATE ON "ArtefactContext"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER "ArtefactCorrectionModel_updatedAt_trigger"
  BEFORE UPDATE ON "ArtefactCorrectionModel"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- FIM DA MIGRATION v2
-- ============================================================
