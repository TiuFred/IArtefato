import "server-only";

import { getPrisma } from "@/services/database/prisma";
import type {
  EvaluationSimulationInput,
  EvaluationSimulationOutput,
  EvaluationSimulationView,
  SimilarCaseView,
} from "@/features/shared/types";
import { evaluationSimulationSchema } from "./schemas";

export async function listSimulations(): Promise<EvaluationSimulationView[]> {
  const rows: SimulationWithPrompt[] = await getPrisma().simulation.findMany({
    include: { pseudoPrompt: true },
    orderBy: { createdAt: "desc" },
  });

  return rows.map((row: SimulationWithPrompt) =>
    mapSimulation(row, row.similarCaseIds.map((id: string) => ({ id })))
  );
}

export async function saveSimulation(params: {
  input: EvaluationSimulationInput;
  output: EvaluationSimulationOutput;
  combinedPseudoPrompt: string;
  similarCases: SimilarCaseView[];
}): Promise<EvaluationSimulationView> {
  const row: SimulationWithPrompt = await getPrisma().simulation.create({
    data: {
      subject: params.input.subject,
      artefactName: params.input.artefactName ?? "",
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

type SimulationWithPrompt = {
  id: string;
  subject: string;
  artefactName: string;
  activityDescription: string;
  studentResponse: string;
  similarCaseIds: string[];
  predictedFeedback: string;
  predictedScore: number;
  maxScore: number;
  risks: unknown;
  missingRequirements: unknown;
  confidence: number;
  createdAt: Date;
  pseudoPrompt: { content: string } | null;
};

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
    artefactName: row.artefactName,
    activityDescription: row.activityDescription,
    studentResponse: row.studentResponse,
    createdAt: row.createdAt.toISOString(),
    combinedPseudoPrompt: row.pseudoPrompt?.content ?? "",
    similarCases: similarCases.filter((item): item is SimilarCaseView => "similarity" in item),
    ...output,
  };
}

function toJson(value: unknown): never {
  return value as never;
}
