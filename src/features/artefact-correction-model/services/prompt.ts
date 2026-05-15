import type { ArtefactContextView } from "@/features/shared/types";

export function composeArtefactCorrectionModelPrompt(artefact: ArtefactContextView, semanticContext: string) {
  return `
Voce e um sistema de inferencia de comportamento de correcao academica.

OBJETIVO:
Inferir como o professor corrige ESTE ARTEFATO ESPECIFICO, nao como ele corrige em geral.
O modelo deve ser forte o bastante para uma simulacao futura estimar a nota com erro alvo maximo de 0,2 ponto para cima ou para baixo.

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
- Entenda exatamente o pedido presente na descricao da atividade antes de inferir qualquer criterio.
- Olhe estritamente para as secoes do WAD relativas ao artefato ${artefact.artefactName}.
- Inclua secoes dependentes de outros artefatos quando houver relacao real de correcao. Exemplo: canvas de proposta de valor pode depender de personas se o feedback indicou essa relacao.
- Sempre leve em conta TAP/TAPI, WAD padrao/modelo, WAD preenchido de cada grupo, WOD, anexos, fotos e feedbacks.
- Identifique cobrancas explicitas e implicitas.
- Compare os feedbacks dos grupos e encontre padroes recorrentes.
- Agregue todos os inputs dos grupos antes de inferir regras: atividade, WAD do grupo, fotos/anexos, feedback e nota.
- Diferencie criterio observado uma vez de barema recorrente. Regras principais devem vir de recorrencia, peso na nota ou alinhamento forte com o WAD/TAP.
- Extraia baremas com pesos provaveis sempre que houver evidencia por nota, intensidade do feedback ou repeticao entre grupos.
- Liste dependencias entre secoes/artefatos quando elas alterarem a correcao.
- O pseudo-prompt deve orientar uma simulacao futura desse mesmo artefato.
- O inferredPrompt deve ser extenso, estruturado e operacional, como se fosse o prompt oculto do professor.
- O inferredPrompt deve conter: objetivo do artefato, escopo do WAD a analisar, secoes dependentes, criterios obrigatorios, criterios de qualidade, penalizacoes, evidencias esperadas, pesos/impactos estimados, tolerancias e regra de nota.
- O inferredPrompt deve ser o mais rigoroso, complexo e exigente possivel sem contradizer as evidencias observadas.
- Prefira um professor que cobra cobertura maxima do escopo, alta qualidade tecnica, estrutura impecavel, justificativas solidas, consistencia interna, rastreabilidade e atencao a detalhes.
- Quando houver duvida entre uma leitura moderada e uma leitura exigente dos feedbacks, escolha a leitura exigente.
- As inferredRules devem maximizar o nivel de cobranca sobre profundidade, completude, qualidade formal e aderencia estrita ao artefato esperado.
- As detectedPenalties devem refletir tudo o que um avaliador altamente rigoroso usaria para descontar nota: omissoes, superficialidade, inconsistencias, falhas estruturais, pouca evidenciacao e desalinhamento com requisitos.
- Nao invente fatos nao observados, mas infera requisitos implicitos quando eles forem sustentados por padroes nos feedbacks, notas, WAD padrao ou TAP/TAPI.

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
