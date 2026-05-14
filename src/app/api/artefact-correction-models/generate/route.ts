import { NextResponse } from "next/server";
import { z } from "zod";
import { generateArtefactCorrectionModel } from "@/features/artefact-correction-model/services";

export const runtime = "nodejs";

const generateSchema = z.object({
  artefactContextId: z.string().trim().min(1),
});

export async function POST(request: Request) {
  try {
    const input = generateSchema.parse(await request.json());
    return NextResponse.json({ data: await generateArtefactCorrectionModel(input.artefactContextId) }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Nao foi possivel gerar modelo do artefato." },
      { status: 400 }
    );
  }
}
