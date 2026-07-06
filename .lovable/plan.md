## Pacotes Promocionais por Rifa

Adiciona pacotes de preço opcionais em cada rifa. Não altera lógica de compra existente — apenas modula o valor final e adiciona um limite opcional de quantidade quando um pacote está ativo.

### 1. Modelo de dados

`src/lib/types.ts`
- Novo tipo `RifaPackage { id: string; quantity: number; price: number; description?: string }`.
- Adicionar `packages?: RifaPackage[]` em `Rifa`.

Nenhuma migração — persistência é localStorage via `RifasContext`.

### 2. Área administrativa

**Novo componente** `src/components/admin/PackagesEditor.tsx`
- Seção "Pacotes Promocionais" com botão "+ Adicionar Pacote".
- Cada linha: inputs Quantidade, Valor, Descrição, botão remover.
- Validações inline: quantidade > 0, valor > 0, sem quantidades duplicadas, quantidade ≤ `totalNumbers` da rifa.
- Ordena automaticamente por quantidade ao salvar.
- Exibe preço unitário calculado e economia vs. `pricePerNumber × quantity`.

**Integração**
- `src/routes/admin.rifas.nova.tsx`: nova seção usando `PackagesEditor`; envia `packages` para `createRifa`.
- `src/components/admin/EditRifaModal.tsx`: mesma seção para editar pacotes de rifa existente.
- `src/context/RifasContext.tsx`: `createRifa` e `updateRifa` já aceitam campos genéricos; apenas garantir que `packages` seja preservado.

### 3. Página da rifa (cliente)

`src/routes/rifa.$id.tsx` + novo componente `src/components/rifa/PackagesPicker.tsx`
- Acima do `NumbersGrid`, seção "Escolha sua oferta" com cards dos pacotes.
- Cada card mostra: quantidade, descrição (badge "🔥"), preço promocional, "De: R$X", "Economize: R$Y (Z%)".
- Desktop: grid horizontal. Mobile: scroll horizontal (`overflow-x-auto snap-x`).
- Clicar num card:
  - Define `activePackage` no estado local do `RifaDetail`.
  - NÃO seleciona números.
  - Exibe toast "Pacote promocional selecionado."
  - Se `selected.length > pkg.quantity`: `ConfirmDialog` "Você possui mais números selecionados do que o pacote escolhido. Deseja limpar os excedentes?" — ao confirmar, trunca `selected` para `pkg.quantity` primeiros.
- Botão "Remover pacote" volta ao cálculo unitário.

### 4. Contador e limite

`src/components/rifa/QuickBuyBar.tsx` + `NumbersGrid.tsx`
- Novo prop `maxSelectable?: number` (vem de `activePackage.quantity`).
- Ao tentar adicionar número quando `selected.length >= maxSelectable`: bloquear e toast "Quantidade máxima do pacote atingida."
- Aplica também aos botões +1/+5/+10/+20 (truncar ao limite) e ao `ChooseNumbersModal` (rejeita excedentes com mensagem).
- Remover número sempre permitido; libera nova seleção.
- Exibir header "Escolhidos: X / N" quando pacote ativo, e "Escolhidos: X" caso contrário.

### 5. Cálculo do valor

Novo helper `src/lib/pricing.ts`:
```
computePrice(selectedCount, unitPrice, packages, activePackageId?) 
  → { total, unitTotal, appliedPackage?, savings, discountPct }
```
Regras:
- Se `activePackage` existe e `selectedCount === activePackage.quantity` → usa preço do pacote.
- Se não há pacote ativo mas `selectedCount` bate exatamente com algum `packages[i].quantity` → aplica automaticamente (menor preço se houver empate) e mostra toast "Pacote promocional aplicado."
- Caso contrário → `selectedCount × unitPrice`.

Usado em:
- Painel lateral de resumo do `rifa.$id.tsx` (mostra "Pacote aplicado", valor unitário riscado quando aplica).
- `PixModal.tsx` (checkout): exibe quantidade, pacote aplicado, valor unitário base, desconto, valor final.
- `reserveNumbers` em `RifasContext`: cálculo do `order.total` passa a usar `computePrice` em vez de `nums.length * pricePerNumber`.

### 6. UX / animações

- Card ativo do pacote: `ring-2 ring-primary`, transform `scale-[1.02]`, transição suave.
- Badge "Mais Vendido" (ou descrição) com gradiente.
- Toasts via `sonner` já disponíveis.

### 7. Compatibilidade

- Rifas sem `packages` continuam funcionando exatamente como hoje (seção fica oculta).
- Nenhuma mudança em `drawRifa`, `confirmPayment`, `isRifaClosed`, autenticação ou grid de números além do `maxSelectable` opcional.
- Mocks existentes (`mockRifas.ts`): opcional adicionar `packages` em 1–2 rifas para demonstração.

### Arquivos

Novos:
- `src/lib/pricing.ts`
- `src/components/admin/PackagesEditor.tsx`
- `src/components/rifa/PackagesPicker.tsx`

Editados:
- `src/lib/types.ts`
- `src/context/RifasContext.tsx` (usar `computePrice` em `reserveNumbers`)
- `src/routes/admin.rifas.nova.tsx`
- `src/components/admin/EditRifaModal.tsx`
- `src/routes/rifa.$id.tsx`
- `src/components/rifa/QuickBuyBar.tsx`
- `src/components/rifa/NumbersGrid.tsx`
- `src/components/rifa/ChooseNumbersModal.tsx`
- `src/components/rifa/PixModal.tsx`
- `src/mocks/mockRifas.ts` (dados de exemplo — opcional)
