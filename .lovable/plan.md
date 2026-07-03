## Correções e melhorias — Rifas Online

### 1. Encerramento centralizado (fonte única da verdade)

Criar `src/lib/rifaStatus.ts` com helpers puros:

- `isRifaClosed(rifa)` → true se `status !== "ativa"` **ou** `drawDate` <= `Date.now()`.
- `canPurchase(rifa)` → `!isRifaClosed(rifa)`.
- `eligibleDrawNumbers(numbers, rifaId, orders)` → apenas números com `status === "vendido"` **e** cuja `order.status === "pago"` **e** `rifaId` corresponde.
- `canDraw(rifa, eligible)` → retorna `{ ok, reason }` validando: rifa encerrada, tem `drawDate`, existe ≥1 número elegível.

Usar esses helpers em toda parte (público, admin, contexto) para evitar divergências.

### 2. Bloqueio de compras após encerramento (`src/routes/rifa.$id.tsx`)

- Substituir `const finished = rifa.status !== "ativa"` por `const closed = isRifaClosed(rifa)`.
- Quando `closed`:
  - Ocultar `QuickBuyBar`, `ChooseNumbersModal`, botão "Comprar Números" e a `aside` de resumo.
  - Esconder `CountdownTimer`.
  - Mostrar um `Alert` destacado (bg-warning/10, ícone Lock): **"Esta rifa foi encerrada. Não é mais possível realizar compras."**
  - Manter `NumbersGrid` em modo leitura (`finished` prop já suportada).
- Endurecer `toggle()` e `buy()` para retornar cedo se `closed` (defesa em profundidade).
- Ajustar `RifasContext.reserveNumbers` para checar `isRifaClosed` e lançar/retornar erro; toast de erro no chamador.

### 3. Selo "Rifa Encerrada" e resultados

Na página pública quando `closed`:
- Selo grande no topo do card principal: `Badge` "Rifa Encerrada" (destructive).
- Bloco de resultado já existente é mantido, garantindo exibir: data/hora do sorteio, número vencedor, nome do vencedor, prêmio. Se ainda não sorteada, mostrar "Aguardando sorteio".

### 4. Sorteio — regras e validação (`admin.sorteios.tsx` + `RifasContext.drawRifa`)

- `drawRifa` passa a receber apenas números elegíveis via `eligibleDrawNumbers(state.numbers, rifaId, state.orders)`.
- Antes de sortear, executar `canDraw`:
  - se falhar → `toast.error(reason)` e abortar (não abrir `DrawExperienceModal`).
  - motivos possíveis: "Rifa ainda não foi encerrada", "Rifa sem data de sorteio", "Não existem números vendidos para realizar o sorteio."
- Botão "Realizar Sorteio" fica desabilitado quando `eligible.length === 0` com tooltip explicativo.
- Ao encerrar automaticamente por data: no `admin.sorteios.tsx` (e onde necessário) usar `isRifaClosed` para decidir se o botão de sortear aparece.

### 5. Gravação do sorteio em MP4 (`src/lib/screenRecorder.ts`)

Corrigir e ampliar:

- Detectar suporte a MP4 via `MediaRecorder.isTypeSupported("video/mp4;codecs=h264,aac")` e usá-lo quando disponível (Safari, Chrome recentes).
- Fallback: gravar em `video/webm` e converter para MP4 no cliente com **ffmpeg.wasm** (`@ffmpeg/ffmpeg` + `@ffmpeg/util`), carregado sob demanda (dynamic `import()`), extensão final `.mp4`.
- Se o navegador não suportar `getDisplayMedia` ou `MediaRecorder`: `toast.error` amigável.
- Tratar cancelamento pelo usuário (`NotAllowedError`) sem stacktrace.
- No `admin.sorteios.tsx`:
  - Botão alterna "Gravar Sorteio" ↔ "Parar Gravação".
  - Indicador fixo `REC` (badge vermelho pulsante `animate-pulse` + ponto) no topo direito da tela durante a gravação.
  - Toasts: início, parada com download, erro, conversão em andamento ("Convertendo para MP4…").

### 6. Imagem responsiva do card de rifa (`RifaCard.tsx` e `rifa.$id.tsx`)

- Definir fallback `defaultRifaImage` (novo asset `src/assets/rifa-placeholder.jpg` ou gerado) usado quando `rifa.image` está vazio.
- No card: usar `AspectRatio` (`ratio={4/3}`) com `<img className="h-full w-full object-contain bg-muted">` para não cortar; borda arredondada herdada do `Card`.
- Na página de detalhe: `AspectRatio ratio={16/10}` com `object-contain` e bg neutro para preservar proporção original em mobile/desktop.
- Adicionar `loading="lazy"` e `decoding="async"` onde faltar.

### 7. Remover card duplicado

Auditar e remover duplicações identificadas:
- `RifaCard`: linha "Sorteio: {drawDate}" duplica o `CountdownTimer` da página de detalhe; manter apenas o cronômetro no card + tooltip com a data, evitando repetir na home.
- Página `/rifa/:id`: `RifaStats` mostra `drawDate` e o `CountdownTimer` também — consolidar `drawDate` apenas dentro do `CountdownTimer` header.
- Confirmar durante a implementação se o usuário se refere a outro card específico; ajustar em seguida se necessário.

### 8. Correção de hidratação SSR do cronômetro

`useCountdown` inicia com `Date.now()` no SSR e re-renderiza no cliente → mismatch (visto em runtime error). Ajuste: retornar `null`/zeros até `useEffect` marcar `mounted = true`; renderizar `--` no primeiro paint em SSR.

### 9. Qualidade / consistência

- Substituir os checks pontuais de `rifa.status !== "ativa"` por `isRifaClosed(rifa)` em: `RifaCard`, `rifa.$id.tsx`, `minhas-rifas.tsx`, `admin.rifas.index.tsx`, `admin.sorteios.tsx`.
- `RifasContext.confirmPayment` inalterado, mas garantir que só marca `vendido` se a order estava `pendente` (já é).
- Nenhuma mudança em rotas, tipos existentes ou fluxos de auth.

### Detalhes técnicos

- Novo arquivo: `src/lib/rifaStatus.ts` (helpers puros, sem side effects).
- Atualizados: `src/lib/screenRecorder.ts`, `src/routes/rifa.$id.tsx`, `src/routes/admin.sorteios.tsx`, `src/context/RifasContext.tsx`, `src/components/rifa/RifaCard.tsx`, `src/components/rifa/NumbersGrid.tsx` (guardas), `src/lib/useCountdown.ts` (SSR-safe).
- Dependências novas (lazy loaded): `@ffmpeg/ffmpeg`, `@ffmpeg/util` (~poucos MB, carregados só ao gravar em fallback webm→mp4).
- Sem mudanças de schema ou backend (localStorage mantido).

### Fora de escopo

- Backend real, autenticação server-side, pagamentos reais.
- Redesenho visual amplo.
