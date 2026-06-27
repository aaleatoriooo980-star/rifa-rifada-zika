## Problema identificado

A rota `/admin/rifas` é definida em `src/routes/admin.rifas.tsx` como uma página comum (renderiza a tabela de rifas), mas ela tem rotas filhas:
- `src/routes/admin.rifas.nova.tsx` → `/admin/rifas/nova`
- `src/routes/admin.rifas.$id.tsx` → `/admin/rifas/:id`

No TanStack Router, quando uma rota tem filhas, o componente da rota pai **precisa** renderizar `<Outlet />` para que as filhas apareçam. Como `admin.rifas.tsx` não faz isso, clicar em "Nova rifa" ou no botão de editar muda a URL mas **continua mostrando a mesma tabela** — por isso as ações parecem "não funcionar".

## Correção

1. **Converter `src/routes/admin.rifas.tsx` em layout**
   - Componente passa a retornar apenas `<Outlet />`.

2. **Criar `src/routes/admin.rifas.index.tsx`**
   - Move toda a UI atual da tabela (listagem de rifas, dialog de compradores, ações encerrar/cancelar) para esta nova rota leaf que responde por `/admin/rifas`.

3. **Pequenas melhorias de UX nas páginas filhas** (sem mudar lógica):
   - Adicionar `<DialogDescription>` no dialog de compradores para silenciar o warning de acessibilidade do Radix.

Nenhuma mudança em contexto, mocks, tipos ou outras rotas — apenas a estrutura de roteamento para que Nova Rifa, edição e ações da tabela funcionem.

## Arquivos afetados

- `src/routes/admin.rifas.tsx` (vira layout com `<Outlet />`)
- `src/routes/admin.rifas.index.tsx` (novo — conteúdo atual da tabela)
- (opcional) `DialogDescription` no dialog de compradores