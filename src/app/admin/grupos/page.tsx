"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { GroupMemberView } from "@/features/group-member";
import type { ProjectContextView } from "@/features/shared/types";

const GROUP_NAMES = ["G01", "G02", "G03", "G04", "G05", "G06", "G07", "G08", "G09", "G10"];

type User = { id: string; name: string; email: string };

const card: React.CSSProperties = {
  background: "#111", border: "1px solid #222", borderRadius: 10, padding: "20px 24px",
};
const label: React.CSSProperties = { display: "block", fontSize: 12, color: "#666", marginBottom: 6, fontWeight: 500 };
const sel: React.CSSProperties = {
  width: "100%", background: "#0d0d0d", border: "1px solid #2a2a2a", borderRadius: 6,
  color: "#e8e8e8", fontSize: 14, padding: "8px 12px", outline: "none",
};
const btnPrimary: React.CSSProperties = {
  padding: "8px 18px", borderRadius: 7, border: "none", cursor: "pointer",
  fontSize: 14, fontWeight: 600, background: "#2563eb", color: "#fff",
};
const btnDanger: React.CSSProperties = {
  padding: "4px 10px", borderRadius: 5, border: "none", cursor: "pointer",
  fontSize: 12, fontWeight: 600, background: "#7f1d1d", color: "#fca5a5",
};

export default function AdminGruposPage() {
  const [projects, setProjects] = useState<ProjectContextView[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [members, setMembers] = useState<GroupMemberView[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [assignForm, setAssignForm] = useState({ userId: "", groupName: "G01" });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [projectsRes, usersRes] = await Promise.all([
        fetch("/api/project-contexts"),
        fetch("/api/admin/usuarios"),
      ]);
      const [projectsPayload, usersPayload] = await Promise.all([
        projectsRes.json(),
        usersRes.json(),
      ]);
      setProjects(projectsPayload.data ?? []);
      setUsers(usersPayload.data ?? []);
      if ((projectsPayload.data ?? []).length > 0 && !selectedProject) {
        setSelectedProject(projectsPayload.data[0].id);
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedProject]);

  const loadMembers = useCallback(async () => {
    if (!selectedProject) return;
    const res = await fetch(`/api/group-members?projectContextId=${selectedProject}`);
    const payload = await res.json();
    setMembers(payload.data ?? []);
  }, [selectedProject]);

  useEffect(() => { loadData(); }, []);
  useEffect(() => { loadMembers(); }, [loadMembers]);

  async function handleAssign() {
    if (!assignForm.userId || !selectedProject) {
      toast.error("Selecione um usuário e um projeto.");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch("/api/group-members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...assignForm, projectContextId: selectedProject }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error);
      toast.success("Aluno alocado com sucesso.");
      setAssignForm((f) => ({ ...f, userId: "" }));
      await loadMembers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao alocar.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRemove(userId: string) {
    try {
      const res = await fetch(`/api/group-members/${userId}?projectContextId=${selectedProject}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Falha ao remover.");
      toast.success("Membro removido.");
      await loadMembers();
    } catch {
      toast.error("Erro ao remover membro.");
    }
  }

  // Group members by groupName
  const byGroup = GROUP_NAMES.reduce<Record<string, GroupMemberView[]>>((acc, g) => {
    acc[g] = members.filter((m) => m.groupName === g);
    return acc;
  }, {});

  const assignedUserIds = new Set(members.map((m) => m.userId));
  const unassignedUsers = users.filter((u) => !assignedUserIds.has(u.id));

  if (isLoading) {
    return <p style={{ color: "#475569" }}>Carregando…</p>;
  }

  return (
    <div style={{ maxWidth: 860, display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Alocação de Grupos</h1>
        <p style={{ color: "#64748b", fontSize: 14 }}>
          Atribua cada aluno ao seu grupo dentro de um projeto.
        </p>
      </div>

      {/* Project selector */}
      <div style={card}>
        <label style={label}>Projeto</label>
        <select
          style={sel}
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
        >
          <option value="">Selecione um projeto…</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name} {p.discipline ? `· ${p.discipline}` : ""}</option>
          ))}
        </select>
      </div>

      {selectedProject && (
        <>
          {/* Assign form */}
          <div style={card}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#64748b", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 16 }}>
              Alocar Aluno
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 160px auto", gap: 12, alignItems: "flex-end" }}>
              <div>
                <label style={label}>Usuário{unassignedUsers.length === 0 ? " (todos alocados)" : ""}</label>
                <select
                  style={sel}
                  value={assignForm.userId}
                  onChange={(e) => setAssignForm((f) => ({ ...f, userId: e.target.value }))}
                >
                  <option value="">Selecione…</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name || u.email} {assignedUserIds.has(u.id) ? "(já alocado)" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={label}>Grupo</label>
                <select
                  style={sel}
                  value={assignForm.groupName}
                  onChange={(e) => setAssignForm((f) => ({ ...f, groupName: e.target.value }))}
                >
                  {GROUP_NAMES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <button style={btnPrimary} onClick={handleAssign} disabled={isSaving}>
                {isSaving ? "Salvando…" : "Alocar"}
              </button>
            </div>
          </div>

          {/* Groups grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {GROUP_NAMES.filter((g) => byGroup[g].length > 0 || g <= "G05").map((groupName) => {
              const groupMembers = byGroup[groupName] ?? [];
              return (
                <div key={groupName} style={{
                  ...card,
                  borderColor: groupMembers.length > 0 ? "#1e3a5f" : "#1e293b",
                  padding: "14px 16px",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={{ fontWeight: 700, color: groupMembers.length > 0 ? "#60a5fa" : "#475569" }}>
                      {groupName}
                    </span>
                    <span style={{ fontSize: 12, color: "#475569" }}>
                      {groupMembers.length} membro(s)
                    </span>
                  </div>
                  {groupMembers.length === 0 ? (
                    <p style={{ fontSize: 12, color: "#334155" }}>Sem membros</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {groupMembers.map((m) => (
                        <div key={m.userId} style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          background: "#0d0d0d", borderRadius: 6, padding: "6px 10px",
                        }}>
                          <div>
                            <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 500 }}>
                              {m.user.name || m.user.email}
                            </div>
                            <div style={{ fontSize: 11, color: "#475569" }}>{m.user.email}</div>
                          </div>
                          <button style={btnDanger} onClick={() => handleRemove(m.userId)}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
