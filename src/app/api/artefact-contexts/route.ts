import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  createArtefactContext,
  createArtefactContextSchema,
  listArtefactContexts,
  sanitizeArtefactForGroup,
} from "@/features/artefact-context";
import { getPrisma } from "@/services/database/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
    }

    const artefacts = await listArtefactContexts();
    if (session.user.isAdmin) {
      return NextResponse.json({ data: artefacts });
    }

    const memberships = await getPrisma().groupMember.findMany({
      where: { userId: session.user.id },
      select: { projectContextId: true, groupName: true },
    });
    const membershipByProject = new Map(
      memberships.map((membership) => [membership.projectContextId, membership.groupName])
    );

    return NextResponse.json({
      data: artefacts
        .filter((artefact) => membershipByProject.has(artefact.projectContextId))
        .map((artefact) => sanitizeArtefactForGroup(artefact, membershipByProject.get(artefact.projectContextId)!)),
    });
  } catch {
    return NextResponse.json({ error: "Nao foi possivel carregar artefatos." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Apenas administradores podem criar artefatos." }, { status: 403 });
    }

    const input = createArtefactContextSchema.parse(await request.json());
    return NextResponse.json({ data: await createArtefactContext(input) }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Nao foi possivel criar contexto do artefato." },
      { status: 400 }
    );
  }
}
