import type { GroupFeedbackInput } from "@/features/shared/types";

export const MINIMUM_GROUP_FEEDBACKS = 5;

export function validateCollectiveFeedbacks(feedbacks: GroupFeedbackInput[]) {
  const issues: string[] = [];
  const validFeedbacks = feedbacks.filter(
    (item) =>
      item.groupName.trim().length > 0 &&
      item.activityDescription.trim().length > 0 &&
      item.feedback.trim().length > 0 &&
      Number.isFinite(item.score) &&
      Number.isFinite(item.maxScore)
  ).length;

  if (validFeedbacks < MINIMUM_GROUP_FEEDBACKS) {
    issues.push(`Cadastre pelo menos ${MINIMUM_GROUP_FEEDBACKS} grupos com feedback, atividade e nota.`);
  }

  feedbacks.forEach((item, index) => {
    if (!item.activityDescription.trim()) issues.push(`Grupo ${index + 1}: atividade obrigatoria.`);
    if (!item.feedback.trim()) issues.push(`Grupo ${index + 1}: feedback obrigatorio.`);
    if (!Number.isFinite(item.score)) issues.push(`Grupo ${index + 1}: nota obrigatoria.`);
  });

  return {
    minimumGroups: MINIMUM_GROUP_FEEDBACKS,
    validFeedbacks,
    missingFeedbacks: Math.max(0, MINIMUM_GROUP_FEEDBACKS - validFeedbacks),
    canGenerate: validFeedbacks >= MINIMUM_GROUP_FEEDBACKS && issues.length === 0,
    issues,
  };
}
