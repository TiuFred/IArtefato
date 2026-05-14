import { NextResponse } from "next/server";
import {
  createCorrectionCase,
  createCorrectionCaseSchema,
  listCorrectionCases,
} from "@/features/correction-inference/services";

export async function GET() {
  try {
    const cases = await listCorrectionCases();
    return NextResponse.json({ data: cases });
  } catch {
    return NextResponse.json(
      { error: "Nao foi possivel carregar a base de correcao." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = createCorrectionCaseSchema.parse(body);
    const correctionCase = await createCorrectionCase(input);
    return NextResponse.json({ data: correctionCase }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Nao foi possivel inferir os padroes de correcao.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}

