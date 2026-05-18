-- ============================================================
-- MIGRATION v5 — Limpar ArtefactContexts duplicados
-- Problema: ensureArtefactContextsForProject criava um novo
-- ArtefactContext (com activityId) quando já existia um com
-- o mesmo artefactName mas sem activityId, gerando duplicatas
-- vazias. Esta migration:
--   1. Para cada par duplicado, apaga o vazio (sem feedbacks)
--      e mantém o que tem dados.
--   2. Garante que o sobrevivente tenha activityId preenchido
--      se existir uma Activity com o mesmo título.
-- ============================================================

-- Passo 1: remover ArtefactContexts que não têm feedbacks,
-- mas cujo (projectContextId, artefactName) já tem outro
-- ArtefactContext COM feedbacks.
DELETE FROM "ArtefactContext" ac
WHERE
  -- sem feedbacks próprios
  NOT EXISTS (
    SELECT 1 FROM "GroupFeedback" gf
    WHERE gf."artefactContextId" = ac.id
  )
  -- sem modelos gerados
  AND NOT EXISTS (
    SELECT 1 FROM "ArtefactCorrectionModel" m
    WHERE m."artefactContextId" = ac.id
  )
  -- existe outro com o mesmo nome/projeto que TEM feedbacks
  AND EXISTS (
    SELECT 1 FROM "ArtefactContext" ac2
    WHERE ac2."projectContextId" = ac."projectContextId"
      AND ac2."artefactName"     = ac."artefactName"
      AND ac2.id                 <> ac.id
      AND EXISTS (
        SELECT 1 FROM "GroupFeedback" gf2
        WHERE gf2."artefactContextId" = ac2.id
      )
  );

-- Passo 2: para os ArtefactContexts que ficaram sem activityId,
-- tentar vincular à Activity cujo título bate com artefactName.
UPDATE "ArtefactContext" ac
SET    "activityId" = a.id
FROM   "Activity" a
WHERE  ac."activityId" IS NULL
  AND  a.title = ac."artefactName";

-- ============================================================
-- FIM DA MIGRATION v5
-- ============================================================
