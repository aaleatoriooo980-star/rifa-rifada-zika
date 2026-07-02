import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRifas } from "@/context/RifasContext";
import type { Rifa, RifaStatus } from "@/lib/types";
import { toast } from "sonner";

interface Props {
  rifa: Rifa | null;
  onClose: () => void;
}

function toDateInput(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toISOString().slice(0, 10);
}
function toTimeInput(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toTimeString().slice(0, 5);
}

export function EditRifaModal({ rifa, onClose }: Props) {
  const { updateRifa } = useRifas();
  const [form, setForm] = useState({
    title: "",
    description: "",
    prize: "",
    prizes: "",
    image: "",
    pricePerNumber: 0,
    totalNumbers: 0,
    drawDate: "",
    drawTime: "",
    status: "ativa" as RifaStatus,
  });

  useEffect(() => {
    if (!rifa) return;
    setForm({
      title: rifa.title,
      description: rifa.description,
      prize: rifa.prize,
      prizes: (rifa.prizes ?? []).join("\n"),
      image: rifa.image,
      pricePerNumber: rifa.pricePerNumber,
      totalNumbers: rifa.totalNumbers,
      drawDate: toDateInput(rifa.drawDate),
      drawTime: toTimeInput(rifa.drawDate),
      status: rifa.status,
    });
  }, [rifa]);

  if (!rifa) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.prize) {
      toast.error("Preencha título e prêmio.");
      return;
    }
    if (!form.drawDate || !form.drawTime) {
      toast.error("Informe data e hora do sorteio.");
      return;
    }
    const iso = new Date(`${form.drawDate}T${form.drawTime}:00`).toISOString();
    updateRifa(rifa.id, {
      title: form.title,
      description: form.description,
      prize: form.prize,
      prizes: form.prizes
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      image: form.image,
      pricePerNumber: Number(form.pricePerNumber),
      totalNumbers: Number(form.totalNumbers),
      drawDate: iso,
      status: form.status,
    });
    toast.success("Rifa atualizada!");
    onClose();
  };

  const onImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, image: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  return (
    <Dialog open={!!rifa} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Rifa</DialogTitle>
          <DialogDescription>
            Atualize os dados desta rifa sem sair da tela.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="e-title">Nome *</Label>
            <Input
              id="e-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mt-1.5"
              required
            />
          </div>
          <div>
            <Label htmlFor="e-desc">Descrição</Label>
            <Textarea
              id="e-desc"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="mt-1.5"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="e-prize">Prêmio principal *</Label>
              <Input
                id="e-prize"
                value={form.prize}
                onChange={(e) => setForm({ ...form, prize: e.target.value })}
                className="mt-1.5"
                required
              />
            </div>
            <div>
              <Label htmlFor="e-status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v as RifaStatus })}
              >
                <SelectTrigger id="e-status" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativa">Ativa</SelectItem>
                  <SelectItem value="encerrada">Encerrada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="e-prizes">Prêmios adicionais (1 por linha)</Label>
            <Textarea
              id="e-prizes"
              rows={3}
              value={form.prizes}
              onChange={(e) => setForm({ ...form, prizes: e.target.value })}
              className="mt-1.5"
              placeholder={"2º prêmio: Fone Bluetooth\n3º prêmio: R$ 500"}
            />
          </div>
          <div>
            <Label htmlFor="e-image">Imagem</Label>
            <div className="mt-1.5 flex gap-2">
              <Input
                id="e-image"
                value={form.image.startsWith("data:") ? "" : form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://..."
              />
              <Input type="file" accept="image/*" onChange={onImage} className="max-w-[200px]" />
            </div>
            {form.image && (
              <img
                src={form.image}
                alt="preview"
                className="mt-2 h-24 w-36 rounded object-cover border"
              />
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <Label htmlFor="e-price">Valor *</Label>
              <Input
                id="e-price"
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
              <Label htmlFor="e-total">Qtd. *</Label>
              <Input
                id="e-total"
                type="number"
                min={1}
                value={form.totalNumbers}
                onChange={(e) =>
                  setForm({ ...form, totalNumbers: Number(e.target.value) })
                }
                className="mt-1.5"
                required
              />
            </div>
            <div>
              <Label htmlFor="e-date">Data *</Label>
              <Input
                id="e-date"
                type="date"
                value={form.drawDate}
                onChange={(e) => setForm({ ...form, drawDate: e.target.value })}
                className="mt-1.5"
                required
              />
            </div>
            <div>
              <Label htmlFor="e-time">Hora *</Label>
              <Input
                id="e-time"
                type="time"
                value={form.drawTime}
                onChange={(e) => setForm({ ...form, drawTime: e.target.value })}
                className="mt-1.5"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-gradient-primary text-primary-foreground">
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
