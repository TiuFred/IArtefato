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
  if (!(await requireAdmin())) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  const users = await getPrisma().user.findMany({
    select: { id: true, email: true, name: true, isAdmin: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ data: users });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });

  const { email, name, password, isAdmin } = await request.json();
  if (!email || !password) return NextResponse.json({ error: "Email e senha são obrigatórios." }, { status: 400 });

  const normalizedEmail = normalizeEmail(email);
  const exists = await getPrisma().user.findUnique({ where: { email: normalizedEmail } });
  if (exists) return NextResponse.json({ error: "Email já cadastrado." }, { status: 409 });

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

  return NextResponse.json({ data: user }, { status: 201 });
}
