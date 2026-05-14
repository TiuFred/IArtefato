import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { appendGroupFeedback, appendGroupFeedbackSchema, getArtefactContext } from "@/features/artefact-context";
import { getPrisma } from "@/services/database/prisma";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
    }

    const { id } = await context.params;
    const artefact = await getArtefactContext(id);
    if (!artefact) {
      return NextResponse.json({ error: "Artefato nao encontrado." }, { status: 404 });
    }

    const body = await request.json();

    if (session.user.isAdmin) {
      const input = appendGroupFeedbackSchema.parse({ ...body, artefactContextId: id });
      return NextResponse.json({ data: await appendGroupFeedback(input) }, { status: 201 });
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

    const input = appendGroupFeedbackSchema.parse({
      ...body,
      artefactContextId: id,
      groupName: membership.groupName,
    });

    return NextResponse.json({ data: await appendGroupFeedback(input) }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Nao foi possivel adicionar feedback." },
      { status: 400 }
    );
  }
}
