import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { listGroupMembers, assignGroupMember } from "@/features/group-member";

export const runtime = "nodejs";

const assignSchema = z.object({
  userId: z.string().min(1),
  groupName: z.enum(["G01", "G02", "G03", "G04", "G05"]),
  projectContextId: z.string().min(1).optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Acesso restrito ao admin." }, { status: 403 });
    }

    const members = await listGroupMembers();
    return NextResponse.json({ data: members });
  } catch {
    return NextResponse.json({ error: "Nao foi possivel carregar membros." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Acesso restrito ao admin." }, { status: 403 });
    }
    const body = await request.json();
    const input = assignSchema.parse(body);
    const member = await assignGroupMember(input);
    return NextResponse.json({ data: member }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Nao foi possivel alocar membro." },
      { status: 400 }
    );
  }
}
