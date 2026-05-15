import { getPrisma } from "@/services/database/prisma";
import Link from "next/link";
import { RecentCorrections, type CorrectionItem } from "./_components/RecentCorrections";

export const dynamic = "force-dynamic";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const anyDb = () => getPrisma() as unknown as Record<string, any>;


export default async function AdminPage() {
  const db = getPrisma();

  let userCount = 0;
  let activityCount = 0;
  let groupFeedbackCount = 0;
  let modelCount = 0;
  let recentCorrections: CorrectionItem[] = [];

  try {
    [userCount, activityCount] = await Promise.all([
      db.user.count(),
      db.activity.count(),
    ]);
  } catch { /* degraded */ }

  try {
    [groupFeedbackCount, modelCount] = await Promise.all([
      anyDb().groupFeedback.count(),
      anyDb().artefactCorrectionModel.count(),
    ]);
  } catch { /* degraded */ }

  try {
    const rows = await anyDb().groupFeedback.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { artefactContext: { select: { artefactName: true } } },
    });
    recentCorrections = (rows as Array<{
      id: string; groupName: string; feedback: string;
      score: number; maxScore: number; createdAt: Date;
      artefactContext: { artefactName: string };
    }>).map((r) => ({
      id: r.id,
      groupName: r.groupName,
      artefactName: r.artefactContext.artefactName,
      feedback: r.feedback,
      score: r.score,
      maxScore: r.maxScore,
      createdAt: r.createdAt.toISOString(),
    }));
  } catch { /* degraded */ }

  const stats = [
    { label: "Usuarios", value: userCount, href: "/admin/usuarios", color: "#a78bfa" },
    { label: "Artefatos", value: activityCount, href: "/admin/atividades", color: "#4f8ef7" },
    { label: "Correcoes registradas", value: groupFeedbackCount, href: null, color: "#34d399" },
    { label: "Modelos gerados", value: modelCount, href: null, color: "#fbbf24" },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#e2e8f0", marginBottom: 6 }}>Visao geral</h1>
      <p style={{ fontSize: 14, color: "#475569", marginBottom: 28 }}>
        Resumo de tudo que esta acontecendo no IArtefato.
      </p>

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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 32 }}>
        {[
          { href: "/admin/atividades", icon: "◉", title: "Gerenciar artefatos", desc: "Cadastre os artefatos que todos os grupos poderao usar", color: "#4f8ef7" },
          { href: "/admin/prompts", icon: "⬡", title: "Ver prompts inferidos", desc: "Analise e edite os pseudo-prompts de cada materia", color: "#34d399" },
          { href: "/admin/usuarios", icon: "◆", title: "Gerenciar usuarios", desc: "Crie contas e defina quem e administrador", color: "#a78bfa" },
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

      <h2 style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0", marginBottom: 12 }}>
        Correcoes recentes
      </h2>
      <RecentCorrections initial={recentCorrections} />
    </div>
  );
}
