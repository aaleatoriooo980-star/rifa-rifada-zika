import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { useRifas } from "@/context/RifasContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { NumbersGrid } from "@/components/rifa/NumbersGrid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { formatBRL } from "@/lib/format";
import { computePrice } from "@/lib/pricing";
import { isRifaClosed } from "@/lib/rifaStatus";
import {
  Ticket,
  User,
  Phone,
  Search,
  Plus,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export const Route = createFileRoute("/admin/venda-balcao")({
  head: () => ({ meta: [{ title: "Venda no Balcão — Admin" }] }),
  component: VendaBalcao,
});

function VendaBalcao() {
  const { rifas, getNumbersForRifa, createCounterSale } = useRifas();
  const { users, createCounterClient } = useAuth();
  const navigate = useNavigate();

  // Step 1: Rifa
  const activeRifas = useMemo(() => {
    return rifas.filter((r) => r.status === "ativa" && !r.archived);
  }, [rifas]);

  const rifaOptions = useMemo(() => {
    return activeRifas.map((r) => ({
      value: r.id,
      label: r.title,
      hint: `${formatBRL(r.pricePerNumber)} / número`,
    }));
  }, [activeRifas]);

  const [selectedRifaId, setSelectedRifaId] = useState<string>("");

  // Auto-select if only 1 active rifa exists
  useEffect(() => {
    if (activeRifas.length === 1 && !selectedRifaId) {
      setSelectedRifaId(activeRifas[0].id);
    }
  }, [activeRifas, selectedRifaId]);

  const selectedRifa = useMemo(() => {
    return rifas.find((r) => r.id === selectedRifaId);
  }, [rifas, selectedRifaId]);

  // Numbers for the selected Rifa
  const numbers = useMemo(() => {
    if (!selectedRifaId) return [];
    return getNumbersForRifa(selectedRifaId).sort((a, b) => a.number - b.number);
  }, [selectedRifaId, getNumbersForRifa]);

  // Selected Numbers
  const [selectedNums, setSelectedNums] = useState<number[]>([]);

  // Reset selected numbers when changing Rifa
  useEffect(() => {
    setSelectedNums([]);
  }, [selectedRifaId]);

  // Step 2: Cliente
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");

  const selectedClient = useMemo(() => {
    return users.find((u) => u.id === selectedClientId);
  }, [users, selectedClientId]);

  // Filter clients by name or phone
  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return [];
    const query = clientSearch.toLowerCase();
    return users.filter(
      (u) =>
        u.role === "cliente" &&
        (u.name.toLowerCase().includes(query) || (u.phone && u.phone.includes(query)))
    );
  }, [users, clientSearch]);

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim() || !newClientPhone.trim()) {
      toast.error("Preencha o nome e o telefone do cliente.");
      return;
    }
    try {
      const newClient = createCounterClient(newClientName.trim(), newClientPhone.trim());
      setSelectedClientId(newClient.id);
      setShowNewClientForm(false);
      setNewClientName("");
      setNewClientPhone("");
      setClientSearch("");
      toast.success("Cliente cadastrado e selecionado com sucesso!");
    } catch (err: any) {
      toast.error("Erro ao cadastrar cliente.");
    }
  };

  // Step 4: Packages & Pricing Calculation
  const priceDetails = useMemo(() => {
    if (!selectedRifa) return { total: 0, unitTotal: 0, savings: 0, discountPct: 0 };
    return computePrice(
      selectedNums.length,
      selectedRifa.pricePerNumber,
      selectedRifa.packages,
      null
    );
  }, [selectedNums.length, selectedRifa]);

  // Step 5 & 6: Payment Method & Payment Status
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<"pago" | "pendente">("pago");

  // Step 7: Confirm Sale Modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [lastCreatedOrder, setLastCreatedOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmSale = () => {
    if (!selectedRifaId) {
      toast.error("Selecione uma rifa.");
      return;
    }
    if (!selectedClientId) {
      toast.error("Selecione ou cadastre um cliente.");
      return;
    }
    if (selectedNums.length === 0) {
      toast.error("Selecione ao menos um número.");
      return;
    }
    if (!paymentMethod) {
      toast.error("Selecione a forma de pagamento.");
      return;
    }

    setConfirmOpen(true);
  };

  const executeSale = () => {
    setIsLoading(true);
    setConfirmOpen(false);

    // Simulate small delay for loading spinner/skeleton feeling
    setTimeout(() => {
      try {
        const order = createCounterSale({
          rifaId: selectedRifaId,
          userId: selectedClientId,
          numbers: selectedNums,
          paymentMethod,
          status: paymentStatus,
        });

        setLastCreatedOrder(order);
        setIsLoading(false);
        setSuccessOpen(true);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#10b981", "#34d399", "#065f46"],
        });
        toast.success("Venda registrada com sucesso! 🎉");
      } catch (err: any) {
        setIsLoading(false);
        toast.error(err?.message || "Não foi possível concluir a venda.");
      }
    }, 600);
  };

  const resetForm = () => {
    setSelectedNums([]);
    setSelectedClientId("");
    setClientSearch("");
    setPaymentMethod("");
    setPaymentStatus("pago");
    setSuccessOpen(false);
    setLastCreatedOrder(null);
  };

  // WhatsApp Message Composer
  const handleWhatsAppShare = () => {
    if (!lastCreatedOrder || !selectedClient || !selectedRifa) return;
    
    const formattedNumbers = lastCreatedOrder.numbers
      .map((n: number) => String(n))
      .join("\n");

    const text = `Olá ${selectedClient.name}!

Sua compra foi registrada com sucesso.

Rifa:
${selectedRifa.title}

Números:
${formattedNumbers}

Valor:
${formatBRL(lastCreatedOrder.total)}

Boa sorte!`;

    const cleanPhone = selectedClient.phone?.replace(/\D/g, "") || "";
    const url = `https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <span>🏪</span> Venda no Balcão
        </h1>
        <p className="text-sm text-muted-foreground">
          Registre uma venda presencial de forma rápida para os clientes da loja.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_350px]">
        {/* Main flow cards */}
        <div className="space-y-6">
          {/* Step 1: Select Rifa */}
          <Card className="shadow-soft">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Ticket className="h-5 w-5 text-primary" />
                <h3 className="font-display font-semibold">Passo 1: Selecionar a Rifa</h3>
              </div>
              {activeRifas.length === 0 ? (
                <div className="flex items-center gap-2 text-destructive py-2">
                  <AlertCircle className="h-5 w-5" />
                  <span>Não existem rifas ativas no momento.</span>
                </div>
              ) : (
                <div className="w-full">
                  <Label htmlFor="rifa-select">Rifas Disponíveis</Label>
                  <div className="mt-1.5">
                    <SearchableSelect
                      value={selectedRifaId}
                      onChange={setSelectedRifaId}
                      options={rifaOptions}
                      placeholder="Selecione uma Rifa..."
                      searchPlaceholder="Pesquisar Rifa..."
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Cliente */}
          {selectedRifaId && (
            <Card className="shadow-soft">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <h3 className="font-display font-semibold">Passo 2: Cliente</h3>
                  </div>
                  {selectedClientId && (
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                      Selecionado
                    </Badge>
                  )}
                </div>

                {!selectedClientId && !showNewClientForm && (
                  <div className="space-y-3">
                    <Label htmlFor="client-search">Pesquisar Cliente</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="client-search"
                        placeholder="Pesquisar por Nome ou Telefone..."
                        value={clientSearch}
                        onChange={(e) => setClientSearch(e.target.value)}
                        className="pl-9"
                      />
                    </div>

                    {/* Results list */}
                    {clientSearch.trim() && (
                      <div className="border rounded-md max-h-40 overflow-y-auto bg-card divide-y">
                        {filteredClients.length === 0 ? (
                          <div className="p-3 text-sm text-muted-foreground text-center">
                            Nenhum cliente encontrado.
                          </div>
                        ) : (
                          filteredClients.map((u) => (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => {
                                setSelectedClientId(u.id);
                                setClientSearch("");
                              }}
                              className="w-full p-2.5 text-left text-sm hover:bg-muted transition-colors flex justify-between items-center"
                            >
                              <div>
                                <div className="font-medium text-foreground">{u.name}</div>
                                <div className="text-xs text-muted-foreground">{u.phone || "Sem telefone"}</div>
                              </div>
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            </button>
                          ))
                        )}
                      </div>
                    )}

                    <div className="pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowNewClientForm(true)}
                        className="w-full flex items-center justify-center gap-1.5 border-dashed"
                      >
                        <Plus className="h-4 w-4" /> Cadastrar Novo Cliente
                      </Button>
                    </div>
                  </div>
                )}

                {/* New Client Form */}
                {showNewClientForm && (
                  <form onSubmit={handleCreateClient} className="space-y-4 border p-4 rounded-lg bg-muted/20">
                    <h4 className="font-semibold text-sm">Novo Cliente</h4>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="new-name">Nome Completo</Label>
                        <Input
                          id="new-name"
                          placeholder="Ex: João Silva"
                          value={newClientName}
                          onChange={(e) => setNewClientName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-phone">Telefone (WhatsApp)</Label>
                        <Input
                          id="new-phone"
                          placeholder="Ex: 11999999999"
                          value={newClientPhone}
                          onChange={(e) => setNewClientPhone(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNewClientForm(false)}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" size="sm" className="bg-primary text-primary-foreground">
                        Salvar e Selecionar
                      </Button>
                    </div>
                  </form>
                )}

                {/* Selected Client Card */}
                {selectedClientId && selectedClient && (
                  <div className="flex items-center justify-between border p-3 rounded-lg bg-primary/5 border-primary/10">
                    <div className="flex gap-3 items-center">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {selectedClient.name[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{selectedClient.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {selectedClient.phone || "Sem Telefone"}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedClientId("")}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      Remover
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Escolha dos números */}
          {selectedRifaId && selectedClientId && (
            <Card className="shadow-soft">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b justify-between">
                  <div className="flex items-center gap-2">
                    <Ticket className="h-5 w-5 text-primary" />
                    <h3 className="font-display font-semibold">Passo 3: Escolha dos Números</h3>
                  </div>
                  {selectedNums.length > 0 && (
                    <Badge className="bg-primary text-primary-foreground">
                      {selectedNums.length} selecionado(s)
                    </Badge>
                  )}
                </div>

                {numbers.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between text-xs text-muted-foreground gap-2">
                      <span>Clique nos números disponíveis para selecionar:</span>
                      <div className="flex flex-wrap gap-2.5">
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded bg-success/20 inline-block"></span> Disp.
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded bg-destructive/20 line-through inline-block"></span> Vend.
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded bg-primary inline-block"></span> Sel.
                        </span>
                      </div>
                    </div>
                    <div className="max-h-72 overflow-y-auto pr-1">
                      <NumbersGrid
                        numbers={numbers}
                        selected={selectedNums}
                        onToggle={(n) => {
                          setSelectedNums((prev) =>
                            prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]
                          );
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Summary & Payment Details */}
        <div className="space-y-6">
          <Card className="shadow-soft sticky top-4">
            <CardContent className="p-5 space-y-5">
              <h3 className="font-display font-bold border-b pb-2 text-lg">Resumo da Venda</h3>

              {/* Rifa details */}
              {selectedRifa ? (
                <div className="space-y-1 text-sm">
                  <div className="font-semibold">{selectedRifa.title}</div>
                  <div className="text-xs text-muted-foreground">
                    Preço por número: {formatBRL(selectedRifa.pricePerNumber)}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground py-2 italic">
                  Selecione uma rifa para começar...
                </div>
              )}

              {/* Client details */}
              {selectedClient && (
                <div className="space-y-1 border-t pt-3 text-sm">
                  <div className="text-xs text-muted-foreground">Cliente</div>
                  <div className="font-medium">{selectedClient.name}</div>
                </div>
              )}

              {/* Pricing breakdown */}
              {selectedNums.length > 0 && selectedRifa && (
                <div className="space-y-2 border-t pt-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantidade:</span>
                    <span className="font-medium">{selectedNums.length} números</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor unitário:</span>
                    <span className="font-medium">{formatBRL(selectedRifa.pricePerNumber)}</span>
                  </div>
                  {priceDetails.savings > 0 && (
                    <div className="flex justify-between text-success">
                      <span>Desconto aplicado:</span>
                      <span>-{formatBRL(priceDetails.savings)} ({priceDetails.discountPct}%)</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
                    <span>Valor final:</span>
                    <span className="text-primary">{formatBRL(priceDetails.total)}</span>
                  </div>
                </div>
              )}

              {/* Step 5: Forma de pagamento */}
              {selectedNums.length > 0 && (
                <div className="space-y-3 border-t pt-3">
                  <Label className="font-semibold text-sm">Passo 5: Forma de Pagamento</Label>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-2 gap-2 mt-1.5">
                    <Label
                      htmlFor="pay-pix"
                      className={`flex items-center gap-2 border p-2.5 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                        paymentMethod === "pix" ? "border-primary bg-primary/5 text-primary" : ""
                      }`}
                    >
                      <RadioGroupItem value="pix" id="pay-pix" className="sr-only" />
                      <span>📱 PIX</span>
                    </Label>
                    <Label
                      htmlFor="pay-cash"
                      className={`flex items-center gap-2 border p-2.5 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                        paymentMethod === "dinheiro" ? "border-primary bg-primary/5 text-primary" : ""
                      }`}
                    >
                      <RadioGroupItem value="dinheiro" id="pay-cash" className="sr-only" />
                      <span>💵 Dinheiro</span>
                    </Label>
                    <Label
                      htmlFor="pay-debit"
                      className={`flex items-center gap-2 border p-2.5 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                        paymentMethod === "debito" ? "border-primary bg-primary/5 text-primary" : ""
                      }`}
                    >
                      <RadioGroupItem value="debito" id="pay-debit" className="sr-only" />
                      <span>💳 Débito</span>
                    </Label>
                    <Label
                      htmlFor="pay-credit"
                      className={`flex items-center gap-2 border p-2.5 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                        paymentMethod === "credito" ? "border-primary bg-primary/5 text-primary" : ""
                      }`}
                    >
                      <RadioGroupItem value="credito" id="pay-credit" className="sr-only" />
                      <span>💳 Crédito</span>
                    </Label>
                    <Label
                      htmlFor="pay-other"
                      className={`flex items-center gap-2 border p-2.5 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                        paymentMethod === "outro" ? "border-primary bg-primary/5 text-primary" : ""
                      }`}
                    >
                      <RadioGroupItem value="outro" id="pay-other" className="sr-only" />
                      <span>⚙️ Outro</span>
                    </Label>
                  </RadioGroup>
                </div>
              )}

              {/* Step 6: Status do pagamento */}
              {selectedNums.length > 0 && paymentMethod && (
                <div className="space-y-3 border-t pt-3">
                  <Label className="font-semibold text-sm">Passo 6: Status do Pagamento</Label>
                  <RadioGroup
                    value={paymentStatus}
                    onValueChange={(val) => setPaymentStatus(val as "pago" | "pendente")}
                    className="flex gap-4 mt-1.5"
                  >
                    <Label
                      htmlFor="status-pago"
                      className={`flex-1 flex items-center justify-center gap-2 border p-2 rounded-lg cursor-pointer transition-colors ${
                        paymentStatus === "pago" ? "border-success bg-success/5 text-success font-semibold" : ""
                      }`}
                    >
                      <RadioGroupItem value="pago" id="status-pago" className="sr-only" />
                      <span>Pago</span>
                    </Label>
                    <Label
                      htmlFor="status-pendente"
                      className={`flex-1 flex items-center justify-center gap-2 border p-2 rounded-lg cursor-pointer transition-colors ${
                        paymentStatus === "pendente" ? "border-warning bg-warning/5 text-warning font-semibold" : ""
                      }`}
                    >
                      <RadioGroupItem value="pendente" id="status-pendente" className="sr-only" />
                      <span>Pendente</span>
                    </Label>
                  </RadioGroup>
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-t pt-4">
                <Button
                  onClick={handleConfirmSale}
                  disabled={
                    !selectedRifaId ||
                    !selectedClientId ||
                    selectedNums.length === 0 ||
                    !paymentMethod ||
                    isLoading
                  }
                  className="w-full bg-gradient-primary text-primary-foreground flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4" />
                      <span>Confirmar Venda</span>
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="rounded-xl max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmar Registro de Venda</DialogTitle>
            <DialogDescription>
              Você está prestes a registrar a venda de {selectedNums.length} números para o cliente{" "}
              <strong>{selectedClient?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2 text-sm">
            <div className="flex justify-between border-b pb-1">
              <span className="text-muted-foreground">Valor Total:</span>
              <span className="font-semibold text-primary">{formatBRL(priceDetails.total)}</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span className="text-muted-foreground">Método:</span>
              <span className="font-semibold uppercase">{paymentMethod}</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span className="text-muted-foreground">Status:</span>
              <span
                className={`font-semibold ${
                  paymentStatus === "pago" ? "text-success" : "text-warning"
                }`}
              >
                {paymentStatus === "pago" ? "Pago (Reservas Finalizadas)" : "Pendente (Reservado)"}
              </span>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="ghost" onClick={() => setConfirmOpen(false)} className="w-full">
              Cancelar
            </Button>
            <Button onClick={executeSale} className="w-full bg-primary text-primary-foreground">
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog (Receipt / Comprovante) */}
      <Dialog open={successOpen} onOpenChange={() => {}}>
        <DialogContent className="rounded-xl max-w-md pointer-events-auto">
          <DialogHeader className="items-center text-center">
            <CheckCircle className="h-12 w-12 text-success mb-2 animate-bounce" />
            <DialogTitle>Venda realizada com sucesso.</DialogTitle>
            <DialogDescription>
              A venda no balcão foi registrada no sistema.
            </DialogDescription>
          </DialogHeader>

          {lastCreatedOrder && selectedRifa && selectedClient && (
            <div className="rounded-lg border bg-muted/20 p-4 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cliente:</span>
                <span className="font-medium text-foreground">{selectedClient.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Telefone:</span>
                <span className="font-medium text-foreground">{selectedClient.phone || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rifa:</span>
                <span className="font-medium text-foreground">{selectedRifa.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Números:</span>
                <span className="font-medium text-foreground max-w-[200px] truncate">
                  {lastCreatedOrder.numbers.join(", ")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Forma de Pagamento:</span>
                <span className="font-medium uppercase text-foreground">{lastCreatedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span className="text-muted-foreground">Valor:</span>
                <span className="text-primary">{formatBRL(lastCreatedOrder.total)}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2">
            <Button
              onClick={handleWhatsAppShare}
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2"
            >
              <span>💬 Enviar Comprovante por WhatsApp</span>
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetForm} className="flex-1">
                Nova Venda
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  setSuccessOpen(false);
                  navigate({ to: "/admin" });
                }}
                className="flex-1 bg-primary text-primary-foreground"
              >
                Ver Venda
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
