"use client";

import { useEffect, useState } from "react";
import { SUBJECTS, SUBJECT_COLORS, SUBJECT_ICONS } from "@/features/shared/subjects";
import { toast } from "sonner";

interface Activity {
  id: string;
  subject: string;
  title: string;
  description: string;
  maxScore: number;
  isActive: boolean;
  createdAt: string;
}

const EMPTY_FORM = { subject: "", title: "", description: "", maxScore: 10 };

export default function AtividadesAdminPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Activity>>({});

  async function load() {
    const res = await fetch("/api/admin/activities");
    const data = await res.json();
    setActivities(data.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    let active = true;
    fetch("/api/admin/activities")
      .then((res) => res.json())
      .then((data) => {
        if (active) setActivities(data.data ?? []);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.subject || !form.title || !form.description) {
      toast.error("Preencha todos os campos.");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/admin/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success("Atividade criada.");
      setForm(EMPTY_FORM);
      load();
    } else {
      toast.error("Erro ao criar atividade.");
    }
    setSaving(false);
  }

  async function toggleActive(id: string, current: boolean) {
    await fetch(`/api/admin/activities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    load();
  }

  async function saveEdit(id: string) {
    const res = await fetch(`/api/admin/activities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (res.ok) { toast.success("Salvo."); setEditingId(null); load(); }
    else toast.error("Erro ao salvar.");
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta atividade?")) return;
    await fetch(`/api/admin/activities/${id}`, { method: "DELETE" });
    toast.success("Excluído.");
    load();
  }

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: "#e2e8f0", marginBottom: 6 }}>Atividades predefinidas</h1>
      <p style={{ fontSize: 14, color: "#475569", marginBottom: 28 }}>
        Os enunciados que você cadastrar aqui ficam disponíveis para os alunos selecionarem na Base de Correção.
      </p>

      {/* Formulário de criação */}
      <div style={{ background: "#141414", border: "1px solid #1e1e2e", borderRadius: 12, padding: "20px 24px", marginBottom: 28 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0", marginBottom: 16 }}>Nova atividade</h2>
        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Matéria */}
          <div>
            <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 8 }}>Matéria</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {SUBJECTS.map((s) => {
                const c = SUBJECT_COLORS[s];
                const sel = form.subject === s;
                return (
                  <button key={s} type="button" onClick={() => setForm((p) => ({ ...p, subject: s }))}
                    style={{
                      padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontSize: 13,
                      background: sel ? c.bg : "transparent", border: `1px solid ${sel ? c.border : "#333"}`,
                      color: sel ? c.text : "#555", display: "flex", alignItems: "center", gap: 5,
                    }}>
                    <span>{SUBJECT_ICONS[s]}</span><span>{s}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <FormRow>
            <FormInput label="Título da atividade" placeholder="Ex: Plano de negócios — Módulo 3"
              value={form.title} onChange={(v) => setForm((p) => ({ ...p, title: v }))} />
            <FormInput label="Nota máxima" type="number" placeholder="10"
              value={String(form.maxScore)} onChange={(v) => setForm((p) => ({ ...p, maxScore: Number(v) }))}
              style={{ maxWidth: 100 }} />
          </FormRow>

          <div>
            <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6 }}>Descrição / Enunciado</label>
            <textarea
              rows={4} placeholder="Cole aqui o enunciado completo da atividade..."
              value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              style={{ width: "100%", background: "#0d0d0d", border: "1px solid #262626", borderRadius: 8, padding: "10px 12px", color: "#e8e8e8", fontSize: 14, fontFamily: "inherit", resize: "vertical" }}
            />
          </div>

          <button type="submit" disabled={saving}
            style={{ alignSelf: "flex-start", padding: "8px 20px", background: saving ? "#1e1e2e" : "#4f8ef7", color: saving ? "#475569" : "#fff", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: saving ? "wait" : "pointer" }}>
            {saving ? "Salvando..." : "+ Criar atividade"}
          </button>
        </form>
      </div>

      {/* Lista de atividades */}
      <h2 style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0", marginBottom: 12 }}>
        {loading ? "Carregando..." : `${activities.length} atividade${activities.length !== 1 ? "s" : ""} cadastrada${activities.length !== 1 ? "s" : ""}`}
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {activities.map((act) => {
          const colors = SUBJECT_COLORS[act.subject as keyof typeof SUBJECT_COLORS];
          const isEditing = editingId === act.id;

          return (
            <div key={act.id} style={{
              background: "#141414", border: `1px solid ${act.isActive ? "#1e1e2e" : "#0d0d0d"}`,
              borderRadius: 10, padding: "14px 16px", opacity: act.isActive ? 1 : 0.5,
            }}>
              {isEditing ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <FormInput label="Título" value={editForm.title ?? act.title}
                    onChange={(v) => setEditForm((p) => ({ ...p, title: v }))} />
                  <div>
                    <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6 }}>Descrição</label>
                    <textarea rows={3} value={editForm.description ?? act.description}
                      onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                      style={{ width: "100%", background: "#0d0d0d", border: "1px solid #262626", borderRadius: 6, padding: "8px 10px", color: "#e8e8e8", fontSize: 13, fontFamily: "inherit", resize: "vertical" }} />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => saveEdit(act.id)} style={{ padding: "6px 16px", background: "#4f8ef7", color: "#fff", border: "none", borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Salvar</button>
                    <button onClick={() => setEditingId(null)} style={{ padding: "6px 14px", background: "transparent", color: "#64748b", border: "1px solid #333", borderRadius: 6, fontSize: 13, cursor: "pointer" }}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      {colors && (
                        <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 4, background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text, fontWeight: 600 }}>
                          {SUBJECT_ICONS[act.subject as keyof typeof SUBJECT_ICONS]} {act.subject}
                        </span>
                      )}
                      <span style={{ fontWeight: 600, fontSize: 14, color: "#e2e8f0" }}>{act.title}</span>
                      <span style={{ fontSize: 12, color: "#475569" }}>· {act.maxScore}pts</span>
                    </div>
                    <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, margin: 0 }}>
                      {act.description.slice(0, 140)}{act.description.length > 140 ? "..." : ""}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => { setEditingId(act.id); setEditForm({ title: act.title, description: act.description, maxScore: act.maxScore }); }}
                      style={{ padding: "5px 10px", background: "transparent", border: "1px solid #333", borderRadius: 6, color: "#64748b", fontSize: 12, cursor: "pointer" }}>Editar</button>
                    <button onClick={() => toggleActive(act.id, act.isActive)}
                      style={{ padding: "5px 10px", background: "transparent", border: `1px solid ${act.isActive ? "#334155" : "#059669"}`, borderRadius: 6, color: act.isActive ? "#64748b" : "#34d399", fontSize: 12, cursor: "pointer" }}>
                      {act.isActive ? "Desativar" : "Ativar"}
                    </button>
                    <button onClick={() => handleDelete(act.id)}
                      style={{ padding: "5px 10px", background: "transparent", border: "1px solid #991b1b", borderRadius: 6, color: "#f87171", fontSize: 12, cursor: "pointer" }}>Excluir</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FormRow({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "flex", gap: 12 }}>{children}</div>;
}

function FormInput({ label, value, onChange, placeholder, type = "text", style: extraStyle }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; style?: React.CSSProperties;
}) {
  return (
    <div style={{ flex: 1, ...extraStyle }}>
      <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6 }}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", background: "#0d0d0d", border: "1px solid #262626", borderRadius: 8, padding: "8px 12px", color: "#e8e8e8", fontSize: 14, outline: "none" }} />
    </div>
  );
}
