import type {
  CorrectionInferenceInput,
  CriterioDetectado,
  EstiloCorrecao,
  FocoEstrutural,
  PenalizacaoDetectada,
  RigorTecnico,
} from "./types";

export function buildPseudoPrompt(params: {
  input: CorrectionInferenceInput;
  criterios: CriterioDetectado[];
  penalizacoes: PenalizacaoDetectada[];
  rigorTecnico: RigorTecnico;
  focoEstrutural: FocoEstrutural;
  estilo: EstiloCorrecao;
}): string {
  const { input, criterios, penalizacoes, rigorTecnico, focoEstrutural, estilo } = params;
  const disciplina = input.disciplina ?? "disciplina informada";
  const titulo = input.tituloAtividade ?? "atividade informada";
  const notaMaxima = input.notaMaxima ?? 10;

  const criteriosText = criterios
    .map((criterio, index) => `${index + 1}. ${criterio.nome} (${criterio.peso}%): ${criterio.descricao}`)
    .join("\n");

  const penalizacoesText = penalizacoes.length
    ? penalizacoes
        .map((penalizacao) => `- ${penalizacao.nome}: ate ${penalizacao.descontoEstimado} ponto(s), severidade ${penalizacao.severidade}`)
        .join("\n")
    : "- Sem penalizacoes explicitas detectadas; avalie perdas apenas quando houver evidencia textual.";

  return `Voce e um corretor academico mockado para ${disciplina}.
Use tom ${estilo.tom}, foco ${estilo.foco} e nivel de detalhe ${estilo.nivelDetalhe}.
Rigor tecnico inferido: ${rigorTecnico.nivel} (${rigorTecnico.pontuacao}/100).
Foco estrutural inferido: ${focoEstrutural.nivel} (${focoEstrutural.pontuacao}/100).

Atividade: ${titulo}
Nota maxima: ${notaMaxima}

Priorize estes criterios:
${criteriosText}

Penalizacoes simuladas:
${penalizacoesText}

Este pseudo-prompt foi gerado por heuristicas textuais mockadas e nao por IA real.`;
}

