# Plano — Rifas Online (MVP)

App completo de rifas com dois perfis (cliente e admin), dados 100% mockados em memória, sem backend, sem PIX real, sem JWT. Foco em UX polida estilo SaaS (Mercado Pago / Hotmart).

## Observações de stack

O template usa **TanStack Router** (file-based em `src/routes/`), não React Router DOM. Vou usar TanStack Router mantendo as mesmas URLs pedidas. Context API + `localStorage` para persistir sessão e estado mockado entre reloads (sem backend). Tudo em Tailwind v4 + shadcn já instalados.

## Design

- Tema claro, cartões com `rounded-2xl`, sombras suaves, espaçamento generoso
- Paleta: primária verde-esmeralda (confiança/dinheiro), acentos âmbar para "aguardando", vermelho suave para "vendido"
- Tipografia: display Sora + body Inter (carregados via `<link>` no `__root.tsx`)
- Tokens definidos em `src/styles.css` (`@theme`), sem cores hardcoded
- Animações discretas (framer-motion já disponível via tw-animate-css), skeletons, toasts via `sonner`

## Estrutura de arquivos

```
src/
  mocks/
    mockUsers.ts
    mockRifas.ts
    mockNumbers.ts        // estado dos números por rifa
    mockOrders.ts
    mockPayments.ts
    mockDraws.ts
    images/ (3 imagens geradas: iphone, moto, ps)
  context/
    AuthContext.tsx       // login/logout, usuário atual, persistência localStorage
    RifasContext.tsx      // CRUD rifas, números, pedidos, pagamentos, sorteios
  components/
    layout/PublicHeader.tsx
    layout/AdminSidebar.tsx
    rifa/RifaCard.tsx
    rifa/NumbersGrid.tsx
    rifa/PixModal.tsx
    admin/StatCard.tsx
    admin/Charts.tsx      // recharts
    common/ProtectedRoute.tsx
  routes/
    __root.tsx            // já existe — adicionar providers + fontes
    index.tsx             // home cliente (lista de rifas)
    login.tsx
    register.tsx
    rifa.$id.tsx
    minhas-rifas.tsx
    admin.tsx             // layout com sidebar + <Outlet/>
    admin.index.tsx       // dashboard
    admin.rifas.tsx
    admin.rifas.nova.tsx
    admin.rifas.$id.tsx
    admin.sorteios.tsx
```

## Dados mockados (seeds)

- **Users**: admin@rifas.com / 123456 (role: admin); joao@email.com / 123456 (role: cliente, cpf, telefone)
- **Rifas**: 3 rifas conforme spec (iPhone, Honda CG 160, PS6 encerrada com vencedor 777 = João)
- **Numbers**: array por rifa com status `disponivel | aguardando | vendido` e `userId` opcional; seed coerente com "vendidos" das rifas (PS6 100% vendida, João dono do 777)
- **Orders / Payments**: histórico mínimo para João aparecer em "Minhas Rifas"
- **Draws**: 1 sorteio (PS6)

## Fluxos principais

### Auth (fake)
- `AuthContext` valida email+senha contra `mockUsers`, salva user em `localStorage`
- `ProtectedRoute` redireciona conforme role
- Tela login com botões "Entrar como Admin" / "Entrar como Cliente" (autofill)

### Cliente
- **Home `/`**: grid de cards (imagem, prêmio, valor, progresso vendidos/total, badge status, botão "Ver Rifa")
- **`/rifa/:id`**: hero com imagem + descrição + valor; grid de números com 3 cores; ações "Aleatórios (n)", "Limpar", "Comprar (X números — R$ Y)"
- **PixModal**: resumo + QRCode placeholder (SVG fake) + código `000201010212MOCKPIX123456789` + botão "Simular pagamento aprovado" → marca números como `vendido`, cria payment `pago`, toast sucesso, redireciona para `/minhas-rifas`
- **`/minhas-rifas`**: tabela/cards com rifa, números, status, data, resultado se sorteada

### Admin
- **`/admin`** (dashboard): 7 StatCards + 3 gráficos recharts (barras vendas por rifa, linha arrecadação mensal mock, área participantes/mês mock)
- **`/admin/rifas`**: tabela com ações editar/encerrar/cancelar/ver compradores (modal lista compradores)
- **`/admin/rifas/nova`** e **`/admin/rifas/:id`**: formulário com react-hook-form + zod; imagem via URL ou upload local (base64)
- **`/admin/sorteios`**: lista rifas elegíveis (com vendidos > 0); botão "Realizar Sorteio" sorteia número entre os vendidos, mostra animação simples, salva em `mockDraws`, exibe vencedor

## Detalhes técnicos

- Sem TanStack Query / loaders — leituras direto do context (dados síncronos em memória)
- Persistência: cada mutação atualiza estado do context e espelha em `localStorage` (chave `rifas_state_v1`); reset opcional via botão no admin
- Tokens semânticos em `styles.css`: `--color-primary` (esmeralda), `--color-success`, `--color-warning`, `--color-destructive`, gradientes para hero do admin
- Imagens dos prêmios geradas via imagegen e salvas em `src/assets/`
- Toasts via `sonner` (já no stack)
- Loading skeletons nos cards na primeira renderização (delay artificial pequeno)

## Entregáveis ao final
- 11 rotas funcionais
- Login com 2 perfis pré-cadastrados (autofill)
- Fluxo de compra completo com PIX fake e atualização de status
- Dashboard admin com indicadores e gráficos
- CRUD completo de rifas + sorteio funcional
- Layout responsivo (mobile-first), tema claro, identidade visual coerente

Confirma para eu construir?
