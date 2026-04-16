import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type DistributionChartProps = {
  data: Array<{ name: string; count: number }>;
};

export function DistributionChart({ data }: DistributionChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: "var(--chart-text)", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "var(--chart-grid)" }}
          />
          <YAxis
            allowDecimals={false}
            width={36}
            tick={{ fill: "var(--chart-text)", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(value) => [value, "Tracked"]}
            contentStyle={{
              borderRadius: 6,
              borderColor: "var(--chart-grid)",
              boxShadow: "0 2px 8px rgba(15, 23, 42, 0.08)",
            }}
          />
          <Bar dataKey="count" fill="#059669" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
