import "server-only";

import { getPrisma } from "@/services/database/prisma";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => getPrisma() as unknown as Record<string, any>;

export interface GroupMemberView {
  id: string;
  userId: string;
  groupName: string;
  projectContextId: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
  projectContext: { id: string; name: string };
}

type GroupMemberRow = {
  id: string;
  userId: string;
  groupName: string;
  projectContextId: string;
  createdAt: Date;
  user: { id: string; name: string; email: string };
  projectContext: { id: string; name: string };
};

const includeGroupMember = {
  user: { select: { id: true, name: true, email: true } },
  projectContext: { select: { id: true, name: true } },
};

export async function listGroupMembers(projectContextId?: string): Promise<GroupMemberView[]> {
  const rows: GroupMemberRow[] = await db().groupMember.findMany({
    where: projectContextId ? { projectContextId } : undefined,
    include: includeGroupMember,
    orderBy: [{ groupName: "asc" }, { createdAt: "asc" }],
  });
  return rows.map(mapGroupMember);
}

export async function getGroupMemberByUser(userId: string, projectContextId: string): Promise<GroupMemberView | null> {
  const row: GroupMemberRow | null = await db().groupMember.findUnique({
    where: { userId_projectContextId: { userId, projectContextId } },
    include: includeGroupMember,
  });
  return row ? mapGroupMember(row) : null;
}

export async function assignGroupMember(params: {
  userId: string;
  groupName: string;
  projectContextId: string;
}): Promise<GroupMemberView> {
  const row: GroupMemberRow = await db().groupMember.upsert({
    where: { userId_projectContextId: { userId: params.userId, projectContextId: params.projectContextId } },
    create: { userId: params.userId, groupName: params.groupName, projectContextId: params.projectContextId },
    update: { groupName: params.groupName },
    include: includeGroupMember,
  });
  return mapGroupMember(row);
}

export async function removeGroupMember(userId: string, projectContextId: string): Promise<void> {
  await db().groupMember.deleteMany({
    where: { userId, projectContextId },
  });
}

function mapGroupMember(row: GroupMemberRow): GroupMemberView {
  return {
    id: row.id,
    userId: row.userId,
    groupName: row.groupName,
    projectContextId: row.projectContextId,
    createdAt: row.createdAt.toISOString(),
    user: row.user,
    projectContext: row.projectContext,
  };
}
