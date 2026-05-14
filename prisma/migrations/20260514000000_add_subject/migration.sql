-- Add subject column to CorrectionCase
ALTER TABLE "CorrectionCase" ADD COLUMN IF NOT EXISTS "subject" TEXT NOT NULL DEFAULT 'Geral';

-- Add subject column to Simulation
ALTER TABLE "Simulation" ADD COLUMN IF NOT EXISTS "subject" TEXT NOT NULL DEFAULT 'Geral';

-- Add indexes
CREATE INDEX IF NOT EXISTS "CorrectionCase_subject_idx" ON "CorrectionCase"("subject");
CREATE INDEX IF NOT EXISTS "Simulation_subject_idx" ON "Simulation"("subject");
