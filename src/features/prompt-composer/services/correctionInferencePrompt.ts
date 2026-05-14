import type { CorrectionInferenceInput } from "@/features/shared/types";

export function composeCorrectionInferencePrompt(input: CorrectionInferenceInput): string {
  return `Voce trabalha para o IArtefato.

Tarefa: inferir o comportamento de correcao usado por uma IA de professor a partir de uma correcao ja recebida.
Nao corrija novamente a atividade como objetivo principal. Extraia padroes provaveis do prompt oculto do avaliador.

Dados da correcao observada:
MATERIAS / PROFESSORES SELECIONADOS:
${input.subjects.join(", ")}

DESCRICAO DA ATIVIDADE:
${input.activityDescription}

RESPOSTA ENVIADA PELO ALUNO:
${input.studentResponse}

FEEDBACK RECEBIDO:
${input.feedbackReceived}

NOTA RECEBIDA:
${input.score}/${input.maxScore}

Retorne apenas JSON valido, sem markdown, neste formato:
{
  "criteria": [
    {
      "name": "criterio valorizado",
      "weight": 0,
      "description": "como esse criterio parece influenciar a nota",
      "confidence": 0,
      "evidenceSnippet": "trecho curto do feedback que sustenta a inferencia"
    }
  ],
  "penalties": [
    {
      "name": "penalizacao inferida",
      "estimatedDeduction": 0,
      "description": "regra provavel de desconto",
      "evidenceSnippet": "trecho curto do feedback",
      "severity": "low|medium|high"
    }
  ],
  "correctionStyle": {
    "tone": "strict|moderate|lenient",
    "focus": "technical|conceptual|practical|mixed",
    "detailLevel": "brief|detailed|exhaustive",
    "topKeywords": ["palavra"]
  },
  "technicalRigor": {
    "level": "low|medium|high",
    "score": 0,
    "rationale": ["justificativa"]
  },
  "structuralFocus": {
    "level": "low|medium|high",
    "score": 0,
    "observedAspects": ["aspecto estrutural observado"]
  },
  "pseudoPrompt": "pseudo-prompt aproximado que poderia ter produzido a correcao observada",
  "tags": ["tags semanticas curtas para busca futura"],
  "confidence": 0
}

Regras:
- Pesos de criteria devem somar aproximadamente 100.
- Use estimatedDeduction coerente com a escala ${input.maxScore}.
- Nao invente dados externos.
- O pseudoPrompt deve representar a logica do avaliador, nao o prompt real.
- Ao redigir o pseudoPrompt, prefira a versao mais exigente, complexa e rigorosa plausivel com base nas evidencias.
- O pseudoPrompt deve cobrar do aluno profundidade conceitual, precisao tecnica, completude, boa organizacao, justificativas explicitas, rastreabilidade entre requisitos e resposta, e evidencias concretas sempre que isso for compativel com a correcao observada.
- Quando houver ambiguidade, incline a inferencia para um avaliador mais detalhista, criterioso e dificil de satisfazer, nao para um avaliador permissivo.
- Priorize criterios que aumentem a exigencia sobre clareza estrutural, cobertura integral do escopo, consistencia interna, qualidade argumentativa e aderencia estrita ao enunciado.
- Todas as strings devem estar em portugues brasileiro.`;
}
