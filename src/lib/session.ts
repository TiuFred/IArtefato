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
  try {
    const session = await auth();
    if (!session?.user?.email) return null;
    return {
      userId: session.user.id ?? "",
      email: session.user.email,
      name: session.user.name ?? session.user.email,
      isAdmin: session.user.isAdmin ?? false,
    };
  } catch (error) {
    if (isNextDynamicServerError(error)) {
      throw error;
    }
    console.error("[session:getSession]", error);
    return null;
  }
}

function isNextDynamicServerError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const data = error as { digest?: unknown; message?: unknown };
  return (
    data.digest === "DYNAMIC_SERVER_USAGE" ||
    (typeof data.message === "string" && data.message.includes("Dynamic server usage"))
  );
}
