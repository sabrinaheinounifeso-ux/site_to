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
