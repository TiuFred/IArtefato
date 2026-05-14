import "server-only";

import { Prisma } from "@prisma/client";
import { getPrisma } from "@/services/database/prisma";
import type { CorrectionCaseView, CorrectionInferenceOutput } from "@/features/shared/types";
import { correctionInferenceSchema } from "./schemas";
import type { CreateCorrectionCaseInput } from "./validation";

export async function listCorrectionCases(subject?: string): Promise<CorrectionCaseView[]> {
  const rows = await getPrisma().correctionCase.findMany({
    where: subject ? { subject } : undefined,
    include: { pseudoPrompt: true },
    orderBy: { createdAt: "desc" },
  });

  return rows.map(mapCorrectionCase);
}

export async function getCorrectionCase(id: string): Promise<CorrectionCaseView | null> {
  const row = await getPrisma().correctionCase.findUnique({
    where: { id },
    include: { pseudoPrompt: true },
  });

  return row ? mapCorrectionCase(row) : null;
}

export async function deleteCorrectionCase(id: string): Promise<void> {
  await getPrisma().correctionCase.delete({ where: { id } });
}

export async function saveCorrectionCase(params: {
  input: CreateCorrectionCaseInput;
  inference: CorrectionInferenceOutput;
}): Promise<CorrectionCaseView> {
  const row = await getPrisma().correctionCase.create({
    data: {
      subject: params.input.subject,
      subjects: params.input.subjects,
      activityId: params.input.activityId ?? null,
      activityDescription: params.input.activityDescription,
      studentResponse: params.input.studentResponse,
      feedbackReceived: params.input.feedbackReceived,
      score: params.input.score,
      maxScore: params.input.maxScore,
      criteria: toJson(params.inference.criteria),
      penalties: toJson(params.inference.penalties),
      correctionStyle: toJson(params.inference.correctionStyle),
      technicalRigor: toJson(params.inference.technicalRigor),
      structuralFocus: toJson(params.inference.structuralFocus),
      tags: params.inference.tags,
      confidence: params.inference.confidence,
      pseudoPrompt: {
        create: {
          content: params.inference.pseudoPrompt,
          patternSummary: toJson({
            subject: params.input.subject,
            subjects: params.input.subjects,
            activityId: params.input.activityId ?? null,
            criteria: params.inference.criteria.map((criterion) => criterion.name),
            penalties: params.inference.penalties.map((penalty) => penalty.name),
            style: params.inference.correctionStyle,
          }),
        },
      },
    },
    include: { pseudoPrompt: true },
  });

  return mapCorrectionCase(row);
}

type CorrectionCaseWithPrompt = Prisma.CorrectionCaseGetPayload<{
  include: { pseudoPrompt: true };
}>;

function mapCorrectionCase(row: CorrectionCaseWithPrompt): CorrectionCaseView {
  const inference = correctionInferenceSchema.parse({
    criteria: row.criteria,
    penalties: row.penalties,
    correctionStyle: row.correctionStyle,
    technicalRigor: row.technicalRigor,
    structuralFocus: row.structuralFocus,
    pseudoPrompt: row.pseudoPrompt?.content ?? "",
    tags: row.tags,
    confidence: row.confidence,
  });

  return {
    id: row.id,
    subject: row.subject,
    subjects: row.subjects.length > 0 ? row.subjects : [row.subject],
    activityId: row.activityId,
    activityDescription: row.activityDescription,
    studentResponse: row.studentResponse,
    feedbackReceived: row.feedbackReceived,
    score: row.score,
    maxScore: row.maxScore,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    inference,
  };
}

function toJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}
