import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";
import { getPrisma } from "@/services/database/prisma";
import { isConfiguredAdminEmail, normalizeEmail } from "@/features/auth/services/adminEmails";

async function requireAdmin() {
  const session = await getSession();
  return session?.isAdmin ? session : null;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Nao autorizado." }, { status: 403 });

  const users = await getPrisma().user.findMany({
    select: { id: true, email: true, name: true, isAdmin: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const memberships = await getPrisma().groupMember.findMany({
    select: { userId: true, groupName: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const groupByUserId = new Map<string, string>();
  for (const membership of memberships) {
    if (!groupByUserId.has(membership.userId)) {
      groupByUserId.set(membership.userId, membership.groupName);
    }
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
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Nao autorizado." }, { status: 403 });

  const { email, name, password, isAdmin } = await request.json();
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
}
