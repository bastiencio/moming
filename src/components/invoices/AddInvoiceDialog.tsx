import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Minus, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { CreateInvoiceData } from "@/hooks/useInvoices";

const invoiceSchema = z.object({
  client_id: z.string().min(1, "Client is required"),
  po_number: z.string().optional(),
  due_date: z.string().optional(),
  notes: z.string().optional(),
  tax_rate: z.number().min(0, "Tax rate must be positive").max(100, "Tax rate cannot exceed 100%"),
  tax_included: z.boolean().default(true),
  items: z.array(z.object({
    product_id: z.string().min(1, "Product is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    unit_price: z.number().min(0, "Price must be positive"),
  })).min(1, "At least one item is required"),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface Client {
  id: string;
  name: string;
  email: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  base_price: number;
  category: 'small_bottle' | 'large_bottle' | 'keg';
}

interface AddInvoiceDialogProps {
  onInvoiceCreated: (invoiceData: CreateInvoiceData) => Promise<void>;
}

export const AddInvoiceDialog = ({ onInvoiceCreated }: AddInvoiceDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      client_id: "",
      po_number: "",
      due_date: "",
      notes: "",
      tax_rate: 13,
      tax_included: true,
      items: [{ product_id: "", quantity: 1, unit_price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Fetch clients and products
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsResponse, productsResponse] = await Promise.all([
          supabase.from("clients").select("*").eq("active", true),
          supabase.from("products").select("id, name, sku, base_price, category").eq("active", true),
        ]);

        if (clientsResponse.data) setClients(clientsResponse.data);
        if (productsResponse.data) setProducts(productsResponse.data);
      } catch (error) {
      }
    };

    if (open) {
      fetchData();
    }
  }, [open]);

  // Update product pricing when product changes
  const handleProductChange = async (productId: string, index: number) => {
    const product = products.find(p => p.id === productId);
    const clientId = form.getValues("client_id");
    
    if (product && clientId) {
      let finalPrice = product.base_price;
      
      try {
        // First check for specific client-product pricing
        const { data: clientProductPricing } = await supabase
          .from("client_pricing")
          .select("custom_price")
          .eq("client_id", clientId)
          .eq("product_id", productId)
          .single();
          
        if (clientProductPricing) {
          finalPrice = clientProductPricing.custom_price;
        } else {
          // Check for client-category pricing
          const { data: clientCategoryPricing } = await supabase
            .from("client_category_pricing")
            .select("custom_price")
            .eq("client_id", clientId)
            .eq("product_category", product.category)
            .single();
            
          if (clientCategoryPricing) {
            finalPrice = clientCategoryPricing.custom_price;
          }
        }
      } catch (error) {
        // If no client-specific pricing found, use base price
      }
      
      form.setValue(`items.${index}.unit_price`, finalPrice);
    }
  };

  const onSubmit = async (data: InvoiceFormData) => {
    try {
      setLoading(true);

      // Transform data to include product names and calculate totals
      const items = data.items.map(item => {
        const product = products.find(p => p.id === item.product_id);
        return {
          product_id: item.product_id,
          product_name: product?.name || "",
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.quantity * item.unit_price,
        };
      });

      const invoiceData: CreateInvoiceData = {
        client_id: data.client_id,
        po_number: data.po_number,
        due_date: data.due_date,
        notes: data.notes,
        tax_rate: data.tax_rate,
        tax_included: data.tax_included,
        items,
      };

      await onInvoiceCreated(invoiceData);
      setOpen(false);
      form.reset();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const watchedItems = form.watch("items");
  const watchedTaxRate = form.watch("tax_rate");
  const watchedTaxIncluded = form.watch("tax_included");
  
  const subtotal = watchedItems.reduce((sum, item) => {
    return sum + (item.quantity * item.unit_price);
  }, 0);
  
  // Calculate tax based on whether it's included or excluded
  let taxAmount = 0;
  let displaySubtotal = subtotal;
  let total = subtotal;
  
  if (watchedTaxIncluded) {
    // Tax is included in the item prices
    taxAmount = subtotal * (watchedTaxRate / 100) / (1 + watchedTaxRate / 100);
    displaySubtotal = subtotal - taxAmount;
    total = subtotal;
  } else {
    // Tax is excluded and added to subtotal
    taxAmount = subtotal * (watchedTaxRate / 100);
    total = subtotal + taxAmount;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Create New Invoice
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Client Information */}
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="client_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a client" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-background border shadow-md z-50">
                            {clients.map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="due_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="po_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>P.O. Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter P.O. number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Additional notes or special instructions..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Tax Settings */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                  <FormField
                    control={form.control}
                    name="tax_rate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Tax Rate (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.1"
                            min="0"
                            max="100"
                            placeholder="10"
                            className="text-center text-lg"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tax_included"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <div>
                          <FormLabel className="text-base font-medium">Tax Included in Prices</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Toggle if tax is already included in item prices
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Invoice Items */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Invoice Items</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ product_id: "", quantity: 1, unit_price: 0 })}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="hidden md:grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                  <div className="col-span-4">Product</div>
                  <div className="col-span-2">Quantity</div>
                  <div className="col-span-3">Unit Price (¥)</div>
                  <div className="col-span-2">Total</div>
                  <div className="col-span-1"></div>
                </div>
                
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-4 border rounded-lg bg-muted/20">
                    <div className="col-span-1 md:col-span-4">
                      <FormField
                        control={form.control}
                        name={`items.${index}.product_id`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="md:sr-only">Product</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                handleProductChange(value, index);
                              }}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select product" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-background border shadow-md z-50">
                                {products.map((product) => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.name} ({product.sku})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="col-span-1 md:col-span-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="md:sr-only">Quantity</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                className="text-center"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="col-span-1 md:col-span-3">
                      <FormField
                        control={form.control}
                        name={`items.${index}.unit_price`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="md:sr-only">Unit Price (¥)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                className="text-right"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="col-span-1 md:col-span-2">
                      <div className="text-right">
                        <div className="md:sr-only text-sm font-medium text-muted-foreground mb-1">Total</div>
                        <div className="text-lg font-semibold">
                          ¥{((watchedItems[index]?.quantity || 0) * (watchedItems[index]?.unit_price || 0)).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-span-1 md:col-span-1 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Totals */}
                <div className="border-t pt-6">
                  <div className="max-w-sm ml-auto space-y-3">
                    <div className="flex justify-between text-base">
                      <span>Subtotal:</span>
                      <span className="font-medium">¥{displaySubtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span>Tax ({watchedTaxRate}%{watchedTaxIncluded ? ' included' : ''}):</span>
                      <span className="font-medium">¥{taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold border-t pt-3">
                      <span>Total:</span>
                      <span>¥{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Invoice"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};