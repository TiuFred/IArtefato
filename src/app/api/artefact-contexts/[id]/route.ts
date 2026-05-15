import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getArtefactContext, sanitizeArtefactForGroup } from "@/features/artefact-context";
import { getPrisma } from "@/services/database/prisma";

export const runtime = "nodejs";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
    }

    const { id } = await context.params;
    const artefact = await getArtefactContext(id);
    if (!artefact) return NextResponse.json({ error: "Artefato nao encontrado." }, { status: 404 });

    if (session.user.isAdmin) {
      return NextResponse.json({ data: artefact });
    }

    const membership = await getPrisma().groupMember.findUnique({
      where: {
        userId_projectContextId: {
          userId: session.user.id,
          projectContextId: artefact.projectContextId,
        },
      },
      select: { groupName: true },
    });

    if (!membership) {
      return NextResponse.json({ error: "Acesso negado a este projeto." }, { status: 403 });
    }

    return NextResponse.json({
      data: sanitizeArtefactForGroup(artefact, membership.groupName),
    });
  } catch {
    return NextResponse.json({ error: "Nao foi possivel carregar o artefato." }, { status: 500 });
  }
}
