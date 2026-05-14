import { NextResponse } from "next/server";
import { z } from "zod";
import { searchSimilarCorrectionCases } from "@/features/semantic-memory/services";

const searchSchema = z.object({
  text: z.string().min(1),
  tags: z.array(z.string()).optional(),
  limit: z.number().int().min(1).max(10).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = searchSchema.parse(body);
    const results = await searchSimilarCorrectionCases(input);
    return NextResponse.json({ data: results });
  } catch {
    return NextResponse.json(
      { error: "Nao foi possivel buscar memoria semantica." },
      { status: 400 }
    );
  }
}
