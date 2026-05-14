import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { getPrisma } from "@/services/database/prisma";
import { isConfiguredAdminEmail } from "@/features/auth/services/adminEmails";

const patchSchema = z.object({
  name: z.string().optional(),
  isAdmin: z.boolean().optional(),
  password: z.string().optional(),
  groupName: z.enum(["G01", "G02", "G03", "G04", "G05"]).nullable().optional(),
});

async function requireAdmin() {
  const session = await getSession();
  return session?.isAdmin ? session : null;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Nao autorizado." }, { status: 403 });
    const { id } = await params;
    const body = patchSchema.parse(await request.json());

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

    const defaultProject = await getPrisma().projectContext.findFirst({
      select: { id: true },
      orderBy: { createdAt: "asc" },
    });

    const user = await getPrisma().user.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, isAdmin: true, createdAt: true },
    });

    if (defaultProject && body.groupName !== undefined) {
      if (body.groupName === null) {
        await getPrisma().groupMember.deleteMany({
          where: { userId: id, projectContextId: defaultProject.id },
        });
      } else {
        await getPrisma().groupMember.upsert({
          where: { userId_projectContextId: { userId: id, projectContextId: defaultProject.id } },
          create: { userId: id, projectContextId: defaultProject.id, groupName: body.groupName },
          update: { groupName: body.groupName },
        });
      }
    }

    const membership = defaultProject
      ? await getPrisma().groupMember.findUnique({
          where: { userId_projectContextId: { userId: id, projectContextId: defaultProject.id } },
          select: { groupName: true },
        })
      : null;

    return NextResponse.json({
      data: {
        ...user,
        groupName: membership?.groupName ?? null,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Nao foi possivel atualizar o usuario." },
      { status: 400 }
    );
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Nao autorizado." }, { status: 403 });
  const { id } = await params;
  if (id === session.userId) {
    return NextResponse.json({ error: "Nao e possivel excluir a propria conta." }, { status: 400 });
  }
  await getPrisma().user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
