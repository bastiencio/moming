import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle, TrendingUp, TrendingDown, Package, Search, RefreshCw } from "lucide-react";
import { useInventory } from "@/hooks/useInventory";
import { AdjustStockDialog } from "@/components/inventory/AdjustStockDialog";
import { StockHistoryDialog } from "@/components/inventory/StockHistoryDialog";
import { formatCurrency } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const Inventory = () => {
  const { items, loading, totalValue, refetch, adjustStock, getMovements } = useInventory();
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return items.filter((it) =>
      (it.product?.name || "").toLowerCase().includes(s) || (it.product?.sku || "").toLowerCase().includes(s)
    );
  }, [items, searchTerm]);

  const lowStockCount = useMemo(() => items.filter((i) => i.stock_status === "low_stock").length, [items]);
  const outOfStockCount = useMemo(() => items.filter((i) => i.stock_status === "out_of_stock").length, [items]);

  const [avgMonthlyUnits, setAvgMonthlyUnits] = useState<Record<string, number>>({});
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<{ id: string; name: string; sku: string } | null>(null);

  useEffect(() => {
    const fetchAvg = async () => {
      if (!items.length) return;
      const productIds = items.map((it) => it.product?.id).filter(Boolean) as string[];
      if (!productIds.length) return;

      const now = new Date();
      const past = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1)); // last 6 months
      const from = `${past.getUTCFullYear()}-${String(past.getUTCMonth() + 1).padStart(2, "0")}-01`;
      const to = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;

      const { data, error } = await supabase
        .from("sales_monthly")
        .select("product_id, units, period_month")
        .in("product_id", productIds)
        .gte("period_month", from)
        .lte("period_month", to);

      if (error) {
        return;
      }

      const sums: Record<string, number> = {};
      productIds.forEach((id) => (sums[id] = 0));
      (data || []).forEach((row: any) => {
        if (row.product_id) {
          sums[row.product_id] = (sums[row.product_id] || 0) + Number(row.units ?? 0);
        }
      });

      const months = 6;
      const avgs: Record<string, number> = {};
      Object.keys(sums).forEach((id) => {
        avgs[id] = sums[id] / months;
      });
      setAvgMonthlyUnits(avgs);
    };

    fetchAvg();
  }, [items]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_stock":
        return <Badge variant="default">In Stock</Badge>;
      case "low_stock":
        return (
          <Badge variant="secondary" className="bg-warning/20 text-warning">
            Low Stock
          </Badge>
        );
      case "out_of_stock":
        return <Badge variant="destructive">Out of Stock</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-foreground mb-2">Inventory Management</h1>
          <p className="text-muted-foreground">Track stock levels, movements, and receive low-stock alerts</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => refetch()} disabled={loading}>
          <RefreshCw className="w-4 h-4 mr-2" />
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-kombucha">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Inventory Value</p>
                <p className="text-xl font-medium text-foreground">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-kombucha">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-warning/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Low Stock Items</p>
                <p className="text-xl font-medium text-warning">{lowStockCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-kombucha">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-destructive/20 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
                <p className="text-xl font-medium text-destructive">{outOfStockCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-kombucha">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total SKUs</p>
                <p className="text-xl font-medium text-foreground">{items.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-kombucha">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Search inventory by product name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-kombucha">
        <CardHeader>
          <CardTitle>Current Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Min/Max Levels</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Last Restocked</TableHead>
                <TableHead>ETA to Out of Stock</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.product?.name}</TableCell>
                  <TableCell className="font-mono text-sm">{item.product?.sku}</TableCell>
                  <TableCell>
                    <span className={`font-medium ${item.stock_status === 'in_stock' ? 'text-success' : item.stock_status === 'low_stock' ? 'text-warning' : 'text-destructive'}`}>
                      {item.current_stock}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Min:</span> {item.min_stock_level} <br />
                      <span className="text-muted-foreground">Max:</span> {item.max_stock_level}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(item.stock_status)}</TableCell>
                  <TableCell>{formatCurrency((item.product?.cost_price || 0) * (item.current_stock || 0))}</TableCell>
                  <TableCell>{item.last_restocked_at ? new Date(item.last_restocked_at).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>
                    {(() => {
                      const pid = item.product?.id || '';
                      const avg = avgMonthlyUnits[pid] || 0;
                      if (avg <= 0) return <span className="text-muted-foreground">—</span>;
                      const monthsLeft = Number(item.current_stock ?? 0) / avg;
                      const val = Math.max(0, Math.round(monthsLeft * 10) / 10);
                      const color = val < 1 ? 'text-destructive' : val < 3 ? 'text-warning' : 'text-success';
                      return <span className={`font-medium ${color}`}>{val.toFixed(1)} mo</span>;
                    })()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setActiveProduct(item.product ? { id: item.product.id, name: item.product.name, sku: item.product.sku } : null);
                          setAdjustOpen(true);
                        }}
                      >
                        Adjust
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setActiveProduct(item.product ? { id: item.product.id, name: item.product.name, sku: item.product.sku } : null);
                          setHistoryOpen(true);
                        }}
                      >
                        History
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">No items found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AdjustStockDialog
        open={adjustOpen}
        onOpenChange={setAdjustOpen}
        product={activeProduct}
        onConfirm={async (payload) => {
          if (!activeProduct) return;
          await adjustStock({ product_id: activeProduct.id, quantity: payload.quantity, type: payload.type, reason: payload.reason });
        }}
      />

      <StockHistoryDialog
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        product={activeProduct}
        fetchMovements={async (product_id) => await getMovements(product_id)}
        onStockChanged={() => refetch()}
      />
    </div>
  );
};

export default Inventory;
