"use client";

import { useCallback, useEffect, useState } from "react";
import type { CorrectionCaseView } from "@/features/shared/types";
import type { CreateCorrectionCaseInput } from "../services/validation";

export function useCorrectionCases() {
  const [cases, setCases] = useState<CorrectionCaseView[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/correction-cases", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setCases(payload.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar correcoes.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    fetch("/api/correction-cases", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => {
        if (isActive) setCases(payload.data ?? []);
      })
      .catch((err) => {
        if (isActive) {
          setError(err instanceof Error ? err.message : "Erro ao carregar correcoes.");
        }
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const createCase = useCallback(async (input: CreateCorrectionCaseInput) => {
    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch("/api/correction-cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);

      setCases((current) => [payload.data, ...current]);
      setSelectedId(payload.data.id);
      return payload.data as CorrectionCaseView;
    } finally {
      setIsCreating(false);
    }
  }, []);

  const deleteCase = useCallback(async (id: string) => {
    const response = await fetch(`/api/correction-cases/${id}`, { method: "DELETE" });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error);

    setCases((current) => current.filter((item) => item.id !== id));
    setSelectedId((current) => (current === id ? null : current));
  }, []);

  const selectedCase = cases.find((item) => item.id === selectedId) ?? null;

  return {
    cases,
    selectedCase,
    selectedId,
    isLoading,
    isCreating,
    error,
    refresh,
    createCase,
    deleteCase,
    selectCase: setSelectedId,
  };
}
