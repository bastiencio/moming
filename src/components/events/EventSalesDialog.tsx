import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { EventItem } from "@/hooks/useEvents";
import { Plus } from "lucide-react";

interface ProductOption { id: string; name: string; sku: string; base_price: number; }

interface SaleRow {
  id: string;
  sale_timestamp: string;
  product_id: string;
  quantity_sold: number;
  unit_price: number;
  total_revenue: number;
  product?: { id: string; name: string; sku: string } | null;
}

const saleSchema = z.object({
  product_id: z.string().min(1, "Product is required"),
  quantity_sold: z.preprocess((v) => Number(v), z.number().min(1)),
  unit_price: z.preprocess((v) => Number(v), z.number().min(0)),
});

type SaleFormData = z.infer<typeof saleSchema>;

interface EventSalesDialogProps {
  event: EventItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddSale: (payload: { event_id: string; product_id: string; quantity_sold: number; unit_price: number }) => Promise<void>;
}

export const EventSalesDialog = ({ event, open, onOpenChange, onAddSale }: EventSalesDialogProps) => {
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [sales, setSales] = useState<SaleRow[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: { product_id: "", quantity_sold: 1, unit_price: 0 },
  });

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("id, name, sku, base_price")
      .eq("active", true)
      .order("name");
    setProducts((data || []) as ProductOption[]);
  };

  const fetchSales = async () => {
    if (!event) return;
    const { data, error } = await supabase
      .from("event_sales")
      .select("*, product:products(id, name, sku)")
      .eq("event_id", event.id)
      .order("sale_timestamp", { ascending: false });
    if (error) {
      return;
    }
    setSales((data || []) as any);
  };

  useEffect(() => {
    if (open) {
      fetchProducts();
      fetchSales();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, event?.id]);

  const totalRevenue = useMemo(() => sales.reduce((s, r) => s + Number(r.total_revenue || 0), 0), [sales]);

  const onSubmit = async (values: SaleFormData) => {
    if (!event) return;
    try {
      setLoading(true);
      await onAddSale({
        event_id: event.id,
        product_id: values.product_id,
        quantity_sold: values.quantity_sold,
        unit_price: values.unit_price,
      });
      form.reset({ product_id: "", quantity_sold: 1, unit_price: 0 });
      await fetchSales();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Sales for {event.name}</DialogTitle>
        </DialogHeader>

        {/* Add Sale */}
        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-6">
                  <FormField
                    control={form.control}
                    name="product_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product</FormLabel>
                        <Select value={field.value} onValueChange={(v) => {
                          field.onChange(v);
                          const p = products.find(pr => pr.id === v);
                          if (p) form.setValue("unit_price", p.base_price);
                        }}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a product" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-background border shadow-md z-50">
                            {products.map(p => (
                              <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="quantity_sold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="unit_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.01" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="md:col-span-2 flex">
                  <Button type="submit" className="w-full" disabled={loading}>
                    <Plus className="w-4 h-4 mr-2" />
                    {loading ? "Adding..." : "Add Sale"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Sales Table */}
        <div className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{new Date(s.sale_timestamp).toLocaleString()}</TableCell>
                  <TableCell>{s.product?.name || s.product_id}</TableCell>
                  <TableCell>{s.quantity_sold}</TableCell>
                  <TableCell>${Number(s.unit_price).toFixed(2)}</TableCell>
                  <TableCell className="font-medium">${Number(s.total_revenue).toFixed(2)}</TableCell>
                </TableRow>
              ))}
              {sales.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">No sales recorded yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="text-right mt-3 font-medium">Total Revenue: ${totalRevenue.toFixed(2)}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
