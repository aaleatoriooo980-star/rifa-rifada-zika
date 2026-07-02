import { useMemo, useState } from "react";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, User as UserIcon, Hash } from "lucide-react";
import { useRifas } from "@/context/RifasContext";
import { useAuth } from "@/context/AuthContext";

interface Props {
  rifaId: string;
}

export function BuyersSearch({ rifaId }: Props) {
  const { getBuyersForRifa } = useRifas();
  const { users } = useAuth();
  const buyers = getBuyersForRifa(rifaId);
  const [selected, setSelected] = useState("");

  const options = useMemo(
    () =>
      buyers.map((b) => {
        const u = users.find((x) => x.id === b.userId);
        return {
          value: b.userId,
          label: u?.name ?? "Usuário",
          hint: u?.phone ?? u?.email,
        };
      }),
    [buyers, users],
  );

  const active = buyers.find((b) => b.userId === selected);
  const activeUser = active ? users.find((u) => u.id === active.userId) : null;

  return (
    <div className="space-y-3">
      <div>
        <SearchableSelect
          value={selected}
          onChange={setSelected}
          options={options}
          placeholder="Pesquisar comprador por nome ou telefone..."
          searchPlaceholder="Nome ou telefone"
          emptyLabel="Nenhum comprador."
        />
      </div>

      {active && activeUser && (
        <Card className="shadow-soft">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center gap-2 text-sm">
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{activeUser.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              {activeUser.phone ?? activeUser.email}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Hash className="h-4 w-4 text-muted-foreground" />
              {active.numbers.length} número(s) adquirido(s)
            </div>
            <div className="flex flex-wrap gap-1 pt-1">
              {active.numbers.map((n) => (
                <Badge key={n} variant="secondary" className="font-mono">
                  {String(n).padStart(3, "0")}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
