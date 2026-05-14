import { getPrisma } from "@/services/database/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

type RecentCorrection = {
  id: string;
  subject: string;
  activityDescription: string;
  score: number;
  maxScore: number;
  createdAt: Date;
};

export default async function AdminPage() {
  const db = getPrisma();
  const [userCount, activityCount, correctionCount, simulationCount] = await Promise.all([
    db.user.count(),
    db.activity.count(),
    db.correctionCase.count(),
    db.simulation.count(),
  ]);

  const recentCorrections: RecentCorrection[] = await db.correctionCase.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, subject: true, activityDescription: true, score: true, maxScore: true, createdAt: true },
  });

  const stats = [
    { label: "Usuários", value: userCount, href: "/admin/usuarios", color: "#a78bfa" },
    { label: "Atividades predefinidas", value: activityCount, href: "/admin/atividades", color: "#4f8ef7" },
    { label: "Correções cadastradas", value: correctionCount, href: null, color: "#34d399" },
    { label: "Simulações realizadas", value: simulationCount, href: null, color: "#fbbf24" },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#e2e8f0", marginBottom: 6 }}>Visão geral</h1>
      <p style={{ fontSize: 14, color: "#475569", marginBottom: 28 }}>
        Resumo de tudo que está acontecendo no IArtefato.
      </p>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 32 }}>
        {stats.map(({ label, value, href, color }) => (
          <div key={label} style={{
            padding: "16px", background: "#141414",
            border: "1px solid #1e1e2e", borderRadius: 10,
          }}>
            <div style={{ fontSize: 11, color: "#475569", marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color, marginBottom: 8 }}>{value}</div>
            {href && (
              <Link href={href} style={{ fontSize: 12, color: "#475569", textDecoration: "none" }}>
                Gerenciar →
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Atalhos admin */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 32 }}>
        {[
          { href: "/admin/atividades", icon: "◉", title: "Gerenciar atividades", desc: "Adicione enunciados que os alunos poderão usar", color: "#4f8ef7" },
          { href: "/admin/prompts", icon: "⬡", title: "Ver prompts inferidos", desc: "Analise e edite os pseudo-prompts de cada matéria", color: "#34d399" },
          { href: "/admin/usuarios", icon: "◆", title: "Gerenciar usuários", desc: "Crie contas e defina quem é administrador", color: "#a78bfa" },
        ].map(({ href, icon, title, desc, color }) => (
          <Link key={href} href={href} style={{ textDecoration: "none" }}>
            <div style={{
              padding: "18px", background: "#141414",
              border: "1px solid #1e1e2e", borderRadius: 10,
              transition: "border-color 0.15s", cursor: "pointer",
            }}>
              <div style={{ fontSize: 22, marginBottom: 8, color }}>{icon}</div>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#e2e8f0", marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.5 }}>{desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Correções recentes */}
      <h2 style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0", marginBottom: 12 }}>
        Correções recentes (todos os usuários)
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {recentCorrections.length === 0 ? (
          <div style={{ padding: "20px", background: "#141414", border: "1px solid #1e1e2e", borderRadius: 8, color: "#475569", fontSize: 14 }}>
            Nenhuma correção cadastrada ainda.
          </div>
        ) : recentCorrections.map((c) => (
          <div key={c.id} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "12px 16px", background: "#141414", border: "1px solid #1e1e2e", borderRadius: 8,
          }}>
            <div>
              <span style={{
                fontSize: 11, fontWeight: 600, marginRight: 8,
                padding: "2px 7px", borderRadius: 4, background: "#1e1e2e", color: "#64748b",
              }}>{c.subject}</span>
              <span style={{ fontSize: 13, color: "#94a3b8" }}>
                {c.activityDescription.slice(0, 72)}{c.activityDescription.length > 72 ? "..." : ""}
              </span>
            </div>
            <div style={{ display: "flex", gap: 16, alignItems: "center", flexShrink: 0 }}>
              <span style={{ fontWeight: 700, color: c.score / c.maxScore >= 0.7 ? "#4ade80" : "#f87171" }}>
                {c.score}/{c.maxScore}
              </span>
              <span style={{ fontSize: 12, color: "#334155" }}>
                {new Date(c.createdAt).toLocaleDateString("pt-BR")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
