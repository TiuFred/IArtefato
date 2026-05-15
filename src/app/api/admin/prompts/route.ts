import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getPrisma } from "@/services/database/prisma";

export const runtime = "nodejs";

async function requireAdmin() {
  const session = await getSession();
  return session?.isAdmin ? session : null;
}

export async function GET() {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
    }

    const prompts = await getPrisma().pseudoPrompt.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        correctionCase: {
          select: { id: true, subject: true, activityDescription: true, score: true, maxScore: true, createdAt: true },
        },
        simulation: {
          select: { id: true, subject: true, activityDescription: true, createdAt: true },
        },
      },
    });

    return NextResponse.json({ data: prompts });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao carregar prompts." },
      { status: 500 }
    );
  }
}
