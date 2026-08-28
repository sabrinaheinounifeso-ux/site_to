// Camada 1 — regras determinísticas, aplicadas antes de qualquer classificação
// por IA. Cada bloco abaixo é uma "variável" fixa de negócio: se o texto
// bate no padrão, o destino é decidido direto, sem depender do modelo.
// Ordem de checagem: DA → COORDENAÇÃO → TOCA (a primeira que casar vence).

import type { Sigla } from "./types";

// DA — inclui "DATO", apelido usado pelos alunos para o Diretório
// Acadêmico de TO (DA + TO = DATO), além de menção direta ao DA, ao
// diretório acadêmico, à liga acadêmica ou a linguagem institucional
// explícita (reivindicação, direitos, representação coletiva).
const DA_PATTERNS: RegExp[] = [
  /\bDA\b/, // sigla em maiúsculas — evita casar com a preposição "da"
  /\bDATO\b/i, // apelido do DA de TO
  /diret[oó]rio acad[eê]mico/i,
  /\bliga acad[eê]mica\b/i,
  /reivindica[cç][aã]o/i,
  /\bmeus? direitos?\b/i,
  /representa[cç][aã]o estudantil/i,
  /di[aá]logo institucional/i,
];

// Menções que, mesmo citando DA/DATO/liga, são claramente sobre divulgar um
// evento ou produto da própria liga — nesse caso a regra de DA não deve se
// sobrepor à categoria de evento/divulgação.
const DA_EXCECAO_DIVULGACAO: RegExp[] = [/divulgar|divulga[cç][aã]o/i];

// COORDENAÇÃO — assuntos institucionais "sérios": pedidos de resposta
// oficial, documentação formal ou procedimentos que só a coordenação
// resolve.
const COORDENACAO_PATTERNS: RegExp[] = [
  /resposta (oficial|institucional)/i,
  /documenta[cç][aã]o oficial/i,
  /\batestado\b/i,
  /trancamento( de matr[ií]cula)?/i,
  /processo (administrativo|disciplinar)/i,
  /den[uú]ncia formal/i,
  /procedimento (oficial|institucional|formal)/i,
  /assunto (grave|s[eé]rio)/i,
  /quest[aã]o (grave|muito s[eé]ria)/i,
];

// TOCA — projetos e produções dos próprios alunos, voltados à comunidade
// estudantil (não confundir com pesquisa/extensão do curso, que é Perfil
// de TO).
const TOCA_PATTERNS: RegExp[] = [
  /projetos? estudant/i,
  /projeto de alun[oa]s?/i,
  /produtos? (feitos? por|de|dos?) alun[oa]s?/i,
];

export interface RegraForcada {
  destino: Sigla;
  categoria: string;
  motivo: string;
}

export function aplicarRegraPrioridade(texto: string): RegraForcada | null {
  const mencionaDA = DA_PATTERNS.some((re) => re.test(texto));
  const pareceDivulgacao = DA_EXCECAO_DIVULGACAO.some((re) => re.test(texto));
  if (mencionaDA && !pareceDivulgacao) {
    return {
      destino: "DA",
      categoria: "institucional",
      motivo:
        "Sua mensagem menciona o DA (também conhecido como DATO), o diretório acadêmico, a liga acadêmica ou tem caráter institucional — esse é o caminho mais direto para representação e diálogo institucional.",
    };
  }

  if (COORDENACAO_PATTERNS.some((re) => re.test(texto))) {
    return {
      destino: "COORDENACAO",
      categoria: "institucional_oficial",
      motivo:
        "Isso parece exigir uma resposta ou procedimento oficial, que só a Coordenação pode dar. Se depois disso você também quiser representação ou discutir a questão coletivamente, o DA pode ser um próximo passo.",
    };
  }

  if (TOCA_PATTERNS.some((re) => re.test(texto))) {
    return {
      destino: "TOCA",
      categoria: "projeto_estudantil",
      motivo:
        "Isso é um projeto feito por alunos para a comunidade estudantil — a TOCA é o espaço certo para divulgar e conectar isso com o resto da turma.",
    };
  }

  return null;
}
