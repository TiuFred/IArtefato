"use client";

/**
 * correctionStore
 *
 * Estado global da Base de Correção.
 * Gerencia a lista de entradas e a entrada selecionada para visualização.
 */

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from "react";
import type { CorrectionEntry, InferredPattern, CorrectionInput } from "@/types/correction";

// ─── Seed com exemplos para demo ──────────────────────────────────────────────

const SEED_ENTRIES: CorrectionEntry[] = [
  {
    id: "entry-seed-001",
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    input: {
      subject: "Programação Orientada a Objetos",
      activityTitle: "Sistema de Cadastro em Python",
      activityDescription:
        "Desenvolva um sistema de cadastro de clientes usando POO em Python com herança, polimorfismo e tratamento de exceções.",
      studentResponse:
        "Implementei as classes Cliente, ClientePremium e ClienteCorporativo com herança e polimorfismo no método calcular_desconto().",
      feedbackReceived:
        "Boa implementação da hierarquia de classes e uso do polimorfismo. Faltou tratamento de exceções adequado e os comentários no código são insuficientes. A implementação poderia ser mais robusta com validações nos setters.",
      score: 7.5,
      maxScore: 10,
    },
    pattern: {
      id: "pat-seed-001",
      confidence: 82,
      inferredAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      criteria: [
        {
          name: "Implementação Técnica",
          weight: 45,
          description: "Qualidade e correção do código desenvolvido",
          confidence: 88,
          evidenceSnippet: "Boa implementação da hierarquia de classes e uso do polimorfismo.",
        },
        {
          name: "Documentação",
          weight: 30,
          description: "Clareza dos comentários e explicações",
          confidence: 75,
          evidenceSnippet: "os comentários no código são insuficientes.",
        },
        {
          name: "Boas Práticas",
          weight: 25,
          description: "Validações e robustez da solução",
          confidence: 65,
          evidenceSnippet: "poderia ser mais robusta com validações nos setters.",
        },
      ],
      penalties: [
        {
          name: "Documentação insuficiente",
          estimatedDeduction: 1.0,
          description: "Comentários no código ausentes ou superficiais",
          evidenceSnippet: "os comentários no código são insuficientes.",
          severity: "medium",
        },
        {
          name: "Implementação incompleta",
          estimatedDeduction: 0.5,
          description: "Tratamento de exceções não implementado",
          evidenceSnippet: "Faltou tratamento de exceções adequado.",
          severity: "medium",
        },
      ],
      style: {
        tone: "moderate",
        focus: "technical",
        detailLevel: "detailed",
        topKeywords: ["implementação", "polimorfismo", "comentários", "validações"],
      },
      pseudoPrompt:
        "Você é um avaliador acadêmico para Programação Orientada a Objetos.\nModerado e equilibrado. Avalie: Implementação Técnica (45%), Documentação (30%), Boas Práticas (25%).\nDesconte por falta de comentários (-1.0) e implementação incompleta (-0.5).",
    },
  },
];

// ─── Types do store ───────────────────────────────────────────────────────────

interface CorrectionState {
  entries: CorrectionEntry[];
  selectedId: string | null;
}

type CorrectionAction =
  | { type: "ADD_ENTRY"; payload: CorrectionEntry }
  | { type: "SELECT_ENTRY"; payload: string | null }
  | { type: "DELETE_ENTRY"; payload: string };

// ─── Reducer ──────────────────────────────────────────────────────────────────

function correctionReducer(
  state: CorrectionState,
  action: CorrectionAction
): CorrectionState {
  switch (action.type) {
    case "ADD_ENTRY":
      return {
        ...state,
        entries: [action.payload, ...state.entries],
        selectedId: action.payload.id,
      };
    case "SELECT_ENTRY":
      return { ...state, selectedId: action.payload };
    case "DELETE_ENTRY":
      return {
        ...state,
        entries: state.entries.filter((e) => e.id !== action.payload),
        selectedId:
          state.selectedId === action.payload ? null : state.selectedId,
      };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface CorrectionContextValue {
  state: CorrectionState;
  addEntry: (input: CorrectionInput, pattern: InferredPattern) => CorrectionEntry;
  selectEntry: (id: string | null) => void;
  deleteEntry: (id: string) => void;
  selectedEntry: CorrectionEntry | null;
}

const CorrectionContext = createContext<CorrectionContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CorrectionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(correctionReducer, {
    entries: SEED_ENTRIES,
    selectedId: null,
  });

  const addEntry = useCallback(
    (input: CorrectionInput, pattern: InferredPattern): CorrectionEntry => {
      const entry: CorrectionEntry = {
        id: `entry-${Date.now()}`,
        input,
        pattern,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: "ADD_ENTRY", payload: entry });
      return entry;
    },
    []
  );

  const selectEntry = useCallback((id: string | null) => {
    dispatch({ type: "SELECT_ENTRY", payload: id });
  }, []);

  const deleteEntry = useCallback((id: string) => {
    dispatch({ type: "DELETE_ENTRY", payload: id });
  }, []);

  const selectedEntry =
    state.entries.find((e) => e.id === state.selectedId) ?? null;

  return (
    <CorrectionContext.Provider
      value={{ state, addEntry, selectEntry, deleteEntry, selectedEntry }}
    >
      {children}
    </CorrectionContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCorrectionStore() {
  const ctx = useContext(CorrectionContext);
  if (!ctx) {
    throw new Error("useCorrectionStore must be used within CorrectionProvider");
  }
  return ctx;
}
