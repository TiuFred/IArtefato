import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getPrisma } from "@/services/database/prisma";

async function requireAdmin() {
  const session = await getSession();
  return session?.isAdmin ? session : null;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  const { id } = await params;
  const { content } = await request.json();
  if (!content || typeof content !== "string") {
    return NextResponse.json({ error: "Conteúdo inválido." }, { status: 400 });
  }

  const updated = await getPrisma().pseudoPrompt.update({
    where: { id },
    data: { content },
    select: { id: true, content: true },
  });

  return NextResponse.json({ data: updated });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  const { id } = await params;
  await getPrisma().pseudoPrompt.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
