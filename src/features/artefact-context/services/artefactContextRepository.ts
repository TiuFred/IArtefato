import "server-only";

import { parseAcademicDocument } from "@/features/academic-context-engine/document-parser/documentParser";
import type { ArtefactContextView, GroupFeedbackView } from "@/features/shared/types";
import { getPrisma } from "@/services/database/prisma";
import type { AppendGroupFeedbackInput, CreateArtefactContextInput } from "./validation";

type ArtefactContextRow = {
  id: string;
  artefactName: string;
  projectContextId: string;
  activityId: string | null;
  description: string;
  wadText: string;
  wodText: string;
  expectedStructure: string;
  explicitRequirements: string[];
  implicitRequirements: string[];
  deliverables: string[];
  createdAt: Date;
  updatedAt: Date;
  projectContext: {
    id: string;
    name: string;
    discipline: string;
    description: string;
    tapText: string;
  };
  uploadedDocuments: Array<{
    id: string;
    fileName: string;
    mimeType: string;
    documentType: string;
    textContent: string;
    preview: string;
    createdAt: Date;
  }>;
  groupFeedbacks: GroupFeedbackRow[];
  correctionModels: Array<{
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
  }>;
};

type GroupFeedbackRow = {
  id: string;
  groupName: string;
  activityDescription: string;
  feedback: string;
  score: number;
  maxScore: number;
  activityId: string | null;
  artefactContextId: string;
  createdAt: Date;
};

const includeArtefactContext = {
  projectContext: {
    select: { id: true, name: true, discipline: true, description: true, tapText: true },
  },
  uploadedDocuments: true,
  groupFeedbacks: { orderBy: { createdAt: "asc" as const } },
  correctionModels: { orderBy: { generatedAt: "desc" as const }, take: 1 },
};

export async function createArtefactContext(input: CreateArtefactContextInput): Promise<ArtefactContextView> {
  const parsedDocuments = await Promise.all(input.documents.map(parseAcademicDocument));
  const row: ArtefactContextRow = await getPrisma().artefactContext.create({
    data: {
      artefactName: input.artefactName,
      projectContextId: input.projectContextId,
      activityId: input.activityId ?? null,
      description: input.description,
      wadText: input.wadText,
      wodText: input.wodText,
      expectedStructure: input.expectedStructure,
      explicitRequirements: input.explicitRequirements,
      implicitRequirements: input.implicitRequirements,
      deliverables: input.deliverables,
      uploadedDocuments: {
        create: parsedDocuments.map((doc) => ({
          fileName: doc.fileName,
          mimeType: doc.mimeType,
          documentType: doc.documentType,
          textContent: doc.textContent,
          preview: doc.preview,
        })),
      },
      groupFeedbacks: {
        create: input.groupFeedbacks.map((feedback) => ({
          groupName: feedback.groupName,
          activityDescription: feedback.activityDescription,
          feedback: feedback.feedback,
          score: feedback.score,
          maxScore: feedback.maxScore,
          activityId: feedback.activityId ?? input.activityId ?? null,
        })),
      },
    },
    include: includeArtefactContext,
  });

  return mapArtefactContext(row);
}

export async function listArtefactContexts(): Promise<ArtefactContextView[]> {
  const rows: ArtefactContextRow[] = await getPrisma().artefactContext.findMany({
    include: includeArtefactContext,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapArtefactContext);
}

export async function getArtefactContext(id: string): Promise<ArtefactContextView | null> {
  const row: ArtefactContextRow | null = await getPrisma().artefactContext.findUnique({
    where: { id },
    include: includeArtefactContext,
  });
  return row ? mapArtefactContext(row) : null;
}

export async function appendGroupFeedback(input: AppendGroupFeedbackInput): Promise<GroupFeedbackView> {
  const row: GroupFeedbackRow = await getPrisma().groupFeedback.create({
    data: {
      artefactContextId: input.artefactContextId,
      groupName: input.groupName,
      activityDescription: input.activityDescription,
      feedback: input.feedback,
      score: input.score,
      maxScore: input.maxScore,
      activityId: input.activityId ?? null,
    },
  });
  return mapGroupFeedback(row);
}

function mapArtefactContext(row: ArtefactContextRow): ArtefactContextView {
  return {
    id: row.id,
    artefactName: row.artefactName,
    projectContextId: row.projectContextId,
    activityId: row.activityId,
    description: row.description,
    wadText: row.wadText,
    wodText: row.wodText,
    expectedStructure: row.expectedStructure,
    explicitRequirements: row.explicitRequirements,
    implicitRequirements: row.implicitRequirements,
    deliverables: row.deliverables,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    projectContext: row.projectContext,
    uploadedDocuments: row.uploadedDocuments.map((doc) => ({
      ...doc,
      createdAt: doc.createdAt.toISOString(),
    })),
    groupFeedbacks: row.groupFeedbacks.map(mapGroupFeedback),
    latestModel: row.correctionModels[0]
      ? {
          id: row.correctionModels[0].id,
          artefactName: row.correctionModels[0].artefactName,
          projectContextId: row.correctionModels[0].projectContextId,
          artefactContextId: row.correctionModels[0].artefactContextId,
          inferredPrompt: row.correctionModels[0].inferredPrompt,
          inferredRules: asStringArray(row.correctionModels[0].inferredRules),
          inferredPatterns: asStringArray(row.correctionModels[0].inferredPatterns),
          detectedPenalties: asStringArray(row.correctionModels[0].detectedPenalties),
          correctionStyle: asCorrectionStyle(row.correctionModels[0].correctionStyle),
          rigorLevel: asRigorLevel(row.correctionModels[0].rigorLevel),
          confidence: row.correctionModels[0].confidence,
          groupFeedbackCount: row.correctionModels[0].groupFeedbackCount,
          generatedAt: row.correctionModels[0].generatedAt.toISOString(),
        }
      : null,
  };
}

function mapGroupFeedback(row: GroupFeedbackRow): GroupFeedbackView {
  return {
    id: row.id,
    artefactContextId: row.artefactContextId,
    groupName: row.groupName,
    activityDescription: row.activityDescription,
    feedback: row.feedback,
    score: row.score,
    maxScore: row.maxScore,
    activityId: row.activityId,
    createdAt: row.createdAt.toISOString(),
  };
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

function asRigorLevel(value: string): "low" | "medium" | "high" {
  return value === "low" || value === "medium" || value === "high" ? value : "medium";
}
