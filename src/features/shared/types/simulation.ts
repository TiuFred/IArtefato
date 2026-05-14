import type { CorrectionCaseView } from "./correction";

export interface EvaluationSimulationInput {
  subject: string;
  activityDescription: string;
  studentResponse: string;
  maxScore: number;
}

export interface EvaluationRisk {
  area: string;
  severity: "low" | "medium" | "high";
  description: string;
  suggestion: string;
}

export interface MissingRequirement {
  requirement: string;
  reason: string;
  impact: number;
}

export interface SimilarCaseView {
  id: string;
  activityDescription: string;
  score: number;
  maxScore: number;
  similarity: number;
  matchedSignals: string[];
}

export interface EvaluationSimulationOutput {
  predictedFeedback: string;
  predictedScore: number;
  maxScore: number;
  risks: EvaluationRisk[];
  missingRequirements: MissingRequirement[];
  confidence: number;
}

export interface EvaluationSimulationView extends EvaluationSimulationInput, EvaluationSimulationOutput {
  id: string;
  createdAt: string;
  combinedPseudoPrompt: string;
  similarCases: SimilarCaseView[];
}

export interface SimulationContextCase extends CorrectionCaseView {
  similarity: number;
  matchedSignals: string[];
}

