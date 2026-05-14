import Link from "next/link";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

const adminNav = [
  { href: "/admin", label: "Visão geral", icon: "◈" },
  { href: "/admin/atividades", label: "Atividades", icon: "◉" },
  { href: "/admin/grupos", label: "Grupos de alunos", icon: "⬡" },
  { href: "/admin/prompts", label: "Prompts de correção", icon: "▣" },
  { href: "/admin/usuarios", label: "Usuários", icon: "◆" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session?.isAdmin) redirect("/dashboard");

  return (
    <div style={{ display: "flex", gap: 0, marginTop: -36, minHeight: "calc(100vh - 52px)" }}>
      {/* Sidebar admin */}
      <aside style={{
        width: 210, flexShrink: 0, background: "#0a0a0f",
        borderRight: "1px solid #1e1e2e", padding: "24px 0",
        position: "sticky", top: 52, height: "calc(100vh - 52px)", overflowY: "auto",
      }}>
        <div style={{
          margin: "0 16px 16px", padding: "10px 12px",
          background: "#7c3aed15", border: "1px solid #7c3aed30", borderRadius: 8,
        }}>
          <div style={{ fontSize: 10, color: "#7c3aed", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>
            Painel Admin
          </div>
          <div style={{ fontSize: 12, color: "#a78bfa" }}>{session.email}</div>
        </div>

        <div style={{ fontSize: 10, color: "#334155", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 16px 8px" }}>
          Administração
        </div>

        {adminNav.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 16px", color: "#94a3b8", fontSize: 13,
              textDecoration: "none", transition: "all 0.15s",
            }}
          >
            <span style={{ width: 20, textAlign: "center", color: "#475569" }}>{icon}</span>
            {label}
          </Link>
        ))}

        <div style={{ height: 1, background: "#1e1e2e", margin: "16px 0" }} />

        <Link
          href="/dashboard"
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "9px 16px", color: "#475569", fontSize: 13,
            textDecoration: "none",
          }}
        >
          <span>←</span> Voltar ao site
        </Link>
      </aside>

      {/* Conteúdo */}
      <main style={{ flex: 1, padding: "32px 40px", overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}
