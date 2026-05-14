import { z } from "zod";
import { SUBJECTS } from "@/features/shared/subjects";

export const createSimulationSchema = z.object({
  subject: z.enum(SUBJECTS as unknown as [string, ...string[]], {
    message: "Selecione uma matéria.",
  }),
  activityDescription: z.string().trim().min(20, "Descreva a atividade com mais detalhes."),
  studentResponse: z.string().trim().min(20, "Inclua a resposta que deseja simular."),
  maxScore: z.coerce.number().min(1, "A nota maxima deve ser maior que zero.").default(10),
});

export type CreateSimulationInput = z.infer<typeof createSimulationSchema>;
