import { z } from "zod";

export const evaluationSimulationSchema = z.object({
  predictedFeedback: z.string().min(20),
  predictedScore: z.number().min(0),
  maxScore: z.number().min(1),
  risks: z.array(
    z.object({
      area: z.string().min(1),
      severity: z.enum(["low", "medium", "high"]),
      description: z.string().min(1),
      suggestion: z.string().min(1),
    })
  ),
  missingRequirements: z.array(
    z.object({
      requirement: z.string().min(1),
      reason: z.string().min(1),
      impact: z.number().min(0),
    })
  ),
  confidence: z.number().min(0).max(100),
});

export type EvaluationSimulationAIResult = z.infer<typeof evaluationSimulationSchema>;

