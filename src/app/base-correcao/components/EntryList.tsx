"use client";

import { useState } from "react";
import type { CorrectionCaseView } from "@/features/shared/types";
import { SUBJECTS, SUBJECT_COLORS, SUBJECT_ICONS } from "@/features/shared/subjects";

interface EntryListProps {
  cases: CorrectionCaseView[];
  selectedId: string | null;
  isLoading: boolean;
  mode: "list" | "form";
  onAddNew: () => void;
  onSelect: (id: string | null) => void;
}

export function EntryList({ cases, selectedId, isLoading, mode, onAddNew, onSelect }: EntryListProps) {
  const [filterSubject, setFilterSubject] = useState<string | null>(null);

  const filtered = filterSubject
    ? cases.filter((c) => (c.subjects?.length ? c.subjects : [c.subject]).includes(filterSubject))
    : cases;

  const countBySubject = SUBJECTS.reduce<Record<string, number>>((acc, s) => {
    acc[s] = cases.filter((c) => (c.subjects?.length ? c.subjects : [c.subject]).includes(s)).length;
    return acc;
  }, {});

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ fontSize: 13, color: "#888" }}>
          {isLoading ? "Carregando..." : `${filtered.length} entrada${filtered.length !== 1 ? "s" : ""}`}
        </p>
        <button
          onClick={onAddNew}
          style={{
            padding: "5px 12px",
            background: mode === "form" ? "#1a1a1a" : "#4f8ef7",
            color: mode === "form" ? "#888" : "#fff",
            border: mode === "form" ? "1px solid #333" : "none",
            borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: "pointer",
          }}
        >
          {mode === "form" ? "Cancelar" : "+ Adicionar"}
        </button>
      </div>

      {/* Filtro por matéria */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
        <button
          onClick={() => setFilterSubject(null)}
          style={{
            padding: "3px 8px", borderRadius: 5, fontSize: 11, cursor: "pointer",
            background: !filterSubject ? "#4f8ef720" : "transparent",
            border: `1px solid ${!filterSubject ? "#4f8ef7" : "#333"}`,
            color: !filterSubject ? "#4f8ef7" : "#555",
            fontWeight: !filterSubject ? 600 : 400,
          }}
        >
          Todas
        </button>
        {SUBJECTS.filter((s) => countBySubject[s] > 0).map((subject) => {
          const colors = SUBJECT_COLORS[subject];
          const isActive = filterSubject === subject;
          return (
            <button
              key={subject}
              onClick={() => setFilterSubject(isActive ? null : subject)}
              style={{
                padding: "3px 8px", borderRadius: 5, fontSize: 11, cursor: "pointer",
                background: isActive ? colors.bg : "transparent",
                border: `1px solid ${isActive ? colors.border : "#333"}`,
                color: isActive ? colors.text : "#555",
                fontWeight: isActive ? 600 : 400,
                display: "flex", alignItems: "center", gap: 4,
              }}
            >
              <span>{SUBJECT_ICONS[subject]}</span>
              <span>{subject}</span>
              <span style={{
                background: isActive ? colors.border + "40" : "#1e1e1e",
                color: isActive ? colors.text : "#444",
                padding: "0 4px", borderRadius: 3, fontSize: 10,
              }}>
                {countBySubject[subject]}
              </span>
            </button>
          );
        })}
      </div>

      {!isLoading && filtered.length === 0 ? (
        <p style={{ color: "#555", fontSize: 13, textAlign: "center", padding: "24px 0" }}>
          {filterSubject ? `Nenhuma correção de ${filterSubject}.` : "Nenhuma correção salva ainda."}
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {filtered.map((entry) => (
            <EntryRow
              key={entry.id}
              entry={entry}
              isSelected={selectedId === entry.id}
              onClick={() => onSelect(selectedId === entry.id ? null : entry.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EntryRow({ entry, isSelected, onClick }: {
  entry: CorrectionCaseView;
  isSelected: boolean;
  onClick: () => void;
}) {
  const scorePercent = entry.score / entry.maxScore;
  const scoreColor = scorePercent >= 0.8 ? "#4ade80" : scorePercent >= 0.6 ? "#fbbf24" : "#f87171";
  const subjects = entry.subjects?.length ? entry.subjects : [entry.subject];

  return (
    <button
      onClick={onClick}
      style={{
        width: "100%", textAlign: "left", padding: "10px 12px",
        background: isSelected ? "#0f1a2d" : "#141414",
        border: `1px solid ${isSelected ? "#1e3a5a" : "#222"}`,
        borderRadius: 8, cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 5 }}>
        {subjects.map((subject) => {
          const subjectColors = SUBJECT_COLORS[subject as keyof typeof SUBJECT_COLORS];
          const subjectIcon = SUBJECT_ICONS[subject as keyof typeof SUBJECT_ICONS];
          if (!subjectColors) return null;

          return (
            <span key={subject} style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "2px 7px", borderRadius: 4,
              background: subjectColors.bg, border: `1px solid ${subjectColors.border}`,
              fontSize: 11, color: subjectColors.text, fontWeight: 600,
            }}>
              <span>{subjectIcon}</span>
              <span>{subject}</span>
            </span>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 500, fontSize: 13, color: isSelected ? "#e8e8e8" : "#ccc",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2,
          }}>
            {entry.activityDescription}
          </div>
          <div style={{ fontSize: 11, color: "#555" }}>
            {entry.inference.criteria.length} critérios · {entry.inference.penalties.length} penalizações
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: scoreColor }}>
            {entry.score}
            <span style={{ color: "#555", fontWeight: 400, fontSize: 12 }}>/{entry.maxScore}</span>
          </div>
          <div style={{ fontSize: 11, color: "#555", marginTop: 1 }}>
            {entry.inference.confidence}% conf.
          </div>
        </div>
      </div>
    </button>
  );
}
