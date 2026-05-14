import "server-only";

import { getPrisma } from "@/services/database/prisma";

const DEFAULT_EXPECTED_STRUCTURE = "Siga a estrutura e as instrucoes definidas pelo professor para este artefato.";

export async function ensureArtefactContextsForAllProjects(activityId: string) {
  const prisma = getPrisma();
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    select: { id: true, title: true, description: true },
  });
  if (!activity) return;

  const projects = await prisma.projectContext.findMany({
    select: { id: true },
  });

  for (const project of projects) {
    try {
      await ensureSingleArtefactContext(project.id, activity.id, activity.title, activity.description);
    } catch {
      // Ignore sync failures for one project to avoid breaking the whole request.
    }
  }
}

export async function ensureArtefactContextsForProject(projectContextId: string) {
  const prisma = getPrisma();
  const activities = await prisma.activity.findMany({
    where: { isActive: true },
    select: { id: true, title: true, description: true },
    orderBy: { createdAt: "asc" },
  });

  for (const activity of activities) {
    try {
      await ensureSingleArtefactContext(projectContextId, activity.id, activity.title, activity.description);
    } catch {
      // Ignore one bad artefact sync and continue exposing the rest of the project.
    }
  }
}

export async function syncArtefactContextFromActivity(activityId: string) {
  const prisma = getPrisma();
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    select: { id: true, title: true, description: true },
  });
  if (!activity) return;

  await prisma.artefactContext.updateMany({
    where: { activityId: activity.id },
    data: {
      artefactName: activity.title,
      description: activity.description,
    },
  });
}

export async function deleteArtefactContextsFromActivity(activityId: string) {
  await getPrisma().artefactContext.deleteMany({
    where: { activityId },
  });
}

async function ensureSingleArtefactContext(
  projectContextId: string,
  activityId: string,
  artefactName: string,
  description: string
) {
  const prisma = getPrisma();
  const existing = await prisma.artefactContext.findFirst({
    where: { projectContextId, activityId },
    select: { id: true },
  });
  if (existing) return;

  await prisma.artefactContext.create({
    data: {
      projectContextId,
      activityId,
      artefactName,
      description,
      expectedStructure: DEFAULT_EXPECTED_STRUCTURE,
      wadText: "",
      wodText: "",
      explicitRequirements: [],
      implicitRequirements: [],
      deliverables: [],
    },
  });
}
