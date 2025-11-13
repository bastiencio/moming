
import React, { useMemo, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SalesFilters } from "@/components/analytics/SalesFilters";
import { TrendChart } from "@/components/analytics/TrendChart";
import {
  useRegions,
  useSalesAggregates,
  SalesCategory,
  SALES_CATEGORY_LABELS,
  monthKey,
  useLinearForecast,
  useProductOptions,
  ProductOption,
} from "@/hooks/useSalesAnalytics";

const ALL_CATEGORIES: SalesCategory[] = [
  "online",
  "offline_events",
  "offline_shops",
  "cws_distributor",
  "hong_kong_cws",
  "free_stock_giveaway",
];

const startEndDefault = () => {
  const now = new Date();
  const toMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
  const past = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));
  const fromMonth = `${past.getUTCFullYear()}-${String(past.getUTCMonth() + 1).padStart(2, "0")}-01`;
  return { fromMonth, toMonth };
};

const AnalyticsPage: React.FC = () => {
  const { fromMonth, toMonth } = startEndDefault();
  const [from, setFrom] = useState<string>(fromMonth);
  const [to, setTo] = useState<string>(toMonth);
  const [activeCategories, setActiveCategories] = useState<SalesCategory[]>([...ALL_CATEGORIES]);
  const [selectedRegionIds, setSelectedRegionIds] = useState<string[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [showBottles, setShowBottles] = useState<boolean>(false);
  const [showBySku, setShowBySku] = useState<boolean>(false);
  const [showTotal, setShowTotal] = useState<boolean>(true);
  const [showForecast, setShowForecast] = useState<boolean>(true);

  const { data: regions = [], isLoading: regionsLoading } = useRegions();
  const { data: productOptions = [] } = useProductOptions();

  // Initialize all regions and products as selected when data loads
  useEffect(() => {
    if (regions.length > 0 && selectedRegionIds.length === 0) {
      setSelectedRegionIds(regions.map(region => region.id));
    }
  }, [regions, selectedRegionIds.length]);

  useEffect(() => {
    if (productOptions.length > 0 && selectedProductIds.length === 0) {
      setSelectedProductIds(productOptions.map(product => product.id));
    }
  }, [productOptions, selectedProductIds.length]);

  // Apply region filter only when category list contains cws_distributor (as regions break down is meaningful there)
  const applyRegionFilter = activeCategories.includes("cws_distributor") ? selectedRegionIds : [];

  const { data: aggregates = [], isLoading } = useSalesAggregates({
    from,
    to,
    categories: activeCategories,
    regionIds: applyRegionFilter.length ? applyRegionFilter : undefined,
    productIds: selectedProductIds.length ? selectedProductIds : undefined,
  });

  // When showing by SKU, determine which products to query
  const skuProductIds = useMemo(() => {
    if (!showBySku) return undefined;
    if (selectedProductIds.length > 0) return selectedProductIds;
    // If no products selected, get all product IDs
    return productOptions.map(p => p.id);
  }, [showBySku, selectedProductIds, productOptions]);

  // Fetch SKU-level data when showing by SKU
  const { data: skuAggregates = [], isLoading: skuLoading } = useSalesAggregates({
    from,
    to,
    categories: activeCategories,
    regionIds: applyRegionFilter.length ? applyRegionFilter : undefined,
    productIds: skuProductIds,
  });

  // Build trend data: pivot by month with category or SKU columns + total
  const trendSeries = useMemo(() => {
    const map = new Map<string, Record<string, number | string>>();
    const sourceData = showBySku ? skuAggregates : aggregates;
    
    if (showBySku) {
      // Group by product using the SKU aggregates
      const productsToShow = selectedProductIds.length > 0 
        ? selectedProductIds 
        : Array.from(new Set(sourceData.map(row => row.product_id).filter(Boolean)));
      
      sourceData.forEach(row => {
        const mk = monthKey(row.period_month);
        if (!map.has(mk)) map.set(mk, { month: mk });
        const rec = map.get(mk)!;
        
        const value = showBottles ? Number(row.units ?? 0) : Number(row.revenue ?? 0);
        
        if (row.product_id) {
          const product = productOptions.find(p => p.id === row.product_id);
          const productKey = product?.name || `Product ${row.product_id}`;
          rec[productKey] = (Number(rec[productKey] ?? 0) + value) as number;
        }
        
        rec["total"] = (Number(rec["total"] ?? 0) + value) as number;
      });
      
      const months = Array.from(map.keys()).sort();
      return months.map((m) => {
        const base = map.get(m)!;
        // Ensure all products have values even if 0
        productsToShow.forEach(productId => {
          const product = productOptions.find(p => p.id === productId);
          const productKey = product?.name || `Product ${productId}`;
          if (base[productKey] === undefined) base[productKey] = 0;
        });
        if (base["total"] === undefined) base["total"] = 0;
        return base;
      });
    } else {
      // Original category grouping
      for (const row of sourceData) {
        const mk = monthKey(row.period_month);
        if (!map.has(mk)) map.set(mk, { month: mk });
        const rec = map.get(mk)!;
        const cat = (row.category ?? "unknown") as string;
        const value = showBottles ? Number(row.units ?? 0) : Number(row.revenue ?? 0);
        rec[cat] = (Number(rec[cat] ?? 0) + value) as number;
        rec["total"] = (Number(rec["total"] ?? 0) + value) as number;
      }

      // fill missing categories with 0 so lines render cleanly
      const months = Array.from(map.keys()).sort();
      return months.map((m) => {
        const base = map.get(m)!;
        ALL_CATEGORIES.forEach((c) => {
          if (base[c] === undefined) base[c] = 0;
        });
        if (base["total"] === undefined) base["total"] = 0;
        return base;
      });
    }
  }, [aggregates, skuAggregates, showBottles, showBySku, selectedProductIds, productOptions]);

  // Build forecast based on total series
  const totalForForecast = useMemo(
    () => trendSeries.map((r) => ({ month: r.month as string, total: Number(r["total"] ?? 0) })),
    [trendSeries]
  );
  const forecast = useLinearForecast(totalForForecast, 6);

  // Merge forecast into chart data (append forecast months)
  const chartData = useMemo(() => {
    if (trendSeries.length === 0) return [];
    const out = [...trendSeries];
    // Forecast rows only have forecast value
    forecast.forEach((f) => {
      out.push({
        month: f.month,
        forecast: f.forecast,
      });
    });
    return out;
  }, [trendSeries, forecast]);

  const combinedLoading = isLoading || (showBySku && skuLoading);

  const kpis = useMemo(() => {
    const totalRevenue = aggregates.reduce((a, b) => a + Number(b.revenue ?? 0), 0);
    const totalUnits = aggregates.reduce((a, b) => a + Number(b.units ?? 0), 0);
    const totalGM = aggregates.reduce((a, b) => a + Number(b.gross_margin ?? 0), 0);
    // growth = last month vs previous month
    const last = totalForForecast[totalForForecast.length - 1]?.total ?? 0;
    const prev = totalForForecast[totalForForecast.length - 2]?.total ?? 0;
    const growth = prev > 0 ? ((last - prev) / prev) * 100 : 0;
    return {
      totalRevenue,
      totalUnits,
      totalGM,
      growth,
    };
  }, [aggregates, totalForForecast]);

  const onPeriodChange = (f: string, t: string) => {
    setFrom(f);
    setTo(t);
  };

  const onSetAllCategories = (checked: boolean) => {
    setActiveCategories(checked ? [...ALL_CATEGORIES] : []);
  };

  const onToggleCategory = (cat: SalesCategory) => {
    setActiveCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const onToggleRegion = (id: string) => {
    setSelectedRegionIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const onClearRegions = () => setSelectedRegionIds([]);

  const onToggleProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const onClearProducts = () => setSelectedProductIds([]);

  return (
    <div className="min-h-screen w-full p-4 md:p-6 space-y-6 bg-background">
      
      <div className="grid gap-4">
        <SalesFilters
          from={from}
          to={to}
          onPeriodChange={onPeriodChange}
          categories={activeCategories}
          onToggleCategory={onToggleCategory}
          onSetAllCategories={onSetAllCategories}
          regions={regions}
          selectedRegionIds={selectedRegionIds}
          onToggleRegion={onToggleRegion}
          onClearRegions={onClearRegions}
          products={productOptions}
          selectedProductIds={selectedProductIds}
          onToggleProduct={onToggleProduct}
          onClearProducts={onClearProducts}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-card">
          <div className="text-xs text-muted-foreground">{showBottles ? "Total Bottles" : "Revenue"}</div>
          {combinedLoading ? (
            <Skeleton className="h-6 w-24 mt-2" />
          ) : (
            <div className="text-2xl font-semibold">
              {new Intl.NumberFormat().format(Math.round(showBottles ? kpis.totalUnits : kpis.totalRevenue))}
            </div>
          )}
        </Card>
        <Card className="p-4 bg-card">
          <div className="text-xs text-muted-foreground">{showBottles ? "Avg per Month" : "Units"}</div>
          {combinedLoading ? (
            <Skeleton className="h-6 w-24 mt-2" />
          ) : (
            <div className="text-2xl font-semibold">
              {showBottles 
                ? new Intl.NumberFormat().format(Math.round(kpis.totalUnits / Math.max(1, totalForForecast.length)))
                : new Intl.NumberFormat().format(Math.round(kpis.totalUnits))
              }
            </div>
          )}
        </Card>
        <Card className="p-4 bg-card">
          <div className="text-xs text-muted-foreground">Gross Margin</div>
          {combinedLoading ? (
            <Skeleton className="h-6 w-24 mt-2" />
          ) : (
            <div className="text-2xl font-semibold">
              {new Intl.NumberFormat().format(Math.round(kpis.totalGM))}
            </div>
          )}
        </Card>
        <Card className="p-4 bg-card">
          <div className="text-xs text-muted-foreground">MoM Growth</div>
      {combinedLoading ? (
            <Skeleton className="h-6 w-24 mt-2" />
          ) : (
            <div className={`text-2xl font-semibold ${kpis.growth >= 0 ? "text-green-600" : "text-red-600"}`}>
              {kpis.growth >= 0 ? "+" : ""}
              {kpis.growth.toFixed(1)}%
            </div>
          )}
        </Card>
      </div>

      {combinedLoading ? (
        <Card className="p-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-72 w-full" />
        </Card>
      ) : (
        <div className="space-y-4">
          <TrendChart 
            data={chartData as any[]} 
            activeCategories={showBySku ? [] : activeCategories}
            showBySku={showBySku}
            showTotal={showTotal}
            showForecast={showForecast}
            productOptions={productOptions}
          />
          <div className="flex justify-center space-x-8">
            <div className="flex items-center space-x-2">
              <Switch
                id="show-bottles"
                checked={showBottles}
                onCheckedChange={setShowBottles}
              />
              <Label htmlFor="show-bottles">
                {showBottles ? "Bottles" : "Sales"}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="show-by-sku"
                checked={showBySku}
                onCheckedChange={setShowBySku}
              />
              <Label htmlFor="show-by-sku">
                {showBySku ? "By SKU" : "By Channels"}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="show-total"
                checked={showTotal}
                onCheckedChange={setShowTotal}
              />
              <Label htmlFor="show-total">
                Show Total
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="show-forecast"
                checked={showForecast}
                onCheckedChange={setShowForecast}
              />
              <Label htmlFor="show-forecast">
                Show Forecast
              </Label>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default AnalyticsPage;
