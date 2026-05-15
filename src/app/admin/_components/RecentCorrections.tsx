"use client";

import { useState } from "react";
import { toast } from "sonner";

export type CorrectionItem = {
  id: string;
  groupName: string;
  artefactName: string;
  feedback: string;
  score: number;
  maxScore: number;
  createdAt: string;
};

export function RecentCorrections({ initial }: { initial: CorrectionItem[] }) {
  const [items, setItems] = useState(initial);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      const res = await fetch(`/api/group-feedbacks/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? "Erro ao apagar");
      }
      setItems((prev) => prev.filter((c) => c.id !== id));
      toast.success("Correção apagada.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao apagar.");
    } finally {
      setDeleting(null);
    }
  }

  if (items.length === 0) {
    return (
      <div style={{ padding: "20px", background: "#141414", border: "1px solid #1e1e2e", borderRadius: 8, color: "#475569", fontSize: 14 }}>
        Nenhuma correção registrada ainda.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {items.map((c) => (
        <div key={c.id} style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "12px 16px", background: "#141414", border: "1px solid #1e1e2e", borderRadius: 8,
          gap: 12,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{
              fontSize: 11, fontWeight: 600, marginRight: 8,
              padding: "2px 7px", borderRadius: 4, background: "#1e1e2e", color: "#64748b",
            }}>{c.artefactName}</span>
            <span style={{ fontSize: 13, color: "#4f8ef7", marginRight: 8 }}>{c.groupName}</span>
            <span style={{ fontSize: 13, color: "#94a3b8" }}>
              {c.feedback.slice(0, 60)}{c.feedback.length > 60 ? "..." : ""}
            </span>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexShrink: 0 }}>
            <span style={{ fontWeight: 700, color: c.score / c.maxScore >= 0.7 ? "#4ade80" : "#f87171" }}>
              {c.score}/{c.maxScore}
            </span>
            <span style={{ fontSize: 12, color: "#334155" }}>
              {new Date(c.createdAt).toLocaleDateString("pt-BR")}
            </span>
            <button
              onClick={() => void handleDelete(c.id)}
              disabled={deleting === c.id}
              title="Apagar correção"
              style={{
                padding: "4px 10px", borderRadius: 5, border: "1px solid #7f1d1d",
                background: "#1a0808", color: "#f87171", fontSize: 12,
                fontWeight: 600, cursor: "pointer",
                opacity: deleting === c.id ? 0.5 : 1,
              }}
            >
              {deleting === c.id ? "..." : "Apagar"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
