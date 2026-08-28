import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase";
import { classificarComIA } from "@/lib/anthropic";
import { aplicarRegraPrioridade } from "@/lib/rules";
import { CLARIFY_OPTIONS, type Espaco, type Sigla } from "@/lib/types";

const CONFIANCA_MINIMA = 0.4;

const bodySchema = z.object({
  texto: z.string().min(1).max(2000),
  categoriaForcada: z.string().optional(),
});

async function buscarEspaco(sigla: Sigla): Promise<Espaco | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("espacos")
    .select("*")
    .eq("sigla", sigla)
    .maybeSingle();
  if (error || !data) return null;
  return data as Espaco;
}

async function registrarLog(params: {
  texto: string;
  destino: string | null;
  confianca: number | null;
  precisouEsclarecer: boolean;
}) {
  try {
    const supabase = getSupabaseServerClient();
    await supabase.from("interacoes_log").insert({
      texto_usuario: params.texto.slice(0, 500),
      destino: params.destino,
      confianca: params.confianca,
      precisou_esclarecer: params.precisouEsclarecer,
    });
  } catch {
    // log é best-effort — nunca deve derrubar a resposta ao aluno
  }
}

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }
  const { texto, categoriaForcada } = parsed.data;

  // Caminho vindo da tela de esclarecimento: mapeamento direto, sem IA.
  if (categoriaForcada) {
    const opcao = CLARIFY_OPTIONS.find((o) => o.key === categoriaForcada);
    if (!opcao || !opcao.sigla) {
      await registrarLog({ texto, destino: null, confianca: null, precisouEsclarecer: true });
      return NextResponse.json({
        precisaEsclarecer: true,
        categoria: "outro",
        motivo:
          "Não conseguimos identificar um espaço específico. Tente descrever com mais detalhes o que está acontecendo.",
        principal: null,
        secundario: null,
      });
    }
    const principal = await buscarEspaco(opcao.sigla);
    await registrarLog({ texto, destino: opcao.sigla, confianca: 1, precisouEsclarecer: false });
    return NextResponse.json({
      precisaEsclarecer: false,
      categoria: categoriaForcada,
      motivo: `Você indicou "${opcao.label.replace(/^[^\s]+\s/, "")}" — esse é o espaço mais direto para esse tipo de demanda.`,
      principal,
      secundario: null,
    });
  }

  // Camada 1 — regra determinística de prioridade (DA).
  const regraForcada = aplicarRegraPrioridade(texto);
  if (regraForcada) {
    const principal = await buscarEspaco(regraForcada.destino);
    await registrarLog({ texto, destino: regraForcada.destino, confianca: 1, precisouEsclarecer: false });
    return NextResponse.json({
      precisaEsclarecer: false,
      categoria: "institucional",
      motivo: regraForcada.motivo,
      principal,
      secundario: null,
    });
  }

  // Camada 2 — classificação por IA com o conteúdo do banco como contexto.
  let espacosContexto: Pick<Espaco, "sigla" | "nome" | "atende" | "nao_atende">[] = [];
  try {
    const supabase = getSupabaseServerClient();
    const { data } = await supabase.from("espacos").select("sigla, nome, atende, nao_atende");
    espacosContexto = data ?? [];
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro ao consultar os espaços cadastrados." },
      { status: 500 }
    );
  }

  let classificacao;
  try {
    classificacao = await classificarComIA(texto, espacosContexto);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro ao classificar a demanda." },
      { status: 500 }
    );
  }

  // Camada 3 — limiar de confiança.
  if (
    !classificacao ||
    !classificacao.destino_principal ||
    classificacao.confianca < CONFIANCA_MINIMA
  ) {
    await registrarLog({
      texto,
      destino: classificacao?.destino_principal ?? null,
      confianca: classificacao?.confianca ?? null,
      precisouEsclarecer: true,
    });
    return NextResponse.json({
      precisaEsclarecer: true,
      categoria: classificacao?.categoria ?? "indefinida",
      motivo: "Ainda não tenho certeza suficiente para te indicar um caminho.",
      principal: null,
      secundario: null,
      opcoes: CLARIFY_OPTIONS,
    });
  }

  const principal = await buscarEspaco(classificacao.destino_principal);
  const secundario = classificacao.destino_secundario
    ? await buscarEspaco(classificacao.destino_secundario)
    : null;

  await registrarLog({
    texto,
    destino: classificacao.destino_principal,
    confianca: classificacao.confianca,
    precisouEsclarecer: false,
  });

  return NextResponse.json({
    precisaEsclarecer: false,
    categoria: classificacao.categoria,
    motivo: classificacao.motivo_curto,
    principal,
    secundario,
  });
}
