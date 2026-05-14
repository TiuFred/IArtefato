import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/services/database/prisma";
import {
  createEvaluationSimulation,
  createSimulationSchema,
  listSimulations,
} from "@/features/evaluation-simulator/services";

export async function GET() {
  try {
    const simulations = await listSimulations();
    return NextResponse.json({ data: simulations });
  } catch {
    return NextResponse.json(
      { error: "Nao foi possivel carregar simulacoes." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
    }

    const body = await request.json();
    const input = createSimulationSchema.parse(body);
    const membership = await getPrisma().groupMember.findFirst({
      where: { userId: session.user.id },
      select: { projectContextId: true },
      orderBy: { createdAt: "asc" },
    });
    const simulation = await createEvaluationSimulation(input, {
      projectContextId: membership?.projectContextId,
    });
    return NextResponse.json({ data: simulation }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Nao foi possivel simular a avaliacao.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}

