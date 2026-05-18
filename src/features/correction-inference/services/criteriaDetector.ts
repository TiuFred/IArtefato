import { CRITERIA_DEFINITIONS } from "./dictionaries";
import { collectEvidence, countKeywordMatches } from "./textAnalysis";
import type { CorrectionInferenceInput, CriterioDetectado } from "./types";

export function detectCriteria(input: CorrectionInferenceInput): CriterioDetectado[] {
  const combinedText = `${input.descricaoAtividade}\n${input.respostaAluno}\n${input.feedback}`;

  const detected = CRITERIA_DEFINITIONS.map((definition) => {
    const feedbackMatches = countKeywordMatches(input.feedback, definition.keywords);
    const activityMatches = countKeywordMatches(input.descricaoAtividade, definition.keywords);
    const responseMatches = countKeywordMatches(input.respostaAluno, definition.keywords);
    const relevance = feedbackMatches * 3 + activityMatches * 2 + responseMatches;

    if (relevance === 0) return null;

    return {
      nome: definition.nome,
      descricao: definition.descricao,
      confianca: Math.min(96, 42 + relevance * 11),
      peso: 0,
      evidencias: collectEvidence(combinedText, definition.keywords),
    };
  }).filter((criterion): criterion is CriterioDetectado => criterion !== null);

  if (detected.length === 0) {
    return [
      {
        nome: "Qualidade geral",
        descricao: "Avaliacao geral inferida por ausencia de sinais textuais especificos.",
        confianca: 45,
        peso: 100,
        evidencias: [input.feedback.slice(0, 140)].filter(Boolean),
      },
    ];
  }

  const confidenceSum = detected.reduce((sum, criterion) => sum + criterion.confianca, 0);
  const weighted = detected.map((criterion) => ({
    ...criterion,
    peso: Math.round((criterion.confianca / confidenceSum) * 100),
  }));

  const roundingGap = 100 - weighted.reduce((sum, criterion) => sum + criterion.peso, 0);
  if (weighted[0]) weighted[0].peso += roundingGap;

  return weighted;
}

