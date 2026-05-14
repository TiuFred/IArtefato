import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/services/database/prisma";

export const runtime = "nodejs";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => getPrisma() as unknown as Record<string, any>;

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
    }

    // Find user's group membership
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
    });

    if (!membership) {
      return NextResponse.json({ error: "Sem grupo atribuido." }, { status: 403 });
    }

    return NextResponse.json({
      data: {
        groupName: membership.groupName,
        projectContext: membership.projectContext,
        artefacts: membership.projectContext.artefactContexts,
      },
    });
  } catch {
    return NextResponse.json({ error: "Erro ao carregar projeto." }, { status: 500 });
  }
}
