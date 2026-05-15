import "server-only";

import { parseAcademicDocument } from "@/features/academic-context-engine/document-parser/documentParser";
import type { ProjectContextView } from "@/features/shared/types";
import { getPrisma } from "@/services/database/prisma";
import type { CreateProjectContextInput } from "./validation";

type ProjectContextRow = {
  id: string;
  name: string;
  discipline: string;
  description: string;
  tapText: string;
  createdAt: Date;
  updatedAt: Date;
  uploadedDocuments: Array<{
    id: string;
    fileName: string;
    mimeType: string;
    documentType: string;
    textContent: string;
    preview: string;
    contentBase64?: string;
    createdAt: Date;
  }>;
};

export async function createProjectContext(input: CreateProjectContextInput): Promise<ProjectContextView> {
  const parsedDocuments = await Promise.all(input.documents.map(parseAcademicDocument));
  const row: ProjectContextRow = await getPrisma().projectContext.create({
    data: {
      name: input.name,
      discipline: input.discipline,
      description: input.description,
      tapText: input.tapText,
      uploadedDocuments: {
        create: parsedDocuments
          .filter((doc) => doc.documentType === "tap" || doc.textContent.length > 0)
          .map((doc) => ({
            fileName: doc.fileName,
            mimeType: doc.mimeType,
            documentType: doc.documentType,
            textContent: doc.textContent,
            preview: doc.preview,
            contentBase64: doc.contentBase64,
          })),
      },
    },
    include: { uploadedDocuments: true },
  });

  return mapProjectContext(row);
}

export async function listProjectContexts(): Promise<ProjectContextView[]> {
  const rows: ProjectContextRow[] = await getPrisma().projectContext.findMany({
    include: { uploadedDocuments: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapProjectContext);
}

export async function getProjectContext(id: string): Promise<ProjectContextView | null> {
  const row: ProjectContextRow | null = await getPrisma().projectContext.findUnique({
    where: { id },
    include: { uploadedDocuments: true },
  });
  return row ? mapProjectContext(row) : null;
}

function mapProjectContext(row: ProjectContextRow): ProjectContextView {
  return {
    id: row.id,
    name: row.name,
    discipline: row.discipline,
    description: row.description,
    tapText: row.tapText,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    uploadedDocuments: row.uploadedDocuments.map((doc) => ({
      ...doc,
      contentBase64: doc.contentBase64 || undefined,
      createdAt: doc.createdAt.toISOString(),
    })),
  };
}
