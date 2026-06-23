import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useRifas } from "@/context/RifasContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/admin/rifas/$id")({
  component: EditRifa,
});

function EditRifa() {
  const { id } = Route.useParams();
  const { rifas, updateRifa } = useRifas();
  const navigate = useNavigate();
  const rifa = rifas.find((r) => r.id === id);
  const [form, setForm] = useState({
    title: "",
    description: "",
    prize: "",
    image: "",
    pricePerNumber: 0,
    drawDate: "",
  });

  useEffect(() => {
    if (rifa) {
      setForm({
        title: rifa.title,
        description: rifa.description,
        prize: rifa.prize,
        image: rifa.image,
        pricePerNumber: rifa.pricePerNumber,
        drawDate: rifa.drawDate?.slice(0, 10) ?? "",
      });
    }
  }, [rifa]);

  if (!rifa) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Rifa não encontrada.</p>
        <Button asChild variant="link">
          <Link to="/admin/rifas">Voltar</Link>
        </Button>
      </div>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    updateRifa(rifa.id, {
      title: form.title,
      description: form.description,
      prize: form.prize,
      image: form.image,
      pricePerNumber: Number(form.pricePerNumber),
      drawDate: form.drawDate || undefined,
    });
    toast.success("Rifa atualizada!");
    navigate({ to: "/admin/rifas" });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <button
        onClick={() => navigate({ to: "/admin/rifas" })}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </button>
      <h1 className="font-display text-2xl font-bold">Editar Rifa</h1>

      <Card className="shadow-soft">
        <CardContent className="p-6">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-1.5"
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
              <Label htmlFor="prize">Prêmio</Label>
              <Input
                id="prize"
                value={form.prize}
                onChange={(e) => setForm({ ...form, prize: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="image">Imagem (URL)</Label>
              <Input
                id="image"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="price">Valor por número</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.5"
                  value={form.pricePerNumber}
                  onChange={(e) =>
                    setForm({ ...form, pricePerNumber: Number(e.target.value) })
                  }
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="draw">Data do sorteio</Label>
                <Input
                  id="draw"
                  type="date"
                  value={form.drawDate}
                  onChange={(e) => setForm({ ...form, drawDate: e.target.value })}
                  className="mt-1.5"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: "/admin/rifas" })}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-gradient-primary text-primary-foreground">
                Salvar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
