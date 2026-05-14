import "server-only";

import { getPrisma } from "@/services/database/prisma";

export async function ensureProjectForGroup(groupName: string): Promise<{ id: string; name: string }> {
  const prisma = getPrisma();
  const projectName = `Projeto ${groupName}`;

  const existing = await prisma.projectContext.findFirst({
    where: { name: projectName },
    select: { id: true, name: true },
  });
  if (existing) return existing;

  const template = await prisma.projectContext.findFirst({
    include: {
      uploadedDocuments: true,
      artefactContexts: {
        include: { uploadedDocuments: true },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return prisma.projectContext.create({
    data: {
      name: projectName,
      discipline: template?.discipline ?? "",
      description: template?.description || `Projeto vinculado automaticamente ao grupo ${groupName}.`,
      tapText: template?.tapText ?? "",
      globalRules: template?.globalRules ?? {},
      uploadedDocuments: {
        create: (template?.uploadedDocuments ?? []).map((doc) => ({
          fileName: doc.fileName,
          mimeType: doc.mimeType,
          documentType: doc.documentType,
          textContent: doc.textContent,
          preview: doc.preview,
        })),
      },
      artefactContexts: {
        create: (template?.artefactContexts ?? []).map((artefact) => ({
          artefactName: artefact.artefactName,
          activityId: artefact.activityId,
          description: artefact.description,
          wadText: artefact.wadText,
          wodText: artefact.wodText,
          expectedStructure: artefact.expectedStructure,
          explicitRequirements: artefact.explicitRequirements,
          implicitRequirements: artefact.implicitRequirements,
          deliverables: artefact.deliverables,
          uploadedDocuments: {
            create: artefact.uploadedDocuments.map((doc) => ({
              fileName: doc.fileName,
              mimeType: doc.mimeType,
              documentType: doc.documentType,
              textContent: doc.textContent,
              preview: doc.preview,
            })),
          },
        })),
      },
    },
    select: { id: true, name: true },
  });
}
