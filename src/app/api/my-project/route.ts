import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/services/database/prisma";
import { ensureArtefactContextsForProject, sanitizeOtherGroupFeedback } from "@/features/artefact-context";

type FeedbackRow = {
  groupName: string;
  activityDescription: string;
  feedback: string;
  score: number;
  maxScore: number;
  wadText: string;
  wadFileName: string;
  uploadedDocuments: unknown[];
  [key: string]: unknown;
};

export const runtime = "nodejs";

type ArtefactRow = {
  groupFeedbacks: FeedbackRow[];
  [key: string]: unknown;
};

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
    }

    const membership = await getPrisma().groupMember.findFirst({
      where: { userId: session.user.id },
      include: {
        projectContext: {
          include: {
            artefactContexts: {
              include: {
                groupFeedbacks: {
                  orderBy: { createdAt: "asc" },
                  include: { uploadedDocuments: { orderBy: { createdAt: "asc" } } },
                },
                correctionModels: { orderBy: { generatedAt: "desc" }, take: 1 },
              },
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    if (!membership) {
      return NextResponse.json({ error: "Sem grupo atribuido." }, { status: 403 });
    }

    const projectContextId = membership.projectContextId ?? membership.projectContext?.id;
    if (projectContextId) {
      try {
        await ensureArtefactContextsForProject(projectContextId);
      } catch {
        // Do not fail the project load if artefact backfill hits legacy inconsistent data.
      }
    }

    const refreshedMembership = await getPrisma().groupMember.findFirst({
      where: { id: membership.id },
      include: {
        projectContext: {
          include: {
            artefactContexts: {
              include: {
                groupFeedbacks: {
                  orderBy: { createdAt: "asc" },
                  include: { uploadedDocuments: { orderBy: { createdAt: "asc" } } },
                },
                correctionModels: { orderBy: { generatedAt: "desc" }, take: 1 },
              },
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
    });

    if (!refreshedMembership) {
      return NextResponse.json({ error: "Sem grupo atribuido." }, { status: 403 });
    }

    const artefacts = refreshedMembership.projectContext.artefactContexts.map((artefact: ArtefactRow) => ({
      ...artefact,
      groupFeedbacks: artefact.groupFeedbacks.map((feedback: FeedbackRow) => {
        if (feedback.groupName === refreshedMembership.groupName) return feedback;
        return sanitizeOtherGroupFeedback(feedback);
      }),
    }));

    return NextResponse.json({
      data: {
        groupName: refreshedMembership.groupName,
        projectContext: refreshedMembership.projectContext,
        artefacts,
      },
    });
  } catch {
    return NextResponse.json({ error: "Erro ao carregar projeto." }, { status: 500 });
  }
}
