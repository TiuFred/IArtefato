export type NivelInferido = "baixo" | "medio" | "alto";
export type TomCorrecao = "rigoroso" | "moderado" | "flexivel";
export type FocoCorrecao = "tecnico" | "conceitual" | "pratico" | "misto";
export type NivelDetalhe = "breve" | "detalhado" | "exaustivo";

export interface CorrectionInferenceInput {
  descricaoAtividade: string;
  respostaAluno: string;
  feedback: string;
  nota: number;
  notaMaxima?: number;
  disciplina?: string;
  tituloAtividade?: string;
}

export interface CriterioDetectado {
  nome: string;
  peso: number;
  descricao: string;
  confianca: number;
  evidencias: string[];
}

export interface PenalizacaoDetectada {
  nome: string;
  descontoEstimado: number;
  severidade: "baixa" | "media" | "alta";
  descricao: string;
  evidencias: string[];
}

export interface RigorTecnico {
  nivel: NivelInferido;
  pontuacao: number;
  justificativas: string[];
}

export interface FocoEstrutural {
  nivel: NivelInferido;
  pontuacao: number;
  aspectosObservados: string[];
}

export interface EstiloCorrecao {
  tom: TomCorrecao;
  foco: FocoCorrecao;
  nivelDetalhe: NivelDetalhe;
  palavrasChave: string[];
}

export interface CorrectionInferenceOutput {
  pseudoPrompt: string;
  criteriosDetectados: CriterioDetectado[];
  penalizacoesDetectadas: PenalizacaoDetectada[];
  rigorTecnico: RigorTecnico;
  focoEstrutural: FocoEstrutural;
  estiloCorrecao: EstiloCorrecao;
}

