import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SalesCategory, SALES_CATEGORY_LABELS } from '@/hooks/useSales';

interface SKUData {
  id?: string;
  product_id: string;
  product_name: string;
  sku: string;
  revenue: number;
  cost: number;
  units: number;
  discounts: number;
  returns: number;
  taxes: number;
}

interface SKUEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  month: string; // YYYY-MM format
  category: SalesCategory;
  valueMode: 'revenue' | 'bottles';
  onDataUpdated: () => void;
}

export const SKUEditDialog: React.FC<SKUEditDialogProps> = ({
  open,
  onOpenChange,
  month,
  category,
  valueMode,
  onDataUpdated
}) => {
  const [skuData, setSkuData] = useState<SKUData[]>([]);
  const [products, setProducts] = useState<Array<{ id: string; name: string; sku: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Fetch products and existing sales data
  useEffect(() => {
    if (open && month && category) {
      fetchData();
    }
  }, [open, month, category]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all products
      const { data: productsData, error: productsError } = await supabase
        .from('mo-products')
        .select('id, name, sku')
        .eq('active', true)
        .order('name');

      if (productsError) throw productsError;
      setProducts(productsData || []);

      // Fetch existing sales data for this month/category
      const periodMonth = `${month}-01`;
      const { data: salesData, error: salesError } = await supabase
        .from('mo-sales_monthly' as any)
        .select(`
          id,
          product_id,
          revenue,
          cost,
          units,
          discounts,
          returns,
          taxes
        `)
        .eq('period_month', periodMonth)
        .eq('category', category);

      if (salesError) throw salesError;

      // Create a map of product data
      const productsMap = new Map();
      (productsData || []).forEach(product => {
        productsMap.set(product.id, { name: product.name, sku: product.sku });
      });

      // Create SKU data array with existing data and empty entries for products without data
      const existingSalesMap = new Map();
      (salesData || []).forEach((sale: any) => {
        if (sale.product_id) {
          const productInfo = productsMap.get(sale.product_id);
          if (productInfo) {
            existingSalesMap.set(sale.product_id, {
              id: sale.id,
              product_id: sale.product_id,
              product_name: productInfo.name,
              sku: productInfo.sku,
              revenue: sale.revenue,
              cost: sale.cost,
              units: sale.units,
              discounts: sale.discounts || 0,
              returns: sale.returns || 0,
              taxes: sale.taxes || 0
            });
          }
        }
      });

      // Add entries for all products
      const allSkuData = (productsData || []).map(product => {
        if (existingSalesMap.has(product.id)) {
          return existingSalesMap.get(product.id);
        } else {
          return {
            product_id: product.id,
            product_name: product.name,
            sku: product.sku,
            revenue: 0,
            cost: 0,
            units: 0,
            discounts: 0,
            returns: 0,
            taxes: 0
          };
        }
      });

      setSkuData(allSkuData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch SKU data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSKUValue = (productId: string, field: keyof SKUData, value: number) => {
    setSkuData(prev => prev.map(sku => 
      sku.product_id === productId 
        ? { ...sku, [field]: value }
        : sku
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const periodMonth = `${month}-01`;
      
      // Separate existing records from new records
      const existingRecords = skuData
        .filter(sku => sku.id && (sku.revenue > 0 || sku.cost > 0 || sku.units > 0))
        .map(sku => ({
          id: sku.id,
          period_month: periodMonth,
          category,
          product_id: sku.product_id,
          revenue: sku.revenue,
          cost: sku.cost,
          units: sku.units,
          discounts: sku.discounts,
          returns: sku.returns,
          taxes: sku.taxes,
          currency: 'CNY',
          fx_to_cny: 1
        }));

      const newRecords = skuData
        .filter(sku => !sku.id && (sku.revenue > 0 || sku.cost > 0 || sku.units > 0))
        .map(sku => ({
          period_month: periodMonth,
          category,
          product_id: sku.product_id,
          revenue: sku.revenue,
          cost: sku.cost,
          units: sku.units,
          discounts: sku.discounts,
          returns: sku.returns,
          taxes: sku.taxes,
          currency: 'CNY',
          fx_to_cny: 1
        }));

      // Update existing records
      if (existingRecords.length > 0) {
        const { error } = await supabase
          .from('mo-sales_monthly' as any)
          .upsert(existingRecords, {
            onConflict: 'id'
          });

        if (error) throw error;
      }

      // Insert new records
      if (newRecords.length > 0) {
        const { error } = await supabase
          .from('mo-sales_monthly' as any)
          .insert(newRecords);

        if (error) throw error;
      }

      // Delete records that are now zero
      const recordsToDelete = skuData
        .filter(sku => sku.id && sku.revenue === 0 && sku.cost === 0 && sku.units === 0)
        .map(sku => sku.id!);

      if (recordsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('mo-sales_monthly' as any)
          .delete()
          .in('id', recordsToDelete);

        if (deleteError) throw deleteError;
      }

      toast({
        title: "Success",
        description: "SKU data updated successfully",
      });

      onDataUpdated();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save SKU data",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const monthYear = new Date(`${month}-01`).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long' 
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Edit SKU Data - {SALES_CATEGORY_LABELS[category]} - {monthYear}
          </DialogTitle>
          <DialogDescription>
            Update revenue, cost, units, and other metrics for each product SKU.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="p-8 text-center">Loading SKU data...</div>
        ) : (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead className="text-right">Revenue (¥)</TableHead>
                      <TableHead className="text-right">Cost (¥)</TableHead>
                      <TableHead className="text-right">Units</TableHead>
                      <TableHead className="text-right">Discounts (¥)</TableHead>
                      <TableHead className="text-right">Returns (¥)</TableHead>
                      <TableHead className="text-right">Taxes (¥)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {skuData.map((sku) => (
                      <TableRow key={sku.product_id}>
                        <TableCell className="font-mono text-sm">{sku.sku}</TableCell>
                        <TableCell>{sku.product_name}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={sku.revenue}
                            onChange={(e) => updateSKUValue(sku.product_id, 'revenue', parseFloat(e.target.value) || 0)}
                            className="text-right"
                            min="0"
                            step="0.01"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={sku.cost}
                            onChange={(e) => updateSKUValue(sku.product_id, 'cost', parseFloat(e.target.value) || 0)}
                            className="text-right"
                            min="0"
                            step="0.01"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={sku.units}
                            onChange={(e) => updateSKUValue(sku.product_id, 'units', parseInt(e.target.value) || 0)}
                            className="text-right"
                            min="0"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={sku.discounts}
                            onChange={(e) => updateSKUValue(sku.product_id, 'discounts', parseFloat(e.target.value) || 0)}
                            className="text-right"
                            min="0"
                            step="0.01"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={sku.returns}
                            onChange={(e) => updateSKUValue(sku.product_id, 'returns', parseFloat(e.target.value) || 0)}
                            className="text-right"
                            min="0"
                            step="0.01"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={sku.taxes}
                            onChange={(e) => updateSKUValue(sku.product_id, 'taxes', parseFloat(e.target.value) || 0)}
                            className="text-right"
                            min="0"
                            step="0.01"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};