import { normalizeSemanticText } from "@/features/semantic-memory/services";
import { TAG_HINTS } from "./simulatorDictionaries";

export function extractSemanticTags(text: string): string[] {
  const normalized = normalizeSemanticText(text);

  return Object.entries(TAG_HINTS)
    .filter(([, hints]) =>
      hints.some((hint) => normalized.includes(normalizeSemanticText(hint)))
    )
    .map(([tag]) => tag);
}

export function hasAnyKeyword(text: string, keywords: string[]): boolean {
  const normalized = normalizeSemanticText(text);
  return keywords.some((keyword) => normalized.includes(normalizeSemanticText(keyword)));
}
