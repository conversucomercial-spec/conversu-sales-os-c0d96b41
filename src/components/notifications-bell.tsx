import { useNavigate } from "@tanstack/react-router";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useNotifications } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";

/** Sino com notificações reais: contador, marcar como lida e ir para o contexto. */
export function NotificationsBell() {
  const { items, unread, isLoading, markRead, markAllRead } = useNotifications();
  const navigate = useNavigate();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-xl" aria-label="Notificações">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2">
          <p className="text-xs font-semibold">
            Notificações {unread > 0 && <span className="text-muted-foreground">({unread})</span>}
          </p>
          {unread > 0 && (
            <Button size="sm" variant="ghost" onClick={() => markAllRead()}>
              <CheckCheck className="h-3.5 w-3.5" /> Marcar todas
            </Button>
          )}
        </div>
        <Separator />
        <div className="scroll-slim max-h-80 overflow-y-auto">
          {isLoading && <p className="p-3 text-xs text-muted-foreground">Carregando…</p>}
          {!isLoading && items.length === 0 && (
            <p className="p-3 text-xs text-muted-foreground">
              Nenhuma notificação. Elas aparecem quando há movimentação nas oportunidades.
            </p>
          )}
          {items.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => {
                if (!n.readAt) markRead(n.id);
                if (n.link) navigate({ to: n.link } as never);
              }}
              className={cn(
                "w-full border-b px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-secondary",
                !n.readAt && "bg-primary/5",
              )}
            >
              <div className="flex items-start gap-2">
                {!n.readAt && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold">{n.title}</p>
                  {n.detail && (
                    <p className="line-clamp-2 text-[11px] text-muted-foreground">{n.detail}</p>
                  )}
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {new Date(n.createdAt).toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
