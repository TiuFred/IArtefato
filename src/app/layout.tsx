import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Toaster } from "sonner";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getSession } from "@/lib/session";
import { LogoutButton } from "@/components/layout/LogoutButton";
import { getPrisma } from "@/services/database/prisma";

export const metadata: Metadata = {
  title: "IArtefato",
  description: "Inferência de padrões de correção acadêmica",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const headersList = await headers();
  const pathname =
    headersList.get("x-pathname") ??
    headersList.get("next-url") ??
    headersList.get("x-invoke-path") ??
    "";

  const isPublicRoute =
    !session ||
    !pathname ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/aguardando-grupo");

  if (!isPublicRoute && !session.isAdmin) {
    let hasMembership = true;
    try {
      const membership = await getPrisma().groupMember.findFirst({
        where: { userId: session.userId },
        select: { groupName: true },
      });
      hasMembership = Boolean(membership);
    } catch {
      // Prevent a membership lookup failure from crashing all student pages.
      hasMembership = true;
    }
    if (!hasMembership) {
      redirect("/aguardando-grupo");
    }
  }

  return (
    <html lang="pt-BR">
      <body style={{ background: "#0d0d0d", color: "#e8e8e8", minHeight: "100vh" }}>
        {session && (
          <nav style={{
            borderBottom: "1px solid #222", padding: "0 24px", height: 52,
            display: "flex", alignItems: "center", gap: 8,
            background: "#0d0d0d", position: "sticky", top: 0, zIndex: 10,
          }}>
            <Link href="/" style={{ fontWeight: 700, fontSize: 15, color: "#4f8ef7", marginRight: 20 }}>
              IArtefato
            </Link>

            {/* Links for all logged-in users */}
            <Link href="/dashboard" style={navLinkStyle}>Dashboard</Link>
            <Link href="/base-correcao" style={navLinkStyle}>Base de Correção</Link>
            <Link href="/simular" style={navLinkStyle}>Simular</Link>
            <Link href="/tutorial" style={navLinkStyle}>Tutorial</Link>

            {/* Admin-only links */}
            {session.isAdmin && (
              <>
                <Link href="/padroes" style={navLinkStyle}>Padrões</Link>
                <Link href="/admin" style={{
                  ...navLinkStyle,
                  background: "#7c3aed20", border: "1px solid #7c3aed40",
                  color: "#a78bfa", fontWeight: 600,
                }}>
                  Admin
                </Link>
              </>
            )}

            {/* User info + logout */}
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 13, color: "#475569" }}>
                {session.name || session.email}
              </span>
              <LogoutButton />
            </div>
          </nav>
        )}

        <main style={{ maxWidth: 900, margin: "0 auto", padding: session ? "36px 24px" : "0" }}>
          {children}
        </main>
        <Toaster richColors theme="dark" position="top-right" />
      </body>
    </html>
  );
}

const navLinkStyle: React.CSSProperties = {
  padding: "5px 12px", borderRadius: 6, color: "#888", fontSize: 14,
};
