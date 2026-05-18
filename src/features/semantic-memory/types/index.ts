export interface SemanticMemoryRecord {
  id: string;
  atividade: string;
  resposta: string;
  feedback: string;
  nota: number;
  notaMaxima: number;
  pseudoPrompt: string;
  padroesDetectados: string[];
  tags: string[];
  data: string;
}

export interface CreateSemanticMemoryRecordInput {
  atividade: string;
  resposta: string;
  feedback: string;
  nota: number;
  notaMaxima?: number;
  pseudoPrompt: string;
  padroesDetectados: string[];
  tags?: string[];
  data?: string;
}

export interface SemanticSearchQuery {
  texto: string;
  tags?: string[];
  limite?: number;
  notaMinima?: number;
  notaMaxima?: number;
}

export interface SimilarityBreakdown {
  lexical: number;
  tags: number;
  padroes: number;
  nota: number;
}

export interface SemanticSearchResult {
  registro: SemanticMemoryRecord;
  similaridade: number;
  breakdown: SimilarityBreakdown;
  motivos: string[];
}

export interface SemanticMemorySnapshot {
  registros: SemanticMemoryRecord[];
  total: number;
  tags: string[];
  atualizadoEm: string;
}

