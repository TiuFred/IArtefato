import { NextResponse } from "next/server";
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
    const body = await request.json();
    const input = createSimulationSchema.parse(body);
    const simulation = await createEvaluationSimulation(input);
    return NextResponse.json({ data: simulation }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Nao foi possivel simular a avaliacao.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}

