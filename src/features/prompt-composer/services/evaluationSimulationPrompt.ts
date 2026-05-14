import type { EvaluationSimulationInput, SimulationContextCase } from "@/features/shared/types";

export function composeEvaluationSimulationPrompt(params: {
  input: EvaluationSimulationInput;
  contextCases: SimulationContextCase[];
  combinedPseudoPrompt: string;
}): string {
  const context = params.contextCases
    .map((item, index) => {
      return `CASO ${index + 1} | similaridade ${item.similarity}%
Atividade: ${item.activityDescription}
Nota observada: ${item.score}/${item.maxScore}
Feedback observado: ${item.feedbackReceived}
Pseudo-prompt inferido: ${item.inference.pseudoPrompt}
Padroes: ${item.inference.criteria.map((criterion) => criterion.name).join(", ")}`;
    })
    .join("\n\n");

  return `Voce trabalha para o IArtefato.

Tarefa: simular como uma IA avaliadora de professor provavelmente reagiria a uma nova resposta, usando memoria de padroes inferidos anteriormente.
O objetivo nao e ser uma IA corretora generica; e reutilizar padroes de correcao observados.

NOVA ATIVIDADE:
${params.input.activityDescription}

NOVA RESPOSTA DO ALUNO:
${params.input.studentResponse}

MEMORIA DE CASOS SIMILARES:
${context || "Nenhum caso similar disponivel."}

PSEUDO-PROMPT CONTEXTUAL COMBINADO:
${params.combinedPseudoPrompt}

Retorne apenas JSON valido, sem markdown, neste formato:
{
  "predictedFeedback": "feedback previsto em portugues brasileiro",
  "predictedScore": 0,
  "maxScore": ${params.input.maxScore},
  "risks": [
    {
      "area": "area de risco",
      "severity": "low|medium|high",
      "description": "por que isso pode reduzir a nota",
      "suggestion": "como reduzir o risco"
    }
  ],
  "missingRequirements": [
    {
      "requirement": "criterio ou requisito possivelmente faltante",
      "reason": "evidencia da ausencia",
      "impact": 0
    }
  ],
  "confidence": 0
}

Regras:
- predictedScore deve estar entre 0 e ${params.input.maxScore}.
- Baseie a previsao principalmente nos casos similares e nos pseudo-prompts combinados.
- Explique riscos e requisitos faltantes sem alegar conhecer o prompt real.
- Nao exponha chaves, variaveis de ambiente nem detalhes internos.`;
}

