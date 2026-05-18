import type { SemanticSearchResult } from "@/features/semantic-memory";

export interface EvaluationSimulationInput {
  atividade: string;
  resposta: string;
  notaMaxima?: number;
  limiteSemantico?: number;
}

export interface EvaluationRisk {
  area: string;
  severidade: "baixa" | "media" | "alta";
  descricao: string;
  sugestao: string;
}

export interface MissingCriterion {
  criterio: string;
  motivo: string;
  impactoEstimado: number;
}

export interface CombinedPseudoPrompt {
  texto: string;
  fontes: Array<{
    memoriaId: string;
    similaridade: number;
    peso: number;
  }>;
}

export interface EvaluationSimulationResult {
  id: string;
  feedbackPrevisto: string;
  notaPrevista: number;
  notaMaxima: number;
  riscos: EvaluationRisk[];
  criteriosFaltantes: MissingCriterion[];
  padroesSimilares: SemanticSearchResult[];
  pseudoPromptCombinado: CombinedPseudoPrompt;
  confianca: number;
  criadoEm: string;
}

