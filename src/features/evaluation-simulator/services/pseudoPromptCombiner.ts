import type { SimulationContextCase } from "@/features/shared/types";

interface CombinedPseudoPrompt {
  texto: string;
  fontes: Array<{
    memoriaId: string;
    similaridade: number;
    peso: number;
  }>;
}

export function combinePseudoPrompts(results: SimulationContextCase[]): CombinedPseudoPrompt {
  const relevantResults = results.filter((result) => result.similarity > 0);
  const similaritySum = relevantResults.reduce(
    (sum, result) => sum + result.similarity,
    0
  );

  const fontes = relevantResults.map((result) => ({
    memoriaId: result.id,
    similaridade: result.similarity,
    peso:
      similaritySum > 0
        ? Math.round((result.similarity / similaritySum) * 100)
        : 0,
  }));

  const promptSections = relevantResults
    .map((result, index) => {
      const weight = fontes[index]?.peso ?? 0;
      return `[Fonte ${index + 1} | similaridade ${result.similarity}% | peso ${weight}%]
${result.inference.pseudoPrompt}`;
    })
    .join("\n\n");

  return {
    fontes,
    texto: `Pseudo-prompt combinado a partir de memoria semantica persistida.
Use os padroes abaixo como memoria de correcao, priorizando fontes mais similares.

${promptSections || "Sem memoria similar suficiente. Use avaliacao geral baseada na completude da resposta."}`,
  };
}
