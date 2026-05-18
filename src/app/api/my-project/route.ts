import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/services/database/prisma";
import { ensureArtefactContextsForProject, sanitizeOtherGroupFeedback } from "@/features/artefact-context";

export const runtime = "nodejs";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const anyDb = () => getPrisma() as unknown as Record<string, any>;

type FeedbackRow = {
  id: string;
  groupName: string;
  activityDescription: string;
  feedback: string;
  score: number;
  maxScore: number;
  wadText: string;
  wadFileName: string;
  uploadedDocuments: unknown[];
  createdAt: Date;
  [key: string]: unknown;
};

type ModelRow = {
  confidence: number;
  rigorLevel: string;
  generatedAt: Date;
  groupFeedbackCount: number;
};

type ArtefactRow = {
  id: string;
  groupFeedbacks: FeedbackRow[];
  correctionModels: ModelRow[];
  [key: string]: unknown;
};

async function fetchMembership(where: Record<string, unknown>) {
  return anyDb().groupMember.findFirst({
    where,
    include: {
      projectContext: {
        include: {
          artefactContexts: {
            include: {
              groupFeedbacks: {
                orderBy: { createdAt: "asc" },
              },
              correctionModels: {
                orderBy: { generatedAt: "desc" },
                take: 1,
                select: {
                  confidence: true,
                  rigorLevel: true,
                  generatedAt: true,
                  groupFeedbackCount: true,
                },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
    }

    const membership = await fetchMembership({ userId: session.user.id });

    if (!membership) {
      return NextResponse.json({ error: "Sem grupo atribuido." }, { status: 403 });
    }

    const projectContextId = membership.projectContextId ?? membership.projectContext?.id;
    if (projectContextId) {
      try {
        await ensureArtefactContextsForProject(String(projectContextId));
      } catch {
        // Do not fail the project load if artefact backfill hits legacy inconsistent data.
      }
    }

    const refreshedMembership = await fetchMembership({ id: membership.id });

    if (!refreshedMembership) {
      return NextResponse.json({ error: "Sem grupo atribuido." }, { status: 403 });
    }

    const artefacts = (refreshedMembership.projectContext.artefactContexts as ArtefactRow[]).map((artefact) => {
      const sanitizedFeedbacks = artefact.groupFeedbacks.map((feedback: FeedbackRow) => {
        if (feedback.groupName === refreshedMembership.groupName) return feedback;
        return sanitizeOtherGroupFeedback(feedback);
      });
      const latestModel = artefact.correctionModels?.[0] ?? null;
      return {
        ...artefact,
        groupFeedbacks: sanitizedFeedbacks,
        latestModel: latestModel
          ? { confidence: latestModel.confidence, rigorLevel: latestModel.rigorLevel }
          : null,
      };
    });

    return NextResponse.json({
      data: {
        groupName: refreshedMembership.groupName,
        projectContext: refreshedMembership.projectContext,
        artefacts,
      },
    });
  } catch (error) {
    console.error("[my-project:get]", error);
    return NextResponse.json({ error: "Erro ao carregar projeto." }, { status: 500 });
  }
}
