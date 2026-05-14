-- Add multi-subject and selected activity context to correction cases
ALTER TABLE "CorrectionCase" ADD COLUMN IF NOT EXISTS "subjects" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "CorrectionCase" ADD COLUMN IF NOT EXISTS "activityId" TEXT;

-- Backfill subjects from existing single subject values
UPDATE "CorrectionCase"
SET "subjects" = ARRAY["subject"]
WHERE cardinality("subjects") = 0 AND "subject" IS NOT NULL;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CorrectionCase_subjects_idx" ON "CorrectionCase"("subjects");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CorrectionCase_activityId_idx" ON "CorrectionCase"("activityId");

