import { z } from "zod";
import { academicDocumentListSchema } from "@/features/academic-context-engine/file-processing/documentValidation";

const listFromText = z.preprocess((value) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];
  return value
    .split(/\r?\n|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}, z.array(z.string()).default([]));

export const groupFeedbackSchema = z.object({
  groupName: z.string().trim().min(1, "Informe o grupo."),
  activityDescription: z.string().trim().min(10, "Atividade obrigatoria."),
  feedback: z.string().trim().optional().default(""),
  score: z.coerce.number({ error: "Nota obrigatoria." }).min(0),
  maxScore: z.coerce.number().min(1).default(10),
  wadText: z.string().optional().default(""),
  wadFileName: z.string().optional().default(""),
  wadDocuments: academicDocumentListSchema.optional().default([]),
  feedbackDocuments: academicDocumentListSchema.optional().default([]),
  activityId: z.string().nullable().optional(),
}).superRefine((value, ctx) => {
  // Documents (base64) are no longer sent in the payload to avoid 413 errors.
  // Validation is relaxed to 1 char — the client performs stricter checks before submitting.
  const hasFeedback = value.feedback.trim().length >= 1 || value.feedbackDocuments.length > 0;
  const hasWad = value.wadText.trim().length >= 1 || value.wadDocuments.length > 0;

  if (!hasFeedback) {
    ctx.addIssue({
      code: "custom",
      path: ["feedback"],
      message: "Informe o feedback em texto ou anexe o arquivo da correcao.",
    });
  }

  if (!hasWad) {
    ctx.addIssue({
      code: "custom",
      path: ["wadText"],
      message: "Informe o WAD do grupo em texto ou por arquivo.",
    });
  }
});

export const createArtefactContextSchema = z.object({
  artefactName: z.string().trim().min(2, "Informe o nome do artefato."),
  projectContextId: z.string().trim().min(1, "Selecione o contexto do projeto."),
  activityId: z.string().nullable().optional(),
  description: z.string().trim().min(20, "Descreva o artefato."),
  wadText: z.string().trim().optional().default(""),
  wodText: z.string().trim().optional().default(""),
  expectedStructure: z.string().trim().min(10, "Informe a estrutura esperada."),
  explicitRequirements: listFromText,
  implicitRequirements: listFromText,
  deliverables: listFromText,
  documents: academicDocumentListSchema.optional().default([]),
  groupFeedbacks: z.array(groupFeedbackSchema).default([]),
});

export const appendGroupFeedbackSchema = groupFeedbackSchema.extend({
  artefactContextId: z.string().trim().min(1),
});

export type CreateArtefactContextInput = z.infer<typeof createArtefactContextSchema>;
export type AppendGroupFeedbackInput = z.infer<typeof appendGroupFeedbackSchema>;
