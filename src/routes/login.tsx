import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Ticket } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar — CampanhaFácil" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const u = login(email, password);
      setLoading(false);
      if (!u) {
        toast.error("Email ou senha inválidos");
        return;
      }
      toast.success(`Bem-vindo, ${u.name.split(" ")[0]}!`);
      navigate({ to: u.role === "admin" ? "/admin" : "/" });
    }, 400);
  };

  const quick = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-gradient-hero p-12 text-primary-foreground lg:flex">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
            <Ticket className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-bold">CampanhaFácil</span>
        </Link>
        <div>
          <h2 className="font-display text-4xl font-extrabold leading-tight">
            Transparência e organização em cada número.
          </h2>
          <p className="mt-4 text-lg text-white/85">
            Mais de 10 mil pessoas já participaram das nossas campanhas.
            Cadastre-se e concorra hoje.
          </p>
        </div>
        <div className="text-sm text-white/70">© 2026 CampanhaFácil</div>
      </div>

      <div className="flex items-center justify-center bg-background p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
              <Ticket className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-bold">CampanhaFácil</span>
          </Link>

          <h1 className="font-display text-3xl font-bold">Entrar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Acesse sua conta para participar das campanhas.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1.5"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-primary text-primary-foreground shadow-soft"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            Acesso rápido para testes
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Card
              className="cursor-pointer border-dashed transition-all hover:border-primary hover:bg-primary/5"
              onClick={() => quick("admin@campanhafacil.com", "123456")}
            >
              <CardContent className="p-3 text-center">
                <div className="text-xs font-semibold uppercase text-primary">Admin</div>
                <div className="mt-0.5 text-xs text-muted-foreground">admin@campanhafacil.com</div>
              </CardContent>
            </Card>
            <Card
              className="cursor-pointer border-dashed transition-all hover:border-primary hover:bg-primary/5"
              onClick={() => quick("joao@email.com", "123456")}
            >
              <CardContent className="p-3 text-center">
                <div className="text-xs font-semibold uppercase text-primary">Cliente</div>
                <div className="mt-0.5 text-xs text-muted-foreground">joao@email.com</div>
              </CardContent>
            </Card>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Não tem conta?{" "}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
