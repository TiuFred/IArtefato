import type { SemanticSearchResult } from "@/features/semantic-memory";
import type { MissingCriterion } from "../types";
import { hasAnyKeyword } from "./inputAnalyzer";
import { CRITERION_KEYWORDS } from "./simulatorDictionaries";

export function detectMissingCriteria(
  resposta: string,
  similarResults: SemanticSearchResult[]
): MissingCriterion[] {
  const expectedCriteria = Array.from(
    new Set(
      similarResults
        .flatMap((result) => result.registro.padroesDetectados)
        .filter((criterion) => criterion !== "Resposta incompleta")
    )
  );

  return expectedCriteria
    .filter((criterion) => {
      const keywords = CRITERION_KEYWORDS[criterion] ?? [criterion];
      return !hasAnyKeyword(resposta, keywords);
    })
    .map((criterion) => ({
      criterio: criterion,
      motivo: `A memoria similar costuma avaliar "${criterion}", mas a resposta tem poucos sinais desse criterio.`,
      impactoEstimado: estimateImpact(criterion),
    }));
}

function estimateImpact(criterion: string): number {
  if (criterion === "Qualidade tecnica" || criterion === "Atendimento ao enunciado") return 1.5;
  if (criterion === "Testes e validacao" || criterion === "Modelagem") return 1.2;
  return 0.8;
}

