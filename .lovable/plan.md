
# Plano — Rifas Online Premium UX

Foco 100% em camada visual, microinterações e novos componentes de apresentação. Nenhuma mudança em `RifasContext`, mocks, tipos, rotas existentes ou fluxo de dados. Toda persistência, cálculo de números e sorteio (`drawRifa`) continuam iguais.

## 1. Novas dependências
- `canvas-confetti` — confetes do sorteio e da compra
- `html-to-image` — gerar PNG do card de resultado para compartilhar
- `qrcode.react` — QR code da próxima rifa no card compartilhável

`framer-motion`, `sonner`, `recharts`, `lucide-react` já estão instalados.

Sons curtos (countdown tick, suspense loop, vitória) via WebAudio API programático (sem baixar assets externos), encapsulados em `src/lib/sound.ts` para manter build leve e offline.

## 2. Novos arquivos

```
src/components/draw/
  DrawExperienceModal.tsx     # modal fullscreen com 3 etapas + confetes + som
  DrawCountdown.tsx           # 3-2-1 com scale/fade
  DrawReel.tsx                # bobina de números girando com blur/scale
  WinnerCard.tsx              # tela final "PARABÉNS" + botões
  ShareResultCard.tsx         # card renderizado -> PNG (logo, prêmio, nº, nome, QR)
  PresentationMode.tsx        # wrapper fullscreen sem chrome p/ live/gravação

src/components/rifa/
  CountdownTimer.tsx          # dias:horas:min:seg, cor laranja <24h, vermelho <1h
  RifaStats.tsx               # card com 5 métricas (compradores, vendidos, arrecadado, sorteio, prêmios)
  QuickBuyBar.tsx             # botões +1 +5 +10 +20 Aleatório Limpar
  ProgressBlock.tsx           # barra elegante + labels (vendidos/restantes/%)

src/components/common/
  ConfirmDialog.tsx           # AlertDialog reutilizável (substitui confirm())
  SkeletonCard.tsx, SkeletonTable.tsx, SkeletonDashboard.tsx

src/lib/
  sound.ts                    # tick(), suspense(start/stop), victory() via WebAudio
  share.ts                    # download PNG, share WhatsApp/Instagram (Web Share API + fallback)
  useCountdown.ts             # hook do relógio regressivo
```

## 3. Fluxo do sorteio premium (`/admin/sorteios`)

Substituir o botão atual por um handler que abre `DrawExperienceModal`:

```text
Etapa 1  ── overlay escuro + "Preparando sorteio..." (1s)
         └─ Countdown 3→2→1 (scale+fade, tick sonoro por número)
Etapa 2  ── DrawReel: números vendidos rolando com blur→nítido,
            desaceleração easeOut, 4–6s, som de suspense em loop,
            legenda "Escolhendo o número vencedor..."
Etapa 3  ── chama drawRifa() UMA vez (lógica intacta) para obter o vencedor real
         └─ para a bobina no número retornado
         └─ canvas-confetti + som de vitória
         └─ WinnerCard com Compartilhar / Gerar Imagem / Fechar
```

O `drawRifa` do contexto é chamado no início da Etapa 2 e o resultado guardado; a bobina apenas encena até parar no número já sorteado — garante consistência com a persistência atual.

Botão extra "Modo Apresentação" abre a mesma experiência dentro de `PresentationMode` (sem `AdminLayout` chrome — usa `createPortal` no `document.body`, esconde sidebar/header via z-index full-screen).

## 4. Compartilhamento
`ShareResultCard` é um componente off-screen (1080×1350) renderizado com logo, imagem do prêmio, número vencedor, nome, data e QR code (link para próxima rifa ativa, se existir). `html-to-image` gera PNG:
- Baixar imagem (download local)
- WhatsApp: `https://wa.me/?text=...` + link ao preview
- Instagram: baixa PNG + toast "Imagem salva — abra o Instagram para postar" (não há API pública direta)
- Usa `navigator.share` quando disponível (mobile)

## 5. Página `/rifa/:id`
Acima do grid de números, adicionar em ordem:
1. `CountdownTimer` (usa `rifa.drawDate`)
2. `ProgressBlock` (usa `sold` já calculado)
3. `RifaStats` (compradores = orders únicas, arrecadado = sold × preço)
4. `QuickBuyBar` (+1 +5 +10 +20 Aleatório, Limpar) — complementa seleção existente sem tocar em disponíveis

Selecionar número: adicionar classe `animate-[ripple_300ms]` + `scale-105` + brilho verde no `NumbersGrid` (apenas Tailwind + keyframe novo em `styles.css`).

Ao concluir compra: confetes discretos + toast verde + números recém-comprados piscam verde por ~1.2s antes de virar "vendido" (efeito visual local, estado real permanece).

## 6. Dashboard `/admin`
Enriquecer com blocos usando dados já disponíveis em `RifasContext`:
- Últimas compras / últimos compradores (deriva de `orders`)
- Próximos sorteios (rifas ativas ordenadas por `drawDate`)
- Total arrecadado no mês, rifas ativas/finalizadas
- Manter gráficos Recharts atuais; adicionar `SkeletonDashboard` no primeiro paint

## 7. Cards de rifa (home e `/admin/rifas`)
Estender `RifaCard` e a tabela admin com: valor arrecadado, nº compradores, data do sorteio, ações Editar/Compartilhar/Ver/Encerrar (todas já existentes no contexto, apenas expor via menu). Hover eleva sombra (`hover:shadow-elevated`), imagem faz leve zoom.

## 8. Toasts, confirmações e skeletons
- Remover qualquer `alert()`/`confirm()` remanescente; usar `sonner` com ícones Lucide e variantes success/info/error (fade+slide, 3s).
- `ConfirmDialog` para ações destrutivas (encerrar/cancelar/excluir).
- `SkeletonCard/Table/Dashboard` aplicados em home, `/admin`, `/admin/rifas`, buyers dialog e `/rifa/:id` durante primeiro render.

## 9. Microinterações globais (styles.css + utilitários)
Adicionar keyframes: `ripple`, `pulse-win`, `reel-spin`, `count-pop`. Utilitários `.hover-elevate`, `.input-focus-ring`. Modais shadcn já usam scale+fade; garantir em todos os `Dialog`.

## 10. Responsividade & performance
- Grid/timer/stats em `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` com `min-w-0`.
- Animações só com `transform` e `opacity`.
- `DrawReel` limita a ~30 números renderizados por vez com `will-change: transform`.
- Sons opt-out via botão mudo no modal.

## 11. Garantias
- `RifasContext`, mocks, tipos, rotas e assinatura de `drawRifa`/`reserveNumbers`/`confirmPayment` permanecem inalterados.
- Nenhuma rota removida; `PresentationMode` é overlay dentro de `/admin/sorteios`.
- Build TanStack Start continua com file-based routing atual.

## Detalhes técnicos
- WebAudio: `OscillatorNode` + `GainNode` — beep 880Hz para tick, ruído filtrado 200Hz para suspense, arpejo C-E-G para vitória. Sem arquivos.
- `html-to-image.toPng(node, { pixelRatio: 2 })` no `ShareResultCard` posicionado `fixed -left-[9999px]`.
- `useCountdown(target)` retorna `{days,hours,minutes,seconds,expired}` com `setInterval(1000)` + cleanup.
- Confetes: `confetti({ particleCount: 180, spread: 90, origin: {y:0.6} })` — versão discreta com 40 partículas na compra.

Pronto para implementar quando aprovado.
