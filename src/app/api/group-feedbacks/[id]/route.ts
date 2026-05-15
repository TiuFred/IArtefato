import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/services/database/prisma";

export const runtime = "nodejs";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const anyDb = () => getPrisma() as unknown as Record<string, any>;

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
    }

    const { id } = await context.params;

    // Fetch the feedback to check ownership
    const feedback = await anyDb().groupFeedback.findUnique({
      where: { id },
      include: {
        artefactContext: { select: { projectContextId: true } },
      },
    });

    if (!feedback) {
      return NextResponse.json({ error: "Correcao nao encontrada." }, { status: 404 });
    }

    // Admins can delete any feedback; students can only delete their group's feedback
    if (!session.user.isAdmin) {
      const membership = await getPrisma().groupMember.findUnique({
        where: {
          userId_projectContextId: {
            userId: session.user.id,
            projectContextId: feedback.artefactContext.projectContextId,
          },
        },
        select: { groupName: true },
      });

      if (!membership || membership.groupName !== feedback.groupName) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
      }
    }

    await anyDb().groupFeedback.delete({ where: { id } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Nao foi possivel apagar a correcao." },
      { status: 500 }
    );
  }
}
