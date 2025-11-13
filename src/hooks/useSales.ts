import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type SalesCategory = 'online' | 'offline_events' | 'offline_shops' | 'cws_distributor' | 'hong_kong_cws' | 'free_stock_giveaway';

export interface SalesRecord {
  id: string;
  period_month: string;
  category: SalesCategory;
  region_id?: string;
  client_id?: string;
  product_id?: string;
  revenue: number;
  cost: number;
  units: number;
  discounts: number;
  returns: number;
  taxes: number;
  currency: string;
  fx_to_cny: number;
  source?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Relations
  cws_regions?: { name: string; code: string } | null;
  clients?: { name: string; company_name: string } | null;
  products?: { name: string; sku: string } | null;
}

export interface CreateSalesData {
  period_month: string;
  category: SalesCategory;
  region_id?: string;
  client_id?: string;
  product_id?: string;
  revenue: number;
  cost: number;
  units: number;
  discounts?: number;
  returns?: number;
  taxes?: number;
  currency?: string;
  fx_to_cny?: number;
  source?: string;
  notes?: string;
}

export const SALES_CATEGORY_LABELS: Record<SalesCategory, string> = {
  online: 'Online',
  offline_events: 'Offline Events',
  offline_shops: 'Offline Shops',
  cws_distributor: 'CWS China',
  hong_kong_cws: 'Hong Kong CWS',
  free_stock_giveaway: 'Free Stock Giveaway',
};

export const useSales = () => {
  const [sales, setSales] = useState<SalesRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSales = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('mo-sales_monthly')
        .select(`
          *,
          cws_regions:region_id(name, code),
          clients:client_id(name, company_name),
          products:product_id(name, sku)
        `)
        .order('period_month', { ascending: false });

      if (error) {
        throw error;
      }

      setSales((data || []) as unknown as SalesRecord[]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch sales data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createSale = async (salesData: CreateSalesData) => {
    try {
      const { data, error } = await supabase
        .from('mo-sales_monthly')
        .insert([{
          ...salesData,
          currency: salesData.currency || 'CNY',
          fx_to_cny: salesData.fx_to_cny || 1,
          discounts: salesData.discounts || 0,
          returns: salesData.returns || 0,
          taxes: salesData.taxes || 0,
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Sales record created successfully",
      });

      await fetchSales(); // Refresh the list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create sales record",
        variant: "destructive",
      });
    }
  };

  const updateSale = async (id: string, salesData: Partial<CreateSalesData>) => {
    try {
      const { error } = await supabase
        .from('mo-sales_monthly')
        .update(salesData)
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Sales record updated successfully",
      });

      await fetchSales(); // Refresh the list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update sales record",
        variant: "destructive",
      });
    }
  };

  const deleteSale = async (id: string) => {
    try {
      const { error } = await supabase
        .from('mo-sales_monthly')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Sales record deleted successfully",
      });

      await fetchSales(); // Refresh the list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete sales record",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  return {
    sales,
    loading,
    createSale,
    updateSale,
    deleteSale,
    refetch: fetchSales,
  };
};