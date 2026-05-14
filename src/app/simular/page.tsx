"use client";

import { useState } from "react";
import { useEvaluationSimulator } from "@/features/evaluation-simulator";
import type { EvaluationSimulationView } from "@/features/evaluation-simulator";
import { SUBJECTS, SUBJECT_COLORS, SUBJECT_ICONS } from "@/features/shared/subjects";

type Step = "input" | "loading" | "done" | "error";

export default function Simular() {
  const [step, setStep] = useState<Step>("input");
  const { simulate, result, error, reset } = useEvaluationSimulator();
  const [form, setForm] = useState({
    subject: "",
    activityDescription: "",
    studentResponse: "",
  });

  const isValid =
    form.subject.length > 0 &&
    form.activityDescription.length > 10 &&
    form.studentResponse.length > 10;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStep("loading");
    const nextResult = await simulate({
      subject: form.subject,
      activityDescription: form.activityDescription,
      studentResponse: form.studentResponse,
      maxScore: 10,
    });
    setStep(nextResult ? "done" : "error");
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
        Simular Avaliação
      </h1>
      <p style={{ color: "#888", marginBottom: 32 }}>
        Insira sua atividade e resposta para prever como a IA avaliadora vai corrigir.
      </p>

      {step !== "done" ? (
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 680 }}
        >
          {step === "error" && (
            <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>
              {error ?? "Nao foi possivel simular a avaliacao."}
            </p>
          )}

          {/* Seletor de matéria */}
          <div>
            <label style={{ display: "block", fontSize: 13, color: "#aaa", fontWeight: 500, marginBottom: 8 }}>
              Matéria / Professor
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
              {SUBJECTS.map((subject) => {
                const colors = SUBJECT_COLORS[subject];
                const isSelected = form.subject === subject;
                return (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, subject }))}
                    style={{
                      padding: "8px 10px",
                      background: isSelected ? colors.bg : "#141414",
                      border: `1px solid ${isSelected ? colors.border : "#262626"}`,
                      borderRadius: 8, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 6,
                      transition: "all 0.15s",
                    }}
                  >
                    <span style={{ fontSize: 14, color: isSelected ? colors.text : "#555" }}>
                      {SUBJECT_ICONS[subject]}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: isSelected ? 600 : 400, color: isSelected ? colors.text : "#666" }}>
                      {subject}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <Field
            label="Descrição da atividade"
            placeholder="Cole aqui o enunciado da atividade..."
            value={form.activityDescription}
            onChange={(v) => setForm((p) => ({ ...p, activityDescription: v }))}
            rows={4}
          />
          <Field
            label="Sua resposta"
            placeholder="Cole aqui a resposta que você pretende enviar..."
            value={form.studentResponse}
            onChange={(v) => setForm((p) => ({ ...p, studentResponse: v }))}
            rows={6}
          />

          <button
            type="submit"
            disabled={!isValid || step === "loading"}
            style={{
              padding: "10px 24px",
              background: isValid ? "#4f8ef7" : "#1e1e1e",
              color: isValid ? "#fff" : "#555",
              border: "none",
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 14,
              cursor: isValid ? "pointer" : "not-allowed",
              alignSelf: "flex-start",
            }}
          >
            {step === "loading" ? "Simulando..." : "Simular Avaliação"}
          </button>
        </form>
      ) : result ? (
        <SimulationResults
          result={result}
          onReset={() => {
            setStep("input");
            reset();
            setForm({ subject: "", activityDescription: "", studentResponse: "" });
          }}
        />
      ) : null}
    </div>
  );
}

function SimulationResults({
  result,
  onReset,
}: {
  result: EvaluationSimulationView;
  onReset: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Score */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          padding: "20px 24px",
          background: "#141414",
          border: "1px solid #222",
          borderRadius: 8,
        }}
      >
        <div>
          <div style={{ color: "#888", fontSize: 13, marginBottom: 4 }}>
            Nota prevista
          </div>
          <div style={{ fontSize: 40, fontWeight: 700 }}>
            {result.predictedScore}
            <span style={{ fontSize: 20, color: "#888", fontWeight: 400 }}>
              /{result.maxScore}
            </span>
          </div>
        </div>
        <div style={{ width: 1, height: 48, background: "#222" }} />
        <div>
          <div style={{ color: "#888", fontSize: 13, marginBottom: 4 }}>
            Confiança
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#8b5cf6" }}>
            {result.confidence}%
          </div>
        </div>
      </div>

      {/* Feedback */}
      <section>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>
          Feedback previsto
        </h3>
        <div
          style={{
            padding: "16px",
            background: "#141414",
            border: "1px solid #222",
            borderRadius: 8,
            color: "#aaa",
            lineHeight: 1.7,
            fontSize: 14,
          }}
        >
          {result.predictedFeedback.split("\n\n").map((para, i) => (
            <p key={i} style={{ marginBottom: i < result.predictedFeedback.split("\n\n").length - 1 ? 12 : 0 }}>
              {para.replace(/\*\*/g, "")}
            </p>
          ))}
        </div>
      </section>

      {/* Missing requirements */}
      {result.missingRequirements.length > 0 && (
        <section>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>
            Requisitos faltantes
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {result.missingRequirements.map((requirement) => (
              <div
                key={requirement.requirement}
                style={{
                  padding: "8px 14px",
                  background: "#141414",
                  border: "1px solid #222",
                  borderRadius: 6,
                  color: "#fbbf24",
                  fontSize: 14,
                }}
              >
                {requirement.requirement} · impacto estimado: -{requirement.impact}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Risk areas */}
      <section>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>
          Áreas de risco
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {result.risks.map((risk) => (
            <div
              key={risk.area}
              style={{
                padding: "12px 14px",
                background: "#141414",
                border: "1px solid #222",
                borderRadius: 6,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <span style={{ fontWeight: 500 }}>{risk.area}</span>
                <span
                  style={{
                    fontSize: 12,
                    padding: "2px 8px",
                    borderRadius: 4,
                    background:
                      risk.severity === "high"
                        ? "#2d0f0f"
                        : risk.severity === "medium"
                        ? "#2d2000"
                        : "#0f1a2d",
                    color:
                      risk.severity === "high"
                        ? "#f87171"
                        : risk.severity === "medium"
                        ? "#fbbf24"
                        : "#60a5fa",
                  }}
                >
                  {risk.severity === "high"
                    ? "Alto"
                    : risk.severity === "medium"
                    ? "Médio"
                    : "Baixo"}
                </span>
              </div>
              <p style={{ color: "#888", fontSize: 13 }}>{risk.description}</p>
              <p style={{ color: "#aaa", fontSize: 13, marginTop: 4 }}>
                → {risk.suggestion}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Similar cases */}
      <section>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>
          Casos similares na base
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {result.similarCases.map((match) => (
            <div
              key={match.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 14px",
                background: "#141414",
                border: "1px solid #222",
                borderRadius: 6,
              }}
            >
              <div>
                <span style={{ fontWeight: 500 }}>{match.activityDescription}</span>
              </div>
              <div style={{ display: "flex", gap: 16, fontSize: 13 }}>
                <span style={{ color: "#888" }}>Nota: {match.score}/{match.maxScore}</span>
                <span style={{ color: "#4f8ef7", fontWeight: 600 }}>
                  {match.similarity}% similar
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>
          Pseudo-prompt combinado
        </h3>
        <pre
          style={{
            padding: "16px",
            background: "#141414",
            border: "1px solid #222",
            borderRadius: 8,
            color: "#aaa",
            lineHeight: 1.6,
            fontSize: 12,
            whiteSpace: "pre-wrap",
            fontFamily: "inherit",
          }}
        >
          {result.combinedPseudoPrompt}
        </pre>
      </section>

      <button
        onClick={onReset}
        style={{
          padding: "8px 16px",
          background: "#222",
          color: "#e8e8e8",
          border: "1px solid #333",
          borderRadius: 6,
          cursor: "pointer",
          fontSize: 14,
          alignSelf: "flex-start",
        }}
      >
        Nova simulação
      </button>
    </div>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  rows,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 13, color: "#aaa", fontWeight: 500 }}>
        {label}
      </label>
      <textarea
        rows={rows ?? 4}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          background: "#141414",
          border: "1px solid #222",
          borderRadius: 6,
          padding: "8px 12px",
          color: "#e8e8e8",
          fontSize: 14,
          outline: "none",
          fontFamily: "inherit",
          resize: "vertical",
        }}
      />
    </div>
  );
}
