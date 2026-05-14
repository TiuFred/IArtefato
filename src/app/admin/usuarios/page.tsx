"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  createdAt: string;
  groupName: string | null;
}

const GROUP_OPTIONS = ["G01", "G02", "G03", "G04", "G05"] as const;
const EMPTY_FORM = { email: "", name: "", password: "", isAdmin: false };

export default function UsuariosAdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; isAdmin: boolean; password: string; groupName: string }>({
    name: "", isAdmin: false, password: "", groupName: "",
  });

  async function load() {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    let active = true;
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => {
        if (active) setUsers(data.data ?? []);
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
    if (!form.email || !form.password) {
      toast.error("Email e senha sao obrigatorios.");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success("Usuario criado com sucesso.");
      setForm(EMPTY_FORM);
      load();
    } else {
      toast.error(data.error ?? "Erro ao criar usuario.");
    }
    setSaving(false);
  }

  async function saveEdit(id: string) {
    const payload: Record<string, unknown> = {
      name: editForm.name,
      isAdmin: editForm.isAdmin,
      groupName: editForm.groupName || null,
    };
    if (editForm.password.trim()) payload.password = editForm.password.trim();

    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      toast.success("Usuario atualizado.");
      setEditingId(null);
      load();
    } else {
      toast.error("Erro ao salvar.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este usuario? Esta acao nao pode ser desfeita.")) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      toast.success("Usuario excluido.");
      load();
    } else {
      toast.error(data.error ?? "Erro ao excluir.");
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: "#e2e8f0", marginBottom: 6 }}>Gerenciar usuarios</h1>
      <p style={{ fontSize: 14, color: "#475569", marginBottom: 28 }}>
        Crie contas, defina quem e administrador, redefina senhas e aloque alunos entre G01 e G05.
      </p>

      <div style={{ background: "#141414", border: "1px solid #1e1e2e", borderRadius: 12, padding: "20px 24px", marginBottom: 28 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0", marginBottom: 16 }}>Novo usuario</h2>
        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <FieldInput label="Email" type="email" placeholder="usuario@escola.com"
              value={form.email} onChange={(v) => setForm((p) => ({ ...p, email: v }))} />
            <FieldInput label="Nome" placeholder="Nome completo"
              value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} />
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            <FieldInput label="Senha" type="password" placeholder="Minimo 6 caracteres"
              value={form.password} onChange={(v) => setForm((p) => ({ ...p, password: v }))} />
            <div style={{ paddingBottom: 2 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#94a3b8", userSelect: "none" }}>
                <input type="checkbox" checked={form.isAdmin} onChange={(e) => setForm((p) => ({ ...p, isAdmin: e.target.checked }))}
                  style={{ width: 15, height: 15, accentColor: "#7c3aed" }} />
                Administrador
              </label>
            </div>
          </div>
          <button type="submit" disabled={saving}
            style={{ alignSelf: "flex-start", padding: "8px 20px", background: saving ? "#1e1e2e" : "#4f8ef7", color: saving ? "#475569" : "#fff", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: saving ? "wait" : "pointer" }}>
            {saving ? "Criando..." : "+ Criar usuario"}
          </button>
        </form>
      </div>

      <h2 style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0", marginBottom: 12 }}>
        {loading ? "Carregando..." : `${users.length} usuario${users.length !== 1 ? "s" : ""}`}
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {users.map((u) => {
          const isEditing = editingId === u.id;

          return (
            <div key={u.id} style={{ background: "#141414", border: "1px solid #1e1e2e", borderRadius: 10, padding: "14px 16px" }}>
              {isEditing ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", gap: 12 }}>
                    <FieldInput label="Nome" value={editForm.name} onChange={(v) => setEditForm((p) => ({ ...p, name: v }))} />
                    <FieldInput label="Nova senha (opcional)" type="password" placeholder="Deixe em branco para manter"
                      value={editForm.password} onChange={(v) => setEditForm((p) => ({ ...p, password: v }))} />
                  </div>
                  <div style={{ maxWidth: 220 }}>
                    <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6 }}>Grupo</label>
                    <select
                      value={editForm.groupName}
                      onChange={(e) => setEditForm((p) => ({ ...p, groupName: e.target.value }))}
                      style={{ width: "100%", background: "#0d0d0d", border: "1px solid #262626", borderRadius: 8, padding: "8px 12px", color: "#e8e8e8", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                    >
                      <option value="">Sem grupo</option>
                      {GROUP_OPTIONS.map((groupName) => (
                        <option key={groupName} value={groupName}>{groupName}</option>
                      ))}
                    </select>
                  </div>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#94a3b8", userSelect: "none" }}>
                    <input type="checkbox" checked={editForm.isAdmin} onChange={(e) => setEditForm((p) => ({ ...p, isAdmin: e.target.checked }))}
                      style={{ width: 15, height: 15, accentColor: "#7c3aed" }} />
                    Administrador
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => saveEdit(u.id)}
                      style={{ padding: "6px 16px", background: "#4f8ef7", color: "#fff", border: "none", borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                      Salvar
                    </button>
                    <button onClick={() => setEditingId(null)}
                      style={{ padding: "6px 14px", background: "transparent", color: "#64748b", border: "1px solid #333", borderRadius: 6, fontSize: 13, cursor: "pointer" }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: "#e2e8f0" }}>
                        {u.name || <span style={{ color: "#334155" }}>Sem nome</span>}
                      </span>
                      <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: u.groupName ? "#0f766e20" : "#33415520", border: `1px solid ${u.groupName ? "#0f766e40" : "#33415540"}`, color: u.groupName ? "#5eead4" : "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {u.groupName ?? "Sem grupo"}
                      </span>
                      {u.isAdmin && (
                        <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: "#7c3aed20", border: "1px solid #7c3aed40", color: "#a78bfa", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          Admin
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: "#64748b" }}>{u.email}</div>
                    <div style={{ fontSize: 11, color: "#334155", marginTop: 2 }}>
                      Criado em {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => { setEditingId(u.id); setEditForm({ name: u.name, isAdmin: u.isAdmin, password: "", groupName: u.groupName ?? "" }); }}
                      style={{ padding: "5px 10px", background: "transparent", border: "1px solid #333", borderRadius: 6, color: "#64748b", fontSize: 12, cursor: "pointer" }}>
                      Editar
                    </button>
                    <button onClick={() => handleDelete(u.id)}
                      style={{ padding: "5px 10px", background: "transparent", border: "1px solid #991b1b", borderRadius: 6, color: "#f87171", fontSize: 12, cursor: "pointer" }}>
                      Excluir
                    </button>
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

function FieldInput({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <div style={{ flex: 1 }}>
      <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6 }}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", background: "#0d0d0d", border: "1px solid #262626", borderRadius: 8, padding: "8px 12px", color: "#e8e8e8", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
    </div>
  );
}
