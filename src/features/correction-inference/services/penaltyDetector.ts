import { PENALTY_DEFINITIONS } from "./dictionaries";
import { collectEvidence, countKeywordMatches } from "./textAnalysis";
import type { CorrectionInferenceInput, PenalizacaoDetectada } from "./types";

export function detectPenalties(input: CorrectionInferenceInput): PenalizacaoDetectada[] {
  const notaMaxima = input.notaMaxima ?? 10;
  const scoreGap = Math.max(0, notaMaxima - input.nota);
  const scoreRatio = notaMaxima > 0 ? input.nota / notaMaxima : 0;

  const detected = PENALTY_DEFINITIONS.map((definition) => {
    const matches = countKeywordMatches(input.feedback, definition.triggers);
    if (matches === 0) return null;

    const matchBoost = Math.min(1.4, 1 + (matches - 1) * 0.2);
    const descontoEstimado = Math.min(scoreGap, definition.descontoBase * matchBoost);

    return {
      nome: definition.nome,
      descricao: definition.descricao,
      severidade: definition.severidade,
      descontoEstimado: Number(descontoEstimado.toFixed(2)),
      evidencias: collectEvidence(input.feedback, definition.triggers),
    };
  }).filter((penalty): penalty is PenalizacaoDetectada => penalty !== null);

  if (detected.length === 0 && scoreRatio < 0.7) {
    return [
      {
        nome: "Perda geral de qualidade",
        descricao: "Nota baixa sem gatilho textual especifico; penalizacao generica simulada.",
        severidade: "media",
        descontoEstimado: Number(scoreGap.toFixed(2)),
        evidencias: [input.feedback.slice(0, 140)].filter(Boolean),
      },
    ];
  }

  return detected;
}

