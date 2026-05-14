export default function AguardandoGrupoPage() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#0d0d0d", padding: 24,
    }}>
      <div style={{ textAlign: "center", maxWidth: 420 }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>⏳</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#e8e8e8", marginBottom: 12 }}>
          Aguardando alocação de grupo
        </h1>
        <p style={{ color: "#64748b", lineHeight: 1.7, marginBottom: 28 }}>
          Sua conta foi criada com sucesso. Para acessar a plataforma, você precisa ser
          alocado em um grupo pelo administrador.
        </p>
        <p style={{ color: "#475569", fontSize: 13 }}>
          Entre em contato com seu professor para ser adicionado a um grupo.
        </p>
      </div>
    </div>
  );
}
