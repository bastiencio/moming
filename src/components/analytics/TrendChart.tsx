
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card } from "@/components/ui/card";
import { SalesCategory, SALES_CATEGORY_LABELS, ProductOption } from "@/hooks/useSalesAnalytics";

type SeriesPoint = Record<string, number | string>;

type Props = {
  data: SeriesPoint[]; // [{ month: '2025-01', online: 100, offline_events: 50, total: 150, forecast?: 170 }, ...]
  activeCategories: SalesCategory[];
  showBySku?: boolean;
  showTotal?: boolean;
  showForecast?: boolean;
  productOptions?: ProductOption[];
};

const COLORS: Record<SalesCategory, string> = {
  online: "#4f46e5",
  offline_events: "#10b981",
  offline_shops: "#f59e0b",
  cws_distributor: "#ef4444",
  hong_kong_cws: "#0ea5e9",
  free_stock_giveaway: "#a855f7",
};

export const TrendChart: React.FC<Props> = ({ data, activeCategories, showBySku = false, showTotal = true, showForecast = true, productOptions = [] }) => {
  // Get all SKUs or categories to render
  const keysToRender = React.useMemo(() => {
    if (showBySku) {
      const skuSet = new Set<string>();
      data.forEach(row => {
        Object.keys(row).forEach(key => {
          if (key !== "month" && key !== "total" && key !== "forecast") {
            skuSet.add(key);
          }
        });
      });
      return Array.from(skuSet);
    }
    return activeCategories;
  }, [data, activeCategories, showBySku]);

  return (
    <Card className="p-4 md:p-6 bg-card">
      <div className="mb-3 text-sm text-muted-foreground">
        Monthly {showBySku ? "SKU" : "Revenue"} Trend
      </div>
      <div className="w-full h-72">
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              formatter={(value: number, name) => [
                new Intl.NumberFormat().format(value),
                name === "total" ? "Total" : name === "forecast" ? "Forecast" : 
                showBySku ? name : SALES_CATEGORY_LABELS[name as SalesCategory],
              ]}
              labelFormatter={(l) => `Month: ${l}`}
            />
            <Legend />
            {keysToRender.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={showBySku ? key : SALES_CATEGORY_LABELS[key as SalesCategory]}
                stroke={showBySku ? `hsl(${(index * 60) % 360}, 70%, 50%)` : COLORS[key as SalesCategory]}
                dot={false}
                strokeWidth={2}
              />
            ))}
            {showTotal && (
              <Line
                type="monotone"
                dataKey="total"
                name="Total"
                stroke="hsl(var(--primary))"
                dot={false}
                strokeWidth={3}
              />
            )}
            {showForecast && (
              <Line
                type="monotone"
                dataKey="forecast"
                name="Forecast"
                stroke="hsl(var(--secondary-foreground))"
                dot={false}
                strokeDasharray="5 5"
                strokeWidth={2}
                isAnimationActive={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default TrendChart;
