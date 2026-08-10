import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Settings, User } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useSession, initials } from "@/hooks/use-session";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu({ compact = false }: { compact?: boolean }) {
  const { user, profile, role } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const name = profile?.full_name || user?.email?.split("@")[0] || "Usuário";
  const subtitle = profile?.job_title || (role === "gestor" ? "Gestor" : "Executivo(a) comercial");

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex min-w-0 items-center gap-2.5 rounded-xl border bg-card p-1.5 text-left transition-colors hover:bg-secondary">
          <Avatar className="h-7 w-7 shrink-0">
            {profile?.avatar_url ? <AvatarImage src={profile.avatar_url} alt={name} /> : null}
            <AvatarFallback className="bg-accent text-[11px] font-semibold text-accent-foreground">
              {initials(name)}
            </AvatarFallback>
          </Avatar>
          {!compact && (
            <div className="min-w-0 pr-1">
              <p className="truncate text-xs font-semibold">{name}</p>
              <p className="truncate text-[11px] text-muted-foreground">{subtitle}</p>
            </div>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="min-w-0">
          <p className="truncate text-sm font-semibold">{name}</p>
          <p className="truncate text-xs font-normal text-muted-foreground">{user?.email}</p>
          <p className="mt-1 inline-flex rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide">
            {role === "gestor" ? "Gestor" : "Vendedor"}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate({ to: "/configuracoes" })}>
          <User className="h-4 w-4" /> Meu perfil
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigate({ to: "/configuracoes" })}>
          <Settings className="h-4 w-4" /> Configurações
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void signOut()}>
          <LogOut className="h-4 w-4" /> Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
