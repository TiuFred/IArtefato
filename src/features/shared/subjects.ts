export const SUBJECTS = [
  "Liderança",
  "UX",
  "Programação",
  "Negócios",
  "Orientação",
  "Matemática",
] as const;

export type Subject = (typeof SUBJECTS)[number];

export const SUBJECT_COLORS: Record<Subject, { bg: string; border: string; text: string }> = {
  Liderança:   { bg: "#1a1028", border: "#7c3aed", text: "#a78bfa" },
  UX:          { bg: "#0f1a2d", border: "#2563eb", text: "#60a5fa" },
  Programação: { bg: "#0d1a12", border: "#059669", text: "#34d399" },
  Negócios:    { bg: "#1a1200", border: "#d97706", text: "#fbbf24" },
  Orientação:  { bg: "#1a0f0f", border: "#dc2626", text: "#f87171" },
  Matemática:  { bg: "#001a1a", border: "#0891b2", text: "#22d3ee" },
};

export const SUBJECT_ICONS: Record<Subject, string> = {
  Liderança:   "◈",
  UX:          "◉",
  Programação: "⬡",
  Negócios:    "◆",
  Orientação:  "◎",
  Matemática:  "∑",
};
