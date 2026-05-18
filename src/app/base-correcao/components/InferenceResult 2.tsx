"use client";

import type { CorrectionEntry } from "@/types/correction";
import {
  TONE_LABELS,
  FOCUS_LABELS,
  DETAIL_LABELS,
} from "@/types/correction";
import { useCorrectionStore } from "@/store/correctionStore";

export function InferenceResult({ entry }: { entry: CorrectionEntry }) {
  const { deleteEntry, selectEntry } = useCorrectionStore();
  const { input, pattern } = entry;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ ...card, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
        <div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>
            {input.subject}
          </div>
          <div style={{ fontWeight: 600, fontSize: 16 }}>{input.activityTitle}</div>
          <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
            <ConfidencePill value={pattern.confidence} />
            <span style={{ color: "#888", fontSize: 12 }}>
              {new Date(pattern.inferredAt).toLocaleDateString("pt-BR")}
            </span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 2 }}>Nota</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>
            {input.score}
            <span style={{ fontSize: 16, color: "#888", fontWeight: 400 }}>
              /{input.maxScore}
            </span>
          </div>
        </div>
      </div>

      {/* Criteria */}
      <section>
        <SectionTitle>Critérios detectados</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {pattern.criteria.map((c) => (
            <div key={c.name} style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</span>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <ConfidencePill value={c.confidence} small />
                  <span style={{ color: "#4f8ef7", fontWeight: 700, fontSize: 15 }}>
                    {c.weight}%
                  </span>
                </div>
              </div>

              {/* Weight bar */}
              <div style={{ height: 4, background: "#222", borderRadius: 2, marginBottom: 8 }}>
                <div
                  style={{
                    height: "100%",
                    width: `${c.weight}%`,
                    background: "#4f8ef7",
                    borderRadius: 2,
                    transition: "width 0.6s ease",
                  }}
                />
              </div>

              <p style={{ fontSize: 13, color: "#888", marginBottom: c.evidenceSnippet ? 6 : 0 }}>
                {c.description}
              </p>

              {c.evidenceSnippet && (
                <blockquote style={{
                  margin: 0,
                  paddingLeft: 10,
                  borderLeft: "2px solid #333",
                  fontSize: 12,
                  color: "#666",
                  fontStyle: "italic",
                }}>
                  &ldquo;{c.evidenceSnippet}&rdquo;
                </blockquote>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Penalties */}
      {pattern.penalties.length > 0 && (
        <section>
          <SectionTitle>Penalizações inferidas</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pattern.penalties.map((p) => (
              <div
                key={p.name}
                style={{
                  ...card,
                  borderColor: p.severity === "high" ? "#3d1515" : p.severity === "medium" ? "#3d2e00" : "#1e1e2e",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</span>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <SeverityBadge severity={p.severity} />
                    <span style={{ color: "#f87171", fontWeight: 700 }}>
                      -{p.estimatedDeduction}
                    </span>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: "#888", marginBottom: p.evidenceSnippet ? 6 : 0 }}>
                  {p.description}
                </p>
                {p.evidenceSnippet && (
                  <blockquote style={{
                    margin: 0,
                    paddingLeft: 10,
                    borderLeft: "2px solid #3d1515",
                    fontSize: 12,
                    color: "#666",
                    fontStyle: "italic",
                  }}>
                    &ldquo;{p.evidenceSnippet}&rdquo;
                  </blockquote>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Correction style */}
      <section>
        <SectionTitle>Estilo de correção detectado</SectionTitle>
        <div style={{ ...card, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <StyleTile label="Tom" value={TONE_LABELS[pattern.style.tone]} />
            <StyleTile label="Foco" value={FOCUS_LABELS[pattern.style.focus]} />
            <StyleTile label="Detalhe" value={DETAIL_LABELS[pattern.style.detailLevel]} />
          </div>
          {pattern.style.topKeywords.length > 0 && (
            <div>
              <p style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>
                Palavras-chave recorrentes no estilo
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {pattern.style.topKeywords.map((kw) => (
                  <span
                    key={kw}
                    style={{
                      padding: "3px 10px",
                      background: "#1a1a2e",
                      border: "1px solid #2e2e50",
                      borderRadius: 100,
                      fontSize: 12,
                      color: "#8b8bf7",
                    }}
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Pseudo-prompt */}
      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <SectionTitle noMargin>Pseudo-prompt inferido</SectionTitle>
          <span style={{ fontSize: 12, color: "#555" }}>
            Aproximação — não é o prompt real do professor
          </span>
        </div>
        <pre
          style={{
            background: "#0a0a0a",
            border: "1px solid #222",
            borderRadius: 8,
            padding: "16px 18px",
            fontSize: 13,
            color: "#aaa",
            whiteSpace: "pre-wrap",
            lineHeight: 1.7,
            fontFamily: "ui-monospace, 'Cascadia Code', monospace",
            margin: 0,
          }}
        >
          {pattern.pseudoPrompt}
        </pre>
      </section>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, paddingTop: 4 }}>
        <button
          onClick={() => selectEntry(null)}
          style={secondaryBtn}
        >
          ← Voltar
        </button>
        <button
          onClick={() => {
            deleteEntry(entry.id);
            selectEntry(null);
          }}
          style={{ ...secondaryBtn, color: "#f87171", borderColor: "#3d1515" }}
        >
          Remover entrada
        </button>
      </div>
    </div>
  );
}

// ─── Atoms ────────────────────────────────────────────────────────────────────

function SectionTitle({
  children,
  noMargin = false,
}: {
  children: React.ReactNode;
  noMargin?: boolean;
}) {
  return (
    <p
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: "#aaa",
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        marginBottom: noMargin ? 0 : 10,
      }}
    >
      {children}
    </p>
  );
}

function ConfidencePill({
  value,
  small = false,
}: {
  value: number;
  small?: boolean;
}) {
  const color =
    value >= 80 ? "#4ade80" : value >= 60 ? "#fbbf24" : "#f87171";
  return (
    <span
      style={{
        padding: small ? "2px 6px" : "3px 10px",
        background: `${color}15`,
        border: `1px solid ${color}40`,
        borderRadius: 100,
        fontSize: small ? 11 : 12,
        color,
        fontWeight: 600,
      }}
    >
      {value}% conf.
    </span>
  );
}

function SeverityBadge({ severity }: { severity: "low" | "medium" | "high" }) {
  const map = {
    high: { label: "Alto", color: "#f87171", bg: "#2d0f0f" },
    medium: { label: "Médio", color: "#fbbf24", bg: "#2d2000" },
    low: { label: "Baixo", color: "#60a5fa", bg: "#0f1a2d" },
  };
  const { label, color, bg } = map[severity];
  return (
    <span
      style={{
        padding: "2px 8px",
        background: bg,
        color,
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      {label}
    </span>
  );
}

function StyleTile({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: "10px 12px",
        background: "#0d0d0d",
        border: "1px solid #222",
        borderRadius: 6,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 11, color: "#555", marginBottom: 4 }}>{label}</div>
      <div style={{ fontWeight: 600, fontSize: 14 }}>{value}</div>
    </div>
  );
}

const card: React.CSSProperties = {
  padding: "14px 16px",
  background: "#141414",
  border: "1px solid #222",
  borderRadius: 8,
};

const secondaryBtn: React.CSSProperties = {
  padding: "7px 14px",
  background: "#1a1a1a",
  color: "#aaa",
  border: "1px solid #2a2a2a",
  borderRadius: 6,
  fontSize: 13,
  cursor: "pointer",
};
