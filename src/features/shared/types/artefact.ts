export type AcademicDocumentType =
  | "tap"
  | "wad_filled"
  | "wad_template"
  | "wod"
  | "auxiliary_pdf"
  | "markdown"
  | "docx"
  | "txt";

export interface UploadedDocumentInput {
  fileName: string;
  mimeType: string;
  documentType: AcademicDocumentType;
  contentBase64: string;
}

export interface UploadedDocumentView {
  id: string;
  fileName: string;
  mimeType: string;
  documentType: string;
  textContent: string;
  preview: string;
  createdAt: string;
}

export interface ProjectContextInput {
  name: string;
  discipline?: string;
  description: string;
  tapText?: string;
}

export interface ProjectContextView extends Required<ProjectContextInput> {
  id: string;
  createdAt: string;
  updatedAt: string;
  uploadedDocuments: UploadedDocumentView[];
}

export interface ArtefactContextInput {
  artefactName: string;
  projectContextId: string;
  activityId?: string | null;
  description: string;
  wadText?: string;
  wodText?: string;
  expectedStructure: string;
  explicitRequirements: string[];
  implicitRequirements: string[];
  deliverables: string[];
}

export interface GroupFeedbackInput {
  groupName: string;
  activityDescription: string;
  feedback: string;
  score: number;
  maxScore: number;
  activityId?: string | null;
}

export interface GroupFeedbackView extends GroupFeedbackInput {
  id: string;
  artefactContextId: string;
  createdAt: string;
}

export interface ArtefactContextView extends ArtefactContextInput {
  id: string;
  createdAt: string;
  updatedAt: string;
  projectContext: Pick<ProjectContextView, "id" | "name" | "discipline" | "description" | "tapText">;
  uploadedDocuments: UploadedDocumentView[];
  groupFeedbacks: GroupFeedbackView[];
  latestModel?: ArtefactCorrectionModelView | null;
}

export interface ArtefactCompletenessStatus {
  minimumGroups: number;
  validFeedbacks: number;
  missingFeedbacks: number;
  canGenerate: boolean;
  issues: string[];
}

export interface ArtefactCorrectionModelOutput {
  inferredPrompt: string;
  inferredRules: string[];
  inferredPatterns: string[];
  detectedPenalties: string[];
  correctionStyle: {
    tone: string;
    focus: string;
    evidence: string[];
  };
  rigorLevel: "low" | "medium" | "high";
  confidence: number;
}

export interface ArtefactCorrectionModelView extends ArtefactCorrectionModelOutput {
  id: string;
  artefactName: string;
  projectContextId: string;
  artefactContextId: string;
  groupFeedbackCount: number;
  generatedAt: string;
}
