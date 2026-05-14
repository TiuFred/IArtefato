import { NextResponse } from "next/server";
import { deleteCorrectionCase, getCorrectionCase } from "@/features/correction-inference/services";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const correctionCase = await getCorrectionCase(id);

    if (!correctionCase) {
      return NextResponse.json({ error: "Caso nao encontrado." }, { status: 404 });
    }

    return NextResponse.json({ data: correctionCase });
  } catch {
    return NextResponse.json(
      { error: "Nao foi possivel carregar o caso." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteCorrectionCase(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Nao foi possivel remover o caso." },
      { status: 500 }
    );
  }
}

