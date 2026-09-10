-- ============================================================
--  Migração: imposto do mês no fechamento financeiro
-- ------------------------------------------------------------
--  O imposto era só calculado na tela (uma alíquota sobre o
--  faturamento). Só que no Simples Nacional a alíquota efetiva
--  varia com o faturamento acumulado, e há mês em que o valor
--  pago não segue conta nenhuma — agosto de 2026, por exemplo,
--  em que o regime começou no meio do mês.
--
--  Por isso a coluna é ANULÁVEL, e o nulo tem significado:
--    null  -> a tela calcula pela alíquota vigente
--    valor -> foi digitado à mão e manda no cálculo (0 inclusive)
--
--  Nenhum mês existente é alterado: todos ficam em null e
--  continuam calculados como antes.
--
--  Como aplicar:
--    Supabase Dashboard → SQL Editor → cole → Run.
--    (idempotente: pode rodar de novo sem efeito)
-- ============================================================

alter table public.financeiro
  add column if not exists imposto numeric(12,2);

comment on column public.financeiro.imposto is
  'Imposto do mês digitado à mão. Nulo = a tela calcula pela alíquota vigente.';

-- confere o resultado
select ano, mes, faturamento, imposto
  from public.financeiro
 where ano = 2026
 order by ordem;
