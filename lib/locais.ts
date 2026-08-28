// Mapa do campus — usado quando a pergunta é sobre localização física
// ("onde fica minha sala", "onde fica tal lugar"), não sobre a quem
// recorrer. Independente da classificação DA/TOCA/Perfil de TO/
// Coordenação: é checado antes de tudo, na própria rota da API.

export interface LocalMapa {
  numero: number;
  nome: string;
  cor: string; // mesma cor do número no mapa, usada no badge da resposta
  padroes: RegExp[];
}

export const LOCAIS_MAPA: LocalMapa[] = [
  { numero: 1, nome: "Cias — Clínica Escola", cor: "#3EB489", padroes: [/\bcias\b/i, /cl[ií]nica escola/i] },
  { numero: 2, nome: "Biblioteca e Chapa Hall", cor: "#EF5350", padroes: [/biblioteca/i, /chapa ?hall/i] },
  { numero: 3, nome: "Quadras", cor: "#F5C232", padroes: [/quadras?/i] },
  {
    numero: 4,
    nome: "Clínica Veterinária e Sala dos Professores",
    cor: "#3AA6D8",
    padroes: [/cl[ií]nica veterin[aá]ria/i, /sala dos professores/i],
  },
  {
    numero: 5,
    nome: "Prédio Basílio Matalobos e Laboratórios",
    cor: "#EC4899",
    padroes: [/bas[ií]lio matalobos/i, /laborat[oó]rios?/i],
  },
  {
    numero: 6,
    nome: "Prédio Alice — auditório (2º andar) e coordenação (3º andar)",
    cor: "#C084FC",
    padroes: [/pr[eé]dio alice/i, /audit[oó]rio/i, /coordena[cç][aã]o/i],
  },
  { numero: 7, nome: "Redário — espaço de convivência", cor: "#F97316", padroes: [/red[aá]rio/i] },
];

const PERGUNTA_LOCALIZACAO_PATTERNS: RegExp[] = [
  /onde fica/i,
  /onde [eé] (a |o |que )/i,
  /onde encontro/i,
  /como chego/i,
  /localiza[cç][aã]o/i,
  /mapa do campus/i,
  /em que (pr[eé]dio|andar)/i,
  /onde (tem|fica) (a |o )?(sala|aula)/i,
];

export function ehPerguntaDeLocalizacao(texto: string): boolean {
  return PERGUNTA_LOCALIZACAO_PATTERNS.some((re) => re.test(texto));
}

export function encontrarLocalNoTexto(texto: string): LocalMapa | null {
  return LOCAIS_MAPA.find((local) => local.padroes.some((re) => re.test(texto))) ?? null;
}
