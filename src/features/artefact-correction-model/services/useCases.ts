import "server-only";

import { buildArtefactSemanticContext } from "@/features/academic-context-engine/contextual-analysis/contextBuilder";
import { validateCollectiveFeedbacks } from "@/features/academic-context-engine/professor-patterns/groupFeedbackRules";
import { getArtefactContext } from "@/features/artefact-context";
import { generateGeminiJson } from "@/services/ai/gemini";
import type { ArtefactCorrectionModelView } from "@/features/shared/types";
import { getPrisma } from "@/services/database/prisma";
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

  const model = await saveArtefactCorrectionModel({
    artefactName: artefact.artefactName,
    projectContextId: artefact.projectContextId,
    artefactContextId: artefact.id,
    output: {
      ...output,
      confidence: Math.round(output.confidence),
    },
    groupFeedbackCount: artefact.groupFeedbacks.length,
  });

  // Contribute to the professor prompt database (PseudoPrompt table).
  // Each generated correction model adds its inferredPrompt so the admin
  // can see and refine the accumulated understanding of the professor's style.
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = getPrisma() as unknown as Record<string, any>;

    // Fetch subject from the linked activity (professor/discipline context)
    const artefactRow = await db.artefactContext.findUnique({
      where: { id: artefactContextId },
      include: { activity: { select: { subject: true } } },
    });
    const subject: string = artefactRow?.activity?.subject ?? artefact.projectContext.discipline ?? "Geral";

    const patternSummary = {
      artefactName: artefact.artefactName,
      subject,
      projectName: artefact.projectContext.name,
      rigorLevel: output.rigorLevel,
      confidence: Math.round(output.confidence),
      groupFeedbackCount: artefact.groupFeedbacks.length,
      topRules: output.inferredRules.slice(0, 3),
      topPenalties: output.detectedPenalties.slice(0, 3),
      correctionStyle: output.correctionStyle,
      generatedAt: new Date().toISOString(),
    };

    // Create a new PseudoPrompt entry (not linked to a CorrectionCase or Simulation —
    // both foreign keys are intentionally null; the artefact context is encoded in patternSummary).
    await db.pseudoPrompt.create({
      data: {
        content: output.inferredPrompt,
        patternSummary,
      },
    });
  } catch {
    // Never fail model generation due to PseudoPrompt persistence issues.
  }

  return model;
}
