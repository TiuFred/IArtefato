"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import type { AcademicDocumentType, ArtefactContextView, ArtefactCorrectionModelView, GroupFeedbackInput, UploadedDocumentInput } from "@/features/shared/types";

const MINIMUM_GROUPS = 5;

const emptyFeedback = (): GroupFeedbackInput => ({
  groupName: "",
  activityDescription: "",
  feedback: "",
  score: 0,
  maxScore: 10,
  wadText: "",
  wadDocuments: [],
  feedbackDocuments: [],
});

// ─── styles ────────────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: "#111", border: "1px solid #222", borderRadius: 10, padding: "20px 24px",
};

const label: React.CSSProperties = {
  display: "block", fontSize: 12, color: "#666", marginBottom: 6, fontWeight: 500,
};

const input: React.CSSProperties = {
  width: "100%", background: "#0d0d0d", border: "1px solid #2a2a2a",
  borderRadius: 6, color: "#e8e8e8", fontSize: 14, padding: "8px 12px",
  outline: "none", boxSizing: "border-box",
};

const btn = (primary?: boolean, danger?: boolean): React.CSSProperties => ({
  padding: "9px 18px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 14,
  fontWeight: 600, transition: "opacity .15s",
  background: danger ? "#7f1d1d" : primary ? "#2563eb" : "#1e293b",
  color: danger ? "#fca5a5" : primary ? "#fff" : "#94a3b8",
});

const tag = (color: string): React.CSSProperties => ({
  display: "inline-block", padding: "2px 10px", borderRadius: 20,
  fontSize: 12, fontWeight: 600, background: `${color}22`, color, marginRight: 6, marginBottom: 4,
});

const sectionTitle: React.CSSProperties = {
  fontSize: 13, fontWeight: 700, color: "#64748b", letterSpacing: ".06em",
  textTransform: "uppercase", marginBottom: 14,
};

// ─── component ─────────────────────────────────────────────────────────────

export default function ArtefactDetailPage() {
  const { artefactId } = useParams<{ artefactId: string }>();
  const router = useRouter();

  const [artefact, setArtefact] = useState<ArtefactContextView | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAddingFeedback, setIsAddingFeedback] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState<GroupFeedbackInput>(emptyFeedback());
  const [myGroupName, setMyGroupName] = useState<string | null>(null);

  // Load current user's group membership for this project
  useEffect(() => {
    if (!artefact?.projectContextId) return;
    fetch(`/api/group-members/me?projectContextId=${artefact.projectContextId}`)
      .then((r) => r.json())
      .then((p) => { if (p.groupName) setMyGroupName(p.groupName); })
      .catch(() => {});
  }, [artefact?.projectContextId]);

  const fetchArtefact = useCallback(async () => {
    try {
      const res = await fetch(`/api/artefact-contexts/${artefactId}`, { cache: "no-store" });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error);
      setArtefact(payload.data);
    } catch {
      toast.error("Não foi possível carregar o artefato.");
    } finally {
      setLoading(false);
    }
  }, [artefactId]);

  useEffect(() => {
    void Promise.resolve().then(fetchArtefact);
  }, [fetchArtefact]);

  async function handleGenerateModel() {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/artefact-correction-models/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artefactContextId: artefactId }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error);
      toast.success("Modelo de correção gerado com sucesso!");
      await fetchArtefact();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao gerar modelo.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleFeedbackFiles(
    fieldName: "wadDocuments" | "feedbackDocuments",
    files: FileList | null,
    documentType: AcademicDocumentType
  ) {
    if (!files) return;
    const docs = await filesToDocuments(files, documentType);
    setFeedbackForm((current) => ({
      ...current,
      [fieldName]: [...(current[fieldName] ?? []), ...docs],
    }));
  }

  async function handleAddFeedback() {
    if (!feedbackForm.groupName.trim()) { toast.error("Informe o nome do grupo."); return; }
    if (!feedbackForm.activityDescription.trim()) { toast.error("Descreva a atividade."); return; }
    if (!feedbackForm.feedback.trim() && (feedbackForm.feedbackDocuments?.length ?? 0) === 0) {
      toast.error("Informe o feedback recebido ou anexe o arquivo da correção.");
      return;
    }
    if (!feedbackForm.wadText?.trim() && (feedbackForm.wadDocuments?.length ?? 0) === 0) {
      toast.error("Informe o WAD do grupo em texto ou por arquivo.");
      return;
    }

    setIsAddingFeedback(true);
    try {
      const res = await fetch(`/api/artefact-contexts/${artefactId}/group-feedbacks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedbackForm),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error);
      toast.success("Feedback adicionado.");
      setFeedbackForm(emptyFeedback());
      setShowAddForm(false);
      await fetchArtefact();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao adicionar feedback.");
    } finally {
      setIsAddingFeedback(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300, color: "#475569" }}>
        Carregando artefato…
      </div>
    );
  }

  if (!artefact) {
    return (
      <div style={{ textAlign: "center", padding: 60 }}>
        <p style={{ color: "#ef4444", marginBottom: 16 }}>Artefato não encontrado.</p>
        <button style={btn()} onClick={() => router.push("/artefatos")}>← Voltar</button>
      </div>
    );
  }

  const feedbackCount = artefact.groupFeedbacks.length;
  const canGenerate = feedbackCount >= MINIMUM_GROUPS;
  const progressPct = Math.min(100, (feedbackCount / MINIMUM_GROUPS) * 100);
  const model: ArtefactCorrectionModelView | null = artefact.latestModel ?? null;

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
        <button style={{ ...btn(), padding: "7px 14px", marginTop: 2 }} onClick={() => router.push("/artefatos")}>
          ← Artefatos
        </button>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#e8e8e8", margin: 0 }}>
            {artefact.artefactName}
          </h1>
          <p style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>
            Projeto: <span style={{ color: "#94a3b8" }}>{artefact.projectContext.name}</span>
            {artefact.projectContext.discipline && (
              <span> · {artefact.projectContext.discipline}</span>
            )}
          </p>
        </div>
      </div>

      {/* ── Context details ── */}
      <div style={card}>
        <p style={sectionTitle}>Descrição do Artefato</p>
        <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
          {artefact.description || <em style={{ color: "#475569" }}>Sem descrição.</em>}
        </p>

        {artefact.expectedStructure && (
          <>
            <p style={{ ...sectionTitle, marginTop: 16 }}>Estrutura Esperada</p>
            <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
              {artefact.expectedStructure}
            </p>
          </>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 16 }}>
          {artefact.explicitRequirements.length > 0 && (
            <div>
              <p style={sectionTitle}>Requisitos Explícitos</p>
              <ul style={{ margin: 0, padding: "0 0 0 18px", color: "#94a3b8", fontSize: 13 }}>
                {artefact.explicitRequirements.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}
          {artefact.implicitRequirements.length > 0 && (
            <div>
              <p style={sectionTitle}>Requisitos Implícitos</p>
              <ul style={{ margin: 0, padding: "0 0 0 18px", color: "#94a3b8", fontSize: 13 }}>
                {artefact.implicitRequirements.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}
        </div>

        {artefact.deliverables.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <p style={sectionTitle}>Entregáveis</p>
            <div>
              {artefact.deliverables.map((d, i) => (
                <span key={i} style={tag("#38bdf8")}>{d}</span>
              ))}
            </div>
          </div>
        )}

        {artefact.uploadedDocuments.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <p style={sectionTitle}>Documentos Anexados</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {artefact.uploadedDocuments.map((doc) => (
                <span key={doc.id} style={tag("#a78bfa")}>
                  {doc.documentType.toUpperCase()} · {doc.fileName}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Group Feedbacks ── */}
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <p style={{ ...sectionTitle, marginBottom: 0 }}>
            Feedbacks Coletivos ({feedbackCount}/{MINIMUM_GROUPS} grupos)
          </p>
          <button style={btn()} onClick={() => setShowAddForm((v) => !v)}>
            {showAddForm ? "Cancelar" : "+ Adicionar Feedback"}
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ background: "#1e293b", borderRadius: 6, height: 8, marginBottom: 20 }}>
          <div style={{
            height: 8, borderRadius: 6, transition: "width .4s",
            width: `${progressPct}%`,
            background: canGenerate ? "#22c55e" : "#3b82f6",
          }} />
        </div>

        {!canGenerate && (
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
            Adicione mais {MINIMUM_GROUPS - feedbackCount} feedback(s) para liberar a geração do modelo.
          </p>
        )}

        {/* Add feedback form */}
        {showAddForm && (
          <div style={{
            background: "#0d0d0d", border: "1px solid #2563eb44",
            borderRadius: 8, padding: "18px 20px", marginBottom: 20,
          }}>
            <p style={{ ...sectionTitle, color: "#3b82f6", marginBottom: 16 }}>Novo Feedback de Grupo</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div>
                <label style={label}>Nome do Grupo</label>
                <input
                  style={input}
                  placeholder="Ex: Grupo A, Turma 3B..."
                  value={feedbackForm.groupName}
                  onChange={(e) => setFeedbackForm((f) => ({ ...f, groupName: e.target.value }))}
                />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={label}>Nota</label>
                  <input
                    style={input}
                    type="number" min={0} max={feedbackForm.maxScore} step={0.5}
                    value={feedbackForm.score}
                    onChange={(e) => setFeedbackForm((f) => ({ ...f, score: Number(e.target.value) }))}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={label}>Nota Máx.</label>
                  <input
                    style={input}
                    type="number" min={1} step={0.5}
                    value={feedbackForm.maxScore}
                    onChange={(e) => setFeedbackForm((f) => ({ ...f, maxScore: Number(e.target.value) }))}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={label}>Descrição da Atividade</label>
              <textarea
                style={{ ...input, minHeight: 60, resize: "vertical" }}
                placeholder="O que o grupo deveria entregar / fazer?"
                value={feedbackForm.activityDescription}
                onChange={(e) => setFeedbackForm((f) => ({ ...f, activityDescription: e.target.value }))}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={label}>WAD do Grupo (texto ou arquivo)</label>
              <textarea
                style={{ ...input, minHeight: 80, resize: "vertical" }}
                placeholder="Cole aqui as seções do WAD entregues pelo grupo para este artefato..."
                value={feedbackForm.wadText ?? ""}
                onChange={(e) => setFeedbackForm((f) => ({ ...f, wadText: e.target.value }))}
              />
              <CompactFileUpload
                label="Anexar WAD, planilha ou foto"
                count={feedbackForm.wadDocuments?.length ?? 0}
                defaultType="group_wad"
                onFiles={(files, selectedType) => handleFeedbackFiles("wadDocuments", files, selectedType)}
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={label}>Feedback Recebido (texto completo)</label>
              <textarea
                style={{ ...input, minHeight: 100, resize: "vertical" }}
                placeholder="Cole aqui o feedback dado ao grupo..."
                value={feedbackForm.feedback}
                onChange={(e) => setFeedbackForm((f) => ({ ...f, feedback: e.target.value }))}
              />
              <CompactFileUpload
                label="Anexar correção (.xlsx, .docx, PDF ou foto)"
                count={feedbackForm.feedbackDocuments?.length ?? 0}
                defaultType="feedback_file"
                onFiles={(files, selectedType) => handleFeedbackFiles("feedbackDocuments", files, selectedType)}
              />
            </div>

            <button style={btn(true)} onClick={handleAddFeedback} disabled={isAddingFeedback}>
              {isAddingFeedback ? "Salvando…" : "Salvar Feedback"}
            </button>
          </div>
        )}

        {/* Existing feedbacks */}
        {artefact.groupFeedbacks.length === 0 ? (
          <p style={{ color: "#475569", fontSize: 14 }}>Nenhum feedback registrado ainda.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {artefact.groupFeedbacks.map((fb, i) => {
              const isMyGroup = myGroupName ? fb.groupName === myGroupName : true;
              const hasWad = !!fb.wadText;
              return (
                <div key={fb.id} style={{
                  background: "#0d0d0d",
                  border: `1px solid ${isMyGroup && hasWad ? "#16a34a44" : "#1e293b"}`,
                  borderRadius: 8, padding: "14px 16px",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 600, color: "#e2e8f0", fontSize: 14 }}>
                        #{i + 1} · {fb.groupName}
                      </span>
                      {hasWad && isMyGroup && (
                        <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 20, background: "#14532d44", color: "#4ade80", border: "1px solid #16a34a44" }}>
                          📄 WAD: {fb.wadFileName || "anexado"}
                        </span>
                      )}
                      {hasWad && !isMyGroup && (
                        <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 20, background: "#1e293b", color: "#475569" }}>
                          🔒 WAD privado
                        </span>
                      )}
                    </div>
                    <span style={{
                      fontSize: 13, fontWeight: 700,
                      color: (fb.score / fb.maxScore) >= 0.7 ? "#22c55e" : (fb.score / fb.maxScore) >= 0.4 ? "#f59e0b" : "#ef4444",
                    }}>
                      {fb.score}/{fb.maxScore}
                    </span>
                  </div>
                  {fb.activityDescription && (
                    <p style={{ fontSize: 12, color: "#475569", marginBottom: 6 }}>
                      <em>{fb.activityDescription}</em>
                    </p>
                  )}
                  <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                    {fb.feedback}
                  </p>
                  {fb.uploadedDocuments.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                      {fb.uploadedDocuments.map((doc) => (
                        <span key={doc.id} style={tag(doc.documentType.includes("photo") ? "#f59e0b" : "#38bdf8")}>
                          {doc.documentType} · {doc.fileName}
                        </span>
                      ))}
                    </div>
                  )}
                  {/* Show WAD preview only for own group */}
                  {hasWad && isMyGroup && (
                    <details style={{ marginTop: 10 }}>
                      <summary style={{ fontSize: 12, color: "#64748b", cursor: "pointer" }}>
                        Ver conteúdo do WAD ({fb.wadText!.length.toLocaleString()} chars)
                      </summary>
                      <pre style={{
                        fontSize: 11, color: "#64748b", background: "#080808", borderRadius: 6,
                        padding: "10px 12px", marginTop: 8, overflow: "auto", maxHeight: 300,
                        whiteSpace: "pre-wrap", wordBreak: "break-word",
                      }}>
                        {fb.wadText}
                      </pre>
                    </details>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Generate model button */}
        {canGenerate && (
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #1e293b" }}>
            <button
              style={btn(true)}
              onClick={handleGenerateModel}
              disabled={isGenerating}
            >
              {isGenerating ? "Gerando modelo…" : model ? "↻ Regenerar Modelo de Correção" : "✦ Gerar Modelo de Correção"}
            </button>
          </div>
        )}
      </div>

      {/* ── Correction Model ── */}
      {model && (
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <p style={{ ...sectionTitle, marginBottom: 0 }}>Modelo de Correção Inferido</p>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={tag(rigorColor(model.rigorLevel))}>
                Rigor: {model.rigorLevel}
              </span>
              <span style={tag(confidenceColor(model.confidence))}>
                Confiança: {model.confidence}%
              </span>
              {model.isOutdated && (
                <span style={tag("#f59e0b")}>
                  Desatualizado
                </span>
              )}
              <span style={{ fontSize: 11, color: "#475569" }}>
                {model.groupFeedbackCount} grupos · {new Date(model.generatedAt).toLocaleDateString("pt-BR")}
              </span>
            </div>
          </div>

          {model.isOutdated && (
            <div style={{
              marginBottom: 18, padding: "10px 12px", borderRadius: 8,
              border: "1px solid #f59e0b44", background: "#451a0322",
              color: "#fbbf24", fontSize: 13, lineHeight: 1.5,
            }}>
              Este modelo ainda pode ser usado na simulação, mas há novos dados privados de grupos para incorporar.
              {model.outdatedReason ? ` ${model.outdatedReason}` : ""}
            </div>
          )}

          {/* Pseudo-prompt */}
          <div style={{ marginBottom: 20 }}>
            <p style={sectionTitle}>Prompt Inferido</p>
            <div style={{
              background: "#0d0d0d", borderRadius: 8, border: "1px solid #1e293b",
              padding: "16px 18px", fontSize: 13, color: "#94a3b8", lineHeight: 1.7,
              whiteSpace: "pre-wrap", fontFamily: "monospace",
            }}>
              {model.inferredPrompt}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {model.inferredRules.length > 0 && (
              <div>
                <p style={sectionTitle}>Regras Inferidas</p>
                <ul style={{ margin: 0, padding: "0 0 0 18px", fontSize: 13, color: "#94a3b8" }}>
                  {model.inferredRules.map((r, i) => <li key={i} style={{ marginBottom: 4 }}>{r}</li>)}
                </ul>
              </div>
            )}
            {model.inferredPatterns.length > 0 && (
              <div>
                <p style={sectionTitle}>Padrões Detectados</p>
                <ul style={{ margin: 0, padding: "0 0 0 18px", fontSize: 13, color: "#94a3b8" }}>
                  {model.inferredPatterns.map((p, i) => <li key={i} style={{ marginBottom: 4 }}>{p}</li>)}
                </ul>
              </div>
            )}
          </div>

          {model.detectedPenalties.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <p style={sectionTitle}>Penalizações Detectadas</p>
              <div>
                {model.detectedPenalties.map((p, i) => (
                  <span key={i} style={tag("#ef4444")}>{p}</span>
                ))}
              </div>
            </div>
          )}

          {model.correctionStyle && (
            <div style={{
              marginTop: 20, paddingTop: 20, borderTop: "1px solid #1e293b",
              display: "flex", gap: 24,
            }}>
              <div>
                <p style={{ ...sectionTitle, marginBottom: 4 }}>Tom</p>
                <span style={tag("#a78bfa")}>{model.correctionStyle.tone}</span>
              </div>
              <div>
                <p style={{ ...sectionTitle, marginBottom: 4 }}>Foco</p>
                <span style={tag("#38bdf8")}>{model.correctionStyle.focus}</span>
              </div>
              {model.correctionStyle.evidence?.length > 0 && (
                <div style={{ flex: 1 }}>
                  <p style={{ ...sectionTitle, marginBottom: 4 }}>Evidências Valorizadas</p>
                  <div>
                    {model.correctionStyle.evidence.map((e, i) => (
                      <span key={i} style={tag("#34d399")}>{e}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function rigorColor(level: string) {
  return level === "high" ? "#ef4444" : level === "medium" ? "#f59e0b" : "#22c55e";
}

function confidenceColor(confidence: number) {
  return confidence >= 70 ? "#22c55e" : confidence >= 40 ? "#f59e0b" : "#ef4444";
}

function CompactFileUpload(props: {
  label: string;
  count: number;
  defaultType: "group_wad" | "feedback_file";
  onFiles: (files: FileList | null, documentType: AcademicDocumentType) => void;
}) {
  const [selectedType, setSelectedType] = useState<AcademicDocumentType>(props.defaultType);

  return (
    <div style={{ marginTop: 8 }}>
      <label style={label}>{props.label}</label>
      <div style={{ display: "grid", gridTemplateColumns: "170px 1fr", gap: 8 }}>
        <select value={selectedType} onChange={(event) => setSelectedType(event.target.value as AcademicDocumentType)} style={input}>
          {props.defaultType === "group_wad" ? (
            <>
              <option value="group_wad">WAD do grupo</option>
              <option value="artefact_photo">Foto do artefato</option>
            </>
          ) : (
            <>
              <option value="feedback_file">Arquivo feedback</option>
              <option value="feedback_photo">Foto feedback</option>
            </>
          )}
        </select>
        <input
          type="file"
          multiple
          accept=".xlsx,.xls,.csv,.pdf,.docx,.txt,.md,.png,.jpg,.jpeg,.webp,application/pdf,image/*"
          onChange={(event) => props.onFiles(event.target.files, selectedType)}
          style={{ ...input, padding: "6px 12px" }}
        />
      </div>
      {props.count > 0 && <p style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{props.count} arquivo(s) anexado(s)</p>}
    </div>
  );
}

async function filesToDocuments(files: FileList, documentType: AcademicDocumentType): Promise<UploadedDocumentInput[]> {
  return Promise.all(
    Array.from(files).map(async (file) => ({
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      documentType,
      contentBase64: await fileToBase64(file),
    }))
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Arquivo invalido."));
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.readAsDataURL(file);
  });
}
