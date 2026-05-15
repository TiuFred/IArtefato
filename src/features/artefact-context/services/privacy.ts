import type { ArtefactContextView } from "@/features/shared/types";

type FeedbackPrivacyShape = {
  activityDescription: string;
  feedback: string;
  score: number;
  maxScore: number;
  wadText: string;
  wadFileName: string;
  wadDocuments?: unknown[];
  feedbackDocuments?: unknown[];
  uploadedDocuments: unknown[];
};

export function sanitizeArtefactForGroup(
  artefact: ArtefactContextView,
  groupName: string
): ArtefactContextView {
  return {
    ...artefact,
    groupFeedbacks: artefact.groupFeedbacks.map((feedback) =>
      feedback.groupName === groupName ? feedback : sanitizeOtherGroupFeedback(feedback)
    ),
  };
}

export function sanitizeOtherGroupFeedback<T extends FeedbackPrivacyShape>(feedback: T): T {
  return {
    ...feedback,
    activityDescription: "",
    feedback: "",
    score: 0,
    maxScore: 0,
    wadText: "",
    wadFileName: "",
    wadDocuments: [],
    feedbackDocuments: [],
    uploadedDocuments: [],
  };
}
