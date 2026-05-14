"use client";

import { useState } from "react";
import { useCorrectionCases } from "@/features/correction-inference";
import type { CreateCorrectionCaseInput } from "@/features/correction-inference/services/validation";
import { CorrectionForm } from "./components/CorrectionForm";
import { EntryList } from "./components/EntryList";
import { InferenceResult } from "./components/InferenceResult";

export default function BaseCorrecaoPage() {
  const {
    cases,
    selectedCase,
    selectedId,
    isLoading,
    isCreating,
    createCase,
    deleteCase,
    selectCase,
  } = useCorrectionCases();
  const [mode, setMode] = useState<"list" | "form">("list");

  async function handleCreate(input: CreateCorrectionCaseInput) {
    await createCase(input);
    setMode("list");
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
          Base de Correção
        </h1>
        <p style={{ color: "#888", fontSize: 14, maxWidth: 640 }}>
          Cadastre correções reais recebidas. O Gemini infere padrões prováveis
          do prompt oculto do avaliador e salva tudo no PostgreSQL.
        </p>
      </div>

      <div style={bannerStyle}>
        <span>◈</span>
        <span>
          O sistema não tenta descobrir o prompt real do professor. Ele constrói uma aproximação operacional
          dos critérios, penalizações, rigor e foco usados na correção observada.
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24, alignItems: "start" }}>
        <div style={{ position: "sticky", top: 72 }}>
          <EntryList
            cases={cases}
            selectedId={selectedId}
            isLoading={isLoading}
            mode={mode}
            onAddNew={() => {
              selectCase(null);
              setMode((current) => (current === "form" ? "list" : "form"));
            }}
            onSelect={(id) => {
              selectCase(id);
              setMode("list");
            }}
          />
        </div>

        <div>
          {mode === "form" && (
            <div style={panelStyle}>
              <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 20 }}>
                Nova correção real
              </p>
              <CorrectionForm isSubmitting={isCreating} onSubmit={handleCreate} />
            </div>
          )}

          {mode === "list" && selectedCase && (
            <InferenceResult
              entry={selectedCase}
              onBack={() => selectCase(null)}
              onDelete={async () => {
                await deleteCase(selectedCase.id);
              }}
            />
          )}

          {mode === "list" && !selectedCase && (
            <div style={{ ...panelStyle, padding: "48px 24px", textAlign: "center", color: "#555" }}>
              <p style={{ fontSize: 32, marginBottom: 12 }}>◈</p>
              <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 8, color: "#888" }}>
                {isLoading ? "Carregando base..." : "Selecione uma correção"}
              </p>
              <p style={{ fontSize: 13, color: "#555", marginBottom: 24 }}>
                Ou adicione uma correção real para inferir padrões com Gemini.
              </p>
              <button
                onClick={() => setMode("form")}
                style={{
                  padding: "8px 18px",
                  background: "#4f8ef7",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  fontWeight: 500,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                + Adicionar correção
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const bannerStyle: React.CSSProperties = {
  padding: "10px 14px",
  background: "#0f1a10",
  border: "1px solid #1a3a1a",
  borderRadius: 6,
  marginBottom: 28,
  fontSize: 13,
  color: "#6ee7b7",
  display: "flex",
  alignItems: "flex-start",
  gap: 8,
};

const panelStyle: React.CSSProperties = {
  padding: "20px 24px",
  background: "#141414",
  border: "1px solid #222",
  borderRadius: 10,
};

