import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface InventoryRecord {
  id: string;
  product_id: string;
  current_stock: number;
  min_stock_level: number;
  max_stock_level: number;
  stock_status: StockStatus;
  last_restocked_at: string | null;
  product?: {
    id: string;
    name: string;
    sku: string;
    base_price: number;
    cost_price: number;
  } | null;
}

export interface StockMovement {
  id: string;
  product_id: string;
  movement_type: "in" | "out";
  quantity: number;
  reason?: string | null;
  created_at: string;
}

export const useInventory = () => {
  const [items, setItems] = useState<InventoryRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("mo-inventory")
        .select(
          'id, product_id, current_stock, min_stock_level, max_stock_level, stock_status, last_restocked_at, product:"mo-products"(id, name, sku, base_price, cost_price)'
        )
        .order("updated_at", { ascending: false });
      if (error) throw error;
      
      setItems((data || []) as unknown as InventoryRecord[]);
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to fetch inventory", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const totalValue = useMemo(() => {
    return items.reduce((sum, it) => sum + (Number(it.product?.cost_price ?? 0) * Number(it.current_stock ?? 0)), 0);
  }, [items]);

  const adjustStock = async ({
    product_id,
    quantity,
    type,
    reason,
  }: { product_id: string; quantity: number; type: "in" | "out"; reason?: string }) => {
    try {
      // Load current inventory row
      const { data: invRow, error: invErr } = await supabase
        .from("mo-inventory")
        .select("id, current_stock, last_restocked_at")
        .eq("product_id", product_id)
        .maybeSingle();
      if (invErr) throw invErr;
      if (!invRow) throw new Error("Inventory record not found for this product.");

      const delta = type === "in" ? quantity : -quantity;
      const newStock = Number(invRow.current_stock || 0) + delta;
      if (newStock < 0) throw new Error("Resulting stock cannot be negative.");

      // Update inventory amounts (trigger will recompute stock_status)
      const { error: updErr } = await supabase
        .from("mo-inventory")
        .update({
          current_stock: newStock,
          last_restocked_at: type === "in" ? new Date().toISOString() : invRow.last_restocked_at,
        })
        .eq("id", invRow.id);
      if (updErr) throw updErr;

      // Record movement
      const { error: movErr } = await supabase.from("mo-stock_movements").insert({
        product_id,
        movement_type: type,
        quantity,
        reason: reason || null,
      });
      if (movErr) throw movErr;

      toast({ title: "Stock updated", description: `Successfully ${type === "in" ? "added" : "removed"} ${quantity} units.` });
      await fetchInventory();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      throw err;
    }
  };

  const getMovements = async (product_id: string) => {
    const { data, error } = await supabase
      .from("mo-stock_movements")
      .select("id, product_id, movement_type, quantity, reason, created_at")
      .eq("product_id", product_id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []) as unknown as StockMovement[];
  };

  return {
    items,
    loading,
    totalValue,
    refetch: fetchInventory,
    adjustStock,
    getMovements,
  };
};
