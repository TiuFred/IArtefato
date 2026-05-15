ALTER TABLE "UploadedDocument"
  ADD COLUMN IF NOT EXISTS "contentBase64" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "groupFeedbackId" TEXT;

CREATE INDEX IF NOT EXISTS "UploadedDocument_groupFeedbackId_idx"
  ON "UploadedDocument"("groupFeedbackId");

ALTER TABLE "UploadedDocument"
  ADD CONSTRAINT "UploadedDocument_groupFeedbackId_fkey"
  FOREIGN KEY ("groupFeedbackId") REFERENCES "GroupFeedback"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
