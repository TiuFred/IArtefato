import { STRUCTURAL_KEYWORDS } from "./dictionaries";
import { clampScore, collectEvidence, countKeywordMatches, inferLevel } from "./textAnalysis";
import type { CorrectionInferenceInput, FocoEstrutural } from "./types";

export function detectStructuralFocus(input: CorrectionInferenceInput): FocoEstrutural {
  const structuralMatches = countKeywordMatches(input.feedback, STRUCTURAL_KEYWORDS);
  const activityMatches = countKeywordMatches(input.descricaoAtividade, STRUCTURAL_KEYWORDS);
  const responseLengthSignal = input.respostaAluno.length > 800 ? 8 : input.respostaAluno.length > 300 ? 4 : 0;
  const pontuacao = clampScore(structuralMatches * 15 + activityMatches * 8 + responseLengthSignal);
  const evidences = collectEvidence(
    `${input.descricaoAtividade}\n${input.feedback}`,
    STRUCTURAL_KEYWORDS,
    3
  );

  return {
    nivel: inferLevel(pontuacao),
    pontuacao,
    aspectosObservados:
      evidences.length > 0
        ? evidences
        : ["A estrutura foi inferida apenas por sinais fracos de tamanho e organizacao textual."],
  };
}

