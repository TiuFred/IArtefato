import { getPrisma } from "@/services/database/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const anyDb = () => getPrisma() as unknown as Record<string, any>;

const MINIMUM_FEEDBACKS = 5;

type ModelRow = {
  id: string;
  artefactName: string;
  rigorLevel: string;
  confidence: number;
  groupFeedbackCount: number;
  inferredRules: unknown;
  inferredPatterns: unknown;
  detectedPenalties: unknown;
  correctionStyle: unknown;
  generatedAt: Date;
  artefactContext: { id: string; description: string };
};

type ArtefactStatusRow = {
  id: string;
  artefactName: string;
  feedbackCount: number;
  hasModel: boolean;
  projectName: string;
};

export default async function PadroesPage() {
  let models: ModelRow[] = [];
  let totalFeedbacks = 0;
  let artefactStatuses: ArtefactStatusRow[] = [];
  let dbError = false;

  try {
    const [rawModels, feedbackCount, artefacts] = await Promise.all([
      anyDb().artefactCorrectionModel.findMany({
        orderBy: { generatedAt: "desc" },
        include: { artefactContext: { select: { id: true, description: true } } },
      }),
      anyDb().groupFeedback.count(),
      anyDb().artefactContext.findMany({
        orderBy: { createdAt: "asc" },
        include: {
          projectContext: { select: { name: true } },
          _count: { select: { groupFeedbacks: true } },
          correctionModels: { select: { id: true }, take: 1, orderBy: { generatedAt: "desc" } },
        },
      }),
    ]);

    models = rawModels;
    totalFeedbacks = feedbackCount;
    artefactStatuses = artefacts.map((a: any) => ({
      id: a.id,
      artefactName: a.artefactName,
      feedbackCount: a._count.groupFeedbacks,
      hasModel: a.correctionModels.length > 0,
      projectName: a.projectContext.name,
    }));
  } catch {
    dbError = true;
  }

  const readyNoModel = artefactStatuses.filter(
    (a) => a.feedbackCount >= MINIMUM_FEEDBACKS && !a.hasModel
  );
  const pending = artefactStatuses.filter(
    (a) => a.feedbackCount < MINIMUM_FEEDBACKS
  );

  const rigorLabel: Record<string, string> = {
    low: "Permissivo",
    medium: "Equilibrado",
    high: "Rigoroso",
    very_high: "Muito rigoroso",
  };

  const rigorColor: Record<string, string> = {
    low: "#4ade80",
    medium: "#fbbf24",
    high: "#f97316",
    very_high: "#ef4444",
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Padrões por Artefato</h1>
        <p style={{ color: "#888", fontSize: 14, maxWidth: 600 }}>
          Modelos de correção inferidos automaticamente a partir das correções registradas pelos grupos.
          {totalFeedbacks > 0 && (
            <span style={{ color: "#4f8ef7" }}> {totalFeedbacks} correção(ões) acumulada(s).</span>
          )}
        </p>
      </div>

      {dbError && (
        <div style={{
          padding: "16px", marginBottom: 24, background: "#1a0f0f",
          border: "1px solid #991b1b", borderRadius: 8, color: "#f87171", fontSize: 14,
        }}>
          Erro ao carregar padrões. Verifique se as migrations foram aplicadas.
        </div>
      )}

      {/* ── Status dos artefatos ── */}
      {!dbError && artefactStatuses.length > 0 && (
        <div style={{ marginBottom: 32 }}>

          {/* Prontos para gerar modelo */}
          {readyNoModel.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#60a5fa", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  ⬡ Prontos para análise
                </p>
                <span style={{
                  fontSize: 11, padding: "2px 8px", borderRadius: 20, fontWeight: 600,
                  background: "#1e3a8a22", border: "1px solid #1e40af55", color: "#60a5fa",
                }}>
                  {readyNoModel.length} artefato{readyNoModel.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
                {readyNoModel.map((art) => (
                  <Link key={art.id} href={`/artefatos/${art.id}`} style={{ textDecoration: "none" }}>
                    <div style={{
                      padding: "14px 16px", borderRadius: 10,
                      background: "#0d1225", border: "1px solid #1e40af55",
                      cursor: "pointer", transition: "border-color 0.15s",
                    }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#93c5fd", marginBottom: 4 }}>
                        {art.artefactName}
                      </div>
                      <div style={{ fontSize: 12, color: "#334155", marginBottom: 10 }}>
                        {art.projectName}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ flex: 1, background: "#1e293b", borderRadius: 4, height: 4, marginRight: 8 }}>
                          <div style={{ height: 4, borderRadius: 4, background: "#3b82f6", width: "100%" }} />
                        </div>
                        <span style={{ fontSize: 11, color: "#60a5fa", fontWeight: 600 }}>
                          {art.feedbackCount} correções
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Aguardando correções */}
          {pending.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#475569", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Aguardando correções
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
                {pending.map((art) => (
                  <Link key={art.id} href={`/artefatos/${art.id}`} style={{ textDecoration: "none" }}>
                    <div style={{
                      padding: "12px 14px", borderRadius: 8, opacity: 0.65,
                      background: "#0d0d0d", border: "1px solid #1e1e2e", cursor: "pointer",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>
                          {art.artefactName}
                        </span>
                        <span style={{ fontSize: 11, color: "#334155" }}>
                          {art.feedbackCount}/{MINIMUM_FEEDBACKS}
                        </span>
                      </div>
                      <div style={{ background: "#1e1e2e", borderRadius: 4, height: 3 }}>
                        <div style={{
                          height: 3, borderRadius: 4, background: "#334155",
                          width: `${Math.min(100, (art.feedbackCount / MINIMUM_FEEDBACKS) * 100)}%`,
                        }} />
                      </div>
                      <div style={{ fontSize: 11, color: "#334155", marginTop: 6 }}>
                        Faltam {MINIMUM_FEEDBACKS - art.feedbackCount} feedback{MINIMUM_FEEDBACKS - art.feedbackCount !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {(readyNoModel.length > 0 || pending.length > 0) && models.length > 0 && (
            <div style={{ height: 1, background: "#1e1e2e", margin: "8px 0 28px" }} />
          )}
        </div>
      )}

      {!dbError && models.length === 0 && readyNoModel.length === 0 && (
        <div style={{
          padding: "48px 24px", textAlign: "center",
          background: "#141414", border: "1px solid #222", borderRadius: 10,
        }}>
          <p style={{ fontSize: 28, marginBottom: 12 }}>◈</p>
          <p style={{ fontWeight: 600, color: "#888", marginBottom: 6 }}>
            Nenhum modelo gerado ainda
          </p>
          <p style={{ fontSize: 13, color: "#555" }}>
            Os padrões são inferidos automaticamente quando há correções suficientes cadastradas
            na base de correção.
          </p>
        </div>
      )}

      {models.length > 0 && (
        <p style={{ fontSize: 13, fontWeight: 700, color: "#475569", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          ✓ Modelos gerados
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {(models as ModelRow[]).map((model) => {
          const rules = Array.isArray(model.inferredRules) ? model.inferredRules as Array<{ description: string }> : [];
          const patterns = Array.isArray(model.inferredPatterns) ? model.inferredPatterns as Array<{ pattern: string }> : [];
          const penalties = Array.isArray(model.detectedPenalties) ? model.detectedPenalties as Array<{ name: string }> : [];
          const style = model.correctionStyle as { tone?: string; focusAreas?: string[] } | null;
          const color = rigorColor[model.rigorLevel] ?? "#888";

          return (
            <div key={model.id} style={{
              background: "#141414", border: "1px solid #222",
              borderRadius: 12, padding: "20px 24px",
            }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontSize: 17, fontWeight: 700, color: "#e8e8e8", marginBottom: 4 }}>
                    {model.artefactName}
                  </h2>
                  <p style={{ fontSize: 12, color: "#555" }}>
                    Baseado em {model.groupFeedbackCount} correção(ões) ·{" "}
                    Gerado em {new Date(model.generatedAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
                  <span style={{
                    padding: "4px 10px", borderRadius: 20,
                    background: color + "20", color, fontSize: 12, fontWeight: 700,
                    border: `1px solid ${color}40`,
                  }}>
                    {rigorLabel[model.rigorLevel] ?? model.rigorLevel}
                  </span>
                  <span style={{
                    padding: "4px 10px", borderRadius: 20,
                    background: "#1e3a5f", color: "#7ab3ff", fontSize: 12, fontWeight: 700,
                  }}>
                    {model.confidence}% confiança
                  </span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                {/* Rules */}
                {rules.length > 0 && (
                  <div>
                    <p style={sectionLabel}>Regras inferidas</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {rules.slice(0, 3).map((r, i) => (
                        <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                          <span style={{ color: "#4f8ef7", fontSize: 11, marginTop: 2, flexShrink: 0 }}>▸</span>
                          <span style={{ fontSize: 12, color: "#aaa", lineHeight: 1.5 }}>
                            {typeof r === "string" ? r : r.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Patterns */}
                {patterns.length > 0 && (
                  <div>
                    <p style={sectionLabel}>Padrões detectados</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {patterns.slice(0, 3).map((p, i) => (
                        <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                          <span style={{ color: "#34d399", fontSize: 11, marginTop: 2, flexShrink: 0 }}>✓</span>
                          <span style={{ fontSize: 12, color: "#aaa", lineHeight: 1.5 }}>
                            {typeof p === "string" ? p : p.pattern}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Penalties */}
                {penalties.length > 0 && (
                  <div>
                    <p style={sectionLabel}>Penalizações frequentes</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {penalties.slice(0, 3).map((p, i) => (
                        <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                          <span style={{ color: "#f87171", fontSize: 11, marginTop: 2, flexShrink: 0 }}>✕</span>
                          <span style={{ fontSize: 12, color: "#aaa", lineHeight: 1.5 }}>
                            {typeof p === "string" ? p : p.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Style info */}
              {style && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #1e1e2e", display: "flex", gap: 16, flexWrap: "wrap" }}>
                  {style.tone && (
                    <span style={{ fontSize: 12, color: "#64748b" }}>
                      Tom: <span style={{ color: "#94a3b8" }}>{style.tone}</span>
                    </span>
                  )}
                  {Array.isArray(style.focusAreas) && style.focusAreas.length > 0 && (
                    <span style={{ fontSize: 12, color: "#64748b" }}>
                      Foco: <span style={{ color: "#94a3b8" }}>{style.focusAreas.slice(0, 3).join(", ")}</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const sectionLabel: React.CSSProperties = {
  fontSize: 10, color: "#475569", textTransform: "uppercase",
  letterSpacing: "0.08em", fontWeight: 700, marginBottom: 8,
};
