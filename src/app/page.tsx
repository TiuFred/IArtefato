import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>
        IArtefato
      </h1>
      <p style={{ color: "#888", fontSize: 16, marginBottom: 40, maxWidth: 520 }}>
        Infere os padrões do prompt oculto que os professores usam para corrigir
        atividades com IA — e simula como sua próxima entrega será avaliada.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 400 }}>
        <Link href="/base-correcao" style={cardStyle}>
          <strong>Base de Correção</strong>
          <span style={{ color: "#888", fontSize: 13 }}>
            Adicione atividades já corrigidas para o sistema aprender
          </span>
        </Link>

        <Link href="/simular" style={cardStyle}>
          <strong>Simular Avaliação</strong>
          <span style={{ color: "#888", fontSize: 13 }}>
            Preveja a nota e feedback antes de enviar
          </span>
        </Link>

        <Link href="/artefatos" style={cardStyle}>
          <strong>Modelos por Artefato</strong>
          <span style={{ color: "#888", fontSize: 13 }}>
            Use TAP, WAD/WOD e feedbacks de grupos para modelar um artefato específico
          </span>
        </Link>

        <Link href="/dashboard" style={cardStyle}>
          <strong>Dashboard</strong>
          <span style={{ color: "#888", fontSize: 13 }}>
            Veja o resumo da base de inferência
          </span>
        </Link>
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  padding: "16px 20px",
  background: "#141414",
  border: "1px solid #222",
  borderRadius: 8,
  cursor: "pointer",
};
