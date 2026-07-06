import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Ticket,
  Plus,
  Trophy,
  LogOut,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden w-64 flex-col border-r bg-card md:flex">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
            <Ticket className="h-5 w-5" />
          </span>
          <span className="font-display font-bold">RifasOnline</span>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {items.map((it) => {
            const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
            return (
              <Link
                key={it.to}
                to={it.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <it.icon className="h-4 w-4" />
                {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-3 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Home className="h-4 w-4" /> Ver site
          </Link>
          <button
            onClick={() => {
              logout();
              navigate({ to: "/login" });
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
          {user && (
            <div className="mt-2 rounded-lg bg-muted/50 px-3 py-2">
              <div className="text-xs font-medium">{user.name}</div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
            </div>
          )}
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-8">
          <div className="md:hidden flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground">
              <Ticket className="h-4 w-4" />
            </span>
            <span className="font-display font-bold">Admin</span>
          </div>
          <div className="hidden md:block text-sm text-muted-foreground">
            Painel Administrativo
          </div>
          <nav className="flex gap-1 md:hidden">
            {items.map((it) => {
              const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
              return (
                <Link
                  key={it.to}
                  to={it.to}
                  className={cn(
                    "rounded-md p-2",
                    active ? "bg-primary/10 text-primary" : "text-muted-foreground",
                  )}
                >
                  <it.icon className="h-4 w-4" />
                </Link>
              );
            })}
          </nav>
        </header>
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
