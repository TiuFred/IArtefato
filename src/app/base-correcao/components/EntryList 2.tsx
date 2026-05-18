"use client";

import { useCorrectionStore } from "@/store/correctionStore";
import type { CorrectionEntry } from "@/types/correction";

interface EntryListProps {
  onAddNew: () => void;
  mode: "list" | "form" | "result";
}

export function EntryList({ onAddNew, mode }: EntryListProps) {
  const { state, selectEntry } = useCorrectionStore();
  const { entries, selectedId } = state;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <p style={{ fontSize: 13, color: "#888" }}>
          {entries.length} {entries.length === 1 ? "entrada" : "entradas"}
        </p>
        <button
          onClick={onAddNew}
          style={{
            padding: "5px 12px",
            background: mode === "form" ? "#1a1a1a" : "#4f8ef7",
            color: mode === "form" ? "#888" : "#fff",
            border: mode === "form" ? "1px solid #333" : "none",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          {mode === "form" ? "Cancelar" : "+ Adicionar"}
        </button>
      </div>

      {entries.length === 0 ? (
        <p style={{ color: "#555", fontSize: 13, textAlign: "center", padding: "24px 0" }}>
          Nenhuma entrada ainda. Adicione sua primeira correção.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {entries.map((entry) => (
            <EntryRow
              key={entry.id}
              entry={entry}
              isSelected={selectedId === entry.id}
              onClick={() => selectEntry(selectedId === entry.id ? null : entry.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EntryRow({
  entry,
  isSelected,
  onClick,
}: {
  entry: CorrectionEntry;
  isSelected: boolean;
  onClick: () => void;
}) {
  const scorePercent = entry.input.score / entry.input.maxScore;
  const scoreColor =
    scorePercent >= 0.8 ? "#4ade80" : scorePercent >= 0.6 ? "#fbbf24" : "#f87171";

  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "11px 13px",
        background: isSelected ? "#0f1a2d" : "#141414",
        border: `1px solid ${isSelected ? "#1e3a5a" : "#222"}`,
        borderRadius: 8,
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 500,
              fontSize: 13,
              color: isSelected ? "#e8e8e8" : "#ccc",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              marginBottom: 3,
            }}
          >
            {entry.input.activityTitle}
          </div>
          <div style={{ fontSize: 12, color: "#555" }}>
            {entry.input.subject}
            <span style={{ marginLeft: 8, color: "#444" }}>
              {entry.pattern.criteria.length} critérios · {entry.pattern.penalties.length} penaliz.
            </span>
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: scoreColor }}>
            {entry.input.score}
            <span style={{ color: "#555", fontWeight: 400, fontSize: 12 }}>
              /{entry.input.maxScore}
            </span>
          </div>
          <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>
            {entry.pattern.confidence}% conf.
          </div>
        </div>
      </div>
    </button>
  );
}
