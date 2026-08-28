// Camada 1 — regras determinísticas, aplicadas antes de qualquer classificação
// por IA. Ver seção 5 e 18 da especificação: menção direta ao DA, a
// "diretório acadêmico", a "liga acadêmica" ou linguagem de caráter
// institucional explícito força o destino DA, com prioridade sobre o
// classificador estatístico.
const DA_PATTERNS: RegExp[] = [
  /\bDA\b/, // sigla em maiúsculas — evita casar com a preposição "da"
  /diret[oó]rio acad[eê]mico/i,
  /\bliga acad[eê]mica\b/i,
  /reivindica[cç][aã]o/i,
  /\bmeus? direitos?\b/i,
  /representa[cç][aã]o estudantil/i,
  /di[aá]logo institucional/i,
];

// Menções que, mesmo citando DA/liga, são claramente sobre divulgar um
// evento ou produto da própria liga — nesse caso a regra de prioridade não
// deve se sobrepor à categoria de evento/divulgação.
const DA_EXCECAO_DIVULGACAO: RegExp[] = [
  /divulgar|divulga[cç][aã]o/i,
];

export interface RegraForcada {
  destino: "DA";
  motivo: string;
}

export function aplicarRegraPrioridade(texto: string): RegraForcada | null {
  const mencionaDA = DA_PATTERNS.some((re) => re.test(texto));
  if (!mencionaDA) return null;

  const pareceDivulgacao = DA_EXCECAO_DIVULGACAO.some((re) => re.test(texto));
  if (pareceDivulgacao) return null;

  return {
    destino: "DA",
    motivo:
      "Sua mensagem menciona diretamente o DA, o diretório acadêmico, a liga acadêmica ou tem caráter institucional — esse é o caminho mais direto para representação e diálogo institucional.",
  };
}
