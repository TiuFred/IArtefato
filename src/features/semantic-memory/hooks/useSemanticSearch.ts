"use client";

import { useCallback, useMemo, useState } from "react";
import type { SimulationContextCase } from "@/features/shared/types";

export interface ClientSemanticSearchParams {
  text: string;
  tags?: string[];
  limit?: number;
}

export function useSemanticSearch(initialQuery?: ClientSemanticSearchParams) {
  const [query, setQuery] = useState<ClientSemanticSearchParams>(
    initialQuery ?? { text: "", limit: 5 }
  );
  const [results, setResults] = useState<SimulationContextCase[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const search = useCallback(async (nextQuery: ClientSemanticSearchParams) => {
    setQuery(nextQuery);
    setIsLoading(true);

    try {
      const response = await fetch("/api/semantic-memory/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextQuery),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);

      setResults(payload.data);
      return payload.data as SimulationContextCase[];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setQuery({ text: "", limit: 5 });
    setResults([]);
  }, []);

  const bestMatch = useMemo(() => {
    return results[0] ?? null;
  }, [results]);

  return {
    query,
    results,
    bestMatch,
    hasResults: results.length > 0,
    isLoading,
    search,
    clear,
    setQuery,
  };
}
