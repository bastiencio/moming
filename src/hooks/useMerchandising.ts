import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface MerchItem {
  id: string;
  name: string;
  code: string;
  category?: string;
  stock: number;
  active: boolean;
  picture?: string;
  supplier_taobao_link?: string;
  supplier_wechat_id?: string;
  supplier_phone?: string;
  supplier_email?: string;
  moq?: number;
  cost_per_piece?: number;
  production_time?: string;
  production_details_file?: string;
  created_at?: string;
  updated_at?: string;
}

export const useMerchandising = () => {
  const [items, setItems] = useState<MerchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("mo-merchandising")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load merchandising items.",
      });
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (itemData: Omit<MerchItem, "id" | "created_at" | "updated_at">) => {
    try {
      const { data, error } = await supabase
        .from("mo-merchandising")
        .insert([itemData])
        .select()
        .single();

      if (error) throw error;

      setItems((prev) => [data, ...prev]);
      toast({
        title: "Item added",
        description: `${data.name} has been created successfully.`,
      });
      return data;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add merchandising item.",
      });
      throw error;
    }
  };

  const updateItem = async (id: string, itemData: Partial<MerchItem>) => {
    try {
      const { data, error } = await supabase
        .from("mo-merchandising")
        .update(itemData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setItems((prev) =>
        prev.map((item) => (item.id === id ? data : item))
      );
      toast({
        title: "Item updated",
        description: `${data.name} has been updated successfully.`,
      });
      return data;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update merchandising item.",
      });
      throw error;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from("mo-merchandising")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setItems((prev) => prev.filter((item) => item.id !== id));
      toast({
        title: "Item deleted",
        description: "Merchandising item has been deleted successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete merchandising item.",
      });
      throw error;
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      await updateItem(id, { active: !currentActive });
    } catch (error) {
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return {
    items,
    loading,
    addItem,
    updateItem,
    deleteItem,
    toggleActive,
    refetch: fetchItems,
  };
};