import { z } from "zod";
import { SUBJECTS } from "@/features/shared/subjects";

export const createCorrectionCaseSchema = z.object({
  subject: z.string().trim().min(1, "Selecione pelo menos uma matéria/professor."),
  subjects: z
    .array(z.enum(SUBJECTS as unknown as [string, ...string[]]))
    .min(1, "Selecione pelo menos uma matéria/professor."),
  activityId: z.string().nullable().optional(),
  activityDescription: z.string().trim().min(20, "Descreva a atividade com mais detalhes."),
  studentResponse: z.string().trim().min(20, "Inclua a resposta enviada pelo aluno."),
  feedbackReceived: z.string().trim().min(20, "Inclua o feedback recebido."),
  score: z.coerce.number().min(0, "A nota nao pode ser negativa."),
  maxScore: z.coerce.number().min(1, "A nota maxima deve ser maior que zero."),
});

export type CreateCorrectionCaseInput = z.infer<typeof createCorrectionCaseSchema>;
