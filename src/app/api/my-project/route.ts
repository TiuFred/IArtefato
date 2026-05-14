import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/services/database/prisma";
import { ensureArtefactContextsForProject } from "@/features/artefact-context";

export const runtime = "nodejs";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => getPrisma() as unknown as Record<string, any>;

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
    }

    const membership = await db().groupMember.findFirst({
      where: { userId: session.user.id },
      include: {
        projectContext: {
          include: {
            artefactContexts: {
              include: {
                groupFeedbacks: { orderBy: { createdAt: "asc" } },
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

    const refreshedMembership = await db().groupMember.findFirst({
      where: { id: membership.id },
      include: {
        projectContext: {
          include: {
            artefactContexts: {
              include: {
                groupFeedbacks: { orderBy: { createdAt: "asc" } },
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

    const artefacts = refreshedMembership.projectContext.artefactContexts.map((artefact: any) => ({
      ...artefact,
      groupFeedbacks: artefact.groupFeedbacks.map((feedback: any) => {
        if (feedback.groupName === refreshedMembership.groupName) return feedback;
        return {
          ...feedback,
          wadText: "",
          wadFileName: "",
        };
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
