import type { CorrectionCaseView } from "@/features/shared/types";
import { intersectionSize, tokenize, unique } from "./textUtils";

export interface SimilarityInput {
  text: string;
  tags?: string[];
}

export function calculateSimilarity(
  query: SimilarityInput,
  record: CorrectionCaseView
): { score: number; reasons: string[] } {
  const queryTokens = unique(tokenize(query.text));
  const recordTokens = unique(
    tokenize(
      `${record.activityDescription} ${record.studentResponse} ${record.feedbackReceived} ${record.inference.pseudoPrompt}`
    )
  );
  const sharedTokens = intersectionSize(queryTokens, recordTokens);
  const lexical = queryTokens.length > 0 ? sharedTokens / queryTokens.length : 0;

  const queryTags = unique(query.tags ?? []);
  const recordTags = unique(record.inference.tags);
  const sharedTags = intersectionSize(queryTags, recordTags);
  const tagScore = queryTags.length > 0 ? sharedTags / queryTags.length : 0;

  const patternTokens = unique(record.inference.criteria.map((criterion) => criterion.name).flatMap(tokenize));
  const sharedPatterns = intersectionSize(queryTokens, patternTokens);
  const patternScore = queryTokens.length > 0 ? sharedPatterns / queryTokens.length : 0;
  const score = lexical * 0.55 + tagScore * 0.25 + patternScore * 0.2;

  return {
    score: toPercent(score),
    reasons: buildReasons({
      sharedTokens,
      sharedTags,
      sharedPatterns,
    }),
  };
}

function toPercent(value: number): number {
  return Math.round(Math.max(0, Math.min(1, value)) * 100);
}

function buildReasons(params: {
  sharedTokens: number;
  sharedTags: number;
  sharedPatterns: number;
}): string[] {
  const reasons: string[] = [];

  if (params.sharedTokens > 0) {
    reasons.push(`${params.sharedTokens} termo(s) relevantes em comum`);
  }

  if (params.sharedTags > 0) {
    reasons.push(`${params.sharedTags} tag(s) coincidente(s)`);
  }

  if (params.sharedPatterns > 0) {
    reasons.push(`${params.sharedPatterns} padrao(oes) detectado(s) em comum`);
  }

  return reasons.length > 0 ? reasons : ["similaridade baixa, mantida apenas como comparacao"];
}
