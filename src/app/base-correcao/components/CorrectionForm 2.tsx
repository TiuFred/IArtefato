"use client";

import { useState } from "react";
import type { CorrectionFormState, CorrectionInput } from "@/types/correction";
import { EMPTY_FORM } from "@/types/correction";
import { inferCorrectionPattern } from "@/services/correctionInferenceService";
import { useCorrectionStore } from "@/store/correctionStore";

type FormStep = "idle" | "inferring" | "done" | "error";

const INFERENCE_STEPS = [
  "Processando feedback recebido...",
  "Detectando critérios de avaliação...",
  "Identificando penalizações...",
  "Analisando estilo de correção...",
  "Gerando pseudo-prompt...",
];

export function CorrectionForm({ onDone }: { onDone?: () => void }) {
  const { addEntry } = useCorrectionStore();
  const [form, setForm] = useState<CorrectionFormState>(EMPTY_FORM);
  const [step, setStep] = useState<FormStep>("idle");
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof CorrectionFormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const isValid =
    form.subject.trim() &&
    form.activityTitle.trim() &&
    form.activityDescription.trim().length > 20 &&
    form.studentResponse.trim().length > 20 &&
    form.feedbackReceived.trim().length > 20 &&
    form.score !== "" &&
    form.maxScore !== "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setStep("inferring");
    setError(null);

    // Anima os passos de inferência
    for (let i = 0; i < INFERENCE_STEPS.length; i++) {
      setStepIndex(i);
      await new Promise((r) => setTimeout(r, 600));
    }

    try {
      const input: CorrectionInput = {
        subject: form.subject.trim(),
        activityTitle: form.activityTitle.trim(),
        activityDescription: form.activityDescription.trim(),
        studentResponse: form.studentResponse.trim(),
        feedbackReceived: form.feedbackReceived.trim(),
        score: parseFloat(form.score),
        maxScore: parseFloat(form.maxScore),
      };

      const { pattern } = await inferCorrectionPattern(input);
      addEntry(input, pattern);
      setStep("done");
      setForm(EMPTY_FORM);
      onDone?.();
    } catch {
      setStep("error");
      setError("Erro ao inferir padrões. Tente novamente.");
    }
  }

  if (step === "inferring") {
    return (
      <div style={inferringBox}>
        <p style={{ fontWeight: 600, marginBottom: 20, color: "#e8e8e8" }}>
          Inferindo padrões de correção...
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {INFERENCE_STEPS.map((s, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                color: i < stepIndex ? "#4ade80" : i === stepIndex ? "#e8e8e8" : "#333",
                fontSize: 13,
                transition: "color 0.3s",
              }}
            >
              <span style={{ fontSize: 16, width: 20 }}>
                {i < stepIndex ? "✓" : i === stepIndex ? "›" : "·"}
              </span>
              {s}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div style={{ padding: "20px 0", textAlign: "center" }}>
        <p style={{ fontSize: 20, marginBottom: 8 }}>✓</p>
        <p style={{ fontWeight: 600, marginBottom: 4 }}>
          Padrões inferidos com sucesso
        </p>
        <p style={{ color: "#888", fontSize: 13, marginBottom: 20 }}>
          Entrada adicionada à base. Clique nela na lista para ver os padrões.
        </p>
        <button
          onClick={() => setStep("idle")}
          style={secondaryBtn}
        >
          Adicionar outra
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <p style={{ color: "#f87171", fontSize: 13, marginBottom: 16 }}>
          {error}
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Row 1 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field
            label="Disciplina *"
            placeholder="Ex: Banco de Dados, POO..."
            value={form.subject}
            onChange={set("subject")}
          />
          <Field
            label="Título da atividade *"
            placeholder="Nome da atividade"
            value={form.activityTitle}
            onChange={set("activityTitle")}
          />
        </div>

        {/* Activity description */}
        <Field
          label="Descrição da atividade *"
          placeholder="Cole aqui o enunciado / o que o professor pediu..."
          value={form.activityDescription}
          onChange={set("activityDescription")}
          rows={3}
          hint="Quanto mais detalhe, mais precisa será a inferência"
        />

        {/* Student response */}
        <Field
          label="Sua resposta enviada *"
          placeholder="Cole aqui exatamente o que você entregou..."
          value={form.studentResponse}
          onChange={set("studentResponse")}
          rows={4}
        />

        {/* Feedback received — o mais importante */}
        <Field
          label="Feedback recebido da IA *"
          placeholder="Cole aqui o feedback que você recebeu — é a partir dele que os padrões são inferidos..."
          value={form.feedbackReceived}
          onChange={set("feedbackReceived")}
          rows={5}
          highlight
          hint="Este é o campo mais importante — o sistema analisa o feedback para inferir como a IA avalia"
        />

        {/* Score */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field
            label="Nota recebida *"
            placeholder="Ex: 7.5"
            value={form.score}
            onChange={set("score")}
            type="number"
          />
          <Field
            label="Nota máxima *"
            placeholder="Ex: 10"
            value={form.maxScore}
            onChange={set("maxScore")}
            type="number"
          />
        </div>

        <button
          type="submit"
          disabled={!isValid}
          style={{
            ...primaryBtn,
            opacity: isValid ? 1 : 0.4,
            cursor: isValid ? "pointer" : "not-allowed",
          }}
        >
          Inferir padrões de correção →
        </button>
      </div>
    </form>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function Field({
  label,
  placeholder,
  value,
  onChange,
  rows,
  type = "text",
  hint,
  highlight = false,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  rows?: number;
  type?: string;
  hint?: string;
  highlight?: boolean;
}) {
  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: highlight ? "#0f1a24" : "#141414",
    border: `1px solid ${highlight ? "#1e3a5a" : "#222"}`,
    borderRadius: 6,
    padding: "8px 12px",
    color: "#e8e8e8",
    fontSize: 14,
    outline: "none",
    fontFamily: "inherit",
    resize: rows ? "vertical" : "none",
    lineHeight: 1.6,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 12, color: "#888", fontWeight: 500, letterSpacing: "0.02em" }}>
        {label}
      </label>
      {rows ? (
        <textarea
          rows={rows}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={inputStyle}
        />
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={{ ...inputStyle, height: 36 }}
        />
      )}
      {hint && (
        <p style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{hint}</p>
      )}
    </div>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const inferringBox: React.CSSProperties = {
  padding: "24px 20px",
  background: "#141414",
  border: "1px solid #222",
  borderRadius: 8,
};

const primaryBtn: React.CSSProperties = {
  padding: "10px 20px",
  background: "#4f8ef7",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  fontWeight: 600,
  fontSize: 14,
  alignSelf: "flex-start",
};

const secondaryBtn: React.CSSProperties = {
  padding: "8px 16px",
  background: "#1e1e1e",
  color: "#e8e8e8",
  border: "1px solid #333",
  borderRadius: 6,
  fontSize: 14,
  cursor: "pointer",
};
