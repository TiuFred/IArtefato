import { NextResponse } from "next/server";
import { getArtefactContext } from "@/features/artefact-context";

export const runtime = "nodejs";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const artefact = await getArtefactContext(id);
    if (!artefact) return NextResponse.json({ error: "Artefato nao encontrado." }, { status: 404 });
    return NextResponse.json({ data: artefact });
  } catch {
    return NextResponse.json({ error: "Nao foi possivel carregar o artefato." }, { status: 500 });
  }
}
