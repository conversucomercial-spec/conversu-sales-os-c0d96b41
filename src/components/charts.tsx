import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { compact } from "@/lib/data";

const axis = {
  stroke: "var(--color-muted-foreground)",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
};

const tooltipStyle = {
  contentStyle: {
    borderRadius: 12,
    border: "1px solid var(--color-border)",
    background: "var(--color-card)",
    fontSize: 12,
    boxShadow: "var(--shadow-float)",
  },
};

export const PIE_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-primary)",
];

export function BarValueChart({
  data,
  height = 260,
  horizontal = false,
}: {
  data: { name: string; valor: number }[];
  height?: number;
  horizontal?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout={horizontal ? "vertical" : "horizontal"} margin={{ left: horizontal ? 20 : 0, right: 8, top: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={!horizontal} horizontal={horizontal} />
        {horizontal ? (
          <>
            <XAxis type="number" {...axis} tickFormatter={(v: number) => compact(v)} />
            <YAxis type="category" dataKey="name" width={92} {...axis} />
          </>
        ) : (
          <>
            <XAxis dataKey="name" {...axis} interval={0} angle={-18} textAnchor="end" height={56} />
            <YAxis {...axis} tickFormatter={(v: number) => compact(v)} />
          </>
        )}
        <Tooltip {...tooltipStyle} formatter={(v: number) => compact(v)} cursor={{ fill: "var(--color-secondary)" }} />
        <Bar dataKey="valor" radius={[6, 6, 6, 6]} fill="var(--color-primary)" barSize={horizontal ? 14 : 26} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RevenueChart({
  data,
  height = 280,
}: {
  data: { name: string; receita: number; forecast: number }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="gForecast" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.28} />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-success)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="var(--color-success)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="name" {...axis} />
        <YAxis {...axis} tickFormatter={(v: number) => compact(v)} />
        <Tooltip {...tooltipStyle} formatter={(v: number) => compact(v)} />
        <Area type="monotone" dataKey="forecast" stroke="var(--color-primary)" strokeWidth={2} fill="url(#gForecast)" />
        <Area type="monotone" dataKey="receita" stroke="var(--color-success)" strokeWidth={2} fill="url(#gRevenue)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function DonutChart({
  data,
  height = 240,
}: {
  data: { name: string; value: number }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={54} outerRadius={86} paddingAngle={3} stroke="none">
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip {...tooltipStyle} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function ConversionChart({
  data,
  height = 260,
}: {
  data: { name: string; taxa: number }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="name" {...axis} interval={0} angle={-18} textAnchor="end" height={60} />
        <YAxis {...axis} tickFormatter={(v: number) => `${v}%`} />
        <Tooltip {...tooltipStyle} formatter={(v: number) => `${v}%`} />
        <Line type="monotone" dataKey="taxa" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function Legend({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ul className="mt-3 grid grid-cols-2 gap-2">
      {data.map((d, i) => (
        <li key={d.name} className="flex min-w-0 items-center gap-2 text-xs">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
          <span className="truncate text-muted-foreground">{d.name}</span>
          <span className="ml-auto shrink-0 font-semibold tabular-nums">{d.value}</span>
        </li>
      ))}
    </ul>
  );
}
