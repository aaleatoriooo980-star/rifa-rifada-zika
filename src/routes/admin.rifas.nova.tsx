import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useRifas } from "@/context/RifasContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PackagesEditor, validatePackages } from "@/components/admin/PackagesEditor";
import type { RifaPackage } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/rifas/nova")({
  head: () => ({ meta: [{ title: "Nova Rifa — Admin" }] }),
  component: NovaRifa,
});

function NovaRifa() {
  const { createRifa } = useRifas();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    prize: "",
    image: "",
    pricePerNumber: 5,
    totalNumbers: 100,
    drawDate: "",
    drawTime: "",
  });
  const [packages, setPackages] = useState<RifaPackage[]>([]);

  const onImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, image: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.prize || form.totalNumbers <= 0) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }
    if (!form.drawDate || !form.drawTime) {
      toast.error("Informe data e hora do sorteio.");
      return;
    }
    const iso = new Date(`${form.drawDate}T${form.drawTime}:00`);
    if (iso.getTime() <= Date.now()) {
      toast.error("A data do sorteio deve ser no futuro.");
      return;
    }
    const pkgErr = validatePackages(packages, Number(form.totalNumbers));
    if (pkgErr) {
      toast.error(pkgErr);
      return;
    }
    const sortedPackages = [...packages].sort((a, b) => a.quantity - b.quantity);
    const rifa = createRifa({
      title: form.title,
      description: form.description,
      prize: form.prize,
      pricePerNumber: Number(form.pricePerNumber),
      totalNumbers: Number(form.totalNumbers),
      image: form.image || "https://placehold.co/800x600/10b981/ffffff?text=Rifa",
      drawDate: iso.toISOString(),
      packages: sortedPackages,
    });
    toast.success("Rifa criada com sucesso!");
    navigate({ to: "/admin/rifas" });
    void rifa;
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Nova Rifa</h1>
        <p className="text-sm text-muted-foreground">
          Configure os detalhes da sua nova rifa.
        </p>
      </div>

      <Card className="shadow-soft">
        <CardContent className="p-6">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ex.: iPhone 17 Pro Max"
                className="mt-1.5"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="prize">Nome do prêmio *</Label>
              <Input
                id="prize"
                value={form.prize}
                onChange={(e) => setForm({ ...form, prize: e.target.value })}
                className="mt-1.5"
                required
              />
            </div>
            <div>
              <Label htmlFor="image">Imagem (URL ou upload)</Label>
              <div className="mt-1.5 flex flex-col sm:flex-row gap-2">
                <Input
                  id="image"
                  value={form.image.startsWith("data:") ? "" : form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full"
                />
                <Input
                  type="file"
                  accept="image/*"
                  onChange={onImage}
                  className="w-full sm:max-w-[200px]"
                />
              </div>
              {form.image && (
                <img
                  src={form.image}
                  alt="preview"
                  className="mt-2 h-32 w-48 rounded-md object-cover border"
                />
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="price">Valor por número *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.5"
                  min={0.5}
                  value={form.pricePerNumber}
                  onChange={(e) =>
                    setForm({ ...form, pricePerNumber: Number(e.target.value) })
                  }
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="total">Qtd. números *</Label>
                <Input
                  id="total"
                  type="number"
                  min={1}
                  max={10000}
                  value={form.totalNumbers}
                  onChange={(e) =>
                    setForm({ ...form, totalNumbers: Number(e.target.value) })
                  }
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="draw-date">Data do sorteio *</Label>
                <Input
                  id="draw-date"
                  type="date"
                  value={form.drawDate}
                  onChange={(e) => setForm({ ...form, drawDate: e.target.value })}
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="draw-time">Hora do sorteio *</Label>
                <Input
                  id="draw-time"
                  type="time"
                  value={form.drawTime}
                  onChange={(e) => setForm({ ...form, drawTime: e.target.value })}
                  className="mt-1.5"
                  required
                />
              </div>
            </div>
            <PackagesEditor
              packages={packages}
              onChange={setPackages}
              totalNumbers={Number(form.totalNumbers)}
              pricePerNumber={Number(form.pricePerNumber)}
            />
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: "/admin/rifas" })}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-gradient-primary text-primary-foreground w-full sm:w-auto">
                Criar Rifa
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
