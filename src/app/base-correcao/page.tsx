"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { AcademicDocumentType, UploadedDocumentInput } from "@/features/shared/types";

interface UploadedFile {
  file: File;
  doc: UploadedDocumentInput;
  text?: string;
}

interface GroupFeedback {
  id: string;
  groupName: string;
  activityDescription: string;
  feedback: string;
  score: number;
  maxScore: number;
  wadFileName: string;
  wadText: string;
  uploadedDocuments: Array<{ id: string; fileName: string; documentType: string }>;
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

// ── helpers ──────────────────────────────────────────────────────────────────

function isTextLike(file: File) {
  const name = file.name.toLowerCase();
  return (
    file.type.startsWith("text/") ||
    name.endsWith(".md") ||
    name.endsWith(".txt") ||
    name.endsWith(".csv")
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Arquivo inválido."));
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.readAsDataURL(file);
  });
}

async function toUploadedFile(
  file: File,
  documentType: AcademicDocumentType
): Promise<UploadedFile> {
  const [contentBase64, text] = await Promise.all([
    fileToBase64(file),
    isTextLike(file) ? file.text() : Promise.resolve(undefined),
  ]);
  return {
    file,
    text,
    doc: {
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      documentType,
      contentBase64,
    },
  };
}

// ── component ─────────────────────────────────────────────────────────────────

export default function BaseCorrecaoPage() {
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedArtefact, setSelectedArtefact] = useState<ArtefactContext | null>(null);

  // form state
  const [wadFiles, setWadFiles] = useState<UploadedFile[]>([]);
  const [feedbackFiles, setFeedbackFiles] = useState<UploadedFile[]>([]);
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState("");
  const [maxScore, setMaxScore] = useState("10");
  const [submitting, setSubmitting] = useState(false);

  const loadProject = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/my-project");
      if (!res.ok) throw new Error("Erro ao carregar projeto");
      const json = await res.json() as { data: ProjectData };
      setProjectData(json.data);
    } catch {
      toast.error("Não foi possível carregar seu projeto.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProject();
  }, [loadProject]);

  // Refresh selected artefact after reload
  useEffect(() => {
    if (!projectData || !selectedArtefact) return;
    const updated = projectData.artefacts.find((a) => a.id === selectedArtefact.id);
    if (updated) setSelectedArtefact(updated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectData]);

  function resetForm() {
    setWadFiles([]);
    setFeedbackFiles([]);
    setFeedback("");
    setScore("");
    setMaxScore("10");
  }

  function handleSelectArtefact(artefact: ArtefactContext) {
    setSelectedArtefact(artefact);
    resetForm();
  }

  async function handleWadAdd(fileList: FileList | null) {
    if (!fileList) return;
    const incoming = await Promise.all(
      Array.from(fileList).map((f) => toUploadedFile(f, "group_wad"))
    );
    setWadFiles((prev) => {
      const existing = new Set(prev.map((u) => u.file.name));
      return [...prev, ...incoming.filter((u) => !existing.has(u.file.name))];
    });
  }

  function removeWadFile(fileName: string) {
    setWadFiles((prev) => prev.filter((u) => u.file.name !== fileName));
  }

  async function handleFeedbackAdd(fileList: FileList | null) {
    if (!fileList) return;
    const incoming = await Promise.all(
      Array.from(fileList).map((f) => toUploadedFile(f, "feedback_file"))
    );
    setFeedbackFiles((prev) => {
      const existing = new Set(prev.map((u) => u.file.name));
      return [...prev, ...incoming.filter((u) => !existing.has(u.file.name))];
    });
  }

  function removeFeedbackFile(fileName: string) {
    setFeedbackFiles((prev) => prev.filter((u) => u.file.name !== fileName));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedArtefact || !projectData) return;

    const hasFeedback = feedback.trim().length >= 1 || feedbackFiles.length > 0;
    const hasWad = wadFiles.length > 0;

    if (!hasWad) {
      toast.error("Anexe pelo menos um arquivo do WAD.");
      return;
    }
    if (!hasFeedback) {
      toast.error("Cole o feedback recebido ou anexe o arquivo da correção.");
      return;
    }
    if (!score) {
      toast.error("Informe a nota recebida.");
      return;
    }

    const wadText = wadFiles
      .filter((u) => u.text !== undefined)
      .map((u) => u.text!)
      .join("\n\n---\n\n");

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
          wadText,
          wadFileName: wadFiles[0]?.file.name ?? "",
          wadDocuments: wadFiles.map((u) => u.doc),
          feedbackDocuments: feedbackFiles.map((u) => u.doc),
        }),
      });

      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? "Erro ao salvar");
      }

      toast.success("Correção salva com sucesso!");
      resetForm();
      await loadProject();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar correção.");
    } finally {
      setSubmitting(false);
    }
  }

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

  const myFeedbacks =
    selectedArtefact?.groupFeedbacks.filter(
      (f) => f.groupName === projectData.groupName
    ) ?? [];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Base de Correção</h1>
        <p style={{ color: "#888", fontSize: 14 }}>
          {projectData.projectContext.name} —{" "}
          <span style={{ color: "#4f8ef7" }}>{projectData.groupName}</span>
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 24, alignItems: "start" }}>
        {/* Sidebar */}
        <div style={{ position: "sticky", top: 72 }}>
          <p style={sectionLabelStyle}>Artefatos</p>
          {projectData.artefacts.length === 0 ? (
            <p style={{ fontSize: 13, color: "#555" }}>Nenhum artefato cadastrado.</p>
          ) : (
            projectData.artefacts.map((art) => {
              const myCount = art.groupFeedbacks.filter(
                (f) => f.groupName === projectData.groupName
              ).length;
              const isSelected = selectedArtefact?.id === art.id;
              return (
                <button
                  key={art.id}
                  onClick={() => handleSelectArtefact(art)}
                  style={{
                    display: "block", width: "100%", textAlign: "left",
                    padding: "10px 14px", marginBottom: 6, borderRadius: 8,
                    border: isSelected ? "1px solid #4f8ef7" : "1px solid #222",
                    background: isSelected ? "#0d1f3c" : "#141414",
                    cursor: "pointer", transition: "all 0.15s",
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
              padding: "48px 24px", textAlign: "center",
              background: "#141414", border: "1px solid #222", borderRadius: 10,
            }}>
              <p style={{ fontSize: 28, marginBottom: 12 }}>◈</p>
              <p style={{ color: "#888", fontSize: 15, fontWeight: 500 }}>
                Selecione um artefato para registrar uma correção
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Description card */}
              <div style={panelStyle}>
                <p style={sectionLabelStyle}>Descrição da atividade</p>
                <p style={{ fontSize: 14, color: "#ccc", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                  {selectedArtefact.description || "Sem descrição disponível."}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} style={panelStyle}>
                <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 20 }}>
                  Registrar correção recebida
                </p>

                {/* WAD upload — multiple */}
                <div style={{ marginBottom: 18 }}>
                  <label style={labelStyle}>
                    WAD entregue * <span style={{ color: "#555", fontWeight: 400 }}>(MD, TXT, PDF, imagens…)</span>
                  </label>

                  <label
                    htmlFor="wad-upload"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      gap: 10, padding: "14px 20px",
                      border: "1.5px dashed #333", borderRadius: 8,
                      background: "#0d0d0d", cursor: "pointer", fontSize: 14, color: "#555",
                    }}
                  >
                    <span>⬆</span>
                    <span>Clique para adicionar arquivo(s) do WAD</span>
                  </label>
                  <input
                    id="wad-upload"
                    type="file"
                    multiple
                    accept=".md,.txt,.docx,.pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.webp,application/pdf,image/*"
                    style={{ display: "none" }}
                    onChange={(e) => void handleWadAdd(e.target.files)}
                  />

                  {wadFiles.length > 0 && (
                    <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                      {wadFiles.map((u) => (
                        <FileChip
                          key={u.file.name}
                          name={u.file.name}
                          size={u.file.size}
                          hasText={u.text !== undefined}
                          onRemove={() => removeWadFile(u.file.name)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Feedback textarea */}
                <div style={{ marginBottom: 18 }}>
                  <label style={labelStyle}>Feedback recebido</label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Cole aqui o feedback que você recebeu do avaliador..."
                    rows={6}
                    style={inputStyle}
                  />

                  {/* Feedback file attachments */}
                  <label
                    htmlFor="feedback-upload"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      marginTop: 8, fontSize: 12, color: "#555", cursor: "pointer",
                    }}
                  >
                    <span>📎</span> Anexar arquivo(s) da correção
                  </label>
                  <input
                    id="feedback-upload"
                    type="file"
                    multiple
                    accept=".xlsx,.xls,.csv,.docx,.pdf,.txt,.md,.png,.jpg,.jpeg,.webp,application/pdf,image/*"
                    style={{ display: "none" }}
                    onChange={(e) => void handleFeedbackAdd(e.target.files)}
                  />

                  {feedbackFiles.length > 0 && (
                    <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
                      {feedbackFiles.map((u) => (
                        <FileChip
                          key={u.file.name}
                          name={u.file.name}
                          size={u.file.size}
                          hasText={u.text !== undefined}
                          onRemove={() => removeFeedbackFile(u.file.name)}
                        />
                      ))}
                    </div>
                  )}
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
                    color: "#fff", border: "none", borderRadius: 8,
                    fontWeight: 600, fontSize: 14,
                    cursor: submitting ? "not-allowed" : "pointer",
                    width: "100%", transition: "background 0.15s",
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
                          padding: "14px 16px", background: "#0d0d0d",
                          border: "1px solid #222", borderRadius: 8,
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

                        {fb.uploadedDocuments.length > 1 && (
                          <div style={{ fontSize: 12, color: "#475569", marginBottom: 8 }}>
                            +{fb.uploadedDocuments.length - 1} arquivo(s) adicional(is)
                          </div>
                        )}

                        {fb.feedback ? (
                          <>
                            <p style={{ fontSize: 13, color: "#888", lineHeight: 1.6 }}>
                              {fb.feedback.length > 300
                                ? fb.feedback.slice(0, 300) + "..."
                                : fb.feedback}
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
                          </>
                        ) : null}
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

// ── FileChip ──────────────────────────────────────────────────────────────────

function FileChip({
  name,
  size,
  hasText,
  onRemove,
}: {
  name: string;
  size: number;
  hasText: boolean;
  onRemove: () => void;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "6px 10px", borderRadius: 6,
      background: "#0d1f3c", border: "1px solid #1e3a5f",
    }}>
      <span style={{ fontSize: 13 }}>📄</span>
      <span style={{ fontSize: 13, color: "#7ab3ff", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {name}
      </span>
      <span style={{ fontSize: 11, color: "#475569", flexShrink: 0 }}>
        {(size / 1024).toFixed(1)} KB {hasText ? "· texto" : "· binário"}
      </span>
      <button
        type="button"
        onClick={onRemove}
        style={{
          background: "none", border: "none", cursor: "pointer",
          color: "#ef4444", fontSize: 14, padding: "0 2px", lineHeight: 1,
        }}
        title="Remover"
      >
        ×
      </button>
    </div>
  );
}

// ── styles ────────────────────────────────────────────────────────────────────

const panelStyle: React.CSSProperties = {
  padding: "20px 24px",
  background: "#141414",
  border: "1px solid #222",
  borderRadius: 10,
};

const sectionLabelStyle: React.CSSProperties = {
  fontSize: 12, color: "#555", marginBottom: 10,
  textTransform: "uppercase", letterSpacing: 1,
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 13, color: "#888", marginBottom: 6, fontWeight: 500,
};

const inputStyle: React.CSSProperties = {
  width: "100%", background: "#0d0d0d",
  border: "1px solid #2a2a2a", borderRadius: 8,
  color: "#e8e8e8", fontSize: 14, padding: "10px 12px",
  outline: "none", resize: "vertical" as const, boxSizing: "border-box",
};
