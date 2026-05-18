"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import type { GeneratedQuestion, QuestionGenerationResult } from "@/app/api/question-generation/route";

// ─── Types ──────────────────────────────────────────────────────────────────

interface ArtefactContext {
  id: string;
  artefactName: string;
  description: string;
  groupFeedbacks: { id: string }[];
  latestModel: { confidence: number; rigorLevel: string } | null;
}

interface ProjectData {
  groupName: string;
  projectContext: { id: string; name: string; discipline: string };
  artefacts: ArtefactContext[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const MINIMUM_FEEDBACKS = 5;

// ─── Styles ──────────────────────────────────────────────────────────────────

const panel: React.CSSProperties = {
  background: "#141414",
  border: "1px solid #222",
  borderRadius: 10,
  padding: "20px 24px",
};

const labelSt: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  color: "#64748b",
  marginBottom: 5,
  fontWeight: 500,
};

const difficultyColor: Record<string, string> = {
  "fácil": "#4ade80",
  "médio":  "#fbbf24",
  "difícil": "#f87171",
};

// ─── Main Component ──────────────────────────────────────────────────────────

export default function CriacaoDePerguntasPage() {
  return (
    <Suspense>
      <CriacaoDePerguntas />
    </Suspense>
  );
}

function CriacaoDePerguntas() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("artefactContextId");
  const artefactRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [generating, setGenerating] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<Record<string, QuestionGenerationResult>>({});
  const [customPrompt, setCustomPrompt] = useState("");
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadProject = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/my-project");
      if (!res.ok) throw new Error();
      const json = await res.json();
      const data: ProjectData = json.data;
      setProjectData(data);
      const init: Record<string, number> = {};
      data.artefacts.forEach((a) => { init[a.id] = 5; });
      setQuantities(init);
    } catch {
      toast.error("Não foi possível carregar seu projeto.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProject(); }, [loadProject]);

  // Auto-scroll to highlighted artefact when arriving from /padroes
  useEffect(() => {
    if (!loading && highlightId && artefactRefs.current[highlightId]) {
      setTimeout(() => {
        artefactRefs.current[highlightId]?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    }
  }, [loading, highlightId]);

  async function handleGenerate(artefactId: string) {
    const quantity = quantities[artefactId] ?? 5;
    setGenerating((p) => ({ ...p, [artefactId]: true }));
    try {
      const res = await fetch("/api/question-generation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artefactContextId: artefactId,
          quantity,
          customPrompt: customPrompt.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erro ao gerar perguntas.");
      setResults((p) => ({ ...p, [artefactId]: json.data }));
      toast.success(`${json.data.questions.length} pergunta(s) gerada(s) para ${json.data.artefactName}!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao gerar perguntas.");
    } finally {
      setGenerating((p) => ({ ...p, [artefactId]: false }));
    }
  }

  function handleGenerateAll() {
    if (!projectData) return;
    const eligible = projectData.artefacts.filter(
      (a) => a.groupFeedbacks.length >= MINIMUM_FEEDBACKS
    );
    if (eligible.length === 0) {
      toast.error("Nenhum artefato tem correções suficientes.");
      return;
    }
    eligible.forEach((a) => handleGenerate(a.id));
  }

  async function copyAll(artefactId: string) {
    const result = results[artefactId];
    if (!result) return;
    const text = result.questions.map((q, i) => `${i + 1}. ${q.question}`).join("\n\n");
    await navigator.clipboard.writeText(text).catch(() => toast.error("Não foi possível copiar."));
    setCopiedId(artefactId);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function exportTxt() {
    const parts: string[] = [];
    Object.values(results).forEach((r) => {
      parts.push(`=== ${r.artefactName} ===\n`);
      r.questions.forEach((q, i) => {
        parts.push(`${i + 1}. ${q.question}\n`);
        if (q.expectedElements.length)
          parts.push(`   Elementos: ${q.expectedElements.join(", ")}\n`);
        parts.push(`   Dificuldade: ${q.difficulty}\n`);
        if (q.relatedCriteria.length)
          parts.push(`   Critérios: ${q.relatedCriteria.join(", ")}\n`);
        parts.push("\n");
      });
    });
    const blob = new Blob([parts.join("")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "perguntas-geradas.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Render guards ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ padding: "48px 0", textAlign: "center", color: "#555" }}>
        Carregando projeto...
      </div>
    );
  }

  if (!projectData) {
    return (
      <div style={{ padding: "48px 0", textAlign: "center", color: "#888" }}>
        Nenhum projeto encontrado. Entre em contato com o administrador.
      </div>
    );
  }

  const eligible = projectData.artefacts.filter(
    (a) => a.groupFeedbacks.length >= MINIMUM_FEEDBACKS
  );
  const pendingArtefacts = projectData.artefacts.filter(
    (a) => a.groupFeedbacks.length < MINIMUM_FEEDBACKS
  );
  const hasResults = Object.keys(results).length > 0;
  const anyGenerating = Object.values(generating).some(Boolean);

  // ── Main render ───────────────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Criação de Perguntas</h1>
        <p style={{ color: "#888", fontSize: 14, maxWidth: 640 }}>
          Gere questões similares às cobradas em cada artefato, com base no padrão de correção
          inferido do professor. —{" "}
          <span style={{ color: "#4f8ef7" }}>{projectData.groupName}</span>
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── Prompt Editor ── */}
        <div style={panel}>
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            marginBottom: showPromptEditor ? 16 : 0,
          }}>
            <div>
              <span style={{ fontWeight: 600, fontSize: 14 }}>Prompt personalizado</span>
              <span style={{ fontSize: 12, color: "#475569", marginLeft: 10 }}>
                {customPrompt.trim() ? "✦ Customizado ativo" : "Usando prompt padrão"}
              </span>
            </div>
            <button
              onClick={() => setShowPromptEditor((v) => !v)}
              style={{
                padding: "6px 14px", borderRadius: 7,
                border: "1px solid #2a2a3a", background: "transparent",
                color: "#64748b", fontSize: 12, cursor: "pointer",
              }}
            >
              {showPromptEditor ? "Ocultar" : "Editar prompt"}
            </button>
          </div>

          {showPromptEditor && (
            <div>
              <label style={labelSt}>
                Variáveis disponíveis:{" "}
                {["{artefact_name}", "{quantity}", "{artefact_context}", "{model_context}", "{feedback_samples}"].map((v) => (
                  <code key={v} style={{ color: "#a78bfa", fontSize: 11, marginRight: 6 }}>{v}</code>
                ))}
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={10}
                placeholder="Deixe em branco para usar o prompt padrão do sistema..."
                style={{
                  width: "100%", background: "#0d0d0d", border: "1px solid #2a2a2a",
                  borderRadius: 8, color: "#e8e8e8", fontSize: 13,
                  padding: "10px 12px", outline: "none", resize: "vertical",
                  boxSizing: "border-box", fontFamily: "monospace", lineHeight: 1.6,
                }}
              />
              {customPrompt.trim() && (
                <button
                  onClick={() => setCustomPrompt("")}
                  style={{ marginTop: 6, fontSize: 12, color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}
                >
                  Limpar · usar prompt padrão
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Eligible artefacts ── */}
        {eligible.length > 0 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 4px" }}>
                  Artefatos disponíveis
                </h2>
                <p style={{ fontSize: 12, color: "#475569", margin: 0 }}>
                  Selecione quantas perguntas gerar por artefato
                </p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                {hasResults && (
                  <button
                    onClick={exportTxt}
                    style={{
                      padding: "8px 16px", borderRadius: 7, border: "1px solid #2a2a3a",
                      background: "transparent", color: "#94a3b8", fontSize: 13,
                      fontWeight: 600, cursor: "pointer",
                    }}
                  >
                    ↓ Exportar tudo
                  </button>
                )}
                <button
                  onClick={handleGenerateAll}
                  disabled={anyGenerating}
                  style={{
                    padding: "8px 18px", borderRadius: 7, border: "none",
                    background: anyGenerating ? "#1e293b" : "#4f8ef7",
                    color: anyGenerating ? "#475569" : "#fff",
                    fontSize: 13, fontWeight: 700,
                    cursor: anyGenerating ? "not-allowed" : "pointer",
                  }}
                >
                  ✦ Gerar todos
                </button>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {eligible.map((art) => {
                const result = results[art.id];
                const isGenerating = generating[art.id] ?? false;

                const isHighlighted = highlightId === art.id;

                return (
                  <div
                    key={art.id}
                    ref={(el) => { artefactRefs.current[art.id] = el; }}
                    style={{
                      ...panel,
                      border: isHighlighted ? "1px solid #4f8ef7" : panel.border,
                      boxShadow: isHighlighted ? "0 0 0 2px #4f8ef720" : undefined,
                    }}
                  >
                    {/* Artefact header row */}
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: result ? 16 : 0 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, fontSize: 15, color: "#e2e8f0" }}>
                            {art.artefactName}
                          </span>
                          {art.latestModel ? (
                            <span style={{
                              fontSize: 11, padding: "2px 8px", borderRadius: 20, fontWeight: 600,
                              background: "#14532d22", border: "1px solid #16a34a44", color: "#4ade80",
                            }}>✓ Modelo gerado</span>
                          ) : (
                            <span style={{
                              fontSize: 11, padding: "2px 8px", borderRadius: 20, fontWeight: 600,
                              background: "#1e293b", border: "1px solid #334155", color: "#64748b",
                            }}>Sem modelo</span>
                          )}
                          <span style={{ fontSize: 12, color: "#475569" }}>
                            {art.groupFeedbacks.length} feedbacks
                          </span>
                        </div>
                        {art.description && (
                          <p style={{ fontSize: 13, color: "#64748b", margin: 0, lineHeight: 1.5 }}>
                            {art.description.length > 120
                              ? art.description.slice(0, 120) + "…"
                              : art.description}
                          </p>
                        )}
                        {art.latestModel && (
                          <p style={{ fontSize: 11, color: "#475569", margin: "4px 0 0" }}>
                            Confiança {art.latestModel.confidence}% · Rigor{" "}
                            {art.latestModel.rigorLevel === "high" ? "alto"
                              : art.latestModel.rigorLevel === "medium" ? "médio" : "baixo"}
                          </p>
                        )}
                      </div>

                      {/* Controls */}
                      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, flexShrink: 0 }}>
                        <div>
                          <label style={labelSt}>Quantidade</label>
                          <input
                            type="number"
                            min={1}
                            max={20}
                            value={quantities[art.id] ?? 5}
                            onChange={(e) =>
                              setQuantities((p) => ({
                                ...p,
                                [art.id]: Math.min(20, Math.max(1, parseInt(e.target.value) || 1)),
                              }))
                            }
                            style={{
                              width: 64, background: "#0d0d0d", border: "1px solid #2a2a2a",
                              borderRadius: 6, color: "#e8e8e8", fontSize: 14,
                              padding: "6px 10px", outline: "none", textAlign: "center",
                            }}
                          />
                        </div>
                        <button
                          onClick={() => handleGenerate(art.id)}
                          disabled={isGenerating}
                          style={{
                            padding: "8px 20px", borderRadius: 7, border: "none",
                            background: isGenerating ? "#1e293b" : "#4f8ef7",
                            color: isGenerating ? "#475569" : "#fff",
                            fontSize: 13, fontWeight: 700,
                            cursor: isGenerating ? "not-allowed" : "pointer",
                            minWidth: 100, transition: "background 0.15s",
                          }}
                        >
                          {isGenerating ? "Gerando…" : result ? "↻ Regerar" : "Gerar"}
                        </button>
                      </div>
                    </div>

                    {/* Questions */}
                    {result && result.questions.length > 0 && (
                      <>
                        <div style={{ height: 1, background: "#1e1e2e", marginBottom: 16 }} />
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>
                            {result.questions.length} pergunta{result.questions.length !== 1 ? "s" : ""} gerada{result.questions.length !== 1 ? "s" : ""}
                          </span>
                          <button
                            onClick={() => copyAll(art.id)}
                            style={{
                              padding: "4px 12px", borderRadius: 6,
                              border: "1px solid #2a2a3a", background: "transparent",
                              color: copiedId === art.id ? "#4ade80" : "#64748b",
                              fontSize: 12, cursor: "pointer",
                            }}
                          >
                            {copiedId === art.id ? "✓ Copiado!" : "Copiar todas"}
                          </button>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {result.questions.map((q, i) => (
                            <QuestionCard key={i} index={i} question={q} />
                          ))}
                        </div>
                      </>
                    )}

                    {result && result.questions.length === 0 && (
                      <p style={{ fontSize: 13, color: "#475569", marginTop: 12 }}>
                        Nenhuma pergunta retornada. Tente novamente.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Pending artefacts ── */}
        {pendingArtefacts.length > 0 && (
          <div style={{ ...panel, opacity: 0.65 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 12 }}>
              Artefatos aguardando {MINIMUM_FEEDBACKS} correções mínimas
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {pendingArtefacts.map((art) => (
                <div
                  key={art.id}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 14px", borderRadius: 8,
                    background: "#0d0d0d", border: "1px solid #1e1e2e",
                  }}
                >
                  <span style={{ fontSize: 13, color: "#475569" }}>{art.artefactName}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ background: "#1e293b", borderRadius: 4, height: 4, width: 80 }}>
                      <div style={{
                        height: 4, borderRadius: 4, background: "#334155",
                        width: `${Math.min(100, (art.groupFeedbacks.length / MINIMUM_FEEDBACKS) * 100)}%`,
                      }} />
                    </div>
                    <span style={{ fontSize: 12, color: "#334155", minWidth: 36 }}>
                      {art.groupFeedbacks.length}/{MINIMUM_FEEDBACKS}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {eligible.length === 0 && pendingArtefacts.length === 0 && (
          <div style={{ ...panel, textAlign: "center", padding: "48px 24px" }}>
            <p style={{ fontSize: 28, marginBottom: 12 }}>◈</p>
            <p style={{ color: "#888", fontSize: 15 }}>Nenhum artefato cadastrado ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Question Card ────────────────────────────────────────────────────────────

function QuestionCard({ index, question }: { index: number; question: GeneratedQuestion }) {
  const [expanded, setExpanded] = useState(false);
  const diff = question.difficulty ?? "médio";
  const color = difficultyColor[diff] ?? "#94a3b8";

  return (
    <div style={{
      background: "#0d0d0d", border: "1px solid #1e293b",
      borderRadius: 8, overflow: "hidden",
    }}>
      <div
        onClick={() => setExpanded((v) => !v)}
        style={{ padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 12 }}
      >
        <div style={{
          width: 24, height: 24, borderRadius: 6, flexShrink: 0,
          background: "#1e293b", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#64748b",
          marginTop: 1,
        }}>
          {index + 1}
        </div>
        <p style={{ flex: 1, fontSize: 14, color: "#e2e8f0", margin: 0, lineHeight: 1.6 }}>
          {question.question}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span style={{
            fontSize: 11, padding: "2px 8px", borderRadius: 20, fontWeight: 600,
            background: `${color}22`, border: `1px solid ${color}44`, color,
          }}>
            {diff}
          </span>
          <span style={{ fontSize: 12, color: "#334155" }}>{expanded ? "▴" : "▾"}</span>
        </div>
      </div>

      {expanded && (question.expectedElements.length > 0 || question.relatedCriteria.length > 0) && (
        <div style={{ padding: "0 16px 14px 52px", borderTop: "1px solid #1e293b" }}>
          {question.expectedElements.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <p style={{ fontSize: 11, color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                Elementos esperados na resposta
              </p>
              <ul style={{ margin: 0, padding: "0 0 0 18px" }}>
                {question.expectedElements.map((el, i) => (
                  <li key={i} style={{ fontSize: 13, color: "#94a3b8", marginBottom: 3 }}>{el}</li>
                ))}
              </ul>
            </div>
          )}
          {question.relatedCriteria.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <p style={{ fontSize: 11, color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                Critérios de avaliação relacionados
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {question.relatedCriteria.map((c, i) => (
                  <span key={i} style={{
                    fontSize: 12, padding: "2px 10px", borderRadius: 20,
                    background: "#1e293b", color: "#64748b", border: "1px solid #334155",
                  }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
