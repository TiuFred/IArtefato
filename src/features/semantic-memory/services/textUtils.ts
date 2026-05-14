export function normalizeSemanticText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(text: string): string[] {
  const stopwords = new Set([
    "a",
    "o",
    "as",
    "os",
    "de",
    "da",
    "do",
    "das",
    "dos",
    "em",
    "para",
    "por",
    "com",
    "um",
    "uma",
    "e",
    "ou",
    "que",
    "foi",
    "nao",
    "no",
    "na",
  ]);

  return normalizeSemanticText(text)
    .split(" ")
    .filter((token) => token.length > 2 && !stopwords.has(token));
}

export function unique(values: string[]): string[] {
  return Array.from(new Set(values.map(normalizeSemanticText).filter(Boolean)));
}

export function intersectionSize(left: string[], right: string[]): number {
  const rightSet = new Set(right);
  return left.reduce((total, value) => total + (rightSet.has(value) ? 1 : 0), 0);
}

