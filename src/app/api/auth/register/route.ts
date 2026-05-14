import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { isConfiguredAdminEmail, normalizeEmail } from "@/features/auth/services/adminEmails";
import { getPrisma } from "@/services/database/prisma";

const registerSchema = z.object({
  email: z.string().email("Informe um email válido."),
  name: z.string().trim().max(120).optional(),
  password: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres."),
});

export async function POST(request: Request) {
  try {
    const input = registerSchema.parse(await request.json());
    const email = normalizeEmail(input.email);

    if (isConfiguredAdminEmail(email)) {
      return NextResponse.json(
        { error: "Este email está reservado para admin. Use a aba Criar admin." },
        { status: 403 }
      );
    }

    const exists = await getPrisma().user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "Email já cadastrado." }, { status: 409 });
    }

    const password = await bcrypt.hash(input.password, 10);
    await getPrisma().user.create({
      data: {
        email,
        name: input.name?.trim() ?? "",
        password,
        isAdmin: false,
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
