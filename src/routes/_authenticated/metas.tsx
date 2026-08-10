import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Target } from "lucide-react";

import { ALL_GOALS, GOAL_PERIODS, type GoalLevel, type GoalPeriod } from "@/lib/config";
import { PageHeader, EmptyState } from "@/components/kit";
import { GoalCard } from "@/components/goal-card";
import { FilterSelect, Toolbar } from "@/components/toolbar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/metas")({
  head: () => ({
    meta: [
      { title: "Metas comerciais | Conversu Sales OS" },
      {
        name: "description",
        content: "Metas de empresa, equipe e vendedor com meta, realizado, forecast e gap por período.",
      },
      { property: "og:title", content: "Metas comerciais | Conversu Sales OS" },
      { property: "og:description", content: "Meta × Realizado × Forecast × Gap em três níveis." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MetasPage,
});

const LEVELS: { id: GoalLevel; label: string }[] = [
  { id: "empresa", label: "Empresa" },
  { id: "equipe", label: "Equipe" },
  { id: "vendedor", label: "Vendedor" },
];

function MetasPage() {
  const [level, setLevel] = useState<GoalLevel>("empresa");
  const [period, setPeriod] = useState<GoalPeriod>("2026-08");

  const groups = ALL_GOALS.filter((g) => g.level === level && g.period === period);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Metas comerciais"
        description="Meta × Realizado × Forecast × Gap por empresa, equipe e vendedor."
      />

      <Toolbar>
        <Tabs value={level} onValueChange={(v) => setLevel(v as GoalLevel)} className="min-w-0">
          <TabsList>
            {LEVELS.map((l) => (
              <TabsTrigger key={l.id} value={l.id}>
                {l.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="sm:ml-auto">
          <FilterSelect
            value={period}
            onChange={(v) => setPeriod(v as GoalPeriod)}
            options={GOAL_PERIODS.map((p) => ({ value: p.id, label: p.label }))}
          />
        </div>
      </Toolbar>

      {groups.length === 0 ? (
        <EmptyState
          icon={Target}
          title="Nenhuma meta definida para este período"
          description="Ao conectar as metas reais, este nível passará a exibir os indicadores automaticamente."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {groups.map((g) => (
            <GoalCard key={g.id} group={g} />
          ))}
        </div>
      )}
    </div>
  );
}
