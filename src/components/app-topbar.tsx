import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { NotificationsBell } from "@/components/notifications-bell";
import { NewOpportunityDialog } from "@/components/new-opportunity-dialog";
import { useCrm } from "@/hooks/use-crm";

export function AppTopbar() {
  const [open, setOpen] = useState(false);
  const [newOpportunity, setNewOpportunity] = useState(false);
  const navigate = useNavigate();
  const { data } = useCrm();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const go = (to: string) => {
    setOpen(false);
    navigate({ to } as never);
  };

  return (
    <header className="sticky top-0 z-20 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b bg-background/80 px-4 py-2.5 backdrop-blur-xl sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger className="shrink-0" />
        <button
          onClick={() => setOpen(true)}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border bg-card px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-secondary sm:max-w-md"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="truncate">Buscar empresas, contatos, oportunidades…</span>
          <kbd className="ml-auto hidden shrink-0 rounded border bg-secondary px-1.5 py-0.5 text-[10px] font-medium sm:block">
            ⌘K
          </kbd>
        </button>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <NotificationsBell />
        <Button size="sm" className="rounded-xl" onClick={() => setNewOpportunity(true)}>
          <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Nova oportunidade</span>
        </Button>
      </div>

      <NewOpportunityDialog
        open={newOpportunity}
        onOpenChange={setNewOpportunity}
        withTrigger={false}
      />

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Pesquisar em todo o Conversu…" />
        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          <CommandGroup heading="Navegação">
            {[
              ["Dashboard", "/dashboard"],
              ["Pipeline", "/pipeline"],
              ["Empresas", "/empresas"],
              ["Contatos", "/contatos"],
              ["Atividades", "/atividades"],
              ["Reuniões", "/reunioes"],
              ["Propostas", "/propostas"],
              ["Tarefas", "/tarefas"],
              ["Forecast", "/forecast"],
              ["Metas", "/metas"],
              ["IA Comercial", "/ia-comercial"],
              ["Relatórios", "/relatorios"],
              ["Configurações", "/configuracoes"],
            ].map(([label, to]) => (
              <CommandItem key={to} onSelect={() => go(to!)}>
                {label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Oportunidades">
            {data.opportunities.slice(0, 8).map((o) => (
              <CommandItem key={o.id} value={`${o.title} ${o.company}`} onSelect={() => go("/pipeline")}>
                {o.title}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Empresas">
            {data.companies.slice(0, 8).map((c) => (
              <CommandItem key={c.id} value={c.name} onSelect={() => go("/empresas")}>
                {c.name}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Contatos">
            {data.contacts.slice(0, 8).map((c) => (
              <CommandItem key={c.id} value={`${c.name} ${c.company}`} onSelect={() => go("/contatos")}>
                {c.name} — {c.company}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  );
}
