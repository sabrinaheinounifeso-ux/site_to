import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { classificarComIA } from "@/lib/anthropic";
import { aplicarRegraPrioridade } from "@/lib/rules";
import { CLARIFY_OPTIONS, FALLBACK_EMAIL, type Sigla } from "@/lib/types";
import { ehPerguntaDeLocalizacao, encontrarLocalNoTexto } from "@/lib/locais";
import { ESPACOS } from "@/lib/espacos-data";

const CONFIANCA_MINIMA = 0.4;

const bodySchema = z.object({
  texto: z.string().min(1).max(2000),
  categoriaForcada: z.string().optional(),
});

function buscarEspaco(sigla: Sigla) {
  return ESPACOS[sigla] ?? null;
}

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }
  const { texto, categoriaForcada } = parsed.data;

  // Pergunta de localização física ("onde fica...") — independente de qual
  // espaço trata do assunto, mostra o mapa do campus direto. Só roda na
  // primeira mensagem (sem categoriaForcada), antes de qualquer outra regra.
  if (!categoriaForcada && ehPerguntaDeLocalizacao(texto)) {
    const local = encontrarLocalNoTexto(texto);
    return NextResponse.json({
      precisaEsclarecer: false,
      categoria: "localizacao",
      motivo: local
        ? `Isso fica no ponto ${local.numero} do mapa: ${local.nome}.`
        : "Aqui está o mapa do campus. Se for sobre uma sala de aula específica, o prédio e horário certos são confirmados com a Coordenação.",
      principal: null,
      secundario: null,
      mapa: {
        url: "/mapa-campus.jpg",
        local: local ? { numero: local.numero, nome: local.nome, cor: local.cor } : null,
      },
    });
  }

  // Caminho vindo da tela de esclarecimento: mapeamento direto, sem IA.
  if (categoriaForcada) {
    const opcao = CLARIFY_OPTIONS.find((o) => o.key === categoriaForcada);
    if (!opcao || !opcao.sigla) {
      // "Outro" — a demanda foge dos quatro espaços cadastrados. Em vez de
      // devolver pra tela de esclarecimento (loop sem saída), encerra aqui
      // com um contato de reserva.
      return NextResponse.json({
        precisaEsclarecer: false,
        foraDoSistema: true,
        categoria: "outro",
        motivo:
          "Sua dúvida não se encaixa diretamente no DA, na TOCA, no Perfil de TO ou na Coordenação.",
        principal: null,
        secundario: null,
        contatoFallback: FALLBACK_EMAIL,
      });
    }
    return NextResponse.json({
      precisaEsclarecer: false,
      categoria: categoriaForcada,
      motivo: `Você indicou "${opcao.label.replace(/^[^\s]+\s/, "")}" — esse é o espaço mais direto para esse tipo de demanda.`,
      principal: buscarEspaco(opcao.sigla),
      secundario: null,
    });
  }

  // Camada 1 — regras determinísticas de prioridade (DA/DATO, Coordenação
  // para assuntos oficiais, TOCA para projetos estudantis).
  const regraForcada = aplicarRegraPrioridade(texto);
  if (regraForcada) {
    return NextResponse.json({
      precisaEsclarecer: false,
      categoria: regraForcada.categoria,
      motivo: regraForcada.motivo,
      principal: buscarEspaco(regraForcada.destino),
      secundario: null,
    });
  }

  // Camada 2 — classificação por IA com o conteúdo cadastrado como contexto.
  const espacosContexto = Object.values(ESPACOS).map(({ sigla, nome, atende, nao_atende }) => ({
    sigla,
    nome,
    atende,
    nao_atende,
  }));

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
    return NextResponse.json({
      precisaEsclarecer: true,
      categoria: classificacao?.categoria ?? "indefinida",
      motivo: "Ainda não tenho certeza suficiente para te indicar um caminho.",
      principal: null,
      secundario: null,
      opcoes: CLARIFY_OPTIONS,
    });
  }

  return NextResponse.json({
    precisaEsclarecer: false,
    categoria: classificacao.categoria,
    motivo: classificacao.motivo_curto,
    principal: buscarEspaco(classificacao.destino_principal),
    secundario: classificacao.destino_secundario ? buscarEspaco(classificacao.destino_secundario) : null,
  });
}
