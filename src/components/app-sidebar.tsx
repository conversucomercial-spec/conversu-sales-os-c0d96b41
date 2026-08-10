import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  KanbanSquare,
  Building2,
  Users,
  ListChecks,
  CalendarDays,
  FileText,
  TrendingUp,
  Sparkle,
  BarChart3,
  Settings,
  Target,
  CheckSquare,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { UserMenu } from "@/components/user-menu";

const main = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Pipeline", url: "/pipeline", icon: KanbanSquare },
  { title: "Empresas", url: "/empresas", icon: Building2 },
  { title: "Contatos", url: "/contatos", icon: Users },
];

const execution = [
  { title: "Atividades", url: "/atividades", icon: ListChecks },
  { title: "Reuniões", url: "/reunioes", icon: CalendarDays },
  { title: "Propostas", url: "/propostas", icon: FileText },
  { title: "Tarefas", url: "/tarefas", icon: CheckSquare },
];

const intelligence = [
  { title: "Forecast", url: "/forecast", icon: TrendingUp },
  { title: "Metas", url: "/metas", icon: Target },
  { title: "IA Comercial", url: "/ia-comercial", icon: Sparkle },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  const group = (label: string, items: typeof main) => (
    <SidebarGroup>
      {!collapsed && (
        <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const active = pathname.startsWith(item.url);
            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                  <Link to={item.url} className="flex items-center gap-3">
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="truncate text-sm">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="px-3 py-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="brand-gradient grid h-9 w-9 shrink-0 place-items-center rounded-xl text-primary-foreground shadow-sm">
            <span className="font-display text-sm font-extrabold">C</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-bold leading-tight">Conversu</p>
              <p className="truncate text-[11px] text-muted-foreground">Sales OS</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="scroll-slim">
        {group("Comercial", main)}
        {group("Execução", execution)}
        {group("Inteligência", intelligence)}
      </SidebarContent>
      <SidebarFooter className="p-3">
        <UserMenu compact={collapsed} />
      </SidebarFooter>
    </Sidebar>
  );
}
