import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";
import { getPrisma } from "@/services/database/prisma";
import { isConfiguredAdminEmail, normalizeEmail } from "@/features/auth/services/adminEmails";

export const runtime = "nodejs";

async function requireAdmin() {
  const session = await getSession();
  return session?.isAdmin ? session : null;
}

export async function GET() {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Nao autorizado." }, { status: 403 });
    }

    const users = await getPrisma().user.findMany({
      select: { id: true, email: true, name: true, isAdmin: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    // groupMember may not exist yet if migration hasn't been run — degrade gracefully
    let memberships: Array<{ userId: string; groupName: string }> = [];
    try {
      memberships = await getPrisma().groupMember.findMany({
        select: { userId: true, groupName: true },
        orderBy: { createdAt: "asc" },
      });
    } catch {
      // table not yet migrated — return users without group info
    }

    const groupByUserId = new Map<string, string>();
    for (const m of memberships) {
      if (!groupByUserId.has(m.userId)) groupByUserId.set(m.userId, m.groupName);
    }

    return NextResponse.json({
      data: users.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        groupName: groupByUserId.get(user.id) ?? null,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao carregar usuarios." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Nao autorizado." }, { status: 403 });
    }

    const { email, name, password, isAdmin } = await request.json() as {
      email?: string; name?: string; password?: string; isAdmin?: boolean;
    };

    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha sao obrigatorios." }, { status: 400 });
    }

    const normalizedEmail = normalizeEmail(email);
    const exists = await getPrisma().user.findUnique({ where: { email: normalizedEmail } });
    if (exists) return NextResponse.json({ error: "Email ja cadastrado." }, { status: 409 });

    const hashed = await bcrypt.hash(password, 10);
    const user = await getPrisma().user.create({
      data: {
        email: normalizedEmail,
        name: name ?? "",
        password: hashed,
        isAdmin: Boolean(isAdmin) || isConfiguredAdminEmail(normalizedEmail),
      },
      select: { id: true, email: true, name: true, isAdmin: true, createdAt: true },
    });

    return NextResponse.json({ data: { ...user, groupName: null } }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao criar usuario." },
      { status: 500 }
    );
  }
}
