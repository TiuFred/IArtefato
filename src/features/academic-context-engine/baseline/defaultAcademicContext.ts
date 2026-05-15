import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";

const WAD_TEMPLATE_PATH = join(
  process.cwd(),
  "src/features/academic-context-engine/baseline/files/wad-template.md"
);

const TAPI_CONTEXT_PATH = join(
  process.cwd(),
  "src/features/academic-context-engine/baseline/files/tapi-instituto-ponte.txt"
);

let cachedBaseline: string | null = null;

export function getDefaultAcademicContext() {
  cachedBaseline ??= [
    "TAPI / PROJETO PARCEIRO OBRIGATORIO:",
    readFileSync(TAPI_CONTEXT_PATH, "utf8"),
    "WAD PADRAO / MODELO OBRIGATORIO:",
    readFileSync(WAD_TEMPLATE_PATH, "utf8"),
  ].join("\n\n---\n\n");

  return cachedBaseline;
}
