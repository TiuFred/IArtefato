import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";
import { getPrisma } from "@/services/database/prisma";
import { isConfiguredAdminEmail } from "@/features/auth/services/adminEmails";

async function requireAdmin() {
  const session = await getSession();
  return session?.isAdmin ? session : null;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  const { id } = await params;
  const body = await request.json();

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.isAdmin !== undefined) {
    const current = await getPrisma().user.findUnique({
      where: { id },
      select: { email: true },
    });
    data.isAdmin = Boolean(body.isAdmin) || Boolean(current?.email && isConfiguredAdminEmail(current.email));
  }
  if (body.password) data.password = await bcrypt.hash(body.password, 10);

  const user = await getPrisma().user.update({
    where: { id },
    data,
    select: { id: true, email: true, name: true, isAdmin: true, createdAt: true },
  });

  return NextResponse.json({ data: user });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  const { id } = await params;
  if (id === session.userId) return NextResponse.json({ error: "Não é possível excluir a própria conta." }, { status: 400 });
  await getPrisma().user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
