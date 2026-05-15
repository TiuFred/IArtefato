import { z } from "zod";

export const academicDocumentSchema = z.object({
  fileName: z.string().trim().min(1, "Informe o nome do arquivo."),
  mimeType: z.string().trim().default("text/plain"),
  documentType: z.enum([
    "tap",
    "wad_filled",
    "wad_template",
    "wod",
    "auxiliary_pdf",
    "markdown",
    "docx",
    "txt",
    "group_wad",
    "feedback_file",
    "artefact_photo",
    "feedback_photo",
  ]),
  contentBase64: z.string().min(1, "Arquivo vazio ou ilegível."),
});

export const academicDocumentListSchema = z.array(academicDocumentSchema).max(24);
