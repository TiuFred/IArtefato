import Link from "next/link";
import { getSession } from "@/lib/session";
import { getPrisma } from "@/services/database/prisma";
import { listCorrectionCases } from "@/features/correction-inference/services";
import { listSimulations } from "@/features/evaluation-simulator/services";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const session = await getSession();
  if (!session) return null;

  if (session.isAdmin) {
    const { cases, simulations, error } = await loadAdminDashboardData();
    const averageScore =
      cases.length > 0
        ? cases.reduce((sum, item) => sum + item.score / item.maxScore, 0) / cases.length
        : 0;

    return (
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>
          Dashboard
        </h1>

        {error && (
          <div style={{ ...emptyStyle, marginBottom: 24, color: "#fbbf24" }}>
            Banco ainda nao disponivel no runtime.
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 32 }}>
          <Stat label="Correcoes analisadas" value={String(cases.length)} />
          <Stat label="Simulacoes salvas" value={String(simulations.length)} />
          <Stat label="Nota media observada" value={`${Math.round(averageScore * 100)}%`} />
        </div>

        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
          Correcoes recentes
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {cases.length === 0 ? (
            <div style={emptyStyle}>Nenhuma correcao real salva ainda.</div>
          ) : (
            cases.slice(0, 5).map((entry) => (
              <div key={entry.id} style={rowStyle}>
                <div>
                  <div style={{ fontWeight: 500, marginBottom: 2 }}>
                    {entry.activityDescription.slice(0, 96)}
                    {entry.activityDescription.length > 96 ? "..." : ""}
                  </div>
                  <div style={{ color: "#888", fontSize: 13 }}>
                    {entry.inference.criteria.map((criterion) => criterion.name).slice(0, 3).join(" · ")}
                  </div>
                </div>
                <span style={{ fontWeight: 600 }}>
                  {entry.score}/{entry.maxScore}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  const data = await loadStudentDashboardData(session.userId);
  const averageScore =
    data.feedbacks.length > 0
      ? data.feedbacks.reduce((sum, item) => sum + item.score / item.maxScore, 0) / data.feedbacks.length
      : 0;

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Dashboard do Grupo</h1>
      <p style={{ color: "#888", marginBottom: 24 }}>
        {data.projectName} · <span style={{ color: "#4f8ef7" }}>{data.groupName}</span>
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 32 }}>
        <Stat label="Artefatos disponiveis" value={String(data.artefactCount)} />
        <Stat label="Correcoes do grupo" value={String(data.feedbacks.length)} />
        <Stat label="Nota media do grupo" value={`${Math.round(averageScore * 100)}%`} />
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
        <Link href="/base-correcao" style={primaryLinkStyle}>Base de correcao</Link>
        <Link href="/simular" style={secondaryLinkStyle}>Simular avaliacao</Link>
      </div>

      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Historico recente do grupo</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {data.feedbacks.length === 0 ? (
          <div style={emptyStyle}>Seu grupo ainda nao registrou correcoes.</div>
        ) : (
          data.feedbacks.slice(0, 8).map((entry) => (
            <div key={entry.id} style={rowStyle}>
              <div>
                <div style={{ fontWeight: 500, marginBottom: 2 }}>
                  {entry.artefactName}
                </div>
                <div style={{ color: "#888", fontSize: 13 }}>
                  {entry.feedback.length > 96 ? `${entry.feedback.slice(0, 96)}...` : entry.feedback}
                </div>
              </div>
              <span style={{ fontWeight: 600 }}>
                {entry.score}/{entry.maxScore}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

async function loadAdminDashboardData() {
  try {
    const [cases, simulations] = await Promise.all([
      listCorrectionCases(),
      listSimulations(),
    ]);

    return { cases, simulations, error: null };
  } catch (error) {
    return {
      cases: [],
      simulations: [],
      error: error instanceof Error ? error.message : "Database unavailable",
    };
  }
}

async function loadStudentDashboardData(userId: string) {
  try {
    const membership = await getPrisma().groupMember.findFirst({
      where: { userId },
      include: {
        projectContext: {
          include: {
            artefactContexts: {
              include: {
                groupFeedbacks: {
                  where: {},
                  orderBy: { createdAt: "desc" },
                },
              },
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    if (!membership) {
      return emptyStudentDashboardData();
    }

    const feedbacks = membership.projectContext.artefactContexts.flatMap((artefact) =>
      artefact.groupFeedbacks
        .filter((feedback) => feedback.groupName === membership.groupName)
        .map((feedback) => ({
          id: feedback.id,
          artefactName: artefact.artefactName,
          feedback: feedback.feedback,
          score: feedback.score,
          maxScore: feedback.maxScore,
        }))
    );

    return {
      groupName: membership.groupName,
      projectName: membership.projectContext.name,
      artefactCount: membership.projectContext.artefactContexts.length,
      feedbacks,
    };
  } catch {
    return emptyStudentDashboardData();
  }
}

function emptyStudentDashboardData() {
  return {
    groupName: "Sem grupo",
    projectName: "Sem projeto",
    artefactCount: 0,
    feedbacks: [] as Array<{ id: string; artefactName: string; feedback: string; score: number; maxScore: number }>,
  };
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={statStyle}>
      <div style={{ color: "#888", fontSize: 12, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

const statStyle: React.CSSProperties = {
  padding: "16px",
  background: "#141414",
  border: "1px solid #222",
  borderRadius: 8,
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 16px",
  background: "#141414",
  border: "1px solid #222",
  borderRadius: 8,
  gap: 16,
};

const emptyStyle: React.CSSProperties = {
  padding: "24px 16px",
  background: "#141414",
  border: "1px solid #222",
  borderRadius: 8,
  color: "#777",
};

const primaryLinkStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "8px 16px",
  background: "#4f8ef7",
  color: "#fff",
  borderRadius: 6,
  fontWeight: 500,
  fontSize: 14,
};

const secondaryLinkStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "8px 16px",
  background: "#141414",
  color: "#e8e8e8",
  borderRadius: 6,
  border: "1px solid #333",
  fontWeight: 500,
  fontSize: 14,
};
