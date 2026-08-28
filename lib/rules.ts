// Camada 1 — regras determinísticas, aplicadas antes de qualquer classificação
// por IA. Cada bloco abaixo é uma "variável" fixa de negócio: se o texto
// bate no padrão, o destino é decidido direto, sem depender do modelo.
// Ordem de checagem: DA → COORDENAÇÃO → TOCA (a primeira que casar vence).
//
// Regra de ouro (vale também para a camada 2, na IA): a diferença entre DA
// e Coordenação não é a palavra usada ("nota", "professor", "disciplina"
// aparecem nos dois), é a INTENÇÃO. Quem busca informação/procedimento
// oficial → Coordenação. Quem busca representação, apoio coletivo, ou está
// relatando uma injustiça/insatisfação → DA. Por isso os padrões de DA
// abaixo cobrem sinais de queixa/injustiça/coletivo, e são checados antes
// dos padrões de Coordenação — uma frase com "nota" mas também com
// "reclamar" cai em DA, não em Coordenação.

import type { Sigla } from "./types";

// DA — menção direta ao DA/DATO, ou sinais de representação, reivindicação,
// demanda coletiva ou tratamento injusto. Regra-mãe: "quero reivindicar /
// representar / discutir uma demanda" → DA.
const DA_PATTERNS: RegExp[] = [
  // menção direta
  /\bDA\b/, // sigla em maiúsculas — evita casar com a preposição "da"
  /\bDATO\b/i, // apelido do DA de TO (DA + TO)
  /diret[oó]rio acad[eê]mico/i,
  /\bliga acad[eê]mica\b/i,
  /di[aá]logo institucional/i,

  // reivindicações
  /reivindica[cç][aã]o/i,
  /reclamar|reclama[cç][aã]o/i,
  /(turma|alunos?).{0,20}insatisfeit/i,
  /levar (uma )?demanda/i,
  /apresentar (uma )?demanda/i,
  /demanda (dos alunos|coletiva|dos estudantes)/i,
  /quem (pode|vai) representar/i,

  // representação estudantil
  /representa[cç][aã]o estudantil/i,
  /\bmeus? direitos?\b/i,
  /(nossos|nosso) direitos? como alunos/i,
  /quem representa os alunos/i,
  /levar uma quest[aã]o (dos estudantes|para a faculdade)/i,
  /como funciona a representa[cç][aã]o estudantil/i,

  // problemas com professores
  /problema com (um |uma )?professor/i,
  /conflito com (um )?professor/i,
  /professor.{0,40}(injust|desrespeit|maltrat|atitude)/i,
  /turma.{0,40}(injust|desrespeit|maltrat)/i,
  /orienta[cç][aã]o sobre um conflito/i,

  // demandas acadêmicas coletivas
  /turma inteira.{0,40}(problema|disciplina)/i,
  /v[aá]rios? (alunos?|colegas?|per[ií]odos?|da turma).{0,60}(mesmo problema|mesma situa[cç][aã]o|mesma disciplina|mesma mat[eé]ria|dificuldade)/i,
  /forma como (uma|a) disciplina est[aá] sendo conduzida/i,
  /levar (uma )?quest[aã]o acad[eê]mica/i,

  // direitos e situações injustas
  /respeitando (nossos|os) direitos/i,
  /situa[cç][aã]o.{0,20}injusta/i,
  /decis[aã]o que prejudicou a turma/i,

  // coletivo / organizar a turma
  /juntar os alunos para discutir/i,
  /representar a turma/i,
  /algu[eé]m para representar/i,
];

// Menções que, mesmo citando DA/DATO/liga, são claramente sobre divulgar um
// evento ou produto da própria liga — nesse caso a regra de DA não deve se
// sobrepor à categoria de evento/divulgação.
const DA_EXCECAO_DIVULGACAO: RegExp[] = [/divulgar|divulga[cç][aã]o/i];

// COORDENAÇÃO — informação e procedimento oficial do curso. Agrupado pelas
// categorias mapeadas com exemplos reais de perguntas de alunos.
const COORDENACAO_PATTERNS: RegExp[] = [
  // disciplinas e organização do curso
  /hor[aá]rio (da|de) (minha |uma )?aula/i,
  /qual (vai ser a |a )?sala/i,
  /disciplina [ée] obrigat[oó]ria/i,
  /trocar de disciplina/i,
  /inscri[cç][aã]o (para|de) (uma )?disciplina/i,
  /como funciona a depend[eê]ncia/i,
  /cursar (essa |esta |a )?mat[eé]ria em outro per[ií]odo/i,
  /pr[eé]-?requisitos?/i,
  /carga hor[aá]ria/i,
  /quando come[cç]a a (pr[oó]xima )?disciplina/i,

  // estágio
  /est[aá]gio obrigat[oó]rio/i,
  /come[cç]ar o est[aá]gio/i,
  /documentos?.{0,40}est[aá]gio/i,
  /orientar sobre (o )?est[aá]gio/i,
  /informa[cç][oõ]es sobre est[aá]gio/i,
  /horas de est[aá]gio/i,

  // faltas e frequência (dúvida institucional, não queixa)
  /limite de faltas/i,
  /como funciona a frequ[eê]ncia/i,
  /justificar? uma falta/i,
  /reposi[cç][aã]o de (uma )?atividade/i,
  /ultrapassar o limite de faltas/i,

  // notas e avaliações (informação/procedimento, não queixa)
  /quando sai a nota/i,
  /como funciona a recupera[cç][aã]o/i,
  /avalia[cç][aã]o substitutiva/i,
  /fecha o sistema de notas/i,
  /solicitar revis[aã]o de (uma )?nota/i,
  /prazo.{0,20}revis[aã]o de nota/i,

  // documentos e procedimentos
  /preciso de uma declara[cç][aã]o/i,
  /onde solicito (esse |o )?documento/i,
  /como fa[cç]o (esse |o )?requerimento/i,
  /prazo para entregar (esse |o )?documento/i,
  /onde encontro (esse |o )?formul[aá]rio/i,

  // calendário e informações oficiais
  /calend[aá]rio acad[eê]mico/i,
  /quando termina o semestre/i,
  /quando come[cç]am as f[eé]rias/i,
  /vai ter aula (nesse|neste) dia/i,
  /quando come[cç]a o pr[oó]ximo per[ií]odo/i,
  /data da prova/i,
  /reuni[aã]o de colegiado/i,

  // caráter oficial explícito
  /resposta (oficial|institucional)/i,
  /orienta[cç][aã]o oficial/i,
  /documenta[cç][aã]o oficial/i,
  /\batestado\b/i,
  /trancamento( de matr[ií]cula)?/i,
  /processo (administrativo|disciplinar)/i,
  /den[uú]ncia formal/i,
  /procedimento (oficial|institucional|formal)/i,
  /falar com a coordena[cç][aã]o/i,
  /d[uú]vida sobre o funcionamento do curso/i,
];

// TOCA — organizar, participar ou criar algo para os alunos: eventos,
// esporte, rolês, cultura, integração, ideias e produtos/identidade da
// turma. Regra-mãe: "quero fazer/organizar/propor algo" → TOCA (desde que
// nenhum padrão de DA — queixa, reivindicação — tenha disparado antes).
const TOCA_PATTERNS: RegExp[] = [
  // projetos e produtos de alunos (categoria original)
  /projetos? estudant/i,
  /projeto de alun[oa]s?/i,
  /produtos? (feitos? por|de|dos?) alun[oa]s?/i,

  // eventos e festas
  /\bfesta\b/i,
  /confraterniza[cç][aã]o/i,
  /evento de integra[cç][aã]o/i,
  /sugerir um evento/i,
  /organizar um evento/i,

  // esportes
  /campeonato/i,
  /gincana/i,
  /torneio/i,
  /competi[cç][aã]o entre (os )?cursos/i,
  /time (para )?representar o curso/i,

  // rolês e viagens
  /\bpasseio\b/i,
  /bate-?volta/i,
  /viagem entre (os )?alunos/i,
  /\brol[eê]/i, // "rolê" — sem \b final: acento quebra a detecção de fronteira de palavra

  // cultura
  /ida ao teatro/i,
  /atividade cultural/i,
  /sess[aã]o de cinema/i,
  /atividade art[ií]stica/i,
  /\bteatro\b|\bm[uú]sica\b|\barte\b/i,

  // integração
  /integrar os per[ií]odos/i,
  /atividade (para os |de )?calouros/i,
  /recep[cç][aã]o para (os )?calouros/i,
  /aproximar.{0,20}alunos/i,
  /atividade de integra[cç][aã]o/i,

  // ideias para movimentar os alunos
  /movimentar a faculdade/i,
  /ideia de atividade/i,
  /ideia para (o curso|os alunos)/i,
  /a[cç][aã]o para o curso/i,

  // produtos, vendas e identidade da turma
  /vender uma camisa/i,
  /criar uma camiseta/i,
  /camiseta da turma/i,
  /venda coletiva/i,
  /tenho um produto/i,
  /divulgar (uma coisa|algo) que estou vendendo/i,
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
        "Sua mensagem menciona o DA (também conhecido como DATO), o diretório acadêmico, a liga acadêmica, ou tem caráter de representação, reivindicação coletiva ou queixa sobre tratamento injusto — esse é o caminho mais direto para representação e diálogo institucional.",
    };
  }

  if (COORDENACAO_PATTERNS.some((re) => re.test(texto))) {
    return {
      destino: "COORDENACAO",
      categoria: "institucional_oficial",
      motivo:
        "Isso parece ser uma dúvida sobre informação ou procedimento oficial do curso, que a Coordenação responde diretamente. Se depois disso você também quiser representação ou discutir a questão coletivamente, o DA pode ser um próximo passo.",
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
