"use client";

import { useEffect, useState, useCallback } from "react";
import { useEvaluationSimulator } from "@/features/evaluation-simulator";
import type { EvaluationSimulationView } from "@/features/evaluation-simulator";
import { SUBJECTS, SUBJECT_COLORS, SUBJECT_ICONS } from "@/features/shared/subjects";
import { toast } from "sonner";

type Step = "input" | "loading" | "done" | "error";

interface ArtefactContext {
  id: string;
  artefactName: string;
  description: string;
}

interface ProjectData {
  groupName: string;
  projectContext: { id: string; name: string; discipline: string };
  artefacts: ArtefactContext[];
}

export default function Simular() {
  const [step, setStep] = useState<Step>("input");
  const { simulate, result, error, reset } = useEvaluationSimulator();

  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [projectLoading, setProjectLoading] = useState(true);

  const [selectedArtefact, setSelectedArtefact] = useState<ArtefactContext | null>(null);
  const [subject, setSubject] = useState("");
  const [wadFile, setWadFile] = useState<File | null>(null);
  const [wadText, setWadText] = useState("");

  const loadProject = useCallback(async () => {
    setProjectLoading(true);
    try {
      const res = await fetch("/api/my-project");
      if (!res.ok) throw new Error();
      const json = await res.json();
      setProjectData(json.data);
    } catch {
      toast.error("Não foi possível carregar seu projeto.");
    } finally {
      setProjectLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadProject);
  }, [loadProject]);

  async function handleWadUpload(file: File) {
    setWadFile(file);
    const text = await file.text();
    setWadText(text);
  }

  const isValid =
    subject.length > 0 &&
    selectedArtefact !== null &&
    wadText.length > 10;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedArtefact) return;
    setStep("loading");
    const nextResult = await simulate({
      subject,
      artefactName: selectedArtefact.artefactName,
      activityDescription: selectedArtefact.description,
      studentResponse: wadText,
      maxScore: 10,
    });
    setStep(nextResult ? "done" : "error");
  }

  function handleReset() {
    setStep("input");
    reset();
    setSelectedArtefact(null);
    setSubject("");
    setWadFile(null);
    setWadText("");
  }

  if (step === "done" && result) {
    return (
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Resultado da Simulação</h1>
        <p style={{ color: "#888", marginBottom: 32 }}>
          Artefato: <strong style={{ color: "#e8e8e8" }}>{selectedArtefact?.artefactName}</strong>
        </p>
        <SimulationResults result={result} onReset={handleReset} />
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Simular Avaliação</h1>
      <p style={{ color: "#888", marginBottom: 32 }}>
        Selecione o artefato, anexe seu WAD e veja como a IA prevê sua correção.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 680 }}
      >
        {step === "error" && (
          <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>
            {error ?? "Não foi possível simular a avaliação."}
          </p>
        )}

        {/* Subject selector */}
        <div>
          <label style={labelStyle}>Matéria / Professor</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
            {SUBJECTS.map((s) => {
              const colors = SUBJECT_COLORS[s];
              const isSelected = subject === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSubject(s)}
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
                    {SUBJECT_ICONS[s]}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: isSelected ? 600 : 400, color: isSelected ? colors.text : "#666" }}>
                    {s}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Artefact selector */}
        <div>
          <label style={labelStyle}>Artefato</label>
          {projectLoading ? (
            <p style={{ fontSize: 13, color: "#555" }}>Carregando artefatos...</p>
          ) : !projectData || projectData.artefacts.length === 0 ? (
            <p style={{ fontSize: 13, color: "#555" }}>Nenhum artefato disponível.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {projectData.artefacts.map((art) => {
                const isSelected = selectedArtefact?.id === art.id;
                return (
                  <button
                    key={art.id}
                    type="button"
                    onClick={() => setSelectedArtefact(art)}
                    style={{
                      textAlign: "left",
                      padding: "12px 16px",
                      background: isSelected ? "#0d1f3c" : "#141414",
                      border: `1px solid ${isSelected ? "#4f8ef7" : "#262626"}`,
                      borderRadius: 8,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 14, color: isSelected ? "#7ab3ff" : "#ccc" }}>
                      {art.artefactName}
                    </div>
                    {isSelected && (
                      <div style={{ fontSize: 12, color: "#4f8ef799", marginTop: 4, lineHeight: 1.5 }}>
                        {art.description.length > 120 ? art.description.slice(0, 120) + "..." : art.description}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* WAD upload */}
        <div>
          <label style={labelStyle}>Seu WAD (.md ou .txt) *</label>
          <label
            htmlFor="wad-sim-upload"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 10, padding: "20px",
              border: wadFile ? "1.5px solid #4f8ef7" : "1.5px dashed #333",
              borderRadius: 8, background: wadFile ? "#0d1f3c" : "#0d0d0d",
              cursor: "pointer", fontSize: 14,
              color: wadFile ? "#7ab3ff" : "#555",
              transition: "all 0.15s",
            }}
          >
            {wadFile ? (
              <>
                <span>📄</span>
                <span style={{ fontWeight: 500 }}>{wadFile.name}</span>
                <span style={{ fontSize: 12, color: "#4f8ef780" }}>
                  ({(wadFile.size / 1024).toFixed(1)} KB)
                </span>
              </>
            ) : (
              <>
                <span style={{ fontSize: 20 }}>⬆</span>
                <span>Clique para anexar seu WAD</span>
              </>
            )}
          </label>
          <input
            id="wad-sim-upload"
            type="file"
            accept=".md,.txt"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleWadUpload(file);
            }}
          />
          {wadFile && (
            <button
              type="button"
              onClick={() => { setWadFile(null); setWadText(""); }}
              style={{ marginTop: 6, fontSize: 12, color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}
            >
              Remover arquivo
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={!isValid || step === "loading"}
          style={{
            padding: "12px 28px",
            background: isValid ? "#4f8ef7" : "#1e1e1e",
            color: isValid ? "#fff" : "#555",
            border: "none",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 15,
            cursor: isValid ? "pointer" : "not-allowed",
            alignSelf: "flex-start",
            transition: "background 0.15s",
          }}
        >
          {step === "loading" ? "Simulando..." : "Simular Avaliação"}
        </button>
      </form>
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
          <div style={{ color: "#888", fontSize: 13, marginBottom: 4 }}>Nota prevista</div>
          <div style={{ fontSize: 40, fontWeight: 700 }}>
            {result.predictedScore}
            <span style={{ fontSize: 20, color: "#888", fontWeight: 400 }}>/{result.maxScore}</span>
          </div>
        </div>
        <div style={{ width: 1, height: 48, background: "#222" }} />
        <div>
          <div style={{ color: "#888", fontSize: 13, marginBottom: 4 }}>Confiança</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#8b5cf6" }}>{result.confidence}%</div>
        </div>
      </div>

      {/* Feedback */}
      <section>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Feedback previsto</h3>
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
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Requisitos faltantes</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {result.missingRequirements.map((req) => (
              <div
                key={req.requirement}
                style={{
                  padding: "8px 14px",
                  background: "#141414",
                  border: "1px solid #222",
                  borderRadius: 6,
                  color: "#fbbf24",
                  fontSize: 14,
                }}
              >
                {req.requirement} · impacto estimado: -{req.impact}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Risk areas */}
      <section>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Áreas de risco</h3>
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
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontWeight: 500 }}>{risk.area}</span>
                <span
                  style={{
                    fontSize: 12,
                    padding: "2px 8px",
                    borderRadius: 4,
                    background: risk.severity === "high" ? "#2d0f0f" : risk.severity === "medium" ? "#2d2000" : "#0f1a2d",
                    color: risk.severity === "high" ? "#f87171" : risk.severity === "medium" ? "#fbbf24" : "#60a5fa",
                  }}
                >
                  {risk.severity === "high" ? "Alto" : risk.severity === "medium" ? "Médio" : "Baixo"}
                </span>
              </div>
              <p style={{ color: "#888", fontSize: 13 }}>{risk.description}</p>
              <p style={{ color: "#aaa", fontSize: 13, marginTop: 4 }}>→ {risk.suggestion}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Similar cases */}
      {result.similarCases.length > 0 && (
        <section>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Casos similares na base</h3>
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
                <span style={{ fontWeight: 500 }}>{match.activityDescription}</span>
                <div style={{ display: "flex", gap: 16, fontSize: 13 }}>
                  <span style={{ color: "#888" }}>Nota: {match.score}/{match.maxScore}</span>
                  <span style={{ color: "#4f8ef7", fontWeight: 600 }}>{match.similarity}% similar</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Pseudo-prompt combinado</h3>
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

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  color: "#aaa",
  fontWeight: 500,
  marginBottom: 8,
};
