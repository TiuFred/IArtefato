import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getPrisma } from "@/services/database/prisma";
import { ensureArtefactContextsForAllProjects } from "@/features/artefact-context";

export const runtime = "nodejs";

async function requireAdmin() {
  const session = await getSession();
  return session?.isAdmin ? session : null;
}

export async function GET() {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Nao autorizado." }, { status: 403 });
    const activities = await getPrisma().activity.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ data: activities });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao carregar atividades." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Nao autorizado." }, { status: 403 });

    const { subject, title, description, maxScore } = await request.json() as {
      subject?: string; title?: string; description?: string; maxScore?: number;
    };
    if (!subject || !title || !description) {
      return NextResponse.json({ error: "Preencha todos os campos." }, { status: 400 });
    }

    const activity = await getPrisma().activity.create({
      data: { subject, title, description: description.trim(), maxScore: maxScore ?? 10 },
    });

    try {
      await ensureArtefactContextsForAllProjects(activity.id);
    } catch {
      // non-fatal: artefact sync can be retried
    }

    return NextResponse.json({ data: activity }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao criar atividade." },
      { status: 500 }
    );
  }
}
