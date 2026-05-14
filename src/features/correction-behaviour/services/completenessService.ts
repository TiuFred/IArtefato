import type { ArtefactCompletenessStatus, GroupFeedbackInput } from "@/features/shared/types";
import { validateCollectiveFeedbacks } from "@/features/academic-context-engine/professor-patterns/groupFeedbackRules";

export function getCorrectionBehaviourCompleteness(
  feedbacks: GroupFeedbackInput[]
): ArtefactCompletenessStatus {
  return validateCollectiveFeedbacks(feedbacks);
}
