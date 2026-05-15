import "server-only";

import type { UploadedDocumentInput } from "@/features/shared/types";

export interface ParsedAcademicDocument {
  fileName: string;
  mimeType: string;
  documentType: string;
  textContent: string;
  preview: string;
  contentBase64: string;
}

export async function parseAcademicDocument(
  input: UploadedDocumentInput
): Promise<ParsedAcademicDocument> {
  const buffer = Buffer.from(input.contentBase64, "base64");
  const fileName = input.fileName.toLowerCase();
  const mimeType = input.mimeType.toLowerCase();

  const isImage = mimeType.startsWith("image/") || /\.(png|jpe?g|webp|gif)$/i.test(fileName);
  const textContent = normalizeText(
    isImage
      ? buildImageDescription(input.fileName, input.mimeType, buffer.byteLength)
      : mimeType.includes("pdf") || fileName.endsWith(".pdf")
      ? await parsePdf(buffer)
      : mimeType.includes("word") || fileName.endsWith(".docx")
      ? await parseDocx(buffer)
      : mimeType.includes("spreadsheet") || /\.(xlsx|xls|csv)$/i.test(fileName)
      ? await parseSpreadsheet(buffer, fileName)
      : parseText(buffer)
  );

  return {
    fileName: input.fileName,
    mimeType: input.mimeType || inferMimeType(input.fileName),
    documentType: input.documentType,
    textContent,
    preview: buildPreview(textContent),
    contentBase64: isImage ? input.contentBase64 : "",
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

async function parseSpreadsheet(buffer: Buffer, fileName: string): Promise<string> {
  try {
    const xlsx = await import("xlsx");
    const workbook = xlsx.read(buffer, { type: "buffer" });
    return workbook.SheetNames.map((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      const rows = xlsx.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
      return [`Planilha: ${sheetName}`, JSON.stringify(rows, null, 2)].join("\n");
    }).join("\n\n");
  } catch {
    return fileName.endsWith(".csv") ? parseText(buffer) : "";
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

function buildImageDescription(fileName: string, mimeType: string, bytes: number): string {
  return `Imagem anexada para analise visual: ${fileName} (${mimeType || "image/*"}, ${bytes} bytes). Use este anexo como evidencia visual do artefato quando o modelo multimodal estiver disponivel.`;
}

function inferMimeType(fileName: string): string {
  if (fileName.endsWith(".pdf")) return "application/pdf";
  if (fileName.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  if (fileName.endsWith(".xlsx")) {
    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  }
  if (fileName.endsWith(".xls")) return "application/vnd.ms-excel";
  if (fileName.endsWith(".csv")) return "text/csv";
  if (/\.(png|jpe?g|webp|gif)$/i.test(fileName)) return "image/*";
  if (fileName.endsWith(".md")) return "text/markdown";
  return "text/plain";
}
