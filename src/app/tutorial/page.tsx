"use client";

import { useState } from "react";
import Link from "next/link";

// ─── Seções do tutorial ───────────────────────────────────────────────────────
const SECTIONS = [
  { id: "para-que-serve", label: "Para que serve?", emoji: "◈" },
  { id: "primeira-correcao", label: "Sua 1ª correção", emoji: "①" },
  { id: "entendendo-resultado", label: "Entendendo o resultado", emoji: "②" },
  { id: "simulando", label: "Simulando antes de enviar", emoji: "③" },
  { id: "dicas", label: "Dicas para usar bem", emoji: "◆" },
];

// ─── Componentes de apoio ─────────────────────────────────────────────────────
function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: "#0f1a2d", border: "1px solid #1d4ed8",
      borderRadius: 10, padding: "14px 18px",
      display: "flex", gap: 12, alignItems: "flex-start", margin: "20px 0",
    }}>
      <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>💡</span>
      <span style={{ fontSize: 14, color: "#93c5fd", lineHeight: 1.7 }}>{children}</span>
    </div>
  );
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: "#1a1500", border: "1px solid #92400e",
      borderRadius: 10, padding: "14px 18px",
      display: "flex", gap: 12, alignItems: "flex-start", margin: "20px 0",
    }}>
      <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>⚠️</span>
      <span style={{ fontSize: 14, color: "#fbbf24", lineHeight: 1.7 }}>{children}</span>
    </div>
  );
}

function Good({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: "#0f1a12", border: "1px solid #065f46",
      borderRadius: 10, padding: "14px 18px",
      display: "flex", gap: 12, alignItems: "flex-start", margin: "20px 0",
    }}>
      <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>✅</span>
      <span style={{ fontSize: 14, color: "#6ee7b7", lineHeight: 1.7 }}>{children}</span>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, background: "#4f8ef7",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 700, fontSize: 15, color: "#fff", flexShrink: 0, marginTop: 2,
      }}>
        {n}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: "#e2e8f0", marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.8 }}>{children}</div>
      </div>
    </div>
  );
}

function ExampleCard({ label, text, tone }: { label: string; text: string; tone: "good" | "bad" }) {
  return (
    <div style={{
      flex: 1, padding: "14px 16px",
      background: tone === "good" ? "#0f1a12" : "#1a0f0f",
      border: `1px solid ${tone === "good" ? "#065f46" : "#991b1b"}`,
      borderRadius: 10,
    }}>
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
        color: tone === "good" ? "#34d399" : "#f87171",
        marginBottom: 8, textTransform: "uppercase",
      }}>
        {tone === "good" ? "✓ " : "✕ "}{label}
      </div>
      <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7 }}>{text}</div>
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#e2e8f0", margin: "0 0 6px" }}>{title}</h2>
      <p style={{ fontSize: 15, color: "#64748b", margin: 0, lineHeight: 1.6 }}>{subtitle}</p>
      <div style={{ height: 1, background: "#1e1e2e", marginTop: 20 }} />
    </div>
  );
}

function ResultTag({ label, value, color = "#4f8ef7" }: { label: string; value: string; color?: string }) {
  return (
    <div style={{
      padding: "10px 14px", background: "#141414",
      border: "1px solid #1e1e2e", borderRadius: 8,
    }}>
      <div style={{ fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, color, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

// ─── Conteúdo das seções ──────────────────────────────────────────────────────
function ParaQueServe() {
  return (
    <div>
      <SectionTitle
        title="Para que serve o IArtefato?"
        subtitle="Entenda o que você vai conseguir fazer aqui"
      />

      <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.9, marginBottom: 24 }}>
        Quando você entrega uma atividade para ser corrigida por IA, a correção segue regras que você não vê. O IArtefato
        aprende essas regras a partir das correções que você já recebeu — e usa esse aprendizado para prever
        como sua próxima resposta vai ser avaliada, <strong style={{ color: "#e2e8f0" }}>antes de você enviá-la</strong>.
      </p>

      {/* Fluxo visual */}
      <div style={{
        background: "#0a0a0f", border: "1px solid #1e1e2e",
        borderRadius: 12, padding: "24px 28px", marginBottom: 28,
      }}>
        <div style={{ fontSize: 12, color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20 }}>
          Como funciona na prática
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {[
            { icon: "📋", title: "Você cadastra correções reais", desc: "Cole o enunciado, sua resposta, o feedback que recebeu e a nota." },
            { icon: "🤖", title: "O sistema aprende os padrões", desc: "A IA analisa o feedback e descobre o que o avaliador valoriza e penaliza." },
            { icon: "🔮", title: "Você simula antes de enviar", desc: "Escreva sua resposta, simule e veja a nota prevista, o feedback provável e os pontos de risco." },
            { icon: "✏️", title: "Você melhora a resposta", desc: "Ajuste o que foi sinalizado e simulate novamente até chegar na nota que quer." },
          ].map((item, i, arr) => (
            <div key={i} style={{ display: "flex", gap: 0 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: "#4f8ef720", border: "1px solid #4f8ef730",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                }}>
                  {item.icon}
                </div>
                {i < arr.length - 1 && (
                  <div style={{ width: 1, height: 28, background: "#1e1e2e", margin: "4px 0" }} />
                )}
              </div>
              <div style={{ paddingLeft: 16, paddingBottom: i < arr.length - 1 ? 8 : 0, paddingTop: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#e2e8f0", marginBottom: 2 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: "#64748b" }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Tip>
        A base de dados é compartilhada — todas as correções cadastradas por outros usuários também ajudam o sistema a aprender. Quanto mais correções na base, mais precisa fica a previsão para todo mundo.
      </Tip>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 28 }}>
        {[
          { icon: "📈", title: "Prever sua nota antes de enviar", desc: "Com margem de erro cada vez menor conforme a base cresce" },
          { icon: "📝", title: "Ver o feedback provável", desc: "No mesmo estilo e tom do seu avaliador real" },
          { icon: "⚠️", title: "Identificar riscos na resposta", desc: "Pontos que provavelmente vão ser penalizados" },
          { icon: "✅", title: "Descobrir o que está faltando", desc: "Requisitos que o avaliador espera e você não incluiu" },
        ].map((item) => (
          <div key={item.title} style={{
            padding: "16px", background: "#141414",
            border: "1px solid #1e1e2e", borderRadius: 10,
          }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{item.icon}</div>
            <div style={{ fontWeight: 600, fontSize: 14, color: "#e2e8f0", marginBottom: 4 }}>{item.title}</div>
            <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PrimeiraCorrecao() {
  return (
    <div>
      <SectionTitle
        title="Cadastrando sua primeira correção"
        subtitle="Leva menos de 2 minutos — você só precisa de uma correção que já recebeu"
      />

      <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.8, marginBottom: 24 }}>
        O IArtefato aprende com as correções que você já recebeu. Então o primeiro passo é cadastrar pelo menos uma.
        Quanto mais você cadastrar, mais precisa fica a previsão.
      </p>

      <Step n={1} title="Abra a Base de Correção">
        Clique em <strong style={{ color: "#e2e8f0" }}>Base de Correção</strong> no menu, depois clique em{" "}
        <span style={{
          display: "inline-block", padding: "2px 10px",
          background: "#4f8ef7", borderRadius: 5, fontSize: 12,
          color: "#fff", fontWeight: 600,
        }}>
          + Adicionar correção
        </span>
      </Step>

      <Step n={2} title="Cole a descrição da atividade">
        Copie o enunciado da atividade exatamente como foi apresentado pelo avaliador. Não precisa resumir — cole tudo.
      </Step>

      <Step n={3} title="Cole sua resposta">
        Cole a resposta que você enviou naquela atividade.
      </Step>

      <Step n={4} title="Cole o feedback recebido">
        Esse é o campo mais importante. Cole o feedback completo que o avaliador te retornou.{" "}
        <strong style={{ color: "#e2e8f0" }}>Não resuma, não parafraseie — cole o texto original.</strong>
      </Step>

      <Step n={5} title="Informe a nota">
        Digite a nota que você recebeu e a nota máxima da atividade (ex: 7.5 de 10).
      </Step>

      <Step n={6} title="Envie">
        Clique em enviar. O sistema analisa o feedback em alguns segundos e salva os padrões detectados.
      </Step>

      <Warning>
        O feedback é o coração do aprendizado. Um feedback vago como &quot;bom trabalho, mas faltou mais profundidade&quot;
        vai gerar uma análise fraca. Um feedback detalhado com critérios e comentários específicos vai gerar
        uma análise muito mais útil para suas simulações futuras.
      </Warning>

      <h3 style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0", marginTop: 28, marginBottom: 16 }}>
        Exemplos de feedback
      </h3>
      <div style={{ display: "flex", gap: 12 }}>
        <ExampleCard
          label="Pouco útil"
          tone="bad"
          text={`"Bom trabalho. Pontos interessantes, mas a resposta poderia ser mais completa. Nota: 6.5"`}
        />
        <ExampleCard
          label="Muito útil"
          tone="good"
          text={`"A argumentação central está correta, mas faltou embasamento teórico (critério com peso 30%). A estrutura ficou fragmentada — use tópicos. Penalizado por ausência de exemplos práticos (-1.5pt). Nota: 6.5/10"`}
        />
      </div>
    </div>
  );
}

function EntendendoResultado() {
  return (
    <div>
      <SectionTitle
        title="O que aparece depois de cadastrar"
        subtitle="Veja o que o sistema detectou no feedback do seu avaliador"
      />

      <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.8, marginBottom: 24 }}>
        Depois de salvar uma correção, clique nela na lista lateral para ver a análise completa.
        Veja o que cada parte significa:
      </p>

      {[
        {
          title: "📊 Critérios detectados",
          desc: "O que o avaliador parece valorizar na correção, com o peso de cada critério.",
          example: (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { name: "Argumentação teórica", weight: "40%", conf: "Alta" },
                { name: "Clareza e estrutura", weight: "35%", conf: "Alta" },
                { name: "Exemplos práticos", weight: "25%", conf: "Média" },
              ].map((c) => (
                <div key={c.name} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 12px", background: "#0a0a0f", borderRadius: 7,
                }}>
                  <div style={{ flex: 1, fontSize: 13, color: "#e2e8f0" }}>{c.name}</div>
                  <span style={{
                    padding: "2px 8px", background: "#4f8ef720", borderRadius: 4,
                    fontSize: 12, color: "#4f8ef7", fontWeight: 600,
                  }}>
                    {c.weight}
                  </span>
                  <span style={{ fontSize: 12, color: "#64748b" }}>{c.conf} confiança</span>
                </div>
              ))}
            </div>
          ),
          tip: "O peso mostra o quanto cada critério impacta a nota final. Foque nos critérios de maior peso.",
        },
        {
          title: "⛔ Penalizações detectadas",
          desc: "O que o avaliador costuma descontar pontos e quanto cada erro custa.",
          example: (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { name: "Ausência de exemplos práticos", deduction: "-1.5pt", severity: "high", color: "#f87171" },
                { name: "Estrutura fragmentada", deduction: "-0.5pt", severity: "medium", color: "#fbbf24" },
              ].map((p) => (
                <div key={p.name} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 12px", background: "#0a0a0f", borderRadius: 7,
                }}>
                  <div style={{ flex: 1, fontSize: 13, color: "#e2e8f0" }}>{p.name}</div>
                  <span style={{ fontSize: 13, color: p.color, fontWeight: 600 }}>{p.deduction}</span>
                </div>
              ))}
            </div>
          ),
          tip: "Evite os erros penalizados — cada ponto que você não perde já é um ganho.",
        },
        {
          title: "🎨 Estilo do avaliador",
          desc: "O tom e o foco que esse avaliador costuma usar.",
          example: (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              <ResultTag label="Tom" value="Rigoroso" color="#f87171" />
              <ResultTag label="Foco" value="Técnico" color="#a5b4fc" />
              <ResultTag label="Detalhe" value="Detalhado" color="#34d399" />
            </div>
          ),
          tip: "Se o avaliador é técnico e rigoroso, suas respostas precisam de precisão — não basta uma ideia certa, precisa estar bem fundamentada.",
        },
      ].map((block) => (
        <div key={block.title} style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0", marginBottom: 8 }}>{block.title}</h3>
          <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 12 }}>{block.desc}</p>
          <div style={{
            padding: "16px", background: "#141414",
            border: "1px solid #1e1e2e", borderRadius: 10, marginBottom: 10,
          }}>
            {block.example}
          </div>
          <Tip>{block.tip}</Tip>
        </div>
      ))}
    </div>
  );
}

function Simulando() {
  return (
    <div>
      <SectionTitle
        title="Simulando antes de enviar"
        subtitle="Veja como o avaliador vai corrigir sua resposta — antes de enviá-la de verdade"
      />

      <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.8, marginBottom: 24 }}>
        Esta é a parte mais poderosa do sistema. Com correções cadastradas na base, você consegue prever
        como sua resposta vai ser avaliada e fazer ajustes antes de submeter.
      </p>

      <Step n={1} title="Abra Simular Avaliação">
        Clique em <strong style={{ color: "#e2e8f0" }}>Simular Avaliação</strong> no menu.
      </Step>

      <Step n={2} title="Cole o enunciado da nova atividade">
        Copie a descrição da atividade que você vai responder.
      </Step>

      <Step n={3} title="Cole sua resposta atual">
        Cole a resposta que você <em>pretende enviar</em> — o rascunho que você quer testar.
      </Step>

      <Step n={4} title="Clique em Simular Avaliação">
        O sistema vai analisar em alguns segundos e trazer o resultado.
      </Step>

      <h3 style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0", marginTop: 32, marginBottom: 16 }}>
        O que você vai ver no resultado
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {[
          {
            icon: "🎯",
            title: "Nota prevista",
            desc: "Uma estimativa da nota que você provavelmente vai receber. Quanto mais correções similares estiverem na base, mais precisa é essa estimativa.",
            highlight: "8.5 / 10",
            highlightColor: "#4f8ef7",
          },
          {
            icon: "📝",
            title: "Feedback provável",
            desc: "Um rascunho do que o avaliador provavelmente vai escrever como feedback — no mesmo estilo e tom que ele usa.",
            highlight: null,
          },
          {
            icon: "❌",
            title: "Requisitos faltantes",
            desc: "O que está ausente na sua resposta e que o avaliador espera encontrar. Cada item mostra o impacto estimado na nota.",
            highlight: "− 1.5pt: faltou embasamento teórico",
            highlightColor: "#f87171",
          },
          {
            icon: "⚠️",
            title: "Áreas de risco",
            desc: "Partes da sua resposta que provavelmente vão ser penalizadas, com o nível de risco (alto, médio, baixo) e uma sugestão de como melhorar.",
            highlight: null,
          },
        ].map((item) => (
          <div key={item.title} style={{
            padding: "16px 18px", background: "#141414",
            border: "1px solid #1e1e2e", borderRadius: 10,
            display: "flex", gap: 14,
          }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#e2e8f0", marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{item.desc}</div>
              {item.highlight && (
                <div style={{
                  marginTop: 8, padding: "4px 10px", display: "inline-block",
                  background: (item.highlightColor || "#4f8ef7") + "20",
                  border: `1px solid ${(item.highlightColor || "#4f8ef7")}40`,
                  borderRadius: 6, fontSize: 12, fontWeight: 600,
                  color: item.highlightColor || "#4f8ef7",
                }}>
                  {item.highlight}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0", marginTop: 32, marginBottom: 12 }}>
        O ciclo ideal de uso
      </h3>
      <div style={{ position: "relative" }}>
        {["Escrever a resposta", "Simular", "Ver o que falta", "Melhorar a resposta", "Simular de novo", "Enviar 🚀"].map((step, i, arr) => (
          <div key={step} style={{ display: "flex", gap: 14, marginBottom: i < arr.length - 1 ? 0 : 0 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: i === arr.length - 1 ? "#065f46" : "#1e1e2e",
                border: `1px solid ${i === arr.length - 1 ? "#059669" : "#333"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, color: i === arr.length - 1 ? "#34d399" : "#64748b",
                fontWeight: 600, flexShrink: 0,
              }}>
                {i + 1}
              </div>
              {i < arr.length - 1 && (
                <div style={{ width: 1, height: 24, background: "#1e1e2e" }} />
              )}
            </div>
            <div style={{
              fontSize: 14, color: i === arr.length - 1 ? "#34d399" : "#94a3b8",
              fontWeight: i === arr.length - 1 ? 600 : 400,
              paddingTop: 7, paddingBottom: i < arr.length - 1 ? 8 : 0,
            }}>
              {step}
            </div>
          </div>
        ))}
      </div>

      <Good>
        Você pode simular quantas vezes quiser. Melhore a resposta com base no resultado e simule novamente até
        atingir a nota que quer — ou até os riscos diminuírem.
      </Good>
    </div>
  );
}

function Dicas() {
  return (
    <div>
      <SectionTitle
        title="Dicas para usar bem"
        subtitle="Como extrair o máximo do sistema"
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        <div style={{ padding: "20px", background: "#141414", border: "1px solid #1e1e2e", borderRadius: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#e2e8f0", marginBottom: 8 }}>
            🎓 Cadastre correções variadas
          </div>
          <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.7, margin: 0 }}>
            Correções de atividades diferentes, com notas diferentes (boas e ruins), ajudam o sistema a entender
            melhor o perfil completo do avaliador. Não cadastre só as correções ruins — as boas também ensinam
            o que o avaliador valoriza.
          </p>
        </div>

        <div style={{ padding: "20px", background: "#141414", border: "1px solid #1e1e2e", borderRadius: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#e2e8f0", marginBottom: 8 }}>
            ⚡ Cadastre logo após receber a correção
          </div>
          <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.7, margin: 0 }}>
            O melhor momento para cadastrar é quando você acabou de receber o feedback. Você ainda lembra do
            contexto e tem o texto original na mão. Esperar pode fazer você perder a correção ou esquecer detalhes.
          </p>
        </div>

        <div style={{ padding: "20px", background: "#141414", border: "1px solid #1e1e2e", borderRadius: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#e2e8f0", marginBottom: 8 }}>
            🔍 A base é compartilhada — isso é bom para você
          </div>
          <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.7, margin: "0 0 10px" }}>
            Quando outras pessoas cadastram correções do mesmo avaliador que você tem, suas simulações ficam
            mais precisas automaticamente. Quanto mais pessoas usam, melhor fica para todos.
          </p>
          <Tip>Se você tiver colegas que usam o mesmo avaliador, incentive-os a cadastrar as correções deles também.</Tip>
        </div>

        <div style={{ padding: "20px", background: "#141414", border: "1px solid #1e1e2e", borderRadius: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#e2e8f0", marginBottom: 8 }}>
            📉 Confiança baixa? Sem pânico.
          </div>
          <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.7, margin: 0 }}>
            Se a simulação mostrar uma confiança abaixo de 50%, significa que a base ainda tem poucas correções
            similares para comparar. Nesse caso, use o resultado como uma orientação geral — não como uma previsão
            exata. A precisão melhora conforme mais correções são cadastradas.
          </p>
        </div>

        <div style={{ padding: "20px", background: "#141414", border: "1px solid #1e1e2e", borderRadius: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#e2e8f0", marginBottom: 8 }}>
            🚫 O que o sistema não faz
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
            {[
              "Não acessa o avaliador real — tudo é baseado nos feedbacks que você cadastrou",
              "Não garante a nota exata — é uma previsão, não uma certeza",
              "Não substitui estudar o conteúdo da atividade",
              "Não funciona bem se você tiver menos de 2–3 correções do mesmo avaliador cadastradas",
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ color: "#f87171", flexShrink: 0, marginTop: 1 }}>✕</span>
                <span style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* CTA final */}
      <div style={{
        marginTop: 36, padding: "28px 24px", textAlign: "center",
        background: "linear-gradient(135deg, #4f8ef710, #8b5cf610)",
        border: "1px solid #4f8ef720", borderRadius: 14,
      }}>
        <div style={{ fontSize: 22, marginBottom: 10 }}>🚀</div>
        <div style={{ fontWeight: 700, fontSize: 18, color: "#e2e8f0", marginBottom: 8 }}>
          Pronto para começar?
        </div>
        <p style={{ fontSize: 14, color: "#64748b", marginBottom: 20 }}>
          Cadastre sua primeira correção e deixe o sistema aprender com ela.
        </p>
        <Link
          href="/base-correcao"
          style={{
            display: "inline-block", padding: "10px 24px",
            background: "#4f8ef7", borderRadius: 8,
            color: "#fff", fontWeight: 600, fontSize: 14,
            textDecoration: "none",
          }}
        >
          + Adicionar minha primeira correção
        </Link>
      </div>
    </div>
  );
}

// ─── Mapa de conteúdo ─────────────────────────────────────────────────────────
const CONTENT: Record<string, React.ReactNode> = {
  "para-que-serve": <ParaQueServe />,
  "primeira-correcao": <PrimeiraCorrecao />,
  "entendendo-resultado": <EntendendoResultado />,
  "simulando": <Simulando />,
  "dicas": <Dicas />,
};

// ─── Página ───────────────────────────────────────────────────────────────────
export default function TutorialPage() {
  const [activeId, setActiveId] = useState(SECTIONS[0].id);
  const activeIdx = SECTIONS.findIndex((s) => s.id === activeId);

  return (
    <div style={{
      display: "flex", gap: 0, marginTop: -36,
      minHeight: "calc(100vh - 52px)",
    }}>

      {/* Sidebar */}
      <aside style={{
        width: 220, flexShrink: 0, borderRight: "1px solid #1e1e2e",
        padding: "28px 0", position: "sticky", top: 52,
        height: "calc(100vh - 52px)", overflowY: "auto",
        background: "#0a0a0f",
      }}>
        <div style={{
          padding: "0 16px 14px",
          fontSize: 11, fontWeight: 700, color: "#475569",
          textTransform: "uppercase", letterSpacing: "0.1em",
        }}>
          Como usar
        </div>

        {SECTIONS.map((section, i) => {
          const isActive = section.id === activeId;
          const isDone = i < activeIdx;
          return (
            <button
              key={section.id}
              onClick={() => setActiveId(section.id)}
              style={{
                width: "100%", textAlign: "left", border: "none",
                cursor: "pointer", padding: "9px 16px",
                background: isActive ? "#4f8ef710" : "transparent",
                display: "flex", alignItems: "center", gap: 10,
                position: "relative", transition: "all 0.15s",
              }}
            >
              {isActive && (
                <div style={{
                  position: "absolute", left: 0, top: "50%",
                  transform: "translateY(-50%)", width: 2, height: 18,
                  background: "#4f8ef7", borderRadius: 2,
                }} />
              )}
              <div style={{
                width: 26, height: 26, borderRadius: 6, flexShrink: 0,
                background: isDone ? "#065f4640" : isActive ? "#4f8ef720" : "#1e1e2e",
                border: `1px solid ${isDone ? "#059669" : isActive ? "#4f8ef740" : "#2e2e3e"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: isDone ? 12 : 13,
                color: isDone ? "#34d399" : isActive ? "#4f8ef7" : "#475569",
              }}>
                {isDone ? "✓" : section.emoji}
              </div>
              <span style={{
                fontSize: 13, lineHeight: 1.3,
                color: isActive ? "#4f8ef7" : isDone ? "#64748b" : "#94a3b8",
                fontWeight: isActive ? 600 : 400,
              }}>
                {section.label}
              </span>
            </button>
          );
        })}

        {/* Progresso */}
        <div style={{ margin: "20px 16px 0", padding: "14px", background: "#141414", border: "1px solid #1e1e2e", borderRadius: 10 }}>
          <div style={{ fontSize: 11, color: "#475569", marginBottom: 8 }}>Progresso</div>
          <div style={{ height: 4, background: "#1e1e2e", borderRadius: 4, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 4, background: "#4f8ef7",
              width: `${((activeIdx + 1) / SECTIONS.length) * 100}%`,
              transition: "width 0.3s ease",
            }} />
          </div>
          <div style={{ fontSize: 11, color: "#475569", marginTop: 6, textAlign: "right" }}>
            {activeIdx + 1} de {SECTIONS.length}
          </div>
        </div>
      </aside>

      {/* Conteúdo */}
      <main style={{ flex: 1, padding: "36px 48px", maxWidth: 740, overflowY: "auto" }}>
        {CONTENT[activeId]}

        {/* Navegação */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          marginTop: 48, paddingTop: 20, borderTop: "1px solid #1e1e2e",
        }}>
          <div>
            {activeIdx > 0 && (
              <button
                onClick={() => setActiveId(SECTIONS[activeIdx - 1].id)}
                style={{
                  background: "none", border: "1px solid #1e1e2e", borderRadius: 8,
                  padding: "8px 16px", cursor: "pointer", color: "#94a3b8",
                  fontSize: 13, transition: "all 0.15s",
                }}
              >
                ← {SECTIONS[activeIdx - 1].label}
              </button>
            )}
          </div>
          <div>
            {activeIdx < SECTIONS.length - 1 && (
              <button
                onClick={() => setActiveId(SECTIONS[activeIdx + 1].id)}
                style={{
                  background: "#4f8ef7", border: "none", borderRadius: 8,
                  padding: "8px 16px", cursor: "pointer", color: "#fff",
                  fontSize: 13, fontWeight: 600, transition: "all 0.15s",
                }}
              >
                {SECTIONS[activeIdx + 1].label} →
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
