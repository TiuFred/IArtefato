import "server-only";

import { getPrisma } from "@/services/database/prisma";

export const MAIN_PROJECT_NAME = "Projeto Principal";

export async function ensureProjectForGroup(groupName: string): Promise<{ id: string; name: string }> {
  return ensureMainProject(groupName);
}

export async function ensureMainProject(groupName?: string): Promise<{ id: string; name: string }> {
  const prisma = getPrisma();

  const existing = await prisma.projectContext.findFirst({
    where: { name: MAIN_PROJECT_NAME },
    select: { id: true, name: true },
  });
  if (existing) return existing;

  if (process.env.NODE_ENV === "production") {
    const fallback = await prisma.projectContext.findFirst({
      select: { id: true, name: true },
      orderBy: { createdAt: "asc" },
    });
    if (fallback) return fallback;
  }

  const template = await prisma.projectContext.findFirst({
    where: {
      name: { notIn: ["Projeto G01", "Projeto G02", "Projeto G03", "Projeto G04", "Projeto G05"] },
    },
    include: {
      uploadedDocuments: true,
      artefactContexts: {
        include: { uploadedDocuments: true },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  }) ?? await prisma.projectContext.findFirst({
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
      name: MAIN_PROJECT_NAME,
      discipline: template?.discipline ?? "",
      description: template?.description || `Projeto principal compartilhado por todos os grupos${groupName ? `, incluindo ${groupName}` : ""}.`,
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
