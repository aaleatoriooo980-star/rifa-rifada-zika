import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Ticket, LogOut, User as UserIcon, LayoutDashboard, Menu, X } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function PublicHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
    : "";

  return (
    <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src="/logo.jpg" alt="Campanha Fácil" className="h-9 w-9 rounded-xl object-contain" style={{ mixBlendMode: 'multiply' }} />
          <span className="font-display text-lg font-bold text-foreground">
            Campanha<span className="text-primary">Fácil</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            to="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "text-foreground" }}
            activeOptions={{ exact: true }}
          >
            Campanhas
          </Link>
          {user?.role === "cliente" && (
            <Link
              to="/minhas-rifas"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              Minhas Campanhas
            </Link>
          )}
          {user?.role === "admin" && (
            <Link
              to="/admin"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Painel Admin
            </Link>
          )}
        </nav>

        {/* User / Actions */}
        <div className="flex items-center gap-2">
          {/* Desktop Auth Actions */}
          <div className="hidden md:flex items-center gap-2">
            {!user ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate({ to: "/login" })}
                >
                  Entrar
                </Button>
                <Button
                  onClick={() => navigate({ to: "/register" })}
                  className="bg-gradient-primary text-primary-foreground shadow-soft hover:opacity-90"
                >
                  Criar conta
                </Button>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {initials}
                    </span>
                    <span>{user.name.split(" ")[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="text-sm">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user.role === "cliente" && (
                    <DropdownMenuItem onClick={() => navigate({ to: "/minhas-rifas" })}>
                      <UserIcon className="mr-2 h-4 w-4" /> Minhas campanhas
                    </DropdownMenuItem>
                  )}
                  {user.role === "admin" && (
                    <DropdownMenuItem onClick={() => navigate({ to: "/admin" })}>
                      <LayoutDashboard className="mr-2 h-4 w-4" /> Painel admin
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      logout();
                      navigate({ to: "/login" });
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Abrir menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Slide-down Menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden border-b bg-card transition-all duration-300 ease-in-out",
          mobileOpen ? "max-h-[350px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        )}
      >
        <div className="space-y-3 px-4 py-4">
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="block text-sm font-medium text-muted-foreground py-2 hover:text-foreground"
            activeProps={{ className: "text-foreground font-semibold" }}
            activeOptions={{ exact: true }}
          >
            Campanhas
          </Link>
          {user?.role === "cliente" && (
            <Link
              to="/minhas-rifas"
              onClick={() => setMobileOpen(false)}
              className="block text-sm font-medium text-muted-foreground py-2 hover:text-foreground"
              activeProps={{ className: "text-foreground font-semibold" }}
            >
              Minhas Campanhas
            </Link>
          )}
          {user?.role === "admin" && (
            <Link
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className="block text-sm font-medium text-muted-foreground py-2 hover:text-foreground"
            >
              Painel Admin
            </Link>
          )}
          <DropdownMenuSeparator className="my-2" />
          {!user ? (
            <div className="flex flex-col gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setMobileOpen(false);
                  navigate({ to: "/login" });
                }}
                className="w-full justify-center"
              >
                Entrar
              </Button>
              <Button
                onClick={() => {
                  setMobileOpen(false);
                  navigate({ to: "/register" });
                }}
                className="w-full justify-center bg-gradient-primary text-primary-foreground"
              >
                Criar conta
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="px-2 py-1.5">
                <div className="text-sm font-medium">{user.name}</div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
              </div>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  logout();
                  navigate({ to: "/login" });
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-destructive hover:bg-destructive/10 text-left font-medium"
              >
                <LogOut className="h-4 w-4" /> Sair
              </button>
            </div>
          )}
        </div>
      </div>

      {pathname === "/" && (
        <div className="border-t bg-muted/30 py-2 text-center text-xs text-muted-foreground px-4">
          Plataforma de campanhas promocionais · Pagamentos via PIX · Resultados transparentes
        </div>
      )}
    </header>
  );
}
