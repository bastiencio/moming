import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { SALES_CATEGORY_LABELS } from "@/hooks/useSales";
import { useSalesAggregates, monthKey, SalesCategory as AggCategory } from "@/hooks/useSalesAnalytics";
import { SKUEditDialog } from "@/components/sales/SKUEditDialog";

const Sales = () => {
  // Year selection (default to current year)
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [valueMode, setValueMode] = useState<"revenue" | "bottles">("revenue");
  
  // Dialog state for SKU editing
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<AggCategory>("online");

  // Generate available years (2020 to current year)
  const availableYears = Array.from(
    { length: currentYear - 2020 + 1 }, 
    (_, i) => 2020 + i
  ).reverse(); // Most recent first

  const ALL_CATEGORIES: AggCategory[] = [
    "online",
    "offline_events",
    "offline_shops",
    "cws_distributor",
    "hong_kong_cws",
    "free_stock_giveaway",
  ];

  // Memoize from/to dates for the selected year
  const { from, to } = useMemo(() => ({
    from: `${selectedYear}-01-01`,
    to: `${selectedYear}-12-01`
  }), [selectedYear]);

  const { data: aggregates = [], isLoading: aggLoading } = useSalesAggregates({
    from,
    to,
    categories: ALL_CATEGORIES,
  });

  // Generate 12 months for the selected year
  const monthList = Array.from({ length: 12 }, (_, i) => {
    const month = String(i + 1).padStart(2, "0");
    return `${selectedYear}-${month}`;
  });

  const pivot: Record<string, Record<string, number>> = {};
  ALL_CATEGORIES.forEach((c) => {
    pivot[c] = {};
    monthList.forEach((m) => (pivot[c][m] = 0));
  });
  aggregates.forEach((row) => {
    const m = monthKey(row.period_month);
    const cat = (row.category ?? "unknown") as AggCategory | string;
    if (pivot[cat as string] && pivot[cat as string][m] !== undefined) {
      const val = valueMode === "bottles" ? Number(row.units ?? 0) : Number(row.revenue ?? 0);
      pivot[cat as string][m] += val;
    }
  });

  const handleCellClick = (month: string, category: AggCategory) => {
    setSelectedMonth(month);
    setSelectedCategory(category);
    setDialogOpen(true);
  };

  const handleDataUpdated = () => {
    // Refetch data when dialog saves changes
    window.location.reload(); // Simple refresh for now
  };

  if (aggLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center">
          <div className="text-muted-foreground">Loading sales data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-foreground mb-2">Sales Management</h1>
          <p className="text-muted-foreground">Track and manage sales data across all channels</p>
        </div>
        <ToggleGroup
          type="single"
          value={valueMode}
          onValueChange={(v) => v && setValueMode(v as any)}
          size="sm"
        >
          <ToggleGroupItem value="revenue" aria-label="Show revenue">Sales</ToggleGroupItem>
          <ToggleGroupItem value="bottles" aria-label="Show bottles">Bottles</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Monthly by Channel */}
      <Card className="shadow-kombucha">
        <CardHeader>
          <CardTitle>Monthly by Channel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <label className="text-sm text-foreground">Year</label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Channel</TableHead>
                  {monthList.map((m) => (
                    <TableHead key={m} className="text-right font-mono">{m}</TableHead>
                  ))}
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ALL_CATEGORIES.map((cat) => {
                  const total = monthList.reduce((s, m) => s + (pivot[cat][m] || 0), 0);
                  return (
                    <TableRow key={cat}>
                      <TableCell className="whitespace-nowrap">{SALES_CATEGORY_LABELS[cat as keyof typeof SALES_CATEGORY_LABELS]}</TableCell>
                      {monthList.map((m) => (
                        <TableCell 
                          key={m} 
                          className="text-right font-mono cursor-pointer hover:bg-accent/50 transition-colors"
                          onClick={() => handleCellClick(m, cat)}
                          title="Click to edit SKU breakdown"
                        >
                          {Math.round(pivot[cat][m] || 0).toLocaleString()}
                        </TableCell>
                      ))}
                      <TableCell className="text-right font-mono font-medium">
                        {Math.round(total).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {/* Totals row */}
                <TableRow>
                  <TableCell className="font-medium">Total</TableCell>
                  {monthList.map((m) => {
                    const sum = ALL_CATEGORIES.reduce((s, c) => s + (pivot[c][m] || 0), 0);
                    return (
                      <TableCell key={m} className="text-right font-mono font-medium">
                        {Math.round(sum).toLocaleString()}
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-right font-mono font-semibold">
                    {Math.round(
                      monthList.reduce((acc, m) => acc + ALL_CATEGORIES.reduce((s, c) => s + (pivot[c][m] || 0), 0), 0)
                    ).toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* SKU Edit Dialog */}
      <SKUEditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        month={selectedMonth}
        category={selectedCategory}
        valueMode={valueMode}
        onDataUpdated={handleDataUpdated}
      />
    </div>
  );
};

export default Sales;