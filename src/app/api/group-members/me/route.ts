import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getGroupMemberByUser } from "@/features/group-member";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ groupName: null });
    }
    const { searchParams } = new URL(request.url);
    const projectContextId = searchParams.get("projectContextId") ?? "";
    if (!projectContextId) {
      return NextResponse.json({ groupName: null });
    }
    const member = await getGroupMemberByUser(session.user.id, projectContextId);
    return NextResponse.json({ groupName: member?.groupName ?? null });
  } catch {
    return NextResponse.json({ groupName: null });
  }
}
