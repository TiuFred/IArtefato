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

    const feedback = await anyDb().groupFeedback.findUnique({
      where: { id },
      select: { id: true, groupName: true },
    });

    if (!feedback) {
      return NextResponse.json({ error: "Correcao nao encontrada." }, { status: 404 });
    }

    // Admins can delete any feedback; students can only delete their own group's feedback
    if (!session.user.isAdmin) {
      const membership = await getPrisma().groupMember.findFirst({
        where: { userId: session.user.id, groupName: feedback.groupName },
        select: { id: true },
      });

      if (!membership) {
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
