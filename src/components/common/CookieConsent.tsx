import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";

export function CookieConsent() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Delay slightly for smooth transition
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsOpen(false);
  };

  const decline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-xl border border-border/80 bg-card p-4 shadow-elevated animate-in fade-in slide-in-from-bottom-5 duration-300 md:left-auto md:right-4">
      <div className="flex gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Cookie className="h-5 w-5" />
        </span>
        <div className="space-y-3">
          <div>
            <h4 className="font-display text-sm font-semibold">Valorizamos sua privacidade</h4>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Utilizamos cookies essenciais para o funcionamento do site e analíticos para melhorar a sua experiência. 
              Ao continuar navegando ou clicar em Aceitar, você concorda com nossa{" "}
              <Link to="/politica-de-privacidade" className="text-primary underline hover:text-primary/80">
                Política de Privacidade
              </Link>
              .
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="w-full bg-gradient-primary text-primary-foreground shadow-soft" onClick={accept}>
              Aceitar
            </Button>
            <Button size="sm" variant="ghost" className="w-full text-xs" onClick={decline}>
              Recusar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
