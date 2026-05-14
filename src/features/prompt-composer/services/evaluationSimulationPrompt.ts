import type { ArtefactCorrectionModelView, EvaluationSimulationInput, SimulationContextCase } from "@/features/shared/types";

export function composeEvaluationSimulationPrompt(params: {
  input: EvaluationSimulationInput;
  contextCases: SimulationContextCase[];
  combinedPseudoPrompt: string;
  artefactModel?: ArtefactCorrectionModelView | null;
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

  const artefactModelSection = params.artefactModel
    ? `
MODELO DE CORRECAO ESPECIFICO DO ARTEFATO (alta prioridade):
Artefato: ${params.artefactModel.artefactName}
Rigor inferido: ${params.artefactModel.rigorLevel} | Confianca: ${params.artefactModel.confidence}%
Grupos avaliados: ${params.artefactModel.groupFeedbackCount}

Prompt inferido do professor para este artefato:
${params.artefactModel.inferredPrompt}

Regras inferidas:
${params.artefactModel.inferredRules.map((r, i) => `${i + 1}. ${r}`).join("\n") || "Nenhuma regra especifica inferida."}

Padroes de correcao detectados:
${params.artefactModel.inferredPatterns.map((p, i) => `${i + 1}. ${p}`).join("\n") || "Nenhum padrao especifico detectado."}

Penalizacoes detectadas:
${params.artefactModel.detectedPenalties.map((p, i) => `${i + 1}. ${p}`).join("\n") || "Nenhuma penalizacao detectada."}

Estilo de correcao: tom=${params.artefactModel.correctionStyle.tone}, foco=${params.artefactModel.correctionStyle.focus}
`
    : "";

  return `Voce trabalha para o IArtefato.

Tarefa: simular como uma IA avaliadora de professor provavelmente reagiria a uma nova resposta, usando memoria de padroes inferidos anteriormente.
O objetivo nao e ser uma IA corretora generica; e reutilizar padroes de correcao observados.

NOVA ATIVIDADE:
${params.input.activityDescription}

ARTEFATO IDENTIFICADO:
${params.input.artefactName || "Nao informado"}

NOVA RESPOSTA DO ALUNO:
${params.input.studentResponse}
${artefactModelSection}
MEMORIA DE CASOS SIMILARES (contexto geral):
${context || "Nenhum caso similar disponivel."}

PSEUDO-PROMPT CONTEXTUAL COMBINADO (casos gerais):
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
- Se houver modelo especifico do artefato disponivel, ele e a fonte primaria de padroes e deve ser priorizado sobre casos gerais.
- Se nao houver modelo do artefato, baseie a previsao nos casos similares e pseudo-prompts combinados.
- Assuma por padrao um avaliador altamente exigente, criterioso e detalhista.
- Em caso de ambiguidade, estime a resposta do professor pela interpretacao mais rigorosa plausivel, nao pela mais benevolente.
- Considere como faltas graves superficialidade, cobertura parcial, ausencia de justificativas, baixa precisao tecnica, estrutura fraca, inconsistencias e qualquer desalinhamento com o escopo esperado.
- Os riscos e missingRequirements devem refletir um cenario de cobranca maxima do aluno, inclusive por detalhes estruturais, tecnicos e evidenciais.
- Explique riscos e requisitos faltantes sem alegar conhecer o prompt real do professor.
- Nao exponha chaves, variaveis de ambiente nem detalhes internos.`;
}
