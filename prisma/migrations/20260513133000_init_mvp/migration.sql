-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "CorrectionCase" (
    "id" TEXT NOT NULL,
    "activityDescription" TEXT NOT NULL,
    "studentResponse" TEXT NOT NULL,
    "feedbackReceived" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "maxScore" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "criteria" JSONB NOT NULL,
    "penalties" JSONB NOT NULL,
    "correctionStyle" JSONB NOT NULL,
    "technicalRigor" JSONB NOT NULL,
    "structuralFocus" JSONB NOT NULL,
    "tags" TEXT[],
    "confidence" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CorrectionCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PseudoPrompt" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "patternSummary" JSONB NOT NULL,
    "correctionCaseId" TEXT,
    "simulationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PseudoPrompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Simulation" (
    "id" TEXT NOT NULL,
    "activityDescription" TEXT NOT NULL,
    "studentResponse" TEXT NOT NULL,
    "similarCaseIds" TEXT[],
    "predictedFeedback" TEXT NOT NULL,
    "predictedScore" DOUBLE PRECISION NOT NULL,
    "maxScore" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "risks" JSONB NOT NULL,
    "missingRequirements" JSONB NOT NULL,
    "confidence" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Simulation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CorrectionCase_createdAt_idx" ON "CorrectionCase"("createdAt");

-- CreateIndex
CREATE INDEX "CorrectionCase_tags_idx" ON "CorrectionCase"("tags");

-- CreateIndex
CREATE UNIQUE INDEX "PseudoPrompt_correctionCaseId_key" ON "PseudoPrompt"("correctionCaseId");

-- CreateIndex
CREATE UNIQUE INDEX "PseudoPrompt_simulationId_key" ON "PseudoPrompt"("simulationId");

-- CreateIndex
CREATE INDEX "Simulation_createdAt_idx" ON "Simulation"("createdAt");

-- AddForeignKey
ALTER TABLE "PseudoPrompt" ADD CONSTRAINT "PseudoPrompt_correctionCaseId_fkey" FOREIGN KEY ("correctionCaseId") REFERENCES "CorrectionCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PseudoPrompt" ADD CONSTRAINT "PseudoPrompt_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "Simulation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

