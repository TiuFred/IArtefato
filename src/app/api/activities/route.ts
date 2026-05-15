import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getPrisma } from "@/services/database/prisma";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const subject = searchParams.get("subject");

    const activities = await getPrisma().activity.findMany({
      where: { isActive: true, ...(subject ? { subject } : {}) },
      select: { id: true, subject: true, title: true, description: true, maxScore: true },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ data: activities });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao carregar atividades." },
      { status: 500 }
    );
  }
}
