/**
 * Seed script — 1AMD2 Módulo 2 Inteli
 * Cria ProjectContext (TAPI) + ArtefactContext (WAD) no banco.
 *
 * Execute com:
 *   npx tsx scripts/seed-1amd2.ts
 *
 * Pré-requisito:
 *   DATABASE_URL no ambiente (.env ou variável de shell)
 *   Migrations v1, v2 e v3 já executadas no Supabase
 *   npx prisma generate já executado
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TAPI_TEXT = `PROJETO PARCEIRO
1AMD2 - Aplicação Web

PROJETO: Desenvolvimento de uma aplicação Web para criação, publicação, aplicação e correção de provas de modo remoto
EMPRESA: Instituto Ponte

BREVE DESCRIÇÃO EMPRESA / MINI BIO:
O Instituto Ponte é uma OSCIP (Organização da Sociedade Civil de Interesse Público) fundada em setembro de 2014,
que hoje atende 440 estudantes de 18 estados do Brasil com o propósito de ser a Ponte para a ascensão social em
uma geração, por meio da educação de qualidade, para jovens em vulnerabilidade social.

OVERVIEW
- PRINCIPAL ÁREA DE NEGÓCIO: Educação
- LÍDER DO PROJETO / PONTO FOCAL: Verônica Caricati (Gerente Educacional)
- PONTO FOCAL BACKUP: Pedro Cavalcante (Analista de Dados)

ESBOÇO DO PROJETO
- PROBLEMA: Desequilíbrio entre acessibilidade, estabilidade e funcionalidade em avaliações remotas.
- OBJETIVO: Desenvolver uma aplicação web para gestão de avaliações remotas, contemplando a inserção nativa
  de equações, gerenciamento de uploads de arquivos de resolução e ferramenta de correção distribuída por itens
  da avaliação.
- BENEFÍCIOS ESPERADOS PARA O PARCEIRO: Democratização do acesso às provas (acessibilidade universal);
  redução da carga operacional dos professores (fim do recebimento de provas via WhatsApp); maior justiça
  avaliativa através da correção por item; e aumento da integridade dos dados (fim da perda de anexos).

DESCRIÇÃO CURTA DO PROJETO:
Plataforma web acessível para avaliações remotas com upload robusto e correção isonômica.

ESCOPO MACRO
Para o Aluno: Interface para visualização de questões com suporte a fórmulas (MathType/LaTeX), respostas
objetivas e discursivas e sistema de upload de múltiplas imagens por questão.
Para o Professor: Painel de criação de provas e, crucialmente, uma interface de correção onde o sistema agrupa
todas as respostas da "Questão 1", depois "Questão 2", de todos os alunos, permitindo foco e isonomia.

MVP
- Desenvolvimento de uma aplicação web (Node.js/SQLite) que permita:
- Criação de prova com ao menos um campo de texto e um campo de upload.
- Interface do aluno para submissão de prova com suporte a upload de imagens e arquivos.
- Painel de visualização de respostas para o professor, permitindo navegar pelas questões individualmente.

DEMAIS ENTREGÁVEIS
- Integração nativa de renderização de equações matemáticas (Ex: MathJax ou KaTeX).
- Ferramenta de compressão de imagens no Client-Side (para otimizar uploads sem perder legibilidade).
- Gerador de relatórios de desempenho por questão e por aluno.

RESTRIÇÕES / O PROJETO NÃO CONTEMPLA
- Autenticação: Não haverá sistema de login/senha (o acesso será via links únicos ou identificação simples).
- APIs Externas: Não haverá integração com WebAPIs externas.
- Proctoring: Não contempla bloqueio de navegador ou monitoramento por câmera.

STAKEHOLDERS
- Gerência Educacional: Interessados na padronização da correção.
- Corpo Docente (Matemática/Português): Principais usuários e validadores das funções.
- Núcleo de Experiência do Aluno: Garantes da acessibilidade e inclusão digital.`;

const WAD_TEMPLATE = `# WAD - Web Application Document - Módulo 2 - Inteli

## Nome do Grupo
#### Nomes dos integrantes do grupo

## Sumário
1. Introdução
2. Visão Geral da Aplicação Web
3. Projeto Técnico da Aplicação Web
4. Desenvolvimento da Aplicação Web
5. Testes da Aplicação Web
6. Estudo de Mercado e Plano de Marketing
7. Conclusões e trabalhos futuros
8. Referências

---

# 1. Introdução (sprints 1 a 5)
Contextualize aqui a problemática trazida pelo parceiro de projeto.
Descreva brevemente a solução desenvolvida (até 300 palavras).

# 2. Visão Geral da Aplicação Web (sprint 1)

## 2.1. Escopo do Projeto
### 2.1.1. Modelo de 5 Forças de Porter (sprint 1) — até 400 palavras
### 2.1.2. Análise SWOT da Instituição Parceira (sprint 1) — até 100 palavras
### 2.1.3. Solução (sprints 1 a 5) — 6 itens de até 60 palavras cada:
1. Problema a ser resolvido
2. Dados disponíveis
3. Solução proposta
4. Forma de utilização
5. Benefícios esperados
6. Critério de sucesso

### 2.1.4. Value Proposition Canvas (sprint 1)
### 2.1.5. Matriz de Riscos do Projeto (sprint 1)

## 2.2. Personas (sprint 1)
## 2.3. User Stories (sprints 1 a 5)
Template: "como [papel], posso [ação], para [benefício]"
Inclua critérios de aceite e análise INVEST das 5 prioritárias.

# 3. Projeto da Aplicação Web

## 3.1. Requisitos do Sistema
### 3.1.1. Requisitos Funcionais — tabela RF | Descrição | Prioridade | Status
### 3.1.2. Regras de Negócio — tabela RN | Descrição | RF associado
### 3.1.3. Requisitos Não Funcionais — 8 Eixos ISO/IEC 25010:
USAB, CONF, DES, SUP, SEG, CAP, REST, ORG
### 3.1.4. Matriz RF → RN → Endpoint

## 3.2. Arquitetura
### 3.2.1. Diagrama de Arquitetura (camadas Controller/Service/Repository/Model)
### 3.2.2. Diagrama de Casos de Uso
### 3.2.3. Diagrama de Classes do Domínio (com multiplicidades)
### 3.2.4. Diagrama de Sequência UML (fluxo Controller→Service→Repository→Banco)
### 3.2.5. Diagrama de Atividades ou Estados
### 3.2.6. Diagrama de Implantação
### 3.2.7. Padrões de Projeto Aplicados (Repository, Strategy, Factory, SOLID)

## 3.3. Wireframes (sprint 2)
## 3.4. Guia de estilos (sprint 3) — Cores, Tipografia, Iconografia
## 3.5. Protótipo de alta fidelidade (sprint 3)
## 3.6. Modelagem do banco de dados
### 3.6.1. Modelo ER
### 3.6.2. DER (com cardinalidades e PK/FK)
### 3.6.3. Modelo Relacional e Físico (migrations DDL)
### 3.6.4. Consultas SQL e lógica proposicional

## 3.7. WebAPI e endpoints (métodos, headers, body, status codes)
## 3.8. Autenticação, Autorização e Resiliência (sprint 5)

# 4. Desenvolvimento da Aplicação Web
## 4.1. Primeira versão (sprint 3) — o que foi feito, o que faltou, dificuldades
## 4.2. Segunda versão (sprint 4)
## 4.3. Versão final (sprint 5)

# 5. Testes
## 5.1. Testes de integração automatizados — White-box (Jest unitário) + Black-box (Supertest)
## 5.2. Testes de usabilidade
### 5.2.1. Guerrilha
### 5.2.2. SUS (System Usability Scale)

# 6. Estudo de Mercado e Plano de Marketing (sprint 4)
## 6.1. Resumo Executivo (300 palavras)
## 6.2. Análise de Mercado (visão geral, tamanho, tendências)
## 6.3. Análise da Concorrência
## 6.4. Público-Alvo (segmentação + perfil)
## 6.5. Posicionamento (proposta de valor + diferenciação)
## 6.6. Estratégia de Marketing (produto, preço, praça, promoção)

# 7. Conclusões e trabalhos futuros (sprint 5)
# 8. Referências`;

async function main() {
  console.log("🌱 Iniciando seed 1AMD2...");

  // Idempotent check
  const existing = await prisma.projectContext.findFirst({
    where: { name: "1AMD2 - Aplicação Web" },
  });

  if (existing) {
    console.log("✅ ProjectContext '1AMD2 - Aplicação Web' já existe. Pulando.");
    const artefact = await prisma.artefactContext.findFirst({
      where: { projectContextId: existing.id, artefactName: "WAD" },
    });
    if (!artefact) {
      await createWadArtefact(existing.id);
    } else {
      console.log("✅ ArtefactContext 'WAD' já existe. Seed completo.");
    }
    return;
  }

  // Create ProjectContext
  const project = await prisma.projectContext.create({
    data: {
      name: "1AMD2 - Aplicação Web",
      discipline: "Aplicação Web",
      description: "Projeto parceiro com Instituto Ponte — desenvolvimento de plataforma web para gestão de avaliações remotas com upload e correção isonômica.",
      tapText: TAPI_TEXT,
      uploadedDocuments: {
        create: {
          fileName: "TAPI.pdf",
          mimeType: "application/pdf",
          documentType: "tap",
          textContent: TAPI_TEXT,
          preview: TAPI_TEXT.substring(0, 300),
        },
      },
    },
  });
  console.log(`✅ ProjectContext criado: ${project.id}`);

  await createWadArtefact(project.id);
  console.log("🎉 Seed concluído!");
}

async function createWadArtefact(projectContextId: string) {
  const artefact = await prisma.artefactContext.create({
    data: {
      artefactName: "WAD",
      projectContextId,
      description: "Web Application Document — documento principal de entrega do módulo 2. Abrange escopo, requisitos, arquitetura, desenvolvimento, testes e plano de marketing.",
      wadText: WAD_TEMPLATE,
      wodText: "",
      expectedStructure: "Sumário completo (seções 1–8), Requisitos Funcionais em tabela (RF), Regras de Negócio (RN), 8 eixos ISO 25010, Diagramas UML (Classes, Sequência, Implantação), DER com cardinalidades, Endpoints documentados, Testes automatizados (Jest), Testes de usabilidade (Guerrilha + SUS), Estudo de Mercado (seções 6.1–6.6).",
      explicitRequirements: [
        "Modelo de 5 Forças de Porter (sprint 1)",
        "Análise SWOT da instituição parceira (sprint 1)",
        "Value Proposition Canvas (sprint 1)",
        "Matriz de Riscos (sprint 1)",
        "User Stories com critérios de aceite e análise INVEST (sprints 1 a 5)",
        "Requisitos Funcionais em tabela (RF com prioridade e status)",
        "Regras de Negócio em tabela (RN com RF associado)",
        "8 eixos ISO/IEC 25010 preenchidos com métrica mensurável",
        "Matriz RF → RN → Endpoint",
        "Diagrama de Arquitetura com camadas",
        "Diagrama de Casos de Uso (notação UML correta)",
        "Diagrama de Classes com multiplicidades e tipos de relação",
        "Diagrama de Sequência (Controller→Service→Repository→Banco)",
        "Diagrama de Atividades ou Estados",
        "Diagrama de Implantação UML",
        "Padrões de projeto documentados com justificativa",
        "Wireframes (sprint 2)",
        "Guia de estilos com cores, tipografia e iconografia",
        "Protótipo de alta fidelidade (sprint 3)",
        "Modelo ER conceitual",
        "DER com cardinalidades e PK/FK",
        "Migrations DDL numeradas e reproduzíveis",
        "Consultas SQL com lógica proposicional e tabela verdade",
        "Documentação de endpoints (método, header, body, status codes)",
        "Autenticação com hash bcrypt (parâmetros explícitos)",
        "Controle de sessão com expiração",
        "Autorização por perfil verificada no backend",
        "Estratégias de resiliência (timeout, retry, circuit breaker)",
        "Matriz de Rastreabilidade (RTM completa)",
        "Testes automatizados: White-box (Jest unitário) e Black-box (Supertest)",
        "Relatório de cobertura de testes",
        "Testes de guerrilha com tabela de tarefas e resultados",
        "Testes SUS (System Usability Scale)",
        "Estudo de Mercado: resumo executivo, análise, concorrência, público, posicionamento, marketing",
        "Conclusões e trabalhos futuros",
        "Referências no formato ABNT",
      ],
      implicitRequirements: [
        "Consistência entre DER, Diagrama de Classes e código",
        "Multiplicidades explícitas em toda associação UML",
        "Senhas nunca em texto plano no banco",
        "Frontend nunca é fonte de verdade para autorização",
        "Toda RN deve ter ao menos um teste automatizado a partir da sprint 3",
        "Sem lacunas nos fluxos centrais da RTM a partir da sprint 3",
        "Diagramas usando notação consistente (não misturar convenções)",
        "Atualização das seções evolutivas a cada sprint (User Stories, Requisitos, Arquitetura)",
      ],
      deliverables: [
        "WAD.md completo e atualizado até sprint 5",
        "Código-fonte da aplicação web (repositório GitHub)",
        "Suite de testes Jest com relatório de cobertura",
        "Relatório de testes de usabilidade (Guerrilha + SUS)",
        "Apresentação final",
      ],
      uploadedDocuments: {
        create: {
          fileName: "wad.md",
          mimeType: "text/markdown",
          documentType: "wad_template",
          textContent: WAD_TEMPLATE,
          preview: WAD_TEMPLATE.substring(0, 300),
        },
      },
    },
  });
  console.log(`✅ ArtefactContext 'WAD' criado: ${artefact.id}`);
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
