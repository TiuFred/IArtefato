"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useArtefactModeling } from "@/features/artefact-correction-model/hooks";
import type { AcademicDocumentType, GroupFeedbackInput, UploadedDocumentInput } from "@/features/shared/types";

const EMPTY_GROUPS: GroupFeedbackInput[] = Array.from({ length: 5 }, (_, index) => ({
  groupName: `Grupo ${index + 1}`,
  activityDescription: "",
  feedback: "",
  score: 0,
  maxScore: 10,
  wadText: "",
  wadDocuments: [],
  feedbackDocuments: [],
}));

type ArtefactFormState = {
  artefactName: string;
  projectContextId: string;
  description: string;
  wadText: string;
  wodText: string;
  expectedStructure: string;
  explicitRequirements: string;
  implicitRequirements: string;
  deliverables: string;
  documents: UploadedDocumentInput[];
  groupFeedbacks: GroupFeedbackInput[];
};

export default function ArtefactModelingPage() {
  const {
    projectContexts,
    artefacts,
    statusByArtefact,
    isLoading,
    isCreating,
    isGenerating,
    createProject,
    createArtefact,
    generateModel,
  } = useArtefactModeling();

  const router = useRouter();

  const [projectForm, setProjectForm] = useState({
    name: "",
    discipline: "",
    description: "",
    tapText: "",
    documents: [] as UploadedDocumentInput[],
  });
  const [artefactForm, setArtefactForm] = useState({
    artefactName: "",
    projectContextId: "",
    description: "",
    wadText: "",
    wodText: "",
    expectedStructure: "",
    explicitRequirements: "",
    implicitRequirements: "",
    deliverables: "",
    documents: [] as UploadedDocumentInput[],
    groupFeedbacks: EMPTY_GROUPS,
  });
  const [documentType, setDocumentType] = useState<AcademicDocumentType>("tap");

  async function handleProjectFiles(files: FileList | null) {
    if (!files) return;
    const docs = await filesToDocuments(files, documentType);
    setProjectForm((current) => ({ ...current, documents: [...current.documents, ...docs] }));
  }

  async function handleArtefactFiles(files: FileList | null) {
    if (!files) return;
    const docs = await filesToDocuments(files, documentType);
    setArtefactForm((current) => ({ ...current, documents: [...current.documents, ...docs] }));
  }

  async function handleGroupFiles(
    index: number,
    fieldName: "wadDocuments" | "feedbackDocuments",
    files: FileList | null,
    documentTypeForFiles: AcademicDocumentType
  ) {
    if (!files) return;
    const docs = await filesToDocuments(files, documentTypeForFiles);
    setArtefactForm((current) => ({
      ...current,
      groupFeedbacks: current.groupFeedbacks.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [fieldName]: [...(item[fieldName] ?? []), ...docs] }
          : item
      ),
    }));
  }

  async function submitProject() {
    try {
      const project = await createProject(projectForm);
      setArtefactForm((current) => ({ ...current, projectContextId: project.id }));
      setProjectForm({ name: "", discipline: "", description: "", tapText: "", documents: [] });
      toast.success("Contexto de projeto salvo.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao salvar contexto.");
    }
  }

  async function submitArtefact() {
    try {
      await createArtefact({
        ...artefactForm,
        explicitRequirements: splitLines(artefactForm.explicitRequirements),
        implicitRequirements: splitLines(artefactForm.implicitRequirements),
        deliverables: splitLines(artefactForm.deliverables),
      });
      setArtefactForm((current) => ({
        ...current,
        artefactName: "",
        description: "",
        wadText: "",
        wodText: "",
        expectedStructure: "",
        explicitRequirements: "",
        implicitRequirements: "",
        deliverables: "",
        documents: [],
        groupFeedbacks: EMPTY_GROUPS,
      }));
      toast.success("Artefato salvo. Gere o modelo quando os 5 grupos estiverem completos.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao salvar artefato.");
    }
  }

  async function handleGenerate(artefactId: string) {
    try {
      await generateModel(artefactId);
      toast.success("Modelo de correção do artefato gerado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ainda não é possível gerar o modelo.");
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Modelos por Artefato</h1>
        <p style={{ color: "#888", maxWidth: 720, lineHeight: 1.6 }}>
          Modele como o professor corrige um artefato específico usando TAP, WAD/WOD,
          documentos contextuais e feedbacks coletivos de múltiplos grupos.
        </p>
      </div>

      <div style={grid}>
        <section style={panel}>
          <SectionTitle>Project Context Layer</SectionTitle>
          <Input label="Nome do projeto" value={projectForm.name} onChange={(value) => setProjectForm((c) => ({ ...c, name: value }))} />
          <Input label="Disciplina" value={projectForm.discipline} onChange={(value) => setProjectForm((c) => ({ ...c, discipline: value }))} />
          <Textarea label="Contexto global / TAP" rows={4} value={projectForm.description} onChange={(value) => setProjectForm((c) => ({ ...c, description: value }))} />
          <Textarea label="Texto extra do TAP" rows={3} value={projectForm.tapText} onChange={(value) => setProjectForm((c) => ({ ...c, tapText: value }))} />
          <DocumentPicker documentType={documentType} setDocumentType={setDocumentType} onFiles={handleProjectFiles} />
          <DocumentPreview docs={projectForm.documents} />
          <button onClick={submitProject} disabled={isCreating} style={primaryBtn}>Salvar contexto do projeto</button>
        </section>

        <section style={panel}>
          <SectionTitle>Artefact Context Layer</SectionTitle>
          <Select
            label="Projeto"
            value={artefactForm.projectContextId}
            onChange={(value) => setArtefactForm((c) => ({ ...c, projectContextId: value }))}
            options={projectContexts.map((project) => ({ value: project.id, label: project.name }))}
          />
          <Input label="Nome do artefato" value={artefactForm.artefactName} onChange={(value) => setArtefactForm((c) => ({ ...c, artefactName: value }))} placeholder="UML, DER, RNF, Wireframe..." />
          <Textarea label="Descrição específica do artefato" rows={3} value={artefactForm.description} onChange={(value) => setArtefactForm((c) => ({ ...c, description: value }))} />
          <Textarea label="WAD preenchido" rows={3} value={artefactForm.wadText} onChange={(value) => setArtefactForm((c) => ({ ...c, wadText: value }))} />
          <Textarea label="WOD" rows={3} value={artefactForm.wodText} onChange={(value) => setArtefactForm((c) => ({ ...c, wodText: value }))} />
          <Textarea label="Estrutura esperada" rows={3} value={artefactForm.expectedStructure} onChange={(value) => setArtefactForm((c) => ({ ...c, expectedStructure: value }))} />
          <Textarea label="Requisitos explícitos" rows={2} value={artefactForm.explicitRequirements} onChange={(value) => setArtefactForm((c) => ({ ...c, explicitRequirements: value }))} placeholder="Um por linha" />
          <Textarea label="Requisitos implícitos" rows={2} value={artefactForm.implicitRequirements} onChange={(value) => setArtefactForm((c) => ({ ...c, implicitRequirements: value }))} placeholder="Um por linha" />
          <Textarea label="Entregáveis" rows={2} value={artefactForm.deliverables} onChange={(value) => setArtefactForm((c) => ({ ...c, deliverables: value }))} placeholder="Um por linha" />
          <DocumentPicker documentType={documentType} setDocumentType={setDocumentType} onFiles={handleArtefactFiles} />
          <DocumentPreview docs={artefactForm.documents} />
        </section>
      </div>

      <section style={{ ...panel, marginTop: 18 }}>
        <SectionTitle>Correction Behaviour Layer</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 16 }}>
          {artefactForm.groupFeedbacks.map((feedback, index) => {
            const hasFeedback = feedback.feedback.trim() || (feedback.feedbackDocuments?.length ?? 0) > 0;
            const hasWad = feedback.wadText?.trim() || (feedback.wadDocuments?.length ?? 0) > 0;
            const valid = feedback.activityDescription.trim() && hasFeedback && hasWad && Number.isFinite(feedback.score);
            return (
              <div key={index} style={{ ...statusBox, borderColor: valid ? "#166534" : "#3a2720", color: valid ? "#86efac" : "#fbbf24" }}>
                {feedback.groupName}
                <strong>{valid ? "Completo" : "Pendente"}</strong>
              </div>
            );
          })}
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {artefactForm.groupFeedbacks.map((feedback, index) => (
            <div key={index} style={groupCard}>
              <Input label="Grupo" value={feedback.groupName} onChange={(value) => updateGroup(index, "groupName", value, setArtefactForm)} />
              <Textarea label="Atividade do grupo" rows={2} value={feedback.activityDescription} onChange={(value) => updateGroup(index, "activityDescription", value, setArtefactForm)} />
              <Textarea label="WAD do grupo" rows={2} value={feedback.wadText ?? ""} onChange={(value) => updateGroup(index, "wadText", value, setArtefactForm)} />
              <Textarea label="Feedback recebido" rows={2} value={feedback.feedback} onChange={(value) => updateGroup(index, "feedback", value, setArtefactForm)} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <NumberInput label="Nota" value={feedback.score} onChange={(value) => updateGroup(index, "score", value, setArtefactForm)} />
                <NumberInput label="Nota máxima" value={feedback.maxScore} onChange={(value) => updateGroup(index, "maxScore", value, setArtefactForm)} />
              </div>
              <GroupFilePicker
                label="Arquivos/Fotos do WAD"
                count={feedback.wadDocuments?.length ?? 0}
                onFiles={(files, selectedType) => handleGroupFiles(index, "wadDocuments", files, selectedType)}
                defaultType="group_wad"
              />
              <GroupFilePicker
                label="Arquivos do feedback"
                count={feedback.feedbackDocuments?.length ?? 0}
                onFiles={(files, selectedType) => handleGroupFiles(index, "feedbackDocuments", files, selectedType)}
                defaultType="feedback_file"
              />
            </div>
          ))}
        </div>

        <button onClick={submitArtefact} disabled={isCreating} style={{ ...primaryBtn, marginTop: 14 }}>
          Salvar artefato com feedbacks coletivos
        </button>
      </section>

      <section style={{ marginTop: 26 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 12 }}>Artefatos cadastrados</h2>
        {isLoading ? (
          <div style={empty}>Carregando artefatos...</div>
        ) : artefacts.length === 0 ? (
          <div style={empty}>Nenhum artefato contextual cadastrado ainda.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {artefacts.map((artefact) => {
              const status = statusByArtefact[artefact.id];
              return (
                <div key={artefact.id} style={artefactCard}>
                  <div
                    style={{ flex: 1, cursor: "pointer" }}
                    onClick={() => router.push(`/artefatos/${artefact.id}`)}
                  >
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>{artefact.artefactName}</div>
                    <div style={{ color: "#888", fontSize: 13 }}>
                      {artefact.projectContext.name} · {status?.validFeedbacks ?? 0}/5 grupos válidos · {artefact.uploadedDocuments.length} doc(s)
                    </div>
                    {artefact.latestModel && (
                      <div style={{ color: "#6ee7b7", fontSize: 12, marginTop: 6 }}>
                        ✓ Modelo gerado · {artefact.latestModel.confidence}% confiança · rigor {artefact.latestModel.rigorLevel}
                      </div>
                    )}
                    {!artefact.latestModel && (status?.missingFeedbacks ?? 0) > 0 && (
                      <div style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>
                        Faltam {status?.missingFeedbacks} grupo(s) para gerar modelo · Clique para adicionar
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleGenerate(artefact.id); }}
                      disabled={isGenerating || !status?.canGenerate}
                      style={{
                        ...primaryBtn,
                        background: status?.canGenerate ? "#4f8ef7" : "#1f2937",
                        color: status?.canGenerate ? "#fff" : "#64748b",
                      }}
                      title={status?.issues.join("\n")}
                    >
                      {status?.canGenerate ? "Gerar modelo" : `${status?.validFeedbacks ?? 0}/5`}
                    </button>
                    <button
                      onClick={() => router.push(`/artefatos/${artefact.id}`)}
                      style={{ ...primaryBtn, background: "#1e293b", color: "#94a3b8", padding: "8px 12px" }}
                    >
                      Ver →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

async function filesToDocuments(files: FileList, documentType: AcademicDocumentType): Promise<UploadedDocumentInput[]> {
  return Promise.all(
    Array.from(files).map(async (file) => ({
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      documentType,
      contentBase64: await fileToBase64(file),
    }))
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Arquivo inválido."));
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.readAsDataURL(file);
  });
}

function splitLines(value: string) {
  return value.split(/\r?\n|;/).map((item) => item.trim()).filter(Boolean);
}

function updateGroup(
  index: number,
  field: keyof GroupFeedbackInput,
  value: string | number,
  setArtefactForm: React.Dispatch<React.SetStateAction<ArtefactFormState>>
) {
  setArtefactForm((current) => ({
    ...current,
    groupFeedbacks: current.groupFeedbacks.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [field]: value } : item
    ),
  }));
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: "#e2e8f0" }}>{children}</h2>;
}

function Input(props: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label style={field}>
      <span>{props.label}</span>
      <input value={props.value} placeholder={props.placeholder} onChange={(event) => props.onChange(event.target.value)} style={input} />
    </label>
  );
}

function NumberInput(props: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label style={field}>
      <span>{props.label}</span>
      <input type="number" step="0.1" value={props.value} onChange={(event) => props.onChange(Number(event.target.value))} style={input} />
    </label>
  );
}

function Textarea(props: { label: string; rows: number; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label style={field}>
      <span>{props.label}</span>
      <textarea rows={props.rows} value={props.value} placeholder={props.placeholder} onChange={(event) => props.onChange(event.target.value)} style={{ ...input, resize: "vertical" }} />
    </label>
  );
}

function Select(props: { label: string; value: string; onChange: (value: string) => void; options: Array<{ value: string; label: string }> }) {
  return (
    <label style={field}>
      <span>{props.label}</span>
      <select value={props.value} onChange={(event) => props.onChange(event.target.value)} style={input}>
        <option value="">Selecione</option>
        {props.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function DocumentPicker(props: { documentType: AcademicDocumentType; setDocumentType: (value: AcademicDocumentType) => void; onFiles: (files: FileList | null) => void }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 8 }}>
      <select value={props.documentType} onChange={(event) => props.setDocumentType(event.target.value as AcademicDocumentType)} style={input}>
        <option value="tap">TAP</option>
        <option value="wad_filled">WAD preenchido</option>
        <option value="wad_template">WAD modelo</option>
        <option value="wod">WOD</option>
        <option value="auxiliary_pdf">PDF auxiliar</option>
        <option value="markdown">Markdown</option>
        <option value="docx">DOCX</option>
        <option value="txt">TXT</option>
        <option value="artefact_photo">Foto do artefato</option>
      </select>
      <input type="file" multiple accept=".pdf,.md,.markdown,.docx,.txt,.png,.jpg,.jpeg,.webp,text/plain,application/pdf,image/*" onChange={(event) => props.onFiles(event.target.files)} style={input} />
    </div>
  );
}

function GroupFilePicker(props: {
  label: string;
  count: number;
  defaultType: "group_wad" | "feedback_file";
  onFiles: (files: FileList | null, documentType: AcademicDocumentType) => void;
}) {
  const [selectedType, setSelectedType] = useState<AcademicDocumentType>(props.defaultType);

  return (
    <label style={field}>
      <span>{props.label}</span>
      <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: 8 }}>
        <select value={selectedType} onChange={(event) => setSelectedType(event.target.value as AcademicDocumentType)} style={input}>
          {props.defaultType === "group_wad" ? (
            <>
              <option value="group_wad">WAD do grupo</option>
              <option value="artefact_photo">Foto do artefato</option>
            </>
          ) : (
            <>
              <option value="feedback_file">Arquivo feedback</option>
              <option value="feedback_photo">Foto feedback</option>
            </>
          )}
        </select>
        <input
          type="file"
          multiple
          accept=".xlsx,.xls,.csv,.pdf,.docx,.txt,.md,.png,.jpg,.jpeg,.webp,application/pdf,image/*"
          onChange={(event) => props.onFiles(event.target.files, selectedType)}
          style={input}
        />
      </div>
      {props.count > 0 && <small style={{ color: "#64748b" }}>{props.count} arquivo(s) anexado(s)</small>}
    </label>
  );
}

function DocumentPreview({ docs }: { docs: UploadedDocumentInput[] }) {
  if (docs.length === 0) return null;
  return <div style={{ color: "#64748b", fontSize: 12 }}>{docs.length} documento(s) pronto(s) para upload</div>;
}

const grid: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, alignItems: "start" };
const panel: React.CSSProperties = { background: "#141414", border: "1px solid #222", borderRadius: 10, padding: 18 };
const field: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: "#94a3b8", marginBottom: 10 };
const input: React.CSSProperties = { width: "100%", background: "#0d0d0d", border: "1px solid #262626", borderRadius: 6, padding: "9px 10px", color: "#e8e8e8", fontFamily: "inherit" };
const primaryBtn: React.CSSProperties = { padding: "9px 14px", border: 0, borderRadius: 6, background: "#4f8ef7", color: "#fff", fontWeight: 700, cursor: "pointer" };
const statusBox: React.CSSProperties = { border: "1px solid", borderRadius: 8, padding: 10, background: "#0d0d0d", display: "flex", flexDirection: "column", gap: 4, fontSize: 12 };
const groupCard: React.CSSProperties = { display: "grid", gridTemplateColumns: "120px repeat(3, 1fr) 160px 220px 220px", gap: 8, padding: 10, border: "1px solid #222", borderRadius: 8, background: "#101010", alignItems: "start" };
const empty: React.CSSProperties = { padding: 18, background: "#141414", border: "1px solid #222", borderRadius: 8, color: "#64748b" };
const artefactCard: React.CSSProperties = { display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", padding: 14, background: "#141414", border: "1px solid #222", borderRadius: 8 };
