import "server-only";

import type { ArtefactContextView, GroupFeedbackView, ProjectContextView, UploadedDocumentView } from "@/features/shared/types";

export function buildArtefactSemanticContext(params: {
  projectContext: Pick<ProjectContextView, "name" | "discipline" | "description" | "tapText">;
  artefactContext: Pick<
    ArtefactContextView,
    "artefactName" | "description" | "wadText" | "wodText" | "expectedStructure" | "explicitRequirements" | "implicitRequirements" | "deliverables"
  >;
  documents: UploadedDocumentView[];
  groupFeedbacks: GroupFeedbackView[];
}) {
  return [
    `PROJETO: ${params.projectContext.name}`,
    `DISCIPLINA: ${params.projectContext.discipline || "Nao informada"}`,
    `CONTEXTO GLOBAL/TAP:\n${params.projectContext.description}\n${params.projectContext.tapText}`,
    `ARTEFATO: ${params.artefactContext.artefactName}`,
    `DESCRICAO DO ARTEFATO:\n${params.artefactContext.description}`,
    `WAD:\n${params.artefactContext.wadText}`,
    `WOD:\n${params.artefactContext.wodText}`,
    `ESTRUTURA ESPERADA:\n${params.artefactContext.expectedStructure}`,
    `REQUISITOS EXPLICITOS:\n${params.artefactContext.explicitRequirements.join("\n")}`,
    `REQUISITOS IMPLICITOS:\n${params.artefactContext.implicitRequirements.join("\n")}`,
    `ENTREGAVEIS:\n${params.artefactContext.deliverables.join("\n")}`,
    `DOCUMENTOS:\n${params.documents.map((doc) => `[${doc.documentType}] ${doc.fileName}\n${doc.preview}`).join("\n\n")}`,
    `FEEDBACKS COLETIVOS (${params.groupFeedbacks.length} grupos):\n${params.groupFeedbacks
      .map((item) => {
        const wadSection = item.wadText
          ? `WAD ENTREGUE PELO GRUPO:\n${item.wadText.substring(0, 4000)}${item.wadText.length > 4000 ? "\n[... truncado ...]" : ""}`
          : "WAD: nao submetido";
        return `--- ${item.groupName} (${item.score}/${item.maxScore}) ---\nAtividade: ${item.activityDescription}\n${wadSection}\nFeedback recebido: ${item.feedback}`;
      })
      .join("\n\n")}`,
  ].join("\n\n---\n\n");
}
