import { NextResponse } from "next/server";
import {
  createArtefactContext,
  createArtefactContextSchema,
  listArtefactContexts,
} from "@/features/artefact-context";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json({ data: await listArtefactContexts() });
  } catch {
    return NextResponse.json({ error: "Nao foi possivel carregar artefatos." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const input = createArtefactContextSchema.parse(await request.json());
    return NextResponse.json({ data: await createArtefactContext(input) }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Nao foi possivel criar contexto do artefato." },
      { status: 400 }
    );
  }
}
