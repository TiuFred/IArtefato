import { z } from "zod";
import { academicDocumentListSchema } from "@/features/academic-context-engine/file-processing/documentValidation";

export const createProjectContextSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do projeto."),
  discipline: z.string().trim().optional().default(""),
  description: z.string().trim().min(20, "Descreva o contexto do projeto/TAP."),
  tapText: z.string().trim().optional().default(""),
  documents: academicDocumentListSchema.optional().default([]),
});

export type CreateProjectContextInput = z.infer<typeof createProjectContextSchema>;
