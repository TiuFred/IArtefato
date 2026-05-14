"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Mode = "login" | "signup" | "setup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [form, setForm] = useState({ email: "", name: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (result?.error) {
      setError("Email ou senha incorretos.");
      setLoading(false);
      return;
    }

    // Verifica se é admin para redirecionar corretamente
    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();
    router.push(session?.user?.isAdmin ? "/admin" : "/base-correcao");
    router.refresh();
  }

  async function handleSetup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch("/api/auth/setup-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const payload = await response.json();

    setLoading(false);

    if (!response.ok) {
      setError(payload.error ?? "Não foi possível criar o admin.");
      return;
    }

    toast.success("Admin criado. Agora entre com email e senha.");
    setMode("login");
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const payload = await response.json();

    setLoading(false);

    if (!response.ok) {
      setError(payload.error ?? "Não foi possível criar a conta.");
      return;
    }

    toast.success("Conta criada. Agora entre com email e senha.");
    setMode("login");
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0f",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <div style={{ width: "100%", maxWidth: 380 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#4f8ef7", letterSpacing: "-1px", marginBottom: 6 }}>
            IArtefato
          </div>
          <div style={{ fontSize: 14, color: "#475569" }}>
            Inferência de padrões de correção
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: "#111118", border: "1px solid #1e1e2e",
          borderRadius: 16, padding: "32px 28px",
        }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0", marginBottom: 24 }}>
            {mode === "login"
              ? "Entrar"
              : mode === "signup"
              ? "Criar conta"
              : "Primeiro acesso admin"}
          </h1>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 18 }}>
            <ModeButton active={mode === "login"} onClick={() => setMode("login")}>
              Entrar
            </ModeButton>
            <ModeButton active={mode === "signup"} onClick={() => setMode("signup")}>
              Criar conta
            </ModeButton>
            <ModeButton active={mode === "setup"} onClick={() => setMode("setup")}>
              Criar admin
            </ModeButton>
          </div>

          <form
            onSubmit={
              mode === "login"
                ? handleSubmit
                : mode === "signup"
                ? handleSignup
                : handleSetup
            }
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            <Field
              label="Email"
              type="email"
              placeholder="seu@email.com"
              value={form.email}
              onChange={(v) => setForm((p) => ({ ...p, email: v }))}
              autoComplete="email"
            />
            {mode !== "login" && (
              <Field
                label="Nome"
                type="text"
                placeholder="Seu nome"
                value={form.name}
                onChange={(v) => setForm((p) => ({ ...p, name: v }))}
                autoComplete="name"
              />
            )}
            <Field
              label="Senha"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={(v) => setForm((p) => ({ ...p, password: v }))}
              autoComplete="current-password"
            />

            {error && (
              <div style={{
                padding: "10px 14px", background: "#1a0f0f",
                border: "1px solid #991b1b", borderRadius: 8,
                color: "#f87171", fontSize: 13,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !form.email || !form.password}
              style={{
                marginTop: 4, padding: "12px",
                background: loading || !form.email || !form.password ? "#1e1e2e" : "#4f8ef7",
                color: loading || !form.email || !form.password ? "#475569" : "#fff",
                border: "none", borderRadius: 8,
                fontWeight: 700, fontSize: 15,
                cursor: loading ? "wait" : "pointer",
                transition: "all 0.15s",
              }}
            >
              {loading
                ? "Aguarde..."
                : mode === "login"
                ? "Entrar"
                : mode === "signup"
                ? "Criar conta"
                : "Criar senha admin"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "#334155" }}>
          Contas comuns não acessam o painel admin.
        </p>
      </div>
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "8px 10px",
        borderRadius: 8,
        border: `1px solid ${active ? "#4f8ef7" : "#1e1e2e"}`,
        background: active ? "#4f8ef720" : "#0d0d15",
        color: active ? "#93c5fd" : "#64748b",
        cursor: "pointer",
        fontWeight: 700,
        fontSize: 13,
      }}
    >
      {children}
    </button>
  );
}

function Field({ label, type, placeholder, value, onChange, autoComplete }: {
  label: string; type: string; placeholder: string;
  value: string; onChange: (v: string) => void; autoComplete?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: "#94a3b8" }}>{label}</label>
      <input
        type={type} placeholder={placeholder} value={value}
        onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete}
        style={{
          background: "#0d0d15", border: "1px solid #1e1e2e",
          borderRadius: 8, padding: "10px 14px",
          color: "#e2e8f0", fontSize: 14, outline: "none",
          transition: "border-color 0.15s",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#4f8ef7")}
        onBlur={(e) => (e.target.style.borderColor = "#1e1e2e")}
      />
    </div>
  );
}
