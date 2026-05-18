import { SEMANTIC_MEMORY_SEED } from "./semanticMemorySeed";
import type {
  CreateSemanticMemoryRecordInput,
  SemanticMemoryRecord,
  SemanticMemorySnapshot,
} from "../types";
import { unique } from "../services/textUtils";

let records: SemanticMemoryRecord[] = [...SEMANTIC_MEMORY_SEED];

export function listSemanticMemoryRecords(): SemanticMemoryRecord[] {
  return [...records];
}

export function getSemanticMemorySnapshot(): SemanticMemorySnapshot {
  const tags = unique(records.flatMap((record) => record.tags));

  return {
    registros: listSemanticMemoryRecords(),
    total: records.length,
    tags,
    atualizadoEm: new Date().toISOString(),
  };
}

export function addSemanticMemoryRecord(
  input: CreateSemanticMemoryRecordInput
): SemanticMemoryRecord {
  const record: SemanticMemoryRecord = {
    id: `mem-${Date.now()}`,
    atividade: input.atividade,
    resposta: input.resposta,
    feedback: input.feedback,
    nota: input.nota,
    notaMaxima: input.notaMaxima ?? 10,
    pseudoPrompt: input.pseudoPrompt,
    padroesDetectados: input.padroesDetectados,
    tags: unique(input.tags ?? []),
    data: input.data ?? new Date().toISOString(),
  };

  records = [record, ...records];
  return record;
}

export function removeSemanticMemoryRecord(id: string): void {
  records = records.filter((record) => record.id !== id);
}

export function resetSemanticMemoryDatabase(): void {
  records = [...SEMANTIC_MEMORY_SEED];
}

