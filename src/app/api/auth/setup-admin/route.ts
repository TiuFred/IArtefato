import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { isConfiguredAdminEmail, normalizeEmail } from "@/features/auth/services/adminEmails";
import { getPrisma } from "@/services/database/prisma";

const setupSchema = z.object({
  email: z.string().email(),
  name: z.string().trim().max(120).optional(),
  password: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres."),
});

export async function POST(request: Request) {
  try {
    const input = setupSchema.parse(await request.json());
    const email = normalizeEmail(input.email);

    if (!isConfiguredAdminEmail(email)) {
      return NextResponse.json(
        { error: "Este email não está habilitado como administrador." },
        { status: 403 }
      );
    }

    const existing = await getPrisma().user.findUnique({ where: { email } });
    if (existing) {
      await getPrisma().user.update({
        where: { email },
        data: { isAdmin: true },
      });

      return NextResponse.json(
        { error: "Este admin já existe. Use o login ou redefina a senha pelo painel." },
        { status: 409 }
      );
    }

    const password = await bcrypt.hash(input.password, 10);
    await getPrisma().user.create({
      data: {
        email,
        name: input.name?.trim() ?? "",
        password,
        isAdmin: true,
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Dados inválidos." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Banco de dados indisponível. Verifique DATABASE_URL e migrations." },
      { status: 503 }
    );
  }
}
