// Dados dos 4 espaços — sem banco de dados. Editar contato/orientações é
// editar este arquivo e fazer um novo deploy (git push). Como esses dados
// mudam raramente, isso é mais simples do que manter uma conta de banco só
// pra 4 linhas de cadastro.
//
// Pra atualizar: troque o valor, salve, e rode:
//   git add lib/espacos-data.ts && git commit -m "Atualiza contato do X" && git push
// O Vercel redeploya sozinho a partir do push.

import type { Espaco } from "./types";

export const ESPACOS: Record<string, Espaco> = {
  DA: {
    id: "da",
    sigla: "DA",
    nome: "Diretório Acadêmico de TO (DATO)",
    funcao:
      "Representa os alunos, media diálogo institucional e acompanha reivindicações e direitos estudantis.",
    atende: [
      "problemas com professores",
      "notas lançadas incorretamente",
      "reivindicações coletivas",
      "dúvidas sobre direitos",
    ],
    nao_atende: ["organização de festas e eventos de integração", "divulgação de pesquisas"],
    responsaveis: ["[preencher]"],
    instagram: "https://instagram.com/da.to.exemplo",
    whatsapp: "[preencher]",
    email: "da.to@exemplo.edu.br",
    localizacao: "[preencher]",
    horario: "[preencher]",
    links: [],
    orientacoes:
      "Descreva a situação com o máximo de detalhes possível: data, disciplina e se outros alunos foram afetados.",
    atualizado_em: "2026-08-28",
  },
  TOCA: {
    id: "toca",
    sigla: "TOCA",
    nome: "TOCA — Terapia Ocupacional & Atlética",
    funcao:
      "Organiza integração, lazer, cultura, esporte, festas, passeios, gincanas e campeonatos entre os estudantes.",
    atende: [
      "festas",
      "campeonatos",
      "passeios",
      "gincanas",
      "propostas de evento",
      "divulgação de produtos de alunos",
    ],
    nao_atende: ["questões acadêmicas", "reivindicações institucionais"],
    responsaveis: ["[preencher]"],
    instagram: "https://instagram.com/toca.exemplo",
    whatsapp: "[preencher]",
    email: "toca@exemplo.edu.br",
    localizacao: "[preencher]",
    horario: "[preencher]",
    links: [],
    orientacoes: "Traga sua ideia com uma data aproximada em mente — ajuda a encaixar no calendário de eventos.",
    atualizado_em: "2026-08-28",
  },
  PERFIL_TO: {
    id: "perfil_to",
    sigla: "PERFIL_TO",
    nome: "Perfil de TO",
    funcao:
      "Divulga pesquisas, extensão, eventos oficiais do curso, conquistas e projetos ligados à profissão. Administrado pela mesma equipe da Coordenação — por isso o contato de e-mail e WhatsApp é o mesmo.",
    atende: ["divulgar pesquisa", "divulgar conquista", "divulgar projeto de extensão"],
    nao_atende: ["eventos de integração", "reivindicações"],
    responsaveis: ["[preencher — mesma equipe da Coordenação]"],
    instagram: "https://instagram.com/perfil.to.exemplo",
    whatsapp: "[preencher — mesmo WhatsApp da Coordenação]",
    email: "coordenacao.to@exemplo.edu.br",
    localizacao: "[preencher]",
    horario: "[preencher]",
    links: [],
    orientacoes:
      "Envie um resumo curto e, se tiver, uma imagem em boa qualidade para a divulgação. O Instagram é o canal mais rápido; e-mail e WhatsApp são os mesmos da Coordenação.",
    atualizado_em: "2026-08-28",
  },
  COORDENACAO: {
    id: "coordenacao",
    sigla: "COORDENACAO",
    nome: "Coordenação do Curso",
    funcao:
      "Trata questões administrativas oficiais e decisões que dependem diretamente da coordenação do curso. Também administra o Perfil de TO (divulgação).",
    atende: [
      "respostas institucionais oficiais",
      "dúvidas sobre funcionamento do curso",
      "procedimentos formais",
    ],
    nao_atende: [
      "eventos de integração",
      "divulgação de conteúdo (é o mesmo contato, mas o destino certo é o Perfil de TO)",
    ],
    responsaveis: ["[preencher]"],
    instagram: null,
    whatsapp: "[preencher — mesmo WhatsApp do Perfil de TO]",
    email: "coordenacao.to@exemplo.edu.br",
    localizacao: "[preencher]",
    horario: "[preencher]",
    links: [],
    orientacoes: "Leve seu número de matrícula e, se houver, protocolo de solicitações anteriores.",
    atualizado_em: "2026-08-28",
  },
};
