import "server-only";

import type { ArtefactCorrectionModelOutput, ArtefactCorrectionModelView } from "@/features/shared/types";
import { getPrisma } from "@/services/database/prisma";

type ArtefactCorrectionModelRow = {
  id: string;
  artefactName: string;
  projectContextId: string;
  artefactContextId: string;
  inferredPrompt: string;
  inferredRules: unknown;
  inferredPatterns: unknown;
  detectedPenalties: unknown;
  correctionStyle: unknown;
  rigorLevel: string;
  confidence: number;
  groupFeedbackCount: number;
  generatedAt: Date;
};

export async function saveArtefactCorrectionModel(params: {
  artefactName: string;
  projectContextId: string;
  artefactContextId: string;
  output: ArtefactCorrectionModelOutput;
  groupFeedbackCount: number;
}): Promise<ArtefactCorrectionModelView> {
  const row: ArtefactCorrectionModelRow = await getPrisma().artefactCorrectionModel.create({
    data: {
      artefactName: params.artefactName,
      projectContextId: params.projectContextId,
      artefactContextId: params.artefactContextId,
      inferredPrompt: params.output.inferredPrompt,
      inferredRules: toJson(params.output.inferredRules),
      inferredPatterns: toJson(params.output.inferredPatterns),
      detectedPenalties: toJson(params.output.detectedPenalties),
      correctionStyle: toJson(params.output.correctionStyle),
      rigorLevel: params.output.rigorLevel,
      confidence: Math.round(params.output.confidence),
      groupFeedbackCount: params.groupFeedbackCount,
    },
  });

  return mapArtefactCorrectionModel(row);
}

export async function getLatestModelByArtefactName(
  artefactName: string,
  projectContextId?: string
): Promise<ArtefactCorrectionModelView | null> {
  const row: ArtefactCorrectionModelRow | null = await getPrisma().artefactCorrectionModel.findFirst({
    where: {
      artefactName: { equals: artefactName, mode: "insensitive" },
      ...(projectContextId ? { projectContextId } : {}),
    },
    orderBy: { generatedAt: "desc" },
  });
  return row ? mapArtefactCorrectionModel(row) : null;
}

export async function listArtefactCorrectionModels(artefactName?: string): Promise<ArtefactCorrectionModelView[]> {
  const rows: ArtefactCorrectionModelRow[] = await getPrisma().artefactCorrectionModel.findMany({
    where: artefactName ? { artefactName: { equals: artefactName, mode: "insensitive" } } : undefined,
    orderBy: { generatedAt: "desc" },
  });

  return rows.map(mapArtefactCorrectionModel);
}

export function mapArtefactCorrectionModel(row: ArtefactCorrectionModelRow): ArtefactCorrectionModelView {
  return {
    id: row.id,
    artefactName: row.artefactName,
    projectContextId: row.projectContextId,
    artefactContextId: row.artefactContextId,
    inferredPrompt: row.inferredPrompt,
    inferredRules: asStringArray(row.inferredRules),
    inferredPatterns: asStringArray(row.inferredPatterns),
    detectedPenalties: asStringArray(row.detectedPenalties),
    correctionStyle: asCorrectionStyle(row.correctionStyle),
    rigorLevel: row.rigorLevel === "low" || row.rigorLevel === "medium" || row.rigorLevel === "high" ? row.rigorLevel : "medium",
    confidence: row.confidence,
    groupFeedbackCount: row.groupFeedbackCount,
    generatedAt: row.generatedAt.toISOString(),
  };
}

function toJson(value: unknown): never {
  return value as never;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function asCorrectionStyle(value: unknown) {
  if (!value || typeof value !== "object") return { tone: "moderado", focus: "misto", evidence: [] };
  const data = value as { tone?: unknown; focus?: unknown; evidence?: unknown };
  return {
    tone: typeof data.tone === "string" ? data.tone : "moderado",
    focus: typeof data.focus === "string" ? data.focus : "misto",
    evidence: asStringArray(data.evidence),
  };
}
