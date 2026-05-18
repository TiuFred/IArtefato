import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getArtefactContext } from "@/features/artefact-context";
import { getGeminiClient, getGeminiModel } from "@/services/ai/gemini/client";
import { z } from "zod";

export const runtime = "nodejs";

const requestSchema = z.object({
  artefactContextId: z.string().min(1),
  quantity: z.number().int().min(1).max(20),
  customPrompt: z.string().optional(),
});

export type GeneratedQuestion = {
  question: string;
  expectedElements: string[];
  difficulty: "fácil" | "médio" | "difícil";
  relatedCriteria: string[];
};

export type QuestionGenerationResult = {
  artefactName: string;
  questions: GeneratedQuestion[];
};

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const body = await request.json();
    const { artefactContextId, quantity, customPrompt } = requestSchema.parse(body);

    const artefact = await getArtefactContext(artefactContextId);
    if (!artefact) {
      return NextResponse.json({ error: "Artefato não encontrado." }, { status: 404 });
    }

    const model = artefact.latestModel;

    // Build artefact context string
    const artefactContext = [
      `Artefato: ${artefact.artefactName}`,
      artefact.description ? `Descrição: ${artefact.description}` : "",
      artefact.expectedStructure ? `Estrutura esperada: ${artefact.expectedStructure}` : "",
      artefact.explicitRequirements.length > 0
        ? `Requisitos explícitos:\n${artefact.explicitRequirements.map((r) => `- ${r}`).join("\n")}`
        : "",
      artefact.implicitRequirements.length > 0
        ? `Requisitos implícitos:\n${artefact.implicitRequirements.map((r) => `- ${r}`).join("\n")}`
        : "",
      artefact.deliverables.length > 0
        ? `Entregáveis: ${artefact.deliverables.join(", ")}`
        : "",
    ].filter(Boolean).join("\n\n");

    // Build correction model context string
    const modelContext = model ? [
      `--- Padrão de Correção do Professor ---`,
      `Prompt inferido: ${model.inferredPrompt}`,
      model.inferredRules.length > 0
        ? `Regras de correção:\n${model.inferredRules.map((r) => `- ${r}`).join("\n")}`
        : "",
      model.inferredPatterns.length > 0
        ? `Padrões detectados:\n${model.inferredPatterns.map((p) => `- ${p}`).join("\n")}`
        : "",
      model.detectedPenalties.length > 0
        ? `Penalizações comuns:\n${model.detectedPenalties.map((p) => `- ${p}`).join("\n")}`
        : "",
      `Estilo: Tom ${model.correctionStyle.tone}, Foco ${model.correctionStyle.focus}`,
      `Nível de rigor: ${model.rigorLevel}`,
    ].filter(Boolean).join("\n") : "";

    // Sample feedbacks (up to 3)
    const feedbackSamples = artefact.groupFeedbacks
      .slice(0, 3)
      .map((fb, i) => {
        const preview = fb.feedback.length > 300
          ? fb.feedback.slice(0, 300) + "..."
          : fb.feedback;
        return `Exemplo ${i + 1} (nota ${fb.score}/${fb.maxScore}): "${preview}"`;
      })
      .join("\n\n");

    // Resolve prompt — if user provided a custom one, interpolate variables into it
    const resolvedPrompt = customPrompt
      ? customPrompt
          .replace("{artefact_name}", artefact.artefactName)
          .replace("{quantity}", String(quantity))
          .replace("{artefact_context}", artefactContext)
          .replace("{model_context}", modelContext)
          .replace("{feedback_samples}", feedbackSamples)
      : `Crie ${quantity} pergunta(s) discursiva(s) clara(s) e acessível(is) sobre o artefato "${artefact.artefactName}".

${modelContext ? `Contexto do padrão de correção do professor:\n${modelContext}\n` : ""}
${feedbackSamples ? `Exemplos de feedbacks reais do professor:\n${feedbackSamples}\n` : ""}

Diretrizes para as perguntas:
- Linguagem clara e direta, adequada ao nível da atividade.
- Cada pergunta deve ter um foco bem definido, sem sobrecarregar o aluno com múltiplos comandos.
- Usar verbos como "explique", "descreva", "identifique", "justifique" ou "relate".
- As perguntas devem estimular reflexão e compreensão, não apenas memorização.
- Variar entre perguntas mais simples e outras um pouco mais elaboradas.
- Evitar linguagem excessivamente técnica ou acadêmica desnecessária.
- Preferir perguntas diretas e objetivas em sua formulação, mas abertas nas respostas esperadas.

Gere exatamente ${quantity} questão(ões) no seguinte formato JSON:
{
  "questions": [
    {
      "question": "Enunciado claro e direto da pergunta",
      "expectedElements": ["elemento esperado na resposta 1", "elemento esperado 2"],
      "difficulty": "fácil" | "médio" | "difícil",
      "relatedCriteria": ["critério de avaliação relacionado"]
    }
  ]
}

Responda APENAS com o JSON, sem texto adicional.`;

    const response = await getGeminiClient().models.generateContent({
      model: getGeminiModel(),
      contents: resolvedPrompt,
      config: {
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) throw new Error("Resposta vazia do modelo de IA.");

    // Extract JSON safely
    const trimmed = text.trim();
    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");
    const jsonStr =
      firstBrace >= 0 && lastBrace > firstBrace
        ? trimmed.slice(firstBrace, lastBrace + 1)
        : trimmed;

    const parsed = JSON.parse(jsonStr) as { questions: GeneratedQuestion[] };

    const result: QuestionGenerationResult = {
      artefactName: artefact.artefactName,
      questions: Array.isArray(parsed.questions) ? parsed.questions : [],
    };

    return NextResponse.json({ data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos na requisição." }, { status: 400 });
    }
    console.error("[question-generation]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao gerar perguntas." },
      { status: 500 }
    );
  }
}
