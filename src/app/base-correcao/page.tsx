"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface GroupFeedback {
  id: string;
  groupName: string;
  activityDescription: string;
  feedback: string;
  score: number;
  maxScore: number;
  wadFileName: string;
  wadText: string;
  createdAt: string;
}

interface ArtefactContext {
  id: string;
  artefactName: string;
  description: string;
  groupFeedbacks: GroupFeedback[];
}

interface ProjectData {
  groupName: string;
  projectContext: { id: string; name: string; discipline: string };
  artefacts: ArtefactContext[];
}

export default function BaseCorrecaoPage() {
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedArtefact, setSelectedArtefact] = useState<ArtefactContext | null>(null);

  // Form state
  const [wadFile, setWadFile] = useState<File | null>(null);
  const [wadText, setWadText] = useState("");
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState("");
  const [maxScore, setMaxScore] = useState("10");
  const [submitting, setSubmitting] = useState(false);

  const loadProject = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/my-project");
      if (!res.ok) throw new Error("Erro ao carregar projeto");
      const json = await res.json();
      setProjectData(json.data);
    } catch {
      toast.error("Não foi possível carregar seu projeto.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  function handleSelectArtefact(artefact: ArtefactContext) {
    setSelectedArtefact(artefact);
    setWadFile(null);
    setWadText("");
    setFeedback("");
    setScore("");
    setMaxScore("10");
  }

  async function handleWadUpload(file: File) {
    setWadFile(file);
    const text = await file.text();
    setWadText(text);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedArtefact || !projectData) return;

    if (!feedback.trim()) {
      toast.error("Cole o feedback recebido.");
      return;
    }
    if (!score) {
      toast.error("Informe a nota recebida.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/artefact-contexts/${selectedArtefact.id}/group-feedbacks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupName: projectData.groupName,
          activityDescription: selectedArtefact.description,
          feedback: feedback.trim(),
          score: parseFloat(score),
          maxScore: parseFloat(maxScore),
          wadText: wadText,
          wadFileName: wadFile?.name ?? "",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Erro ao salvar");
      }

      toast.success("Correção salva com sucesso!");
      setFeedback("");
      setWadFile(null);
      setWadText("");
      setScore("");
      await loadProject();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar correção.");
    } finally {
      setSubmitting(false);
    }
  }

  // Refresh selected artefact data after reload
  useEffect(() => {
    if (projectData && selectedArtefact) {
      const updated = projectData.artefacts.find((a) => a.id === selectedArtefact.id);
      if (updated) setSelectedArtefact(updated);
    }
  }, [projectData]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const myFeedbacks = selectedArtefact?.groupFeedbacks.filter(
    (f) => f.groupName === projectData.groupName
  ) ?? [];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Base de Correção</h1>
        <p style={{ color: "#888", fontSize: 14 }}>
          {projectData.projectContext.name} —{" "}
          <span style={{ color: "#4f8ef7" }}>{projectData.groupName}</span>
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 24, alignItems: "start" }}>
        {/* Sidebar: artefact list */}
        <div style={{ position: "sticky", top: 72 }}>
          <p style={{ fontSize: 12, color: "#555", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>
            Artefatos
          </p>
          {projectData.artefacts.length === 0 ? (
            <p style={{ fontSize: 13, color: "#555" }}>Nenhum artefato cadastrado.</p>
          ) : (
            projectData.artefacts.map((art) => {
              const myCount = art.groupFeedbacks.filter((f) => f.groupName === projectData.groupName).length;
              const isSelected = selectedArtefact?.id === art.id;
              return (
                <button
                  key={art.id}
                  onClick={() => handleSelectArtefact(art)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "10px 14px",
                    marginBottom: 6,
                    borderRadius: 8,
                    border: isSelected ? "1px solid #4f8ef7" : "1px solid #222",
                    background: isSelected ? "#0d1f3c" : "#141414",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 14, color: isSelected ? "#7ab3ff" : "#ccc" }}>
                    {art.artefactName}
                  </div>
                  <div style={{ fontSize: 12, color: "#555", marginTop: 3 }}>
                    {myCount} entrega{myCount !== 1 ? "s" : ""} do meu grupo
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Main panel */}
        <div>
          {!selectedArtefact ? (
            <div style={{
              padding: "48px 24px", textAlign: "center", color: "#555",
              background: "#141414", border: "1px solid #222", borderRadius: 10,
            }}>
              <p style={{ fontSize: 28, marginBottom: 12 }}>◈</p>
              <p style={{ color: "#888", fontSize: 15, fontWeight: 500 }}>
                Selecione um artefato para registrar uma correção
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Activity description card */}
              <div style={panelStyle}>
                <p style={{ fontSize: 12, color: "#555", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                  Descrição da atividade
                </p>
                <p style={{ fontSize: 14, color: "#ccc", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                  {selectedArtefact.description || "Sem descrição disponível."}
                </p>
              </div>

              {/* Submission form */}
              <form onSubmit={handleSubmit} style={panelStyle}>
                <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 20 }}>
                  Registrar correção recebida
                </p>

                {/* WAD upload */}
                <div style={{ marginBottom: 18 }}>
                  <label style={labelStyle}>WAD entregue (.md ou .txt)</label>
                  <label
                    htmlFor="wad-upload"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      gap: 10, padding: "16px 20px",
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
                        <span>⬆</span>
                        <span>Clique para anexar seu WAD</span>
                      </>
                    )}
                  </label>
                  <input
                    id="wad-upload"
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

                {/* Feedback textarea */}
                <div style={{ marginBottom: 18 }}>
                  <label style={labelStyle}>Feedback recebido *</label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Cole aqui o feedback que você recebeu do avaliador..."
                    rows={6}
                    style={inputStyle}
                    required
                  />
                </div>

                {/* Score inputs */}
                <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Nota recebida *</label>
                    <input
                      type="number"
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                      placeholder="ex: 7.5"
                      min={0}
                      step={0.1}
                      style={inputStyle}
                      required
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Nota máxima</label>
                    <input
                      type="number"
                      value={maxScore}
                      onChange={(e) => setMaxScore(e.target.value)}
                      placeholder="ex: 10"
                      min={0}
                      step={0.1}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: "10px 24px",
                    background: submitting ? "#333" : "#4f8ef7",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: submitting ? "not-allowed" : "pointer",
                    width: "100%",
                    transition: "background 0.15s",
                  }}
                >
                  {submitting ? "Salvando..." : "Salvar Correção"}
                </button>
              </form>

              {/* History */}
              {myFeedbacks.length > 0 && (
                <div style={panelStyle}>
                  <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>
                    Histórico do {projectData.groupName}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {myFeedbacks.map((fb) => (
                      <div
                        key={fb.id}
                        style={{
                          padding: "14px 16px",
                          background: "#0d0d0d",
                          border: "1px solid #222",
                          borderRadius: 8,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                          <span style={{ fontWeight: 600, fontSize: 15, color: "#e8e8e8" }}>
                            {fb.score}/{fb.maxScore}
                          </span>
                          <span style={{ fontSize: 12, color: "#475569" }}>
                            {new Date(fb.createdAt).toLocaleDateString("pt-BR")}
                          </span>
                        </div>

                        {fb.wadFileName && (
                          <div style={{ fontSize: 12, color: "#4f8ef7", marginBottom: 8 }}>
                            📄 {fb.wadFileName}
                          </div>
                        )}

                        <p style={{ fontSize: 13, color: "#888", lineHeight: 1.6 }}>
                          {fb.feedback.length > 300 ? fb.feedback.slice(0, 300) + "..." : fb.feedback}
                        </p>

                        {fb.feedback.length > 300 && (
                          <details style={{ marginTop: 8 }}>
                            <summary style={{ fontSize: 12, color: "#4f8ef7", cursor: "pointer" }}>
                              Ver completo
                            </summary>
                            <p style={{ fontSize: 13, color: "#888", lineHeight: 1.6, marginTop: 8, whiteSpace: "pre-wrap" }}>
                              {fb.feedback}
                            </p>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  padding: "20px 24px",
  background: "#141414",
  border: "1px solid #222",
  borderRadius: 10,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  color: "#888",
  marginBottom: 6,
  fontWeight: 500,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#0d0d0d",
  border: "1px solid #2a2a2a",
  borderRadius: 8,
  color: "#e8e8e8",
  fontSize: 14,
  padding: "10px 12px",
  outline: "none",
  resize: "vertical" as const,
  boxSizing: "border-box",
};
