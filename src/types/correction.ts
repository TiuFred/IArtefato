// ─── Input do usuário ────────────────────────────────────────────────────────

export interface CorrectionInput {
  subject: string;           // disciplina
  activityTitle: string;     // nome da atividade
  activityDescription: string; // enunciado
  studentResponse: string;   // resposta enviada
  feedbackReceived: string;  // feedback que a IA deu
  score: number;             // nota recebida
  maxScore: number;          // nota máxima
}

// ─── Resultado da inferência ──────────────────────────────────────────────────

export interface CriterionDetected {
  name: string;
  weight: number;            // peso relativo 0-100
  description: string;
  confidence: number;        // 0-100
  evidenceSnippet: string;   // trecho do feedback que embasou a detecção
}

export interface PenaltyDetected {
  name: string;
  estimatedDeduction: number; // ex: 1.5
  description: string;
  evidenceSnippet: string;
  severity: "low" | "medium" | "high";
}

export type CorrectionTone = "strict" | "moderate" | "lenient";
export type CorrectionFocus = "technical" | "conceptual" | "practical" | "mixed";
export type DetailLevel = "brief" | "detailed" | "exhaustive";

export interface CorrectionStyle {
  tone: CorrectionTone;
  focus: CorrectionFocus;
  detailLevel: DetailLevel;
  topKeywords: string[];
}

export interface InferredPattern {
  id: string;
  criteria: CriterionDetected[];
  penalties: PenaltyDetected[];
  style: CorrectionStyle;
  pseudoPrompt: string;
  confidence: number;        // confiança geral 0-100
  inferredAt: string;
}

// ─── Entrada completa na base ─────────────────────────────────────────────────

export interface CorrectionEntry {
  id: string;
  input: CorrectionInput;
  pattern: InferredPattern;
  createdAt: string;
}

// ─── Estado do formulário ─────────────────────────────────────────────────────

export interface CorrectionFormState {
  subject: string;
  activityTitle: string;
  activityDescription: string;
  studentResponse: string;
  feedbackReceived: string;
  score: string;
  maxScore: string;
}

export const EMPTY_FORM: CorrectionFormState = {
  subject: "",
  activityTitle: "",
  activityDescription: "",
  studentResponse: "",
  feedbackReceived: "",
  score: "",
  maxScore: "10",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const TONE_LABELS: Record<CorrectionTone, string> = {
  strict: "Rigoroso",
  moderate: "Moderado",
  lenient: "Flexível",
};

export const FOCUS_LABELS: Record<CorrectionFocus, string> = {
  technical: "Técnico",
  conceptual: "Conceitual",
  practical: "Prático",
  mixed: "Misto",
};

export const DETAIL_LABELS: Record<DetailLevel, string> = {
  brief: "Breve",
  detailed: "Detalhado",
  exhaustive: "Exaustivo",
};
