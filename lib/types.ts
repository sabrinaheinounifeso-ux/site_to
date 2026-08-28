export type Sigla = "DA" | "TOCA" | "PERFIL_TO" | "COORDENACAO";

export interface Espaco {
  id: string;
  sigla: Sigla;
  nome: string;
  funcao: string;
  atende: string[];
  nao_atende: string[];
  responsaveis: string[];
  instagram: string | null;
  whatsapp: string | null;
  email: string | null;
  localizacao: string | null;
  horario: string | null;
  links: { label: string; url: string }[];
  orientacoes: string | null;
  atualizado_em: string;
}

export interface ClassificacaoIA {
  destino_principal: Sigla | null;
  destino_secundario: Sigla | null;
  categoria: string;
  confianca: number;
  motivo_curto: string;
}

export interface ResultadoDirecionamento {
  precisaEsclarecer: boolean;
  categoria: string;
  motivo: string;
  principal: Espaco | null;
  secundario: Espaco | null;
}

export const CLARIFY_OPTIONS: { key: string; label: string; sigla: Sigla | null }[] = [
  { key: "academico", label: "📚 Problema acadêmico", sigla: "DA" },
  { key: "problema_faculdade", label: "🏛️ Problema com a faculdade", sigla: "DA" },
  { key: "professor", label: "👩‍🏫 Questão com professor", sigla: "DA" },
  { key: "reivindicacao", label: "📢 Quero fazer uma reivindicação", sigla: "DA" },
  { key: "evento", label: "🎉 Quero organizar um evento", sigla: "TOCA" },
  { key: "esporte", label: "🏆 Quero organizar uma atividade esportiva", sigla: "TOCA" },
  { key: "passeio", label: "✈️ Quero propor um passeio", sigla: "TOCA" },
  { key: "integracao", label: "🤝 Quero fazer uma atividade de integração", sigla: "TOCA" },
  { key: "divulgar", label: "📣 Quero divulgar algo", sigla: "PERFIL_TO" },
  { key: "ideia", label: "💡 Tenho uma ideia", sigla: "TOCA" },
  { key: "outro", label: "❓ Outro", sigla: null },
];
