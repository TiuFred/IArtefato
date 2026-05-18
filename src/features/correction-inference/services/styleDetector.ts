import { CRITERIA_DEFINITIONS } from "./dictionaries";
import { countKeywordMatches, normalizeText } from "./textAnalysis";
import type { CorrectionInferenceInput, EstiloCorrecao, FocoCorrecao, NivelDetalhe, TomCorrecao } from "./types";

const STRICT_WORDS = ["deve", "necessario", "obrigatorio", "incorreto", "insuficiente", "precisa"];
const FLEXIBLE_WORDS = ["bom trabalho", "parabens", "excelente", "muito bem", "adequado", "satisfatorio"];
const TECHNICAL_WORDS = ["codigo", "implementacao", "algoritmo", "execucao", "compila", "teste"];
const CONCEPTUAL_WORDS = ["conceito", "teoria", "fundamento", "definicao", "compreensao"];
const PRACTICAL_WORDS = ["pratico", "aplicacao", "uso", "cenario", "funcionamento", "exemplo"];

export function detectCorrectionStyle(input: CorrectionInferenceInput): EstiloCorrecao {
  const notaMaxima = input.notaMaxima ?? 10;
  const scoreRatio = notaMaxima > 0 ? input.nota / notaMaxima : 0;
  const strictCount = countKeywordMatches(input.feedback, STRICT_WORDS);
  const flexibleCount = countKeywordMatches(input.feedback, FLEXIBLE_WORDS);

  let tom: TomCorrecao = "moderado";
  if (strictCount > flexibleCount && scoreRatio < 0.8) tom = "rigoroso";
  if (flexibleCount > strictCount && scoreRatio >= 0.75) tom = "flexivel";

  const focusScores: Record<FocoCorrecao, number> = {
    tecnico: countKeywordMatches(input.feedback, TECHNICAL_WORDS),
    conceitual: countKeywordMatches(input.feedback, CONCEPTUAL_WORDS),
    pratico: countKeywordMatches(input.feedback, PRACTICAL_WORDS),
    misto: 0,
  };
  const maxFocusScore = Math.max(focusScores.tecnico, focusScores.conceitual, focusScores.pratico);
  const tiedFocuses = Object.entries(focusScores).filter(([, value]) => value === maxFocusScore && value > 0);
  const foco = tiedFocuses.length === 1 ? (tiedFocuses[0][0] as FocoCorrecao) : "misto";

  let nivelDetalhe: NivelDetalhe = "detalhado";
  if (input.feedback.length < 180) nivelDetalhe = "breve";
  if (input.feedback.length > 650) nivelDetalhe = "exaustivo";

  const normalizedFeedback = normalizeText(input.feedback);
  const palavrasChave = CRITERIA_DEFINITIONS.flatMap((criterion) => criterion.keywords)
    .filter((keyword) => normalizedFeedback.includes(normalizeText(keyword)))
    .slice(0, 8);

  return {
    tom,
    foco,
    nivelDetalhe,
    palavrasChave,
  };
}

