import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { Espaco, ClassificacaoIA } from "./types";

const classificacaoSchema = z.object({
  destino_principal: z.enum(["DA", "TOCA", "PERFIL_TO", "COORDENACAO"]).nullable(),
  destino_secundario: z.enum(["DA", "TOCA", "PERFIL_TO", "COORDENACAO"]).nullable(),
  categoria: z.string(),
  confianca: z.number().min(0).max(1),
  motivo_curto: z.string(),
});

const SYSTEM_PROMPT = `Você classifica demandas de alunos de Terapia Ocupacional para o app
Bússola TO. Sua única saída é um JSON, sem texto fora dele, sem markdown.

Espaços possíveis: DA, TOCA, PERFIL_TO, COORDENACAO.

Classifique usando SOMENTE os campos "atende" e "nao_atende" de cada espaço
fornecidos no contexto abaixo. Nunca use conhecimento próprio sobre a
universidade — se a informação não estiver no contexto, isso não deve
influenciar a decisão.

Pistas de linguagem que já vêm resolvidas antes desta etapa (regras fixas,
você só as vê aqui para manter coerência caso apareçam em frases ambíguas):
"DATO" é apelido do DA (Diretório Acadêmico de TO) e conta como menção ao
DA; assuntos que pedem resposta/procedimento oficial são da Coordenação;
projetos feitos por alunos para a comunidade estudantil são da TOCA.

REGRA DE OURO para diferenciar DA de COORDENACAO: não classifique pela
palavra isolada ("nota", "professor", "disciplina" aparecem nos dois) —
classifique pela intenção do aluno.
- Quer informação ou procedimento oficial (prazo, horário, calendário,
  como funciona algo) → COORDENACAO.
- Quer representação, apoio coletivo, ou está relatando insatisfação/
  injustiça/tratamento indevido → DA.

Exemplos de referência (não repita este formato na saída, é só para
calibrar o julgamento):
- "A professora está tratando a turma de forma injusta. O que podemos
  fazer?" → DA (queixa sobre tratamento injusto).
- "Qual é o procedimento oficial para contestar uma nota?" → COORDENACAO
  (pergunta sobre procedimento).
- "Várias pessoas da turma estão com problema nessa disciplina e queremos
  reclamar." → DA (demanda coletiva).
- "Qual é o prazo oficial para solicitar revisão de uma nota?" →
  COORDENACAO (pergunta sobre prazo/procedimento).

Formato de saída obrigatório (JSON puro):
{
  "destino_principal": "DA" | "TOCA" | "PERFIL_TO" | "COORDENACAO" | null,
  "destino_secundario": "DA" | "TOCA" | "PERFIL_TO" | "COORDENACAO" | null,
  "categoria": string,
  "confianca": number,
  "motivo_curto": string
}

Se a confiança for menor que 0.4, destino_principal deve ser null.`;

export async function classificarComIA(
  texto: string,
  espacos: Pick<Espaco, "sigla" | "nome" | "atende" | "nao_atende">[]
): Promise<ClassificacaoIA | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY não configurada nas variáveis de ambiente.");
  }

  const client = new Anthropic({ apiKey });

  const contexto = espacos
    .map(
      (e) =>
        `${e.sigla} (${e.nome})\n  atende: ${e.atende.join(", ") || "—"}\n  não atende: ${e.nao_atende.join(", ") || "—"}`
    )
    .join("\n\n");

  const response = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 400,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Contexto dos espaços:\n\n${contexto}\n\nMensagem do aluno:\n"""${texto}"""`,
      },
    ],
  });

  const block = response.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") return null;

  try {
    const jsonMatch = block.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);
    return classificacaoSchema.parse(parsed);
  } catch {
    return null;
  }
}
