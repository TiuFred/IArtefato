export interface CorrectionEntry {
  id: string;
  subject: string;
  activityTitle: string;
  activityDescription: string;
  studentResponse: string;
  feedback: string;
  score: number;
  maxScore: number;
  createdAt: string;
  inferredPattern?: InferredPattern;
  status: "pending" | "analyzed" | "error";
}

export interface InferredPattern {
  id: string;
  entryId: string;
  criteria: CriteriaItem[];
  penalties: PenaltyItem[];
  correctionStyle: CorrectionStyle;
  pseudoPrompt: string;
  confidence: number;
  keywords: string[];
  createdAt: string;
}

export interface CriteriaItem {
  name: string;
  weight: number;
  description: string;
  detected: boolean;
}

export interface PenaltyItem {
  name: string;
  deduction: number;
  description: string;
}

export interface CorrectionStyle {
  tone: "strict" | "moderate" | "lenient";
  focus: "technical" | "conceptual" | "practical" | "mixed";
  detailLevel: "brief" | "detailed" | "exhaustive";
  keywords: string[];
}

export interface SimulationRequest {
  activityDescription: string;
  studentResponse: string;
  similarPatterns?: InferredPattern[];
}

export interface SimulationResult {
  id: string;
  requestId: string;
  predictedScore: number;
  maxScore: number;
  predictedFeedback: string;
  missingRequirements: string[];
  riskAreas: RiskArea[];
  structuralAnalysis: StructuralAnalysis;
  similarCases: SimilarCase[];
  confidence: number;
  pseudoPromptUsed: string;
  createdAt: string;
}

export interface RiskArea {
  area: string;
  severity: "low" | "medium" | "high";
  description: string;
  suggestion: string;
}

export interface StructuralAnalysis {
  completeness: number;
  clarity: number;
  technicalDepth: number;
  formatAdherence: number;
  overallQuality: number;
}

export interface SimilarCase {
  id: string;
  title: string;
  similarity: number;
  score: number;
  subject: string;
}

export interface DashboardStats {
  totalEntries: number;
  analyzedEntries: number;
  averageScore: number;
  inferredPatterns: number;
  simulationsRun: number;
  accuracyRate: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  secondary?: number;
}
