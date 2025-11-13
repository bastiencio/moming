import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { StockMovement } from "@/hooks/useInventory";

interface StockHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: { id: string; name: string; sku: string } | null;
  fetchMovements: (product_id: string) => Promise<StockMovement[]>;
  onStockChanged?: () => void;
}

export const StockHistoryDialog = ({ open, onOpenChange, product, fetchMovements, onStockChanged }: StockHistoryDialogProps) => {
  const [rows, setRows] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ quantity: string; reason: string; movement_type: string }>({
    quantity: "",
    reason: "",
    movement_type: "in"
  });
  const { toast } = useToast();

  useEffect(() => {
    const run = async () => {
      if (open && product?.id) {
        setLoading(true);
        try {
          const data = await fetchMovements(product.id);
          setRows(data);
        } finally {
          setLoading(false);
        }
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product?.id]);

  const startEdit = (movement: StockMovement) => {
    setEditingId(movement.id);
    setEditValues({
      quantity: movement.quantity.toString(),
      reason: movement.reason || "",
      movement_type: movement.movement_type
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({ quantity: "", reason: "", movement_type: "in" });
  };

  const saveEdit = async (movementId: string) => {
    if (!product) return;
    
    try {
      const newQuantity = parseInt(editValues.quantity);
      if (isNaN(newQuantity) || newQuantity <= 0) {
        toast({ title: "Error", description: "Quantity must be a valid positive number", variant: "destructive" });
        return;
      }

      const { error } = await supabase
        .from("stock_movements")
        .update({
          quantity: newQuantity,
          reason: editValues.reason || null,
          movement_type: editValues.movement_type
        })
        .eq("id", movementId);

      if (error) throw error;

      toast({ title: "Success", description: "Stock movement updated successfully" });
      
      // Refresh the data
      const updatedData = await fetchMovements(product.id);
      setRows(updatedData);
      setEditingId(null);
      onStockChanged?.();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const deleteMovement = async (movementId: string) => {
    if (!product) return;
    
    try {
      const { error } = await supabase
        .from("stock_movements")
        .delete()
        .eq("id", movementId);

      if (error) throw error;

      toast({ title: "Success", description: "Stock movement deleted successfully" });
      
      // Refresh the data
      const updatedData = await fetchMovements(product.id);
      setRows(updatedData);
      onStockChanged?.();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Stock History {product ? `for ${product.name}` : ""}</DialogTitle>
        </DialogHeader>

        <div className="mt-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{new Date(r.created_at).toLocaleString()}</TableCell>
                  <TableCell>
                    {editingId === r.id ? (
                      <Select value={editValues.movement_type} onValueChange={(value) => setEditValues(prev => ({ ...prev, movement_type: value }))}>
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in">In</SelectItem>
                          <SelectItem value="out">Out</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className={r.movement_type === 'in' ? 'text-success' : 'text-destructive'}>
                        {r.movement_type === 'in' ? 'In' : 'Out'}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === r.id ? (
                      <Input
                        type="number"
                        value={editValues.quantity}
                        onChange={(e) => setEditValues(prev => ({ ...prev, quantity: e.target.value }))}
                        className="w-24"
                        min="1"
                      />
                    ) : (
                      r.quantity
                    )}
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    {editingId === r.id ? (
                      <Input
                        value={editValues.reason}
                        onChange={(e) => setEditValues(prev => ({ ...prev, reason: e.target.value }))}
                        placeholder="Reason"
                        className="w-full"
                      />
                    ) : (
                      <span className="truncate" title={r.reason || undefined}>{r.reason || '-'}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === r.id ? (
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => saveEdit(r.id)} className="h-8 w-8 p-0">
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-8 w-8 p-0">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => startEdit(r)} className="h-8 w-8 p-0">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => deleteMovement(r.id)} 
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">No history yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};
