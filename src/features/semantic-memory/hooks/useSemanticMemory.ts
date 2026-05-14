"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CorrectionCaseView } from "@/features/shared/types";

export function useSemanticMemory() {
  const [records, setRecords] = useState<CorrectionCaseView[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    setIsLoading(true);
    fetch("/api/correction-cases", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => setRecords(payload.data ?? []))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    let isActive = true;

    fetch("/api/correction-cases", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => {
        if (isActive) setRecords(payload.data ?? []);
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const tags = useMemo(
    () => Array.from(new Set(records.flatMap((record) => record.inference.tags))).sort(),
    [records]
  );

  return {
    records,
    tags,
    total: records.length,
    isLoading,
    refresh,
  };
}
