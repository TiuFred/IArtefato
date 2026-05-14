"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { CreateCorrectionCaseInput } from "@/features/correction-inference/services/validation";
import { SUBJECTS, SUBJECT_COLORS, SUBJECT_ICONS } from "@/features/shared/subjects";

interface Activity {
  id: string;
  subject: string;
  title: string;
  description: string;
  maxScore: number;
}

interface CorrectionFormProps {
  isSubmitting: boolean;
  onSubmit: (input: CreateCorrectionCaseInput) => Promise<void>;
}

export function CorrectionForm({ isSubmitting, onSubmit }: CorrectionFormProps) {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreateCorrectionCaseInput>({
    defaultValues: {
      subject: "",
      subjects: [],
      activityId: null,
      activityDescription: "",
      studentResponse: "",
      feedbackReceived: "",
      score: 0,
      maxScore: 10,
    },
  });

  useEffect(() => {
    let cancelled = false;

    async function loadActivities() {
      setLoadingActivities(true);
      try {
        const res = await fetch("/api/activities");
        const data = await res.json();
        if (!cancelled) setActivities(data.data ?? []);
      } catch {
        if (!cancelled) setActivities([]);
      } finally {
        if (!cancelled) setLoadingActivities(false);
      }
    }

    loadActivities();

    return () => {
      cancelled = true;
    };
  }, []);

  async function submit(values: CreateCorrectionCaseInput) {
    if (selectedSubjects.length === 0) {
      toast.error("Selecione pelo menos uma matéria/professor.");
      return;
    }

    try {
      await onSubmit({
        ...values,
        subject: selectedSubjects.join(", "),
        subjects: selectedSubjects,
        activityId: selectedActivityId,
      });
      reset();
      setSelectedSubjects([]);
      setSelectedActivityId(null);
      toast.success("Padrões inferidos e salvos no banco.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao inferir padrões.");
    }
  }

  function setSubjectSelection(subjects: string[]) {
    setSelectedSubjects(subjects);
    setValue("subject", subjects.join(", "), { shouldValidate: true });
    setValue("subjects", subjects as CreateCorrectionCaseInput["subjects"], { shouldValidate: true });
  }

  function toggleSubject(subject: string) {
    const next = selectedSubjects.includes(subject)
      ? selectedSubjects.filter((item) => item !== subject)
      : [...selectedSubjects, subject];

    setSubjectSelection(next);
  }

  function applyActivity(act: Activity) {
    setSelectedActivityId(act.id);
    setValue("activityId", act.id, { shouldValidate: true });
    setValue("activityDescription", act.description, { shouldValidate: true });
    setValue("maxScore", act.maxScore, { shouldValidate: true });

    if (!selectedSubjects.includes(act.subject)) {
      setSubjectSelection([...selectedSubjects, act.subject]);
    }
  }

  function clearActivitySelection() {
    setSelectedActivityId(null);
    setValue("activityId", null, { shouldValidate: true });
    setValue("activityDescription", "");
  }

  return (
    <form onSubmit={handleSubmit(submit)} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      <div>
        <label style={{ display: "block", fontSize: 13, color: "#aaa", fontWeight: 500, marginBottom: 8 }}>
          Matérias / Professores
          <span style={{ color: "#555", fontWeight: 400 }}> (selecione uma ou mais)</span>
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
          {SUBJECTS.map((subject) => {
            const colors = SUBJECT_COLORS[subject];
            const isSelected = selectedSubjects.includes(subject);
            return (
              <button
                key={subject}
                type="button"
                onClick={() => toggleSubject(subject)}
                style={{
                  padding: "8px 10px",
                  background: isSelected ? colors.bg : "#0d0d0d",
                  border: `1px solid ${isSelected ? colors.border : "#262626"}`,
                  borderRadius: 8,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: 14, color: isSelected ? colors.text : "#555" }}>
                  {SUBJECT_ICONS[subject]}
                </span>
                <span style={{
                  fontSize: 13, fontWeight: isSelected ? 600 : 400,
                  color: isSelected ? colors.text : "#666",
                }}>
                  {subject}
                </span>
              </button>
            );
          })}
        </div>
        <input type="hidden" {...register("subject")} />
        {errors.subject && (
          <span style={{ color: "#f87171", fontSize: 12, marginTop: 4, display: "block" }}>
            {errors.subject.message}
          </span>
        )}
      </div>

      <div>
        <label style={{ display: "block", fontSize: 13, color: "#aaa", fontWeight: 500, marginBottom: 8 }}>
          Atividade
          <span style={{ color: "#555", fontWeight: 400 }}> (opcional — preenche o enunciado automaticamente)</span>
        </label>
        <input type="hidden" {...register("activityId")} />
        {loadingActivities ? (
          <div style={{ fontSize: 13, color: "#475569", padding: "8px 0" }}>Carregando atividades...</div>
        ) : activities.length === 0 ? (
          <div style={{ fontSize: 13, color: "#334155", padding: "8px 12px", background: "#0d0d0d", borderRadius: 6, border: "1px solid #1e1e1e" }}>
            Nenhuma atividade cadastrada ainda. Preencha o enunciado manualmente abaixo.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {activities.map((act) => {
              const isSelected = selectedActivityId === act.id;
              const colors = SUBJECT_COLORS[act.subject as keyof typeof SUBJECT_COLORS];
              return (
                <button key={act.id} type="button" onClick={() => applyActivity(act)}
                  style={{
                    textAlign: "left", padding: "10px 12px",
                    background: isSelected ? (colors?.bg ?? "#1e1e2e") : "#0d0d0d",
                    border: `1px solid ${isSelected ? (colors?.border ?? "#4f8ef7") : "#1e1e1e"}`,
                    borderRadius: 8, cursor: "pointer", transition: "all 0.15s",
                  }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: isSelected ? (colors?.text ?? "#e2e8f0") : "#94a3b8" }}>
                      {isSelected && "✓ "}{act.title}
                    </div>
                    <span style={{
                      flexShrink: 0, fontSize: 11, color: colors?.text ?? "#64748b",
                      background: colors?.bg ?? "#111827", border: `1px solid ${colors?.border ?? "#1f2937"}`,
                      borderRadius: 4, padding: "1px 6px",
                    }}>
                      {act.subject}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.5 }}>
                    {act.description.slice(0, 100)}{act.description.length > 100 ? "..." : ""}
                  </div>
                  <div style={{ fontSize: 11, color: "#334155", marginTop: 4 }}>Nota máxima: {act.maxScore}pts</div>
                </button>
              );
            })}
            {selectedActivityId && (
              <button type="button" onClick={clearActivitySelection}
                style={{ alignSelf: "flex-start", fontSize: 12, color: "#475569", background: "none", border: "none", cursor: "pointer", padding: "2px 0", textDecoration: "underline" }}>
                Limpar seleção
              </button>
            )}
          </div>
        )}
      </div>

      <Field
        label="Descrição da atividade"
        error={errors.activityDescription?.message}
        textareaProps={{
          rows: 4,
          placeholder: "Cole aqui o enunciado recebido...",
          ...register("activityDescription", { required: "Campo obrigatório", minLength: 20 }),
        }}
      />

      <Field
        label="Resposta enviada"
        error={errors.studentResponse?.message}
        textareaProps={{
          rows: 5,
          placeholder: "Cole aqui a resposta que você enviou...",
          ...register("studentResponse", { required: "Campo obrigatório", minLength: 20 }),
        }}
      />

      <Field
        label="Feedback recebido"
        error={errors.feedbackReceived?.message}
        textareaProps={{
          rows: 5,
          placeholder: "Cole aqui o feedback gerado pela IA do professor...",
          ...register("feedbackReceived", { required: "Campo obrigatório", minLength: 20 }),
        }}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <NumberField
          label="Nota recebida"
          error={errors.score?.message}
          inputProps={{
            step: "0.1",
            min: "0",
            ...register("score", { valueAsNumber: true, required: "Informe a nota" }),
          }}
        />
        <NumberField
          label="Nota máxima"
          error={errors.maxScore?.message}
          inputProps={{
            step: "0.1",
            min: "1",
            ...register("maxScore", { valueAsNumber: true, required: "Informe a nota máxima" }),
          }}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          padding: "10px 18px",
          background: isSubmitting ? "#1e1e1e" : "#4f8ef7",
          color: isSubmitting ? "#777" : "#fff",
          border: "none",
          borderRadius: 6,
          fontWeight: 600,
          cursor: isSubmitting ? "wait" : "pointer",
        }}
      >
        {isSubmitting ? "Enviando ao Gemini..." : "Inferir e salvar padrões"}
      </button>
    </form>
  );
}

function Field({
  label, error, textareaProps,
}: { label: string; error?: string; textareaProps: React.TextareaHTMLAttributes<HTMLTextAreaElement> }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 13, color: "#aaa", fontWeight: 500 }}>{label}</span>
      <textarea
        {...textareaProps}
        style={{
          width: "100%", background: "#0d0d0d",
          border: `1px solid ${error ? "#7f1d1d" : "#262626"}`,
          borderRadius: 6, padding: "10px 12px", color: "#e8e8e8",
          fontSize: 14, outline: "none", fontFamily: "inherit", resize: "vertical",
        }}
      />
      {error && <span style={{ color: "#f87171", fontSize: 12 }}>{error}</span>}
    </label>
  );
}

function NumberField({
  label, error, inputProps,
}: { label: string; error?: string; inputProps: React.InputHTMLAttributes<HTMLInputElement> }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 13, color: "#aaa", fontWeight: 500 }}>{label}</span>
      <input
        type="number"
        {...inputProps}
        style={{
          width: "100%", background: "#0d0d0d",
          border: `1px solid ${error ? "#7f1d1d" : "#262626"}`,
          borderRadius: 6, padding: "10px 12px", color: "#e8e8e8",
          fontSize: 14, outline: "none",
        }}
      />
      {error && <span style={{ color: "#f87171", fontSize: 12 }}>{error}</span>}
    </label>
  );
}
