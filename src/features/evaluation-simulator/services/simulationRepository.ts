import "server-only";

import { Prisma } from "@prisma/client";
import { getPrisma } from "@/services/database/prisma";
import type {
  EvaluationSimulationInput,
  EvaluationSimulationOutput,
  EvaluationSimulationView,
  SimilarCaseView,
} from "@/features/shared/types";
import { evaluationSimulationSchema } from "./schemas";

export async function listSimulations(): Promise<EvaluationSimulationView[]> {
  const rows = await getPrisma().simulation.findMany({
    include: { pseudoPrompt: true },
    orderBy: { createdAt: "desc" },
  });

  return rows.map((row) =>
    mapSimulation(row, row.similarCaseIds.map((id) => ({ id })))
  );
}

export async function saveSimulation(params: {
  input: EvaluationSimulationInput;
  output: EvaluationSimulationOutput;
  combinedPseudoPrompt: string;
  similarCases: SimilarCaseView[];
}): Promise<EvaluationSimulationView> {
  const row = await getPrisma().simulation.create({
    data: {
      subject: params.input.subject,
      activityDescription: params.input.activityDescription,
      studentResponse: params.input.studentResponse,
      similarCaseIds: params.similarCases.map((item) => item.id),
      predictedFeedback: params.output.predictedFeedback,
      predictedScore: params.output.predictedScore,
      maxScore: params.output.maxScore,
      risks: toJson(params.output.risks),
      missingRequirements: toJson(params.output.missingRequirements),
      confidence: params.output.confidence,
      pseudoPrompt: {
        create: {
          content: params.combinedPseudoPrompt,
          patternSummary: toJson({
            similarCaseIds: params.similarCases.map((item) => item.id),
            similarities: params.similarCases.map((item) => item.similarity),
          }),
        },
      },
    },
    include: { pseudoPrompt: true },
  });

  return mapSimulation(row, params.similarCases);
}

type SimulationWithPrompt = Prisma.SimulationGetPayload<{
  include: { pseudoPrompt: true };
}>;

function mapSimulation(
  row: SimulationWithPrompt,
  similarCases: Array<SimilarCaseView | { id: string }>
): EvaluationSimulationView {
  const output = evaluationSimulationSchema.parse({
    predictedFeedback: row.predictedFeedback,
    predictedScore: row.predictedScore,
    maxScore: row.maxScore,
    risks: row.risks,
    missingRequirements: row.missingRequirements,
    confidence: row.confidence,
  });

  return {
    id: row.id,
    subject: row.subject,
    activityDescription: row.activityDescription,
    studentResponse: row.studentResponse,
    createdAt: row.createdAt.toISOString(),
    combinedPseudoPrompt: row.pseudoPrompt?.content ?? "",
    similarCases: similarCases.filter((item): item is SimilarCaseView => "similarity" in item),
    ...output,
  };
}

function toJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}
