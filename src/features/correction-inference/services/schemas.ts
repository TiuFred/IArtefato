import { z } from "zod";

export const criterionSchema = z.object({
  name: z.string().min(1),
  weight: z.number().min(0).max(100),
  description: z.string().min(1),
  confidence: z.number().min(0).max(100),
  evidenceSnippet: z.string(),
});

export const penaltySchema = z.object({
  name: z.string().min(1),
  estimatedDeduction: z.number().min(0),
  description: z.string().min(1),
  evidenceSnippet: z.string(),
  severity: z.enum(["low", "medium", "high"]),
});

export const correctionInferenceSchema = z.object({
  criteria: z.array(criterionSchema).min(1),
  penalties: z.array(penaltySchema),
  correctionStyle: z.object({
    tone: z.enum(["strict", "moderate", "lenient"]),
    focus: z.enum(["technical", "conceptual", "practical", "mixed"]),
    detailLevel: z.enum(["brief", "detailed", "exhaustive"]),
    topKeywords: z.array(z.string()),
  }),
  technicalRigor: z.object({
    level: z.enum(["low", "medium", "high"]),
    score: z.number().min(0).max(100),
    rationale: z.array(z.string()),
  }),
  structuralFocus: z.object({
    level: z.enum(["low", "medium", "high"]),
    score: z.number().min(0).max(100),
    observedAspects: z.array(z.string()),
  }),
  pseudoPrompt: z.string().min(0).default(""),
  tags: z.array(z.string()),
  confidence: z.number().min(0).max(100),
});

export type CorrectionInferenceAIResult = z.infer<typeof correctionInferenceSchema>;

