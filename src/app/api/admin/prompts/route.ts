import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getPrisma } from "@/services/database/prisma";

async function requireAdmin() {
  const session = await getSession();
  return session?.isAdmin ? session : null;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });

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
}
