import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Ticket,
  Plus,
  Trophy,
  LogOut,
  Home,
  Menu,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const items = [
  { to: "/admin" as const, icon: LayoutDashboard, label: "Dashboard", exact: true },
  { to: "/admin/rifas" as const, icon: Ticket, label: "Rifas" },
  { to: "/admin/rifas/nova" as const, icon: Plus, label: "Nova Rifa" },
  { to: "/admin/sorteios" as const, icon: Trophy, label: "Sorteios" },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        if (window.innerWidth >= 768 && window.innerWidth < 1024) {
          setCollapsed(true);
        } else if (window.innerWidth >= 1024) {
          setCollapsed(false);
        }
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
    : "";

  return (
    <div className="flex min-h-screen bg-muted/30 overflow-x-hidden">
      {/* Mobile Drawer Backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-opacity md:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Mobile Drawer Side Panel */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card p-4 transition-transform duration-300 ease-in-out md:hidden",
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b pb-2">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
              <Ticket className="h-5 w-5" />
            </span>
            <span className="font-display font-bold">RifasOnline</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDrawerOpen(false)}
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex-1 space-y-1 py-4">
          {items.map((it) => {
            const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
            return (
              <Link
                key={it.to}
                to={it.to}
                onClick={() => setDrawerOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <it.icon className="h-4 w-4 shrink-0" />
                {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t pt-4 space-y-2">
          <Link
            to="/"
            onClick={() => setDrawerOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Home className="h-4 w-4 shrink-0" /> Ver site
          </Link>
          <button
            onClick={() => {
              setDrawerOpen(false);
              logout();
              navigate({ to: "/login" });
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground text-left"
          >
            <LogOut className="h-4 w-4 shrink-0" /> Sair
          </button>
          {user && (
            <div className="rounded-lg bg-muted/50 px-3 py-2">
              <div className="text-xs font-medium truncate">{user.name}</div>
              <div className="text-xs text-muted-foreground truncate">{user.email}</div>
            </div>
          )}
        </div>
      </aside>

      {/* Desktop/Tablet Sidebar */}
      <aside
        className={cn(
          "hidden border-r bg-card flex-col transition-all duration-300 md:flex shrink-0",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b px-4 justify-between">
          <div className={cn("flex items-center gap-2 overflow-hidden transition-all duration-300", collapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
              <Ticket className="h-5 w-5" />
            </span>
            <span className="font-display font-bold whitespace-nowrap">RifasOnline</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="mx-auto"
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {items.map((it) => {
            const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
            return (
              <Link
                key={it.to}
                to={it.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all group relative",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  collapsed && "justify-center px-2"
                )}
              >
                <it.icon className="h-4 w-4 shrink-0" />
                <span className={cn("transition-all duration-200 overflow-hidden", collapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>
                  {it.label}
                </span>
                {collapsed && (
                  <div className="absolute left-full ml-2 rounded-md bg-foreground px-2.5 py-1.5 text-xs font-semibold text-background opacity-0 shadow-elevated transition-opacity group-hover:opacity-100 whitespace-nowrap pointer-events-none z-50">
                    {it.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-3 space-y-1">
          <Link
            to="/"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground group relative",
              collapsed && "justify-center px-2"
            )}
          >
            <Home className="h-4 w-4 shrink-0" />
            <span className={cn("transition-all duration-200 overflow-hidden", collapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>
              Ver site
            </span>
            {collapsed && (
              <div className="absolute left-full ml-2 rounded-md bg-foreground px-2.5 py-1.5 text-xs font-semibold text-background opacity-0 shadow-elevated transition-opacity group-hover:opacity-100 whitespace-nowrap pointer-events-none z-50">
                Ver site
              </div>
            )}
          </Link>
          <button
            onClick={() => {
              logout();
              navigate({ to: "/login" });
            }}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground text-left group relative",
              collapsed && "justify-center px-2"
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className={cn("transition-all duration-200 overflow-hidden", collapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>
              Sair
            </span>
            {collapsed && (
              <div className="absolute left-full ml-2 rounded-md bg-foreground px-2.5 py-1.5 text-xs font-semibold text-background opacity-0 shadow-elevated transition-opacity group-hover:opacity-100 whitespace-nowrap pointer-events-none z-50">
                Sair
              </div>
            )}
          </button>
          {user && (
            <div className={cn("mt-2 rounded-lg bg-muted/50 transition-all overflow-hidden", collapsed ? "h-0 p-0" : "p-2")}>
              <div className="text-xs font-medium truncate">{user.name}</div>
              <div className="text-xs text-muted-foreground truncate">{user.email}</div>
            </div>
          )}
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setDrawerOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="md:hidden flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground">
                <Ticket className="h-4 w-4" />
              </span>
              <span className="font-display font-bold">Admin</span>
            </div>
            <div className="hidden md:block text-sm text-muted-foreground">
              Painel Administrativo
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {initials}
                </span>
                <span className="hidden sm:inline text-sm font-medium">{user.name.split(" ")[0]}</span>
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
