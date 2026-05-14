"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  ArtefactContextView,
  ArtefactCorrectionModelView,
  GroupFeedbackInput,
  ProjectContextView,
  UploadedDocumentInput,
} from "@/features/shared/types";
import { getCorrectionBehaviourCompleteness } from "@/features/correction-behaviour";

export interface CreateProjectContextPayload {
  name: string;
  discipline: string;
  description: string;
  tapText: string;
  documents: UploadedDocumentInput[];
}

export interface CreateArtefactContextPayload {
  artefactName: string;
  projectContextId: string;
  activityId?: string | null;
  description: string;
  wadText: string;
  wodText: string;
  expectedStructure: string;
  explicitRequirements: string[];
  implicitRequirements: string[];
  deliverables: string[];
  documents: UploadedDocumentInput[];
  groupFeedbacks: GroupFeedbackInput[];
}

export function useArtefactModeling() {
  const [projectContexts, setProjectContexts] = useState<ProjectContextView[]>([]);
  const [artefacts, setArtefacts] = useState<ArtefactContextView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const [projectsRes, artefactsRes] = await Promise.all([
        fetch("/api/project-contexts", { cache: "no-store" }),
        fetch("/api/artefact-contexts", { cache: "no-store" }),
      ]);
      const [projectsPayload, artefactsPayload] = await Promise.all([
        projectsRes.json(),
        artefactsRes.json(),
      ]);
      if (!projectsRes.ok) throw new Error(projectsPayload.error);
      if (!artefactsRes.ok) throw new Error(artefactsPayload.error);
      setProjectContexts(projectsPayload.data ?? []);
      setArtefacts(artefactsPayload.data ?? []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    Promise.all([
      fetch("/api/project-contexts", { cache: "no-store" }),
      fetch("/api/artefact-contexts", { cache: "no-store" }),
    ])
      .then(async ([projectsRes, artefactsRes]) => {
        const [projectsPayload, artefactsPayload] = await Promise.all([
          projectsRes.json(),
          artefactsRes.json(),
        ]);
        if (!active) return;
        setProjectContexts(projectsPayload.data ?? []);
        setArtefacts(artefactsPayload.data ?? []);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const createProject = useCallback(async (input: CreateProjectContextPayload) => {
    setIsCreating(true);
    try {
      const response = await fetch("/api/project-contexts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setProjectContexts((current) => [payload.data, ...current]);
      return payload.data as ProjectContextView;
    } finally {
      setIsCreating(false);
    }
  }, []);

  const createArtefact = useCallback(async (input: CreateArtefactContextPayload) => {
    setIsCreating(true);
    try {
      const response = await fetch("/api/artefact-contexts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setArtefacts((current) => [payload.data, ...current]);
      return payload.data as ArtefactContextView;
    } finally {
      setIsCreating(false);
    }
  }, []);

  const generateModel = useCallback(async (artefactContextId: string) => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/artefact-correction-models/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artefactContextId }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      const model = payload.data as ArtefactCorrectionModelView;
      await refresh();
      return model;
    } finally {
      setIsGenerating(false);
    }
  }, [refresh]);

  const statusByArtefact = useMemo(
    () =>
      Object.fromEntries(
        artefacts.map((artefact) => [
          artefact.id,
          getCorrectionBehaviourCompleteness(artefact.groupFeedbacks),
        ])
      ),
    [artefacts]
  );

  return {
    projectContexts,
    artefacts,
    statusByArtefact,
    isLoading,
    isCreating,
    isGenerating,
    refresh,
    createProject,
    createArtefact,
    generateModel,
  };
}
