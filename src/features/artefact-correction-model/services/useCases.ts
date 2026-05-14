import "server-only";

import { buildArtefactSemanticContext } from "@/features/academic-context-engine/contextual-analysis/contextBuilder";
import { validateCollectiveFeedbacks } from "@/features/academic-context-engine/professor-patterns/groupFeedbackRules";
import { getArtefactContext } from "@/features/artefact-context";
import { generateGeminiJson } from "@/services/ai/gemini";
import type { ArtefactCorrectionModelView } from "@/features/shared/types";
import { artefactCorrectionModelSchema } from "./schemas";
import { composeArtefactCorrectionModelPrompt } from "./prompt";
import { saveArtefactCorrectionModel } from "./artefactCorrectionModelRepository";

export async function generateArtefactCorrectionModel(
  artefactContextId: string
): Promise<ArtefactCorrectionModelView> {
  const artefact = await getArtefactContext(artefactContextId);
  if (!artefact) throw new Error("Artefato nao encontrado.");

  const completeness = validateCollectiveFeedbacks(artefact.groupFeedbacks);
  if (!completeness.canGenerate) {
    throw new Error(completeness.issues[0] ?? "Cadastre os feedbacks minimos antes de gerar o modelo.");
  }

  const semanticContext = buildArtefactSemanticContext({
    projectContext: artefact.projectContext,
    artefactContext: artefact,
    documents: artefact.uploadedDocuments,
    groupFeedbacks: artefact.groupFeedbacks,
  });
  const prompt = composeArtefactCorrectionModelPrompt(artefact, semanticContext);
  const output = await generateGeminiJson(prompt, artefactCorrectionModelSchema);

  return saveArtefactCorrectionModel({
    artefactName: artefact.artefactName,
    projectContextId: artefact.projectContextId,
    artefactContextId: artefact.id,
    output: {
      ...output,
      confidence: Math.round(output.confidence),
    },
    groupFeedbackCount: artefact.groupFeedbacks.length,
  });
}
