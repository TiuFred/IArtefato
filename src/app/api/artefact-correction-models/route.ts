import { NextResponse } from "next/server";
import { listArtefactCorrectionModels } from "@/features/artefact-correction-model/services";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const artefactName = searchParams.get("artefactName") ?? undefined;
    const models = await listArtefactCorrectionModels(artefactName);
    return NextResponse.json({ data: models });
  } catch {
    return NextResponse.json({ error: "Nao foi possivel carregar modelos." }, { status: 500 });
  }
}
