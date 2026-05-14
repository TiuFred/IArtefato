import "server-only";

import type { UploadedDocumentInput } from "@/features/shared/types";

export interface ParsedAcademicDocument {
  fileName: string;
  mimeType: string;
  documentType: string;
  textContent: string;
  preview: string;
}

export async function parseAcademicDocument(
  input: UploadedDocumentInput
): Promise<ParsedAcademicDocument> {
  const buffer = Buffer.from(input.contentBase64, "base64");
  const fileName = input.fileName.toLowerCase();
  const mimeType = input.mimeType.toLowerCase();

  const textContent = normalizeText(
    mimeType.includes("pdf") || fileName.endsWith(".pdf")
      ? await parsePdf(buffer)
      : mimeType.includes("word") || fileName.endsWith(".docx")
      ? await parseDocx(buffer)
      : parseText(buffer)
  );

  return {
    fileName: input.fileName,
    mimeType: input.mimeType || inferMimeType(input.fileName),
    documentType: input.documentType,
    textContent,
    preview: buildPreview(textContent),
  };
}

async function parsePdf(buffer: Buffer): Promise<string> {
  let parser: { destroy: () => Promise<void> } | null = null;
  try {
    const { PDFParse } = await import("pdf-parse");
    const pdfParser = new PDFParse({ data: new Uint8Array(buffer) });
    parser = pdfParser;
    const parsed = await pdfParser.getText();
    return parsed.text;
  } catch {
    return parseText(buffer);
  } finally {
    await parser?.destroy().catch(() => undefined);
  }
}

async function parseDocx(buffer: Buffer): Promise<string> {
  try {
    const mammoth = await import("mammoth");
    const parsed = await mammoth.extractRawText({ buffer });
    return parsed.value;
  } catch {
    return parseText(buffer);
  }
}

function parseText(buffer: Buffer): string {
  return buffer.toString("utf8");
}

function normalizeText(value: string): string {
  return value.replace(/\u0000/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function buildPreview(value: string): string {
  return value.slice(0, 600);
}

function inferMimeType(fileName: string): string {
  if (fileName.endsWith(".pdf")) return "application/pdf";
  if (fileName.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  if (fileName.endsWith(".md")) return "text/markdown";
  return "text/plain";
}
