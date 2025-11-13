import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus } from "lucide-react";
import { CreateSalesData, SalesCategory, SALES_CATEGORY_LABELS } from "@/hooks/useSales";

interface AddSalesDialogProps {
  onSalesCreated: (salesData: CreateSalesData) => Promise<void>;
}

export const AddSalesDialog = ({ onSalesCreated }: AddSalesDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CreateSalesData>({
    period_month: new Date().toISOString().slice(0, 7) + '-01',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSalesCreated(formData);
      setOpen(false);
      // Reset form
      setFormData({
        period_month: new Date().toISOString().slice(0, 7) + '-01',
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
    } catch (error) {
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Sales Record
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Sales Record</DialogTitle>
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
              Create Sales Record
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};