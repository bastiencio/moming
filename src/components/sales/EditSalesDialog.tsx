import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SalesRecord, CreateSalesData, SalesCategory, SALES_CATEGORY_LABELS } from "@/hooks/useSales";

interface EditSalesDialogProps {
  sale: SalesRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSalesUpdated: (id: string, salesData: Partial<CreateSalesData>) => Promise<void>;
}

export const EditSalesDialog = ({ sale, open, onOpenChange, onSalesUpdated }: EditSalesDialogProps) => {
  const [formData, setFormData] = useState<CreateSalesData>({
    period_month: '',
    category: 'online',
    revenue: 0,
    cost: 0,
    units: 0,
    discounts: 0,
    returns: 0,
    taxes: 0,
    currency: 'CNY',
    fx_to_cny: 1,
  });

  useEffect(() => {
    if (sale) {
      setFormData({
        period_month: sale.period_month,
        category: sale.category,
        revenue: sale.revenue,
        cost: sale.cost,
        units: sale.units,
        discounts: sale.discounts,
        returns: sale.returns,
        taxes: sale.taxes,
        currency: sale.currency,
        fx_to_cny: sale.fx_to_cny,
        source: sale.source || '',
        notes: sale.notes || '',
      });
    }
  }, [sale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sale) return;

    try {
      await onSalesUpdated(sale.id, formData);
      onOpenChange(false);
    } catch (error) {
    }
  };

  if (!sale) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Sales Record</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="period_month">Period Month</Label>
              <Input
                id="period_month"
                type="date"
                value={formData.period_month}
                onChange={(e) => setFormData({ ...formData, period_month: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Channel</Label>
              <Select
                value={formData.category}
                onValueChange={(value: SalesCategory) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SALES_CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="revenue">Revenue</Label>
              <Input
                id="revenue"
                type="number"
                step="0.01"
                value={formData.revenue}
                onChange={(e) => setFormData({ ...formData, revenue: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <div>
              <Label htmlFor="cost">Cost</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="units">Units</Label>
              <Input
                id="units"
                type="number"
                value={formData.units}
                onChange={(e) => setFormData({ ...formData, units: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CNY">CNY</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="HKD">HKD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="discounts">Discounts</Label>
              <Input
                id="discounts"
                type="number"
                step="0.01"
                value={formData.discounts}
                onChange={(e) => setFormData({ ...formData, discounts: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="returns">Returns</Label>
              <Input
                id="returns"
                type="number"
                step="0.01"
                value={formData.returns}
                onChange={(e) => setFormData({ ...formData, returns: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="taxes">Taxes</Label>
              <Input
                id="taxes"
                type="number"
                step="0.01"
                value={formData.taxes}
                onChange={(e) => setFormData({ ...formData, taxes: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="source">Source</Label>
            <Input
              id="source"
              value={formData.source || ''}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              placeholder="e.g., WeChat, Taobao, Event name..."
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Update Sales Record
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};