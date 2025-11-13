
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export type SalesCategory =
  | "online"
  | "offline_events"
  | "offline_shops"
  | "cws_distributor"
  | "hong_kong_cws"
  | "free_stock_giveaway";

export const SALES_CATEGORY_LABELS: Record<SalesCategory, string> = {
  online: "Online sales",
  offline_events: "Offline sales - Events",
  offline_shops: "Offline sales - Shops",
  cws_distributor: "CWS China",
  hong_kong_cws: "Hong Kong CWS",
  free_stock_giveaway: "Free Stock Give away",
};

export interface Region {
  id: string;
  code: string;
  name: string;
  active: boolean;
}

export interface AggregateRow {
  period_month: string; // ISO date string
  category: SalesCategory | null;
  region_id: string | null;
  currency: string | null;
  units: number | null;
  revenue: number | null;
  cost: number | null;
  discounts: number | null;
  returns: number | null;
  taxes: number | null;
  gross_margin: number | null;
  product_id?: string | null; // Added for SKU-level data
}

/**
 * Fetch active regions for filters.
 */
export const useRegions = () => {
  return useQuery({
    queryKey: ["cws_regions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mo-cws_regions")
        .select("id, code, name, active")
        .eq("active", true)
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Region[];
    },
  });
};

export interface ProductOption {
  id: string;
  sku: string;
  name: string;
}

export const useProductOptions = () => {
  return useQuery({
    queryKey: ["product_options"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mo-products")
        .select("id, sku, name")
        .order("sku", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ProductOption[];
    },
  });
};

/**
 * Fetch monthly aggregates filtered by date range, categories, regions (optional),
 * and productIds (SKU filter, optional).
 * - If productIds are provided, we aggregate from sales_monthly on-the-fly.
 * - Otherwise, we read from the sales_monthly_aggregates view.
 */
export const useSalesAggregates = ({
  from,
  to,
  categories,
  regionIds,
  productIds,
}: {
  from: string; // YYYY-MM-01
  to: string; // YYYY-MM-01
  categories: SalesCategory[];
  regionIds?: string[]; // optional
  productIds?: string[]; // optional
}) => {
  return useQuery({
    queryKey: [
      "sales_monthly_aggregates",
      { from, to, categories, regionIds, productIds },
    ],
    queryFn: async () => {
      // When product filter is applied, fetch raw rows and keep product_id for grouping
      if (productIds && productIds.length > 0) {
        let q = supabase
          .from("mo-sales_monthly")
          .select(
            "period_month, category, region_id, currency, units, revenue, cost, discounts, returns, taxes, product_id"
          )
          .gte("period_month", from)
          .lte("period_month", to);

        if (categories?.length) q = q.in("category", categories as readonly SalesCategory[]);
        if (regionIds && regionIds.length > 0) q = q.in("region_id", regionIds);
        q = q.in("product_id", productIds);

        const { data, error } = await q.order("period_month", { ascending: true });
        if (error) throw error;

        // Keep product_id in the result for SKU-level grouping
        return (data ?? []).map((r: any) => ({
          period_month: r.period_month,
          category: r.category,
          region_id: r.region_id,
          currency: r.currency,
          units: Number(r.units ?? 0),
          revenue: Number(r.revenue ?? 0),
          cost: Number(r.cost ?? 0),
          discounts: Number(r.discounts ?? 0),
          returns: Number(r.returns ?? 0),
          taxes: Number(r.taxes ?? 0),
          gross_margin: Number(r.revenue ?? 0) - Number(r.cost ?? 0),
          product_id: r.product_id,
        })) as AggregateRow[];
      }

      // Default path: use aggregated view
      let query = supabase
        .from("mo-sales_monthly_aggregates")
        .select(
          "period_month, category, region_id, currency, units, revenue, cost, discounts, returns, taxes, gross_margin"
        )
        .gte("period_month", from)
        .lte("period_month", to);

      if (categories?.length) {
        query = query.in("category", categories as readonly SalesCategory[]);
      }
      if (regionIds && regionIds.length > 0) {
        // Only apply region filtering when regions are selected
        query = query.in("region_id", regionIds);
      }

      const { data, error } = await query.order("period_month", { ascending: true });
      if (error) throw error;
      return (data ?? []) as AggregateRow[];
    },
    meta: {
      onError: (err: unknown) => {
      },
    },
  });
};

/**
 * Utility to build a month key like 2025-01 from a date string.
 */
export const monthKey = (isoDate: string) => {
  const d = new Date(isoDate);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};

/**
 * Simple linear regression forecast for the next N months based on total revenue series.
 * Returns an array of { monthKey, forecast } for the horizon.
 */
export const useLinearForecast = (series: { month: string; total: number }[], horizon = 6) => {
  return useMemo(() => {
    if (!series.length) return [] as { month: string; forecast: number }[];

    // map months to x = 0..n-1, y = total
    const xs = series.map((_, i) => i);
    const ys = series.map((p) => p.total);

    const n = xs.length;
    const sumX = xs.reduce((a, b) => a + b, 0);
    const sumY = ys.reduce((a, b) => a + b, 0);
    const sumXY = xs.reduce((acc, x, i) => acc + x * ys[i], 0);
    const sumXX = xs.reduce((acc, x) => acc + x * x, 0);

    const denom = n * sumXX - sumX * sumX;
    const slope = denom !== 0 ? (n * sumXY - sumX * sumY) / denom : 0;
    const intercept = n !== 0 ? (sumY - slope * sumX) / n : 0;

    // last existing month
    const last = series[series.length - 1].month;
    const [lastY, lastM] = last.split("-").map(Number);

    const addMonths = (year: number, month: number, add: number) => {
      const base = new Date(Date.UTC(year, month - 1, 1));
      base.setUTCMonth(base.getUTCMonth() + add);
      return `${base.getUTCFullYear()}-${String(base.getUTCMonth() + 1).padStart(2, "0")}`;
    };

    const forecasts: { month: string; forecast: number }[] = [];
    for (let i = 1; i <= horizon; i++) {
      const x = n - 1 + i; // continue x indices
      const yhat = intercept + slope * x;
      forecasts.push({
        month: addMonths(lastY!, lastM!, i),
        forecast: Math.max(0, yhat),
      });
    }
    return forecasts;
  }, [series, horizon]);
};
