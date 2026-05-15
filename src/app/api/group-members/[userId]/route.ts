import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { removeGroupMember } from "@/features/group-member";

export const runtime = "nodejs";

const paramsSchema = z.object({ userId: z.string().min(1) });

export async function DELETE(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Acesso restrito ao admin." }, { status: 403 });
    }
    const { userId } = paramsSchema.parse(await context.params);
    await removeGroupMember(userId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Nao foi possivel remover membro." },
      { status: 400 }
    );
  }
}
