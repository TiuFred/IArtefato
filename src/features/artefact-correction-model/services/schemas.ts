import { z } from "zod";

export const artefactCorrectionModelSchema = z.object({
  inferredPrompt: z.string(),
  inferredRules: z.array(z.string()).default([]),
  inferredPatterns: z.array(z.string()).default([]),
  detectedPenalties: z.array(z.string()).default([]),
  correctionStyle: z.object({
    tone: z.string(),
    focus: z.string(),
    evidence: z.array(z.string()).default([]),
  }),
  rigorLevel: z.enum(["low", "medium", "high"]),
  confidence: z.number().min(0).max(100),
});
