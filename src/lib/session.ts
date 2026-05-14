/**
 * session.ts — wrapper de compatibilidade sobre o NextAuth auth()
 * Todos os server components e API routes importam getSession() daqui.
 */

import { auth } from "@/auth";

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

export async function getSession(): Promise<SessionPayload | null> {
  const session = await auth();
  if (!session?.user?.email) return null;
  return {
    userId: session.user.id ?? "",
    email: session.user.email,
    name: session.user.name ?? session.user.email,
    isAdmin: session.user.isAdmin ?? false,
  };
}
