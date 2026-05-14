CREATE TABLE IF NOT EXISTS "ProjectContext" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "discipline" TEXT NOT NULL DEFAULT '',
  "description" TEXT NOT NULL,
  "tapText" TEXT NOT NULL DEFAULT '',
  "globalRules" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProjectContext_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ArtefactContext" (
  "id" TEXT NOT NULL,
  "artefactName" TEXT NOT NULL,
  "projectContextId" TEXT NOT NULL,
  "activityId" TEXT,
  "description" TEXT NOT NULL,
  "wadText" TEXT NOT NULL DEFAULT '',
  "wodText" TEXT NOT NULL DEFAULT '',
  "expectedStructure" TEXT NOT NULL DEFAULT '',
  "explicitRequirements" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "implicitRequirements" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "deliverables" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ArtefactContext_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "UploadedDocument" (
  "id" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "documentType" TEXT NOT NULL,
  "textContent" TEXT NOT NULL,
  "preview" TEXT NOT NULL,
  "projectContextId" TEXT,
  "artefactContextId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UploadedDocument_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "GroupFeedback" (
  "id" TEXT NOT NULL,
  "groupName" TEXT NOT NULL,
  "activityDescription" TEXT NOT NULL,
  "feedback" TEXT NOT NULL,
  "score" DOUBLE PRECISION NOT NULL,
  "maxScore" DOUBLE PRECISION NOT NULL DEFAULT 10,
  "artefactContextId" TEXT NOT NULL,
  "activityId" TEXT,
  "correctionCaseId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GroupFeedback_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ArtefactCorrectionModel" (
  "id" TEXT NOT NULL,
  "artefactName" TEXT NOT NULL,
  "projectContextId" TEXT NOT NULL,
  "artefactContextId" TEXT NOT NULL,
  "inferredPrompt" TEXT NOT NULL,
  "inferredRules" JSONB NOT NULL,
  "inferredPatterns" JSONB NOT NULL,
  "detectedPenalties" JSONB NOT NULL,
  "correctionStyle" JSONB NOT NULL,
  "rigorLevel" TEXT NOT NULL,
  "confidence" INTEGER NOT NULL,
  "groupFeedbackCount" INTEGER NOT NULL DEFAULT 0,
  "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ArtefactCorrectionModel_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Simulation" ADD COLUMN IF NOT EXISTS "artefactName" TEXT NOT NULL DEFAULT '';

CREATE UNIQUE INDEX IF NOT EXISTS "GroupFeedback_correctionCaseId_key" ON "GroupFeedback"("correctionCaseId");
CREATE INDEX IF NOT EXISTS "ProjectContext_name_idx" ON "ProjectContext"("name");
CREATE INDEX IF NOT EXISTS "ProjectContext_createdAt_idx" ON "ProjectContext"("createdAt");
CREATE INDEX IF NOT EXISTS "ArtefactContext_artefactName_idx" ON "ArtefactContext"("artefactName");
CREATE INDEX IF NOT EXISTS "ArtefactContext_projectContextId_idx" ON "ArtefactContext"("projectContextId");
CREATE INDEX IF NOT EXISTS "ArtefactContext_activityId_idx" ON "ArtefactContext"("activityId");
CREATE INDEX IF NOT EXISTS "UploadedDocument_documentType_idx" ON "UploadedDocument"("documentType");
CREATE INDEX IF NOT EXISTS "UploadedDocument_projectContextId_idx" ON "UploadedDocument"("projectContextId");
CREATE INDEX IF NOT EXISTS "UploadedDocument_artefactContextId_idx" ON "UploadedDocument"("artefactContextId");
CREATE INDEX IF NOT EXISTS "GroupFeedback_artefactContextId_idx" ON "GroupFeedback"("artefactContextId");
CREATE INDEX IF NOT EXISTS "GroupFeedback_activityId_idx" ON "GroupFeedback"("activityId");
CREATE INDEX IF NOT EXISTS "GroupFeedback_groupName_idx" ON "GroupFeedback"("groupName");
CREATE INDEX IF NOT EXISTS "ArtefactCorrectionModel_artefactName_idx" ON "ArtefactCorrectionModel"("artefactName");
CREATE INDEX IF NOT EXISTS "ArtefactCorrectionModel_projectContextId_idx" ON "ArtefactCorrectionModel"("projectContextId");
CREATE INDEX IF NOT EXISTS "ArtefactCorrectionModel_artefactContextId_idx" ON "ArtefactCorrectionModel"("artefactContextId");
CREATE INDEX IF NOT EXISTS "ArtefactCorrectionModel_generatedAt_idx" ON "ArtefactCorrectionModel"("generatedAt");
CREATE INDEX IF NOT EXISTS "Simulation_artefactName_idx" ON "Simulation"("artefactName");

ALTER TABLE "ArtefactContext"
  ADD CONSTRAINT "ArtefactContext_projectContextId_fkey"
  FOREIGN KEY ("projectContextId") REFERENCES "ProjectContext"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ArtefactContext"
  ADD CONSTRAINT "ArtefactContext_activityId_fkey"
  FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "UploadedDocument"
  ADD CONSTRAINT "UploadedDocument_projectContextId_fkey"
  FOREIGN KEY ("projectContextId") REFERENCES "ProjectContext"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UploadedDocument"
  ADD CONSTRAINT "UploadedDocument_artefactContextId_fkey"
  FOREIGN KEY ("artefactContextId") REFERENCES "ArtefactContext"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "GroupFeedback"
  ADD CONSTRAINT "GroupFeedback_artefactContextId_fkey"
  FOREIGN KEY ("artefactContextId") REFERENCES "ArtefactContext"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "GroupFeedback"
  ADD CONSTRAINT "GroupFeedback_activityId_fkey"
  FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "GroupFeedback"
  ADD CONSTRAINT "GroupFeedback_correctionCaseId_fkey"
  FOREIGN KEY ("correctionCaseId") REFERENCES "CorrectionCase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ArtefactCorrectionModel"
  ADD CONSTRAINT "ArtefactCorrectionModel_projectContextId_fkey"
  FOREIGN KEY ("projectContextId") REFERENCES "ProjectContext"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ArtefactCorrectionModel"
  ADD CONSTRAINT "ArtefactCorrectionModel_artefactContextId_fkey"
  FOREIGN KEY ("artefactContextId") REFERENCES "ArtefactContext"("id") ON DELETE CASCADE ON UPDATE CASCADE;
