import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getPrisma } from "@/services/database/prisma";
import { deleteArtefactContextsFromActivity, syncArtefactContextFromActivity } from "@/features/artefact-context";

async function requireAdmin() {
  const session = await getSession();
  return session?.isAdmin ? session : null;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Nao autorizado." }, { status: 403 });
  const { id } = await params;
  const body = await request.json();

  const activity = await getPrisma().activity.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.maxScore !== undefined && { maxScore: body.maxScore }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    },
  });

  if (body.title !== undefined || body.description !== undefined) {
    await syncArtefactContextFromActivity(id);
  }

  return NextResponse.json({ data: activity });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Nao autorizado." }, { status: 403 });
  const { id } = await params;
  await deleteArtefactContextsFromActivity(id);
  await getPrisma().activity.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
