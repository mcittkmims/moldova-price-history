"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import type { PricePoint } from "../../types/product";
import { formatDate, formatMdl } from "../../utils/pricing";

type PriceHistoryChartProps = {
  data: PricePoint[];
};

export function PriceHistoryChart({ data }: PriceHistoryChartProps) {
  const isCompact = useMediaQuery("(max-width: 640px)");
  const chartData = data.map((point) => ({
    date: point.date,
    timestamp: new Date(point.date).getTime(),
    price: point.price,
  }));
  const firstTimestamp = chartData[0]?.timestamp;
  const lastTimestamp = chartData[chartData.length - 1]?.timestamp;
  const hasCollapsedDomain =
    firstTimestamp != null && lastTimestamp != null && firstTimestamp === lastTimestamp;
  const xDomain = hasCollapsedDomain
    ? [firstTimestamp, firstTimestamp + 24 * 60 * 60 * 1000]
    : ["dataMin", "dataMax"];
  const xTicks = isCompact
    ? [firstTimestamp, lastTimestamp].filter((value): value is number => value != null)
    : chartData.map((point) => point.timestamp);

  return (
    <div className="h-64 w-full min-w-0 sm:h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={
            isCompact
              ? { top: 8, right: 4, bottom: 0, left: -8 }
              : { top: 12, right: 12, bottom: 0, left: 0 }
          }
        >
          <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
          <XAxis
            dataKey="timestamp"
            type="number"
            scale="time"
            domain={xDomain}
            ticks={xTicks}
            tickFormatter={(value) => formatDate(new Date(Number(value)).toISOString())}
            tick={{ fill: "var(--chart-text)", fontSize: isCompact ? 11 : 12 }}
            tickLine={false}
            tickMargin={8}
            axisLine={{ stroke: "var(--chart-grid)" }}
            minTickGap={isCompact ? 36 : 20}
            padding={{ left: 0, right: 0 }}
          />
          <YAxis
            width={isCompact ? 42 : 62}
            tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
            tick={{ fill: "var(--chart-text)", fontSize: isCompact ? 11 : 12 }}
            tickLine={false}
            axisLine={false}
            tickCount={isCompact ? 4 : 5}
          />
          <Tooltip
            formatter={(value) => [formatMdl(Number(value)), "Price"]}
            labelFormatter={(value) => formatDate(new Date(Number(value)).toISOString())}
            contentStyle={{
              borderRadius: 6,
              borderColor: "var(--chart-grid)",
              boxShadow: "0 2px 8px rgba(15, 23, 42, 0.08)",
              fontSize: 12,
            }}
          />
          <Line
            type="stepAfter"
            dataKey="price"
            stroke="#059669"
            strokeWidth={2}
            dot={{ r: isCompact ? 2 : 3, fill: "#059669", strokeWidth: 0 }}
            activeDot={{ r: 4, fill: "#047857", strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
