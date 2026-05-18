import type { SemanticSearchResult } from "@/features/semantic-memory";
import type { EvaluationRisk, MissingCriterion } from "../types";

export function detectEvaluationRisks(params: {
  atividade: string;
  resposta: string;
  similarResults: SemanticSearchResult[];
  missingCriteria: MissingCriterion[];
}): EvaluationRisk[] {
  const risks: EvaluationRisk[] = params.missingCriteria.map((criterion) => ({
    area: criterion.criterio,
    severidade: criterion.impactoEstimado >= 1.2 ? "media" : "baixa",
    descricao: criterion.motivo,
    sugestao: `Reforce evidencias de ${criterion.criterio.toLowerCase()} antes de enviar.`,
  }));

  const bestSimilarity = params.similarResults[0]?.similaridade ?? 0;
  if (bestSimilarity < 35) {
    risks.push({
      area: "Baixa correspondencia historica",
      severidade: "media",
      descricao: "A memoria mockada encontrou poucos casos realmente parecidos.",
      sugestao: "Use a previsao como sinal fraco e cadastre mais correcoes similares na base.",
    });
  }

  if (params.resposta.length < Math.min(450, params.atividade.length * 0.6)) {
    risks.push({
      area: "Completude da resposta",
      severidade: "alta",
      descricao: "A resposta parece curta em relacao ao enunciado e pode deixar requisitos sem evidencia.",
      sugestao: "Inclua implementacao, justificativas e exemplos concretos dos pontos pedidos.",
    });
  }

  return mergeRisks(risks).slice(0, 5);
}

function mergeRisks(risks: EvaluationRisk[]): EvaluationRisk[] {
  const byArea = new Map<string, EvaluationRisk>();

  for (const risk of risks) {
    if (!byArea.has(risk.area)) byArea.set(risk.area, risk);
  }

  return Array.from(byArea.values());
}

