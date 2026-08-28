"use client";

import { useState } from "react";
import { CLARIFY_OPTIONS, type Espaco, type Sigla } from "@/lib/types";

type Step = "input" | "clarify" | "result";

interface ApiResposta {
  precisaEsclarecer: boolean;
  categoria: string;
  motivo: string;
  principal: Espaco | null;
  secundario: Espaco | null;
}

const SIGLA_LABEL: Record<Sigla, string> = {
  DA: "DA",
  TOCA: "TOCA",
  PERFIL_TO: "Perfil de TO",
  COORDENACAO: "Coordenação",
};

const SIGLA_CLASSES: Record<Sigla, { badge: string; border: string }> = {
  DA: { badge: "bg-da-tint text-da", border: "border-l-da" },
  TOCA: { badge: "bg-toca-tint text-toca", border: "border-l-toca" },
  PERFIL_TO: { badge: "bg-perfil-tint text-perfil", border: "border-l-perfil" },
  COORDENACAO: { badge: "bg-coord-tint text-coord", border: "border-l-coord" },
};

export default function Home() {
  const [step, setStep] = useState<Step>("input");
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resposta, setResposta] = useState<ApiResposta | null>(null);

  async function enviar(payload: { texto: string; categoriaForcada?: string }) {
    setLoading(true);
    setErro(null);
    try {
      const res = await fetch("/api/classificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data: ApiResposta = await res.json();
      if (!res.ok) throw new Error((data as unknown as { error?: string }).error ?? "Algo deu errado.");
      setResposta(data);
      setStep(data.precisaEsclarecer ? "clarify" : "result");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Algo deu errado.");
    } finally {
      setLoading(false);
    }
  }

  function reiniciar() {
    setStep("input");
    setTexto("");
    setResposta(null);
    setErro(null);
  }

  return (
    <main className="min-h-screen flex justify-center px-5 py-10 sm:py-16">
      <div className="w-full max-w-xl">
        <header className="mb-10 text-center">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-teal text-teal mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="12" cy="12" r="9.5" />
              <path d="M15.5 8.5l-2 5-5 2 2-5z" />
            </svg>
          </div>
          <h1 className="font-display text-3xl font-semibold text-ink">Bússola TO</h1>
          <p className="font-display italic text-ink-soft mt-2">
            Você não precisa saber com quem falar. A gente te ajuda a encontrar o caminho.
          </p>
        </header>

        {step === "input" && (
          <div className="bg-surface border border-line rounded-2xl p-5 sm:p-6 shadow-sm">
            <label htmlFor="texto" className="block text-sm font-medium text-ink-soft mb-2">
              Conte o que está acontecendo
            </label>
            <textarea
              id="texto"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={5}
              placeholder="Ex: minha nota foi lançada errada e eu não sei o que fazer…"
              className="w-full resize-none rounded-xl border border-line bg-paper px-4 py-3 text-ink outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
            />
            {erro && <p className="mt-3 text-sm text-coral">{erro}</p>}
            <button
              onClick={() => texto.trim() && enviar({ texto: texto.trim() })}
              disabled={loading || !texto.trim()}
              className="mt-4 w-full rounded-xl bg-teal px-5 py-3 font-medium text-white transition hover:bg-teal-strong disabled:opacity-50"
            >
              {loading ? "Encontrando o caminho…" : "Me ajuda a encontrar o caminho"}
            </button>
          </div>
        )}

        {step === "clarify" && (
          <div className="bg-surface border border-line rounded-2xl p-5 sm:p-6 shadow-sm">
            <p className="text-ink mb-4">
              Posso te ajudar a encontrar o caminho. Qual dessas opções descreve melhor o que aconteceu?
            </p>
            <div className="flex flex-wrap gap-2">
              {CLARIFY_OPTIONS.map((opcao) => (
                <button
                  key={opcao.key}
                  onClick={() => enviar({ texto, categoriaForcada: opcao.key })}
                  disabled={loading}
                  className="rounded-xl border border-line bg-paper px-4 py-2 text-sm text-ink hover:border-teal hover:text-teal-strong disabled:opacity-50"
                >
                  {opcao.label}
                </button>
              ))}
            </div>
            {erro && <p className="mt-3 text-sm text-coral">{erro}</p>}
            <button onClick={reiniciar} className="mt-5 text-sm text-ink-faint underline">
              Recomeçar
            </button>
          </div>
        )}

        {step === "result" && resposta && (
          <div className="space-y-4">
            {resposta.principal && (
              <ResultCard espaco={resposta.principal} motivo={resposta.motivo} destaque />
            )}
            {resposta.secundario && (
              <div>
                <p className="text-xs uppercase tracking-wide text-ink-faint mb-2">Também pode envolver</p>
                <ResultCard espaco={resposta.secundario} motivo={null} destaque={false} />
              </div>
            )}
            {!resposta.principal && (
              <div className="bg-surface border border-line rounded-2xl p-5 text-ink-soft">
                Não encontrei esse espaço cadastrado ainda. Assim que os dados forem cadastrados no
                painel administrativo, essa resposta aparece aqui.
              </div>
            )}
            <button
              onClick={reiniciar}
              className="w-full rounded-xl border border-line bg-surface px-5 py-3 font-medium text-ink hover:border-teal"
            >
              Fazer outra pergunta
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

function ResultCard({
  espaco,
  motivo,
  destaque,
}: {
  espaco: Espaco;
  motivo: string | null;
  destaque: boolean;
}) {
  const classes = SIGLA_CLASSES[espaco.sigla];
  return (
    <div
      className={`bg-surface border border-line ${destaque ? `border-l-4 ${classes.border}` : ""} rounded-2xl p-5 sm:p-6 shadow-sm`}
    >
      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${classes.badge}`}>
        {SIGLA_LABEL[espaco.sigla]} — {espaco.nome}
      </span>

      {motivo && (
        <div className="mt-4">
          <p className="text-sm font-semibold text-ink-soft">Por quê?</p>
          <p className="text-ink mt-1">{motivo}</p>
        </div>
      )}

      <div className="mt-4">
        <p className="text-sm font-semibold text-ink-soft">O que fazer agora?</p>
        <p className="text-ink mt-1">{espaco.funcao}</p>
      </div>

      <div className="mt-4">
        <p className="text-sm font-semibold text-ink-soft">Como entrar em contato?</p>
        <div className="mt-1 flex flex-wrap gap-2">
          {espaco.whatsapp && (
            <a href={`https://wa.me/${espaco.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="text-sm text-teal underline">
              WhatsApp
            </a>
          )}
          {espaco.instagram && (
            <a href={espaco.instagram} target="_blank" rel="noreferrer" className="text-sm text-teal underline">
              Instagram
            </a>
          )}
          {espaco.email && (
            <a href={`mailto:${espaco.email}`} className="text-sm text-teal underline">
              E-mail
            </a>
          )}
          {!espaco.whatsapp && !espaco.instagram && !espaco.email && (
            <span className="text-sm text-ink-faint">Não temos essa informação cadastrada.</span>
          )}
        </div>
      </div>

      {espaco.orientacoes && (
        <div className="mt-4">
          <p className="text-sm font-semibold text-ink-soft">O que levar / informar?</p>
          <p className="text-ink mt-1">{espaco.orientacoes}</p>
        </div>
      )}

      <p className="mt-4 text-xs text-ink-faint">
        Dados atualizados em {new Date(espaco.atualizado_em).toLocaleDateString("pt-BR")}
      </p>
    </div>
  );
}
