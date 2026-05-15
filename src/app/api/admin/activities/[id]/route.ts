import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getPrisma } from "@/services/database/prisma";
import { deleteArtefactContextsFromActivity, syncArtefactContextFromActivity } from "@/features/artefact-context";

export const runtime = "nodejs";

async function requireAdmin() {
  const session = await getSession();
  return session?.isAdmin ? session : null;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Nao autorizado." }, { status: 403 });
    const { id } = await params;
    const body = await request.json() as {
      title?: string;
      description?: string;
      maxScore?: number;
      isActive?: boolean;
    };

    const data: {
      title?: string;
      description?: string;
      maxScore?: number;
      isActive?: boolean;
    } = {};
    if (typeof body.title === "string") data.title = body.title;
    if (typeof body.description === "string") data.description = body.description;
    if (typeof body.maxScore === "number") data.maxScore = body.maxScore;
    if (typeof body.isActive === "boolean") data.isActive = body.isActive;

    const activity = await getPrisma().activity.update({ where: { id }, data });

    if (body.title !== undefined || body.description !== undefined) {
      try { await syncArtefactContextFromActivity(id); } catch { /* non-fatal */ }
    }

    return NextResponse.json({ data: activity });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao atualizar atividade." },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Nao autorizado." }, { status: 403 });
    const { id } = await params;
    try { await deleteArtefactContextsFromActivity(id); } catch { /* non-fatal */ }
    await getPrisma().activity.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao deletar atividade." },
      { status: 500 }
    );
  }
}
