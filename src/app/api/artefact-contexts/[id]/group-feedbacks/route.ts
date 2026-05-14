import { NextResponse } from "next/server";
import { appendGroupFeedback, appendGroupFeedbackSchema } from "@/features/artefact-context";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const input = appendGroupFeedbackSchema.parse({ ...body, artefactContextId: id });
    return NextResponse.json({ data: await appendGroupFeedback(input) }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Nao foi possivel adicionar feedback." },
      { status: 400 }
    );
  }
}
