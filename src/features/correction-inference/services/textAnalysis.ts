export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function countKeywordMatches(text: string, keywords: string[]): number {
  const normalized = normalizeText(text);
  return keywords.reduce((total, keyword) => {
    return total + (normalized.includes(normalizeText(keyword)) ? 1 : 0);
  }, 0);
}

export function collectEvidence(text: string, keywords: string[], limit = 2): string[] {
  const sentences = text
    .split(/[.!?\n]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const evidence: string[] = [];

  for (const sentence of sentences) {
    const found = keywords.some((keyword) =>
      normalizeText(sentence).includes(normalizeText(keyword))
    );

    if (found) {
      evidence.push(sentence.length > 140 ? `${sentence.slice(0, 140)}...` : sentence);
    }

    if (evidence.length >= limit) break;
  }

  return evidence;
}

export function inferLevel(score: number): "baixo" | "medio" | "alto" {
  if (score >= 70) return "alto";
  if (score >= 40) return "medio";
  return "baixo";
}

export function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

