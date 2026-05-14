import type { ArtefactContextView } from "@/features/shared/types";

export function composeArtefactCorrectionModelPrompt(artefact: ArtefactContextView, semanticContext: string) {
  return `
Voce e um sistema de inferencia de comportamento de correcao academica.

OBJETIVO:
Inferir como o professor corrige ESTE ARTEFATO ESPECIFICO, nao como ele corrige em geral.

ARTEFATO:
${artefact.artefactName}

CAMADAS DE CONTEXTO:
1. Project Context Layer: TAP, disciplina, regras gerais e visao macro do projeto.
2. Artefact Context Layer: WAD/WOD, requisitos, entregaveis, formato e estrutura esperada.
3. Correction Behaviour Layer: feedbacks e notas de multiplos grupos para este artefato.

CONTEXTO CONSOLIDADO:
${semanticContext}

REGRAS:
- Nao gere criterios genericos de professor.
- Gere regras especificas para o artefato ${artefact.artefactName}.
- Identifique cobrancas explicitas e implicitas.
- Compare os feedbacks dos grupos e encontre padroes recorrentes.
- O pseudo-prompt deve orientar uma simulacao futura desse mesmo artefato.
- O inferredPrompt deve ser o mais rigoroso, complexo e exigente possivel sem contradizer as evidencias observadas.
- Prefira um professor que cobra cobertura maxima do escopo, alta qualidade tecnica, estrutura impecavel, justificativas solidas, consistencia interna, rastreabilidade e atencao a detalhes.
- Quando houver duvida entre uma leitura moderada e uma leitura exigente dos feedbacks, escolha a leitura exigente.
- As inferredRules devem maximizar o nivel de cobranca sobre profundidade, completude, qualidade formal e aderencia estrita ao artefato esperado.
- As detectedPenalties devem refletir tudo o que um avaliador altamente rigoroso usaria para descontar nota: omissoes, superficialidade, inconsistencias, falhas estruturais, pouca evidenciacao e desalinhamento com requisitos.

Responda apenas JSON no formato:
{
  "inferredPrompt": "pseudo-prompt especifico do artefato",
  "inferredRules": ["regra inferida"],
  "inferredPatterns": ["padrao recorrente"],
  "detectedPenalties": ["penalizacao recorrente"],
  "correctionStyle": {
    "tone": "tom observado",
    "focus": "foco observado no artefato",
    "evidence": ["evidencia curta baseada nos feedbacks"]
  },
  "rigorLevel": "low | medium | high",
  "confidence": 0
}
`;
}
