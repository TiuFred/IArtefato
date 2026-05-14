import Link from "next/link";
import { listCorrectionCases } from "@/features/correction-inference/services";
import { listSimulations } from "@/features/evaluation-simulator/services";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const { cases, simulations, error } = await loadDashboardData();
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
          Banco ainda não disponível no runtime. Verifique se `.env.local` existe na raiz e rode as migrations.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 32 }}>
        <Stat label="Correções analisadas" value={String(cases.length)} />
        <Stat label="Simulações salvas" value={String(simulations.length)} />
        <Stat label="Nota média observada" value={`${Math.round(averageScore * 100)}%`} />
      </div>

      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
        Correções recentes
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {cases.length === 0 ? (
          <div style={emptyStyle}>Nenhuma correção real salva ainda.</div>
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

      <div style={{ marginTop: 24 }}>
        <Link href="/base-correcao" style={primaryLinkStyle}>
          + Adicionar correção
        </Link>
      </div>
    </div>
  );
}

async function loadDashboardData() {
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
