import { getPrisma } from "@/services/database/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const anyDb = () => getPrisma() as unknown as Record<string, any>;

const MINIMUM_FEEDBACKS = 5;

type FeedbackRow = {
  id: string;
  groupName: string;
  score: number;
  maxScore: number;
  feedback: string;
  createdAt: Date;
};

type ModelRow = {
  id: string;
  artefactName: string;
  rigorLevel: string;
  confidence: number;
  groupFeedbackCount: number;
  inferredPrompt: string;
  inferredRules: unknown;
  inferredPatterns: unknown;
  detectedPenalties: unknown;
  correctionStyle: unknown;
  generatedAt: Date;
  artefactContext: {
    id: string;
    description: string;
    activity: { subject: string } | null;
    groupFeedbacks: FeedbackRow[];
  };
};

type ArtefactStatusRow = {
  id: string;
  artefactName: string;
  feedbackCount: number;
  hasModel: boolean;
  projectName: string;
  feedbacks: FeedbackRow[];
};

export default async function PadroesPage() {
  let models: ModelRow[] = [];
  let totalFeedbacks = 0;
  let artefactStatuses: ArtefactStatusRow[] = [];
  let dbError = false;

  try {
    const [rawModels, feedbackCount, artefacts, allFeedbacks] = await Promise.all([
      anyDb().artefactCorrectionModel.findMany({
        orderBy: { generatedAt: "desc" },
        include: {
          artefactContext: {
            select: {
              id: true,
              description: true,
              activity: { select: { subject: true } },
            },
          },
        },
      }),
      anyDb().groupFeedback.count(),
      anyDb().artefactContext.findMany({
        orderBy: { createdAt: "asc" },
        include: {
          projectContext: { select: { name: true } },
          _count: { select: { groupFeedbacks: true } },
          correctionModels: {
            select: { id: true },
            take: 1,
            orderBy: { generatedAt: "desc" },
          },
        },
      }),
      anyDb().groupFeedback.findMany({
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          groupName: true,
          score: true,
          maxScore: true,
          feedback: true,
          createdAt: true,
          artefactContextId: true,
        },
      }),
    ]);

    // Index feedbacks by artefactContextId for O(1) lookup
    const feedbacksByArtefact: Record<string, FeedbackRow[]> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const fb of allFeedbacks as any[]) {
      const key: string = fb.artefactContextId;
      if (!feedbacksByArtefact[key]) feedbacksByArtefact[key] = [];
      feedbacksByArtefact[key].push(fb);
    }

    // Attach feedbacks to models
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    models = rawModels.map((m: any) => ({
      ...m,
      artefactContext: m.artefactContext
        ? { ...m.artefactContext, groupFeedbacks: feedbacksByArtefact[m.artefactContext.id] ?? [] }
        : null,
    }));

    totalFeedbacks = feedbackCount;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    artefactStatuses = artefacts.map((a: any) => {
      const feedbacks: FeedbackRow[] = feedbacksByArtefact[a.id] ?? [];
      return {
        id: a.id,
        artefactName: a.artefactName,
        // Use the flat-query count as source of truth to avoid Prisma _count cache issues
        feedbackCount: feedbacks.length,
        hasModel: a.correctionModels.length > 0,
        projectName: a.projectContext.name,
        feedbacks,
      };
    });
  } catch (err) {
    console.error("[padroes]", err);
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
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {readyNoModel.map((art) => (
                  <div key={art.id} style={{
                    borderRadius: 10, background: "#0d1225", border: "1px solid #1e40af55",
                  }}>
                    {/* Card header */}
                    <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#93c5fd", marginBottom: 2 }}>
                          {art.artefactName}
                        </div>
                        <div style={{ fontSize: 12, color: "#334155" }}>{art.projectName}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 11, color: "#60a5fa", fontWeight: 600 }}>
                          {art.feedbackCount} correções
                        </span>
                        <Link href={`/artefatos/${art.id}`} style={{
                          padding: "5px 12px", borderRadius: 16,
                          background: "#1e3a8a", color: "#93c5fd", fontSize: 12,
                          fontWeight: 600, textDecoration: "none",
                        }}>
                          Gerar modelo →
                        </Link>
                      </div>
                    </div>

                    {/* Feedbacks dos grupos */}
                    {art.feedbacks.length > 0 && (
                      <details style={{ borderTop: "1px solid #1e3a5f1a" }}>
                        <summary style={{
                          padding: "8px 16px", fontSize: 11, color: "#3b82f6",
                          fontWeight: 600, cursor: "pointer", userSelect: "none",
                          listStyle: "none", display: "flex", alignItems: "center", gap: 6,
                        }}>
                          ▸ Ver {art.feedbacks.length} feedback{art.feedbacks.length !== 1 ? "s" : ""} dos grupos
                        </summary>
                        <div style={{ padding: "0 16px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                          {art.feedbacks.map((fb) => (
                            <FeedbackCard key={fb.id} fb={fb} />
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
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
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {pending.map((art) => (
                  <div key={art.id} style={{
                    borderRadius: 8, background: "#0d0d0d", border: "1px solid #1e1e2e",
                  }}>
                    <div style={{ padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", opacity: 0.75 }}>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>
                          {art.artefactName}
                        </span>
                        <span style={{ fontSize: 11, color: "#334155", marginLeft: 10 }}>
                          {art.projectName}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ background: "#1e1e2e", borderRadius: 4, height: 3, width: 80 }}>
                          <div style={{
                            height: 3, borderRadius: 4, background: "#334155",
                            width: `${Math.min(100, (art.feedbackCount / MINIMUM_FEEDBACKS) * 100)}%`,
                          }} />
                        </div>
                        <span style={{ fontSize: 11, color: "#334155", whiteSpace: "nowrap" }}>
                          {art.feedbackCount}/{MINIMUM_FEEDBACKS} feedbacks
                        </span>
                      </div>
                    </div>

                    {art.feedbacks.length > 0 && (
                      <details style={{ borderTop: "1px solid #1e1e2e" }}>
                        <summary style={{
                          padding: "6px 14px", fontSize: 11, color: "#475569",
                          fontWeight: 600, cursor: "pointer", userSelect: "none",
                          listStyle: "none", display: "flex", alignItems: "center", gap: 6,
                        }}>
                          ▸ Ver {art.feedbacks.length} feedback{art.feedbacks.length !== 1 ? "s" : ""} enviado{art.feedbacks.length !== 1 ? "s" : ""}
                        </summary>
                        <div style={{ padding: "0 14px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
                          {art.feedbacks.map((fb) => (
                            <FeedbackCard key={fb.id} fb={fb} dim />
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
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
          const subject = model.artefactContext?.activity?.subject ?? null;
          const feedbacks: FeedbackRow[] = model.artefactContext?.groupFeedbacks ?? [];

          return (
            <div key={model.id} style={{
              background: "#141414", border: "1px solid #222",
              borderRadius: 12, padding: "20px 24px",
            }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                    <h2 style={{ fontSize: 17, fontWeight: 700, color: "#e8e8e8", margin: 0 }}>
                      {model.artefactName}
                    </h2>
                    {subject && (
                      <span style={{
                        fontSize: 11, padding: "2px 9px", borderRadius: 20, fontWeight: 600,
                        background: "#1e293b", border: "1px solid #334155", color: "#94a3b8",
                      }}>
                        {subject}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 12, color: "#555", margin: 0 }}>
                    Baseado em {model.groupFeedbackCount} correção(ões) ·{" "}
                    Gerado em {new Date(model.generatedAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0, flexWrap: "wrap" }}>
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
                  <Link
                    href={`/criacao-perguntas?artefactContextId=${model.artefactContext?.id}`}
                    style={{
                      padding: "6px 14px", borderRadius: 20,
                      background: "#4f8ef7", color: "#fff", fontSize: 12, fontWeight: 700,
                      textDecoration: "none", whiteSpace: "nowrap",
                    }}
                  >
                    Gerar Perguntas
                  </Link>
                </div>
              </div>

              {/* Feedbacks dos grupos — dados que geraram este modelo */}
              {feedbacks.length > 0 && (
                <details style={{ marginBottom: 16 }}>
                  <summary style={{
                    fontSize: 11, color: "#475569", fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "0.08em", cursor: "pointer", userSelect: "none",
                    padding: "6px 0", listStyle: "none", display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <span style={{ color: "#34d399" }}>▸</span>{" "}
                    Feedbacks dos grupos ({feedbacks.length})
                  </summary>
                  <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                    {feedbacks.map((fb) => (
                      <FeedbackCard key={fb.id} fb={fb} />
                    ))}
                  </div>
                </details>
              )}

              {/* Inferred Prompt */}
              {model.inferredPrompt && (
                <details style={{ marginBottom: 16 }}>
                  <summary style={{
                    fontSize: 11, color: "#475569", fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "0.08em", cursor: "pointer", userSelect: "none",
                    padding: "6px 0", listStyle: "none", display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <span style={{ color: "#4f8ef7" }}>▸</span> Prompt inferido do professor
                  </summary>
                  <pre style={{
                    marginTop: 8, padding: "12px 14px",
                    background: "#0a0f1a", border: "1px solid #1e3a5f",
                    borderRadius: 8, fontSize: 12, color: "#7ab3ff",
                    lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word",
                    fontFamily: "monospace",
                  }}>
                    {model.inferredPrompt}
                  </pre>
                </details>
              )}

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

function FeedbackCard({ fb, dim }: { fb: FeedbackRow; dim?: boolean }) {
  const pct = fb.maxScore > 0 ? Math.round((fb.score / fb.maxScore) * 100) : 0;
  const scoreColor = pct >= 75 ? "#4ade80" : pct >= 50 ? "#fbbf24" : "#f87171";
  const preview = fb.feedback.length > 220 ? fb.feedback.slice(0, 220) + "…" : fb.feedback;

  return (
    <div style={{
      padding: "10px 12px", borderRadius: 8,
      background: dim ? "#0a0a0a" : "#0d0f18",
      border: "1px solid #1e293b",
      opacity: dim ? 0.8 : 1,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>
          {fb.groupName}
        </span>
        <span style={{
          fontSize: 11, fontWeight: 700, color: scoreColor,
          padding: "2px 8px", borderRadius: 12,
          background: scoreColor + "18", border: `1px solid ${scoreColor}33`,
        }}>
          {fb.score}/{fb.maxScore} · {pct}%
        </span>
      </div>
      <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, lineHeight: 1.6 }}>
        {preview}
      </p>
      <p style={{ fontSize: 10, color: "#334155", margin: "6px 0 0" }}>
        {new Date(fb.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
      </p>
    </div>
  );
}

const sectionLabel: React.CSSProperties = {
  fontSize: 10, color: "#475569", textTransform: "uppercase",
  letterSpacing: "0.08em", fontWeight: 700, marginBottom: 8,
};
