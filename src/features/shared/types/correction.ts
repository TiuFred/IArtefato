export type Severity = "low" | "medium" | "high";
export type CorrectionTone = "strict" | "moderate" | "lenient";
export type CorrectionFocus = "technical" | "conceptual" | "practical" | "mixed";
export type DetailLevel = "brief" | "detailed" | "exhaustive";

export interface CriterionDetected {
  name: string;
  weight: number;
  description: string;
  confidence: number;
  evidenceSnippet: string;
}

export interface PenaltyDetected {
  name: string;
  estimatedDeduction: number;
  description: string;
  evidenceSnippet: string;
  severity: Severity;
}

export interface CorrectionStyle {
  tone: CorrectionTone;
  focus: CorrectionFocus;
  detailLevel: DetailLevel;
  topKeywords: string[];
}

export interface TechnicalRigor {
  level: "low" | "medium" | "high";
  score: number;
  rationale: string[];
}

export interface StructuralFocus {
  level: "low" | "medium" | "high";
  score: number;
  observedAspects: string[];
}

export interface CorrectionInferenceInput {
  subject: string;
  subjects: string[];
  activityId?: string | null;
  activityDescription: string;
  studentResponse: string;
  feedbackReceived: string;
  score: number;
  maxScore: number;
}

export interface CorrectionInferenceOutput {
  criteria: CriterionDetected[];
  penalties: PenaltyDetected[];
  correctionStyle: CorrectionStyle;
  technicalRigor: TechnicalRigor;
  structuralFocus: StructuralFocus;
  pseudoPrompt: string;
  tags: string[];
  confidence: number;
}

export interface CorrectionCaseView extends CorrectionInferenceInput {
  id: string;
  createdAt: string;
  updatedAt: string;
  inference: CorrectionInferenceOutput;
}
