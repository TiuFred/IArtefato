"use client";

import { toast } from "sonner";
import type { CorrectionCaseView, Severity } from "@/features/shared/types";

const toneLabels = { strict: "Rigoroso", moderate: "Moderado", lenient: "Flexível" };
const focusLabels = { technical: "Técnico", conceptual: "Conceitual", practical: "Prático", mixed: "Misto" };
const detailLabels = { brief: "Breve", detailed: "Detalhado", exhaustive: "Exaustivo" };

export function InferenceResult({
  entry,
  onBack,
  onDelete,
}: {
  entry: CorrectionCaseView;
  onBack: () => void;
  onDelete: () => Promise<void>;
}) {
  const inference = entry.inference;
  const subjects = entry.subjects?.length ? entry.subjects : [entry.subject];

  async function handleDelete() {
    try {
      await onDelete();
      toast.success("Correção removida.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao remover correção.");
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ ...card, display: "flex", justifyContent: "space-between", gap: 16 }}>
        <div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Correção inferida com Gemini</div>
          <div style={{ fontSize: 12, color: "#4f8ef7", marginBottom: 6, fontWeight: 600 }}>
            {subjects.join(" · ")}
          </div>
          <div style={{ fontWeight: 600, fontSize: 16 }}>
            {entry.activityDescription.slice(0, 96)}
            {entry.activityDescription.length > 96 ? "..." : ""}
          </div>
          <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
            <ConfidencePill value={inference.confidence} />
            <span style={{ color: "#888", fontSize: 12 }}>
              {new Date(entry.createdAt).toLocaleDateString("pt-BR")}
            </span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 2 }}>Nota recebida</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>
            {entry.score}
            <span style={{ fontSize: 16, color: "#888", fontWeight: 400 }}>
              /{entry.maxScore}
            </span>
          </div>
        </div>
      </div>

      <section>
        <SectionTitle>Critérios valorizados</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {inference.criteria.map((criterion) => (
            <div key={criterion.name} style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{criterion.name}</span>
                <span style={{ color: "#4f8ef7", fontWeight: 700 }}>{criterion.weight}%</span>
              </div>
              <p style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>{criterion.description}</p>
              {criterion.evidenceSnippet && <Quote>{criterion.evidenceSnippet}</Quote>}
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle>Penalizações</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {inference.penalties.length === 0 ? (
            <div style={card}>Nenhuma penalização explícita inferida.</div>
          ) : (
            inference.penalties.map((penalty) => (
              <div key={penalty.name} style={card}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>{penalty.name}</span>
                  <span style={{ color: "#f87171", fontWeight: 700 }}>
                    -{penalty.estimatedDeduction} · {severityLabel(penalty.severity)}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>{penalty.description}</p>
                {penalty.evidenceSnippet && <Quote>{penalty.evidenceSnippet}</Quote>}
              </div>
            ))
          )}
        </div>
      </section>

      <section>
        <SectionTitle>Estilo, rigor e foco</SectionTitle>
        <div style={{ ...card, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          <StyleTile label="Tom" value={toneLabels[inference.correctionStyle.tone]} />
          <StyleTile label="Foco" value={focusLabels[inference.correctionStyle.focus]} />
          <StyleTile label="Detalhe" value={detailLabels[inference.correctionStyle.detailLevel]} />
          <StyleTile label="Rigor técnico" value={`${inference.technicalRigor.level} · ${inference.technicalRigor.score}/100`} />
          <StyleTile label="Foco estrutural" value={`${inference.structuralFocus.level} · ${inference.structuralFocus.score}/100`} />
          <StyleTile label="Tags" value={inference.tags.slice(0, 3).join(", ") || "Sem tags"} />
        </div>
      </section>

      <section>
        <SectionTitle>Pseudo-prompt inferido</SectionTitle>
        <pre style={promptStyle}>{inference.pseudoPrompt}</pre>
      </section>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onBack} style={secondaryBtn}>Voltar</button>
        <button onClick={handleDelete} style={{ ...secondaryBtn, color: "#f87171", borderColor: "#3d1515" }}>
          Remover
        </button>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 13, fontWeight: 600, color: "#aaa", textTransform: "uppercase", marginBottom: 10 }}>
      {children}
    </p>
  );
}

function Quote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote style={{ margin: 0, paddingLeft: 10, borderLeft: "2px solid #333", fontSize: 12, color: "#666" }}>
      &ldquo;{children}&rdquo;
    </blockquote>
  );
}

function ConfidencePill({ value }: { value: number }) {
  return <span style={{ padding: "3px 10px", borderRadius: 100, background: "#172554", color: "#93c5fd", fontSize: 12 }}>{value}% conf.</span>;
}

function StyleTile({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: "10px 12px", background: "#0d0d0d", border: "1px solid #222", borderRadius: 6 }}>
      <div style={{ fontSize: 11, color: "#555", marginBottom: 4 }}>{label}</div>
      <div style={{ fontWeight: 600, fontSize: 13 }}>{value}</div>
    </div>
  );
}

function severityLabel(severity: Severity) {
  return { low: "Baixa", medium: "Média", high: "Alta" }[severity];
}

const card: React.CSSProperties = {
  padding: "14px 16px",
  background: "#141414",
  border: "1px solid #222",
  borderRadius: 8,
};

const promptStyle: React.CSSProperties = {
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
