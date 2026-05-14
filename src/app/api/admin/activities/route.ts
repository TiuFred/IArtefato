import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getPrisma } from "@/services/database/prisma";
import { ensureArtefactContextsForAllProjects } from "@/features/artefact-context";

async function requireAdmin() {
  const session = await getSession();
  if (!session?.isAdmin) return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Nao autorizado." }, { status: 403 });
  const activities = await getPrisma().activity.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ data: activities });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Nao autorizado." }, { status: 403 });

  const { subject, title, description, maxScore } = await request.json();
  if (!subject || !title || !description) {
    return NextResponse.json({ error: "Preencha todos os campos." }, { status: 400 });
  }

  const activity = await getPrisma().activity.create({
    data: { subject, title, description: description.trim(), maxScore: maxScore ?? 10 },
  });

  await ensureArtefactContextsForAllProjects(activity.id);

  return NextResponse.json({ data: activity }, { status: 201 });
}
