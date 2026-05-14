"use client";

import { useEffect, useState } from "react";
import { SUBJECTS, SUBJECT_COLORS, SUBJECT_ICONS } from "@/features/shared/subjects";
import { toast } from "sonner";

interface PseudoPrompt {
  id: string;
  content: string;
  createdAt: string;
  correctionCase?: {
    id: string;
    subject: string;
    activityDescription: string;
    score: number;
    maxScore: number;
    createdAt: string;
  } | null;
  simulation?: {
    id: string;
    subject: string;
    activityDescription: string;
    createdAt: string;
  } | null;
}

function getSubject(p: PseudoPrompt): string {
  return p.correctionCase?.subject ?? p.simulation?.subject ?? "Geral";
}

function getActivity(p: PseudoPrompt): string {
  return p.correctionCase?.activityDescription ?? p.simulation?.activityDescription ?? "";
}

function getScore(p: PseudoPrompt): string | null {
  if (!p.correctionCase) return null;
  return `${p.correctionCase.score}/${p.correctionCase.maxScore}`;
}

export default function PromptsAdminPage() {
  const [prompts, setPrompts] = useState<PseudoPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubject, setActiveSubject] = useState<string>("Todos");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/prompts");
    const data = await res.json();
    setPrompts(data.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    let active = true;
    fetch("/api/admin/prompts")
      .then((res) => res.json())
      .then((data) => {
        if (active) setPrompts(data.data ?? []);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function saveEdit(id: string) {
    setSaving(true);
    const res = await fetch(`/api/admin/prompts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editContent }),
    });
    if (res.ok) { toast.success("Prompt atualizado."); setEditingId(null); load(); }
    else toast.error("Erro ao salvar.");
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este pseudo-prompt? A memória semântica associada não será removida.")) return;
    await fetch(`/api/admin/prompts/${id}`, { method: "DELETE" });
    toast.success("Prompt removido.");
    load();
  }

  const allSubjects = ["Todos", ...SUBJECTS];
  const filtered = activeSubject === "Todos"
    ? prompts
    : prompts.filter((p) => getSubject(p) === activeSubject);

  // Group by subject for stats
  const countBySubject = (s: string) => prompts.filter((p) => getSubject(p) === s).length;

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: "#e2e8f0", marginBottom: 6 }}>Prompts de correção</h1>
      <p style={{ fontSize: 14, color: "#475569", marginBottom: 24 }}>
        Pseudo-prompts inferidos automaticamente a cada correção cadastrada. Você pode editar o conteúdo para ajustar como a IA avalia cada matéria.
      </p>

      {/* Subject filter tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 24 }}>
        {allSubjects.map((s) => {
          const sel = activeSubject === s;
          const c = s !== "Todos" ? SUBJECT_COLORS[s as keyof typeof SUBJECT_COLORS] : null;
          const count = s === "Todos" ? prompts.length : countBySubject(s);
          return (
            <button key={s} onClick={() => setActiveSubject(s)}
              style={{
                padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12,
                background: sel ? (c?.bg ?? "#1e1e2e") : "transparent",
                border: `1px solid ${sel ? (c?.border ?? "#475569") : "#2a2a3a"}`,
                color: sel ? (c?.text ?? "#e2e8f0") : "#64748b",
                display: "flex", alignItems: "center", gap: 5,
              }}>
              {s !== "Todos" && <span>{SUBJECT_ICONS[s as keyof typeof SUBJECT_ICONS]}</span>}
              <span>{s}</span>
              <span style={{ fontSize: 11, color: sel ? (c?.text ?? "#94a3b8") : "#334155" }}>({count})</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ padding: 24, color: "#475569", fontSize: 14 }}>Carregando prompts...</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: "28px 24px", background: "#141414", border: "1px solid #1e1e2e", borderRadius: 10, color: "#334155", fontSize: 14, textAlign: "center" }}>
          {activeSubject === "Todos"
            ? "Nenhum prompt encontrado. Comece cadastrando correções na Base de Correção."
            : `Nenhum prompt para ${activeSubject} ainda.`}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((p) => {
            const subject = getSubject(p);
            const colors = SUBJECT_COLORS[subject as keyof typeof SUBJECT_COLORS];
            const activity = getActivity(p);
            const score = getScore(p);
            const isEditing = editingId === p.id;
            const isExpanded = expandedId === p.id;
            const isCorrection = !!p.correctionCase;

            return (
              <div key={p.id} style={{
                background: "#141414", border: "1px solid #1e1e2e",
                borderRadius: 10, overflow: "hidden",
              }}>
                {/* Header */}
                <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                      {colors && (
                        <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 4, background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text, fontWeight: 600, flexShrink: 0 }}>
                          {SUBJECT_ICONS[subject as keyof typeof SUBJECT_ICONS]} {subject}
                        </span>
                      )}
                      <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 4, background: isCorrection ? "#0d2540" : "#1a1a0d", border: `1px solid ${isCorrection ? "#1e4080" : "#333"}`, color: isCorrection ? "#60a5fa" : "#d4a520", fontWeight: 500, flexShrink: 0 }}>
                        {isCorrection ? "Correção" : "Simulação"}
                      </span>
                      {score && (
                        <span style={{ fontSize: 12, color: "#64748b" }}>nota {score}</span>
                      )}
                      <span style={{ fontSize: 12, color: "#334155" }}>
                        {new Date(p.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: "#64748b", margin: 0, lineHeight: 1.5 }}>
                      {activity.slice(0, 100)}{activity.length > 100 ? "..." : ""}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => setExpandedId(isExpanded ? null : p.id)}
                      style={{ padding: "5px 10px", background: "transparent", border: "1px solid #333", borderRadius: 6, color: "#64748b", fontSize: 12, cursor: "pointer" }}>
                      {isExpanded ? "Ocultar" : "Ver prompt"}
                    </button>
                    {!isEditing && (
                      <button onClick={() => { setEditingId(p.id); setEditContent(p.content); setExpandedId(p.id); }}
                        style={{ padding: "5px 10px", background: "transparent", border: "1px solid #333", borderRadius: 6, color: "#64748b", fontSize: 12, cursor: "pointer" }}>
                        Editar
                      </button>
                    )}
                    <button onClick={() => handleDelete(p.id)}
                      style={{ padding: "5px 10px", background: "transparent", border: "1px solid #991b1b", borderRadius: 6, color: "#f87171", fontSize: 12, cursor: "pointer" }}>
                      Excluir
                    </button>
                  </div>
                </div>

                {/* Expandable content */}
                {isExpanded && (
                  <div style={{ borderTop: "1px solid #1e1e2e", padding: "14px 16px" }}>
                    {isEditing ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                          Edite o pseudo-prompt abaixo. Ele será usado como memória de correção nas próximas simulações.
                        </div>
                        <textarea
                          rows={12} value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          style={{ width: "100%", background: "#0d0d0d", border: "1px solid #262626", borderRadius: 8, padding: "10px 12px", color: "#e8e8e8", fontSize: 13, fontFamily: "monospace", lineHeight: 1.6, resize: "vertical", boxSizing: "border-box" }}
                        />
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => saveEdit(p.id)} disabled={saving}
                            style={{ padding: "6px 18px", background: saving ? "#1e1e2e" : "#4f8ef7", color: saving ? "#475569" : "#fff", border: "none", borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: saving ? "wait" : "pointer" }}>
                            {saving ? "Salvando..." : "Salvar alterações"}
                          </button>
                          <button onClick={() => setEditingId(null)}
                            style={{ padding: "6px 14px", background: "transparent", color: "#64748b", border: "1px solid #333", borderRadius: 6, fontSize: 13, cursor: "pointer" }}>
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <pre style={{ margin: 0, fontSize: 12, color: "#94a3b8", fontFamily: "monospace", lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word", background: "#0d0d0d", padding: "12px 14px", borderRadius: 8, border: "1px solid #1a1a2a" }}>
                        {p.content}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
