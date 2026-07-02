# Rifas Online — v2 (UX + Gestão)

Mantém arquitetura atual (TanStack Router + Context + localStorage + shadcn + framer-motion). Nenhuma funcionalidade existente é removida — só ampliada.

## 1. Modelo de dados (src/lib/types.ts + Context)
- `Rifa` ganha: `drawDate` (agora obrigatório em criação), `drawTime` (string HH:mm derivada ou combinada em `drawDate`), `archived: boolean`, `prizes?: string[]` (múltiplos prêmios opcional; hoje só `prize`).
- `User` ganha `notificationsEnabled: boolean` (default true) e `phone` já existe.
- `RifasContext`: adiciona `archiveRifa(id)`, `unarchiveRifa(id)`, mantém `updateRifa` para edição inline.
- Regra reforçada em `drawRifa`: sortear **somente** números com `status === "vendido"` (já é assim; deixar comentado e garantido).

## 2. Página inicial `/` (RifaCard)
- Adicionar cronômetro D:H:M:S por card (reaproveitar `useCountdown`).
- Cores: neutro > 24h, laranja < 24h, vermelho < 1h, "Rifa Encerrada" quando 0.
- Clicar em card de rifa **encerrada** abre `ResultModal` com: nome, número vencedor, nome vencedor, data/hora, prêmio, badge "Sorteio Finalizado". Sem sorteio → "Sorteio ainda não realizado."
- Card de rifa ativa continua navegando para `/rifa/:id`.

## 3. Página pública `/rifa/:id`
- Se `status === "encerrada"`: esconder "Escolha seus números", QuickBuyBar, botão Comprar e Confirmar. Mostrar bloco de resultado (vencedor destacado verde, demais vendidos vermelhos, legenda).
- Grid pós-sorteio: vencedor verde + destaque (scale/ring), demais vendidos vermelhos, disponíveis neutros. Legenda atualizada.
- QuickBuyBar: remover botão "Aleatório"; renomear "Customizado" → "Escolher Número". Ao clicar abre `ChooseNumbersModal` (input `10,25,36,48`) com validação (existe / disponível / não vendido) e feedback via toast dos indisponíveis; os válidos entram na seleção.

## 4. Dashboard admin `/admin`
- Remover cards: Participantes, Pagamentos Pendentes, Pagamentos Aprovados, Números Vendidos.
- Remover gráfico "Novos participantes do mês".
- Reordenar grid restante para layout limpo (colunas responsivas).
- "Últimas Compras": adicionar ComboBox pesquisável (shadcn Command dentro de Popover) filtrando por rifa (Todas + nome). Filtragem client-side em memória.

## 5. Nova rifa `/admin/rifas/nova`
- Campos obrigatórios adicionais: **Data do Sorteio** (shadcn DatePicker) e **Hora do Sorteio** (input `time`). Combinados em `drawDate` ISO.
- Validação zod: obrigatórios, futuro.

## 6. Gerenciar rifas `/admin/rifas`
- Substituir tabela por **DataTable** (novo `src/components/common/DataTable.tsx` genérico: pesquisa, ordenação por header, paginação, responsivo, base para exportação futura).
- Ação **Editar** deixa de navegar: abre `EditRifaModal` (mesmo formulário do "nova") com todos os campos (nome, descrição, imagem, valor, quantidade, data, hora, status, prêmios). Salva via `updateRifa` sem trocar de tela. Rota `/admin/rifas/:id` fica como fallback (não removida).
- Ação **Arquivar** aparece após sorteio (`status === "encerrada"`).
- Filtros no topo: Ativas | Encerradas | Arquivadas (tabs).
- Rifas arquivadas não aparecem na home nem nas outras listas principais.

## 7. Compradores (nova aba em `/admin/rifas/:id` e reaproveitada no gerenciar)
- ComboBox pesquisável (Command) por nome/telefone. Ao selecionar mostra: nome, telefone, quantidade de números, lista completa dos números comprados (badges).

## 8. Sorteios `/admin/sorteios`
- Cards ganham: data, hora, cronômetro ("Sorteio em 2 dias 03 horas 18 min").
- Botão **Gravar Sorteio**: usa `navigator.mediaDevices.getDisplayMedia()` + `MediaRecorder` (webm), ao parar gera blob e força download. Novo helper `src/lib/screenRecorder.ts`.
- Toast se navegador não suportar.

## 9. Push Notification (mock local)
- Novo `src/lib/pushScheduler.ts`: no boot do app (Provider), agenda `setTimeout` para cada rifa ativa disparando 10 min antes do `drawDate`.
- Usa `Notification` API do navegador (pede permissão on-demand quando usuário loga). Se `user.notificationsEnabled === false` ou permissão negada → ignora.
- Mensagem: "Sua rifa será sorteada em 10 minutos. Acompanhe ao vivo."
- Só notifica compradores da rifa (checa `orders` do usuário logado — como não há backend, roda no cliente do próprio comprador).

## 10. Área do cliente `/minhas-rifas`
- Remover cards de resumo (Compradores, Números Vendidos, Valor Arrecadado, Prêmios, Sorteios, Arrecadado).
- Substituir por **lista de rifas** (uma linha por rifa comprada): imagem, nome, data, hora, status, qtd de números comprados, botão **Ver** (abre drawer com detalhes + números).
- Topo: dois ComboBoxes pesquisáveis — (a) Todas | Abertas | Encerradas; (b) "Minhas Rifas" (seleciona rifa específica → drawer/detalhe filtrado).
- Cards continuam mostrando nome, data, hora, cronômetro e status.

## 11. UX geral
- Todos os `confirm()`/`alert()` restantes → `ConfirmDialog` + `toast`.
- ComboBox padrão = shadcn `Command` + `Popover` (pesquisa embutida) — criar wrapper `SearchableSelect`.
- Skeletons já existentes reutilizados nos novos DataTables/listas.
- Framer Motion em modais/drawers novos (fade+scale).
- Lazy load: `DrawExperienceModal`, `EditRifaModal`, `ChooseNumbersModal`, `ResultModal` via `React.lazy` + `Suspense`.

## 12. Novos arquivos
```
src/components/common/DataTable.tsx
src/components/common/SearchableSelect.tsx
src/components/rifa/ResultModal.tsx
src/components/rifa/ChooseNumbersModal.tsx
src/components/admin/EditRifaModal.tsx
src/components/admin/BuyersSearch.tsx
src/lib/screenRecorder.ts
src/lib/pushScheduler.ts
```

## 13. Arquivos alterados (sem quebrar contratos)
`types.ts`, `RifasContext.tsx`, `AuthContext.tsx`, `RifaCard.tsx`, `routes/index.tsx`, `routes/rifa.$id.tsx`, `routes/minhas-rifas.tsx`, `routes/admin.index.tsx`, `routes/admin.rifas.index.tsx`, `routes/admin.rifas.nova.tsx`, `routes/admin.sorteios.tsx`, `components/rifa/QuickBuyBar.tsx`, `components/rifa/NumbersGrid.tsx`.

## 14. Fora de escopo
- Backend/DB real, PIX real, JWT real, exportação efetiva (só deixamos DataTable preparado).

Confirma que sigo com esse escopo completo em uma única implementação?
