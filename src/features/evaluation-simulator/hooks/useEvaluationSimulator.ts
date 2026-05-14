"use client";

import { useCallback, useState } from "react";
import type { EvaluationSimulationInput, EvaluationSimulationView } from "@/features/shared/types";

type EvaluationSimulatorStatus = "idle" | "loading" | "done" | "error";

export function useEvaluationSimulator() {
  const [status, setStatus] = useState<EvaluationSimulatorStatus>("idle");
  const [result, setResult] = useState<EvaluationSimulationView | null>(null);
  const [error, setError] = useState<string | null>(null);

  const simulate = useCallback(async (input: EvaluationSimulationInput) => {
    setStatus("loading");
    setError(null);

    try {
      const response = await fetch("/api/simulations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);

      const nextResult = payload.data as EvaluationSimulationView;
      setResult(nextResult);
      setStatus("done");
      return nextResult;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel simular a avaliacao.");
      setStatus("error");
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setResult(null);
    setError(null);
  }, []);

  return {
    status,
    result,
    error,
    isLoading: status === "loading",
    simulate,
    reset,
  };
}
