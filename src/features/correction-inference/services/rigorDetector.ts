import { TECHNICAL_KEYWORDS } from "./dictionaries";
import { clampScore, collectEvidence, countKeywordMatches, inferLevel } from "./textAnalysis";
import type { CorrectionInferenceInput, RigorTecnico } from "./types";

const STRICTNESS_KEYWORDS = ["deve", "necessario", "obrigatorio", "exige", "precisa", "incorreto"];

export function detectTechnicalRigor(input: CorrectionInferenceInput): RigorTecnico {
  const notaMaxima = input.notaMaxima ?? 10;
  const scoreRatio = notaMaxima > 0 ? input.nota / notaMaxima : 0;
  const technicalMatches = countKeywordMatches(input.feedback, TECHNICAL_KEYWORDS);
  const strictnessMatches = countKeywordMatches(input.feedback, STRICTNESS_KEYWORDS);
  const scorePressure = scoreRatio < 0.7 ? 18 : scoreRatio < 0.85 ? 8 : 0;
  const pontuacao = clampScore(technicalMatches * 12 + strictnessMatches * 10 + scorePressure);
  const evidences = collectEvidence(input.feedback, [...TECHNICAL_KEYWORDS, ...STRICTNESS_KEYWORDS], 3);

  return {
    nivel: inferLevel(pontuacao),
    pontuacao,
    justificativas:
      evidences.length > 0
        ? evidences
        : ["Poucos sinais tecnicos explicitos foram encontrados no feedback."],
  };
}

