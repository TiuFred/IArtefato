import { listCorrectionCases } from "@/features/correction-inference/services";
import { SUBJECTS, SUBJECT_COLORS, SUBJECT_ICONS } from "@/features/shared/subjects";
import type { CorrectionCaseView } from "@/features/shared/types";

export const dynamic = "force-dynamic";

export default async function PadroesPage() {
  let allCases: CorrectionCaseView[] = [];
  let dbError = false;

  try {
    allCases = await listCorrectionCases();
  } catch {
    dbError = true;
  }

  const bySubject = SUBJECTS.map((subject) => ({
    subject,
    cases: allCases.filter((c) => c.subject === subject),
  }));

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Padrões por Professor</h1>
        <p style={{ color: "#888", fontSize: 14, maxWidth: 640 }}>
          Perfil inferido de cada avaliador com base nas correções cadastradas. Quanto mais correções
          de uma matéria, mais preciso o perfil.
        </p>
      </div>

      {dbError && (
        <div style={{
          padding: "16px", marginBottom: 24, background: "#1a0f0f",
          border: "1px solid #991b1b", borderRadius: 8, color: "#f87171", fontSize: 14,
        }}>
          Banco ainda não disponível. Execute o SQL de migration no Supabase para começar.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
        {bySubject.map(({ subject, cases }) => {
          const colors = SUBJECT_COLORS[subject];
          const icon = SUBJECT_ICONS[subject];
          const hasData = cases.length > 0;

          // Agrega padrões detectados
          const avgScore = hasData
            ? cases.reduce((s, c) => s + c.score / c.maxScore, 0) / cases.length
            : null;
          const avgConfidence = hasData
            ? Math.round(cases.reduce((s, c) => s + c.inference.confidence, 0) / cases.length)
            : null;

          // Critérios mais frequentes
          const criteriaFreq: Record<string, number> = {};
          cases.forEach((c) => c.inference.criteria.forEach((cr) => {
            criteriaFreq[cr.name] = (criteriaFreq[cr.name] ?? 0) + 1;
          }));
          const topCriteria = Object.entries(criteriaFreq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([name]) => name);

          // Penalizações mais frequentes
          const penaltyFreq: Record<string, number> = {};
          cases.forEach((c) => c.inference.penalties.forEach((p) => {
            penaltyFreq[p.name] = (penaltyFreq[p.name] ?? 0) + 1;
          }));
          const topPenalties = Object.entries(penaltyFreq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2)
            .map(([name]) => name);

          // Tom dominante
          const tones: Record<string, number> = {};
          cases.forEach((c) => {
            const t = c.inference.correctionStyle.tone;
            tones[t] = (tones[t] ?? 0) + 1;
          });
          const dominantTone = Object.entries(tones).sort((a, b) => b[1] - a[1])[0]?.[0];
          const toneLabel: Record<string, string> = { strict: "Rigoroso", moderate: "Equilibrado", lenient: "Permissivo" };

          return (
            <div
              key={subject}
              style={{
                background: hasData ? colors.bg : "#0d0d0d",
                border: `1px solid ${hasData ? colors.border : "#1e1e2e"}`,
                borderRadius: 12, padding: "20px",
                opacity: hasData ? 1 : 0.5,
              }}
            >
              {/* Header da matéria */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: hasData ? colors.border + "30" : "#1e1e2e",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, color: hasData ? colors.text : "#333",
                }}>
                  {icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: hasData ? colors.text : "#444" }}>
                    {subject}
                  </div>
                  <div style={{ fontSize: 12, color: hasData ? colors.text + "99" : "#333" }}>
                    {cases.length} correç{cases.length === 1 ? "ão" : "ões"} cadastrada{cases.length !== 1 ? "s" : ""}
                  </div>
                </div>
                {hasData && (
                  <div style={{ marginLeft: "auto", textAlign: "right" }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: colors.text }}>
                      {Math.round((avgScore ?? 0) * 100)}%
                    </div>
                    <div style={{ fontSize: 11, color: colors.text + "88" }}>nota média</div>
                  </div>
                )}
              </div>

              {!hasData ? (
                <div style={{ fontSize: 13, color: "#333", textAlign: "center", padding: "16px 0" }}>
                  Nenhuma correção cadastrada ainda
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

                  {/* Stats */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <StatBox label="Confiança média" value={`${avgConfidence}%`} color={colors.text} />
                    {dominantTone && (
                      <StatBox label="Tom do avaliador" value={toneLabel[dominantTone] ?? dominantTone} color={colors.text} />
                    )}
                  </div>

                  {/* Critérios */}
                  {topCriteria.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, color: colors.text + "88", marginBottom: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Critérios mais cobrados
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {topCriteria.map((c) => (
                          <div key={c} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 4, height: 4, borderRadius: "50%", background: colors.text, flexShrink: 0 }} />
                            <span style={{ fontSize: 12, color: colors.text + "cc" }}>{c}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Penalizações */}
                  {topPenalties.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, color: "#f87171" + "88", marginBottom: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Penalizações mais comuns
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {topPenalties.map((p) => (
                          <div key={p} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 11, color: "#f87171" }}>✕</span>
                            <span style={{ fontSize: 12, color: "#f87171cc" }}>{p}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Histórico de notas */}
                  <div>
                    <div style={{ fontSize: 11, color: colors.text + "88", marginBottom: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Histórico de notas
                    </div>
                    <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 32 }}>
                      {cases.slice(0, 8).reverse().map((c, i) => {
                        const pct = c.score / c.maxScore;
                        const barColor = pct >= 0.8 ? "#4ade80" : pct >= 0.6 ? "#fbbf24" : "#f87171";
                        return (
                          <div
                            key={i}
                            title={`${c.score}/${c.maxScore}`}
                            style={{
                              flex: 1, borderRadius: 3,
                              height: `${Math.max(20, pct * 100)}%`,
                              background: barColor + "99",
                              border: `1px solid ${barColor}`,
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      padding: "8px 10px", background: "#00000030",
      border: `1px solid ${color}20`, borderRadius: 8,
    }}>
      <div style={{ fontSize: 10, color: color + "77", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}
