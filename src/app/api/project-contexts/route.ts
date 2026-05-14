import { NextResponse } from "next/server";
import {
  createProjectContext,
  createProjectContextSchema,
  listProjectContexts,
} from "@/features/project-context";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json({ data: await listProjectContexts() });
  } catch {
    return NextResponse.json({ error: "Nao foi possivel carregar contextos de projeto." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const input = createProjectContextSchema.parse(await request.json());
    return NextResponse.json({ data: await createProjectContext(input) }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Nao foi possivel criar contexto de projeto." },
      { status: 400 }
    );
  }
}
