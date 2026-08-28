-- Bússola TO — schema inicial (Supabase / Postgres)
-- Rode este arquivo inteiro no SQL Editor do seu projeto Supabase.

create extension if not exists "pgcrypto";

create table if not exists espacos (
  id            uuid primary key default gen_random_uuid(),
  sigla         text unique not null check (sigla in ('DA','TOCA','PERFIL_TO','COORDENACAO')),
  nome          text not null,
  funcao        text not null,
  atende        text[] not null default '{}',
  nao_atende    text[] not null default '{}',
  responsaveis  text[] default '{}',
  instagram     text,
  whatsapp      text,
  email         text,
  localizacao   text,
  horario       text,
  links         jsonb default '[]',
  orientacoes   text,
  atualizado_em timestamptz not null default now()
);

create table if not exists regras_classificacao (
  id           uuid primary key default gen_random_uuid(),
  espaco_id    uuid references espacos(id) on delete cascade,
  tipo         text not null check (tipo in ('palavra_chave','padrao_regex')),
  valor        text not null,
  prioridade   int  not null default 10,
  ativo        boolean not null default true
);

create table if not exists interacoes_log (
  id                   uuid primary key default gen_random_uuid(),
  texto_usuario        text not null,
  destino              text,
  confianca            numeric,
  precisou_esclarecer  boolean not null default false,
  criado_em            timestamptz not null default now()
);

-- RLS: leitura pública dos espaços (o app consulta sem login), escrita só
-- via chave de serviço (usada no servidor, nunca no navegador).
alter table espacos enable row level security;
alter table interacoes_log enable row level security;
alter table regras_classificacao enable row level security;

create policy "espacos: leitura pública" on espacos
  for select using (true);

create policy "interacoes_log: inserção pública" on interacoes_log
  for insert with check (true);

-- Seed inicial — SUBSTITUA os valores de exemplo pelos contatos reais de
-- cada espaço antes de publicar. Todo o conteúdo abaixo é placeholder.
insert into espacos (sigla, nome, funcao, atende, nao_atende, responsaveis, instagram, whatsapp, email, localizacao, horario, orientacoes)
values
  ('DA', 'Diretório Acadêmico de TO (DATO)',
   'Representa os alunos, media diálogo institucional e acompanha reivindicações e direitos estudantis.',
   array['problemas com professores','notas lançadas incorretamente','reivindicações coletivas','dúvidas sobre direitos'],
   array['organização de festas e eventos de integração','divulgação de pesquisas'],
   array['[preencher no painel admin]'],
   'https://instagram.com/da.to.exemplo', '5511999990000', 'da.to@exemplo.edu.br',
   '[preencher localização]', '[preencher horário de atendimento]',
   'Descreva a situação com o máximo de detalhes possível: data, disciplina e se outros alunos foram afetados.'),
  ('TOCA', 'TOCA — Terapia Ocupacional & Atlética',
   'Organiza integração, lazer, cultura, esporte, festas, passeios, gincanas e campeonatos entre os estudantes.',
   array['festas','campeonatos','passeios','gincanas','propostas de evento','divulgação de produtos de alunos'],
   array['questões acadêmicas','reivindicações institucionais'],
   array['[preencher no painel admin]'],
   'https://instagram.com/toca.exemplo', '5511999990001', 'toca@exemplo.edu.br',
   '[preencher localização]', '[preencher horário de atendimento]',
   'Traga sua ideia com uma data aproximada em mente — ajuda a encaixar no calendário de eventos.'),
  ('PERFIL_TO', 'Perfil de TO',
   'Divulga pesquisas, extensão, eventos oficiais do curso, conquistas e projetos ligados à profissão.',
   array['divulgar pesquisa','divulgar conquista','divulgar projeto de extensão'],
   array['eventos de integração','reivindicações'],
   array['[preencher no painel admin]'],
   'https://instagram.com/perfil.to.exemplo', '5511999990002', 'perfilto@exemplo.edu.br',
   null, null,
   'Envie um resumo curto e, se tiver, uma imagem em boa qualidade para a divulgação.'),
  ('COORDENACAO', 'Coordenação do Curso',
   'Trata questões administrativas oficiais e decisões que dependem diretamente da coordenação do curso.',
   array['respostas institucionais oficiais','dúvidas sobre funcionamento do curso','procedimentos formais'],
   array['eventos de integração','divulgação de conteúdo'],
   array['[preencher no painel admin]'],
   null, null, 'coordenacao.to@exemplo.edu.br',
   '[preencher localização]', '[preencher horário de atendimento]',
   'Leve seu número de matrícula e, se houver, protocolo de solicitações anteriores.')
on conflict (sigla) do nothing;
