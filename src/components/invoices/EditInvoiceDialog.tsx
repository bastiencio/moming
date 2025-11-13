
import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus } from "lucide-react";
import type { Invoice } from "@/hooks/useInvoices";
import { formatCurrency } from "@/utils/currency";

const invoiceItemSchema = z.object({
  id: z.string().optional(),
  product_id: z.string().min(1, "Product is required"),
  product_name: z.string().min(1, "Product name is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unit_price: z.number().min(0, "Unit price must be positive"),
  total_price: z.number().min(0, "Total price must be positive"),
});

const editInvoiceSchema = z.object({
  invoice_number: z.string().min(1, "Invoice number is required"),
  client_id: z.string().min(1, "Client is required"),
  po_number: z.string().optional(),
  due_date: z.string().optional(),
  created_at: z.string().optional(),
  payment_status: z.enum(["pending", "paid", "cancelled"]),
  notes: z.string().optional(),
  tax_rate: z.number().min(0).max(100),
  tax_included: z.boolean(),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
  // New fields
  currency: z.enum(["CNY", "USD"]),
  fx_to_cny: z.number().min(0),
  language: z.enum(["zh", "en"]),
});

type EditInvoiceFormData = z.infer<typeof editInvoiceSchema>;

interface Client {
  id: string;
  name: string;
  email: string;
}

interface Product {
  id: string;
  name: string;
  base_price: number;
  category: 'small_bottle' | 'large_bottle' | 'keg';
}

interface EditInvoiceDialogProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvoiceUpdated: () => void;
  onInvoiceDeleted?: (invoiceId: string, invoiceNumber: string) => void;
}

export const EditInvoiceDialog = ({ 
  invoice, 
  open, 
  onOpenChange, 
  onInvoiceUpdated,
  onInvoiceDeleted 
}: EditInvoiceDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  const form = useForm<EditInvoiceFormData>({
    resolver: zodResolver(editInvoiceSchema),
    defaultValues: {
      invoice_number: "",
      client_id: "",
      due_date: "",
      payment_status: "pending",
      notes: "",
      tax_rate: 13,
      tax_included: true,
      items: [{ product_id: "", product_name: "", quantity: 1, unit_price: 0, total_price: 0 }],
      currency: "CNY",
      fx_to_cny: 1,
      language: "zh",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Load invoice data when dialog opens
  useEffect(() => {
    if (open && invoice) {
      form.setValue("invoice_number", invoice.invoice_number);
      form.setValue("client_id", invoice.client_id);
      form.setValue("po_number", invoice.po_number || "");
      form.setValue("due_date", invoice.due_date || "");
      form.setValue("payment_status", invoice.payment_status as "pending" | "paid" | "cancelled");
      form.setValue("notes", invoice.notes || "");
      form.setValue("tax_rate", invoice.tax_rate || 13);
      form.setValue("tax_included", invoice.tax_included ?? true);
      form.setValue("currency", invoice.currency || "CNY");
      form.setValue("fx_to_cny", invoice.fx_to_cny ?? 1);
      form.setValue("language", invoice.language || "zh");
      form.setValue("created_at", invoice.created_at ? new Date(invoice.created_at).toISOString().split('T')[0] : "");
      
      if (invoice.invoice_items && invoice.invoice_items.length > 0) {
        const items = invoice.invoice_items.map(item => ({
          id: item.id,
          product_id: item.product_id,
          product_name: item.product.name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
        }));
        form.setValue("items", items);
      }
    }
  }, [open, invoice, form]);

  // Fetch clients and products when dialog opens
  useEffect(() => {
    if (open) {
      fetchClients();
      fetchProducts();
      checkAdminRole();
    }
  }, [open]);

  const checkAdminRole = async () => {
    try {
      const { data } = await supabase
        .from("mo-user_roles")
        .select("role")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .eq("role", "admin")
        .single();
      setIsAdmin(!!data);
    } catch (error) {
      setIsAdmin(false);
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from("mo-clients")
        .select("id, name, email")
        .eq("active", true)
        .order("name");

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("mo-products")
        .select("id, name, base_price, category")
        .eq("active", true)
        .order("name");

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
    }
  };

  const handleProductChange = async (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    const clientId = form.getValues("client_id");
    
    if (product && clientId) {
      let finalPrice = product.base_price;
      
      try {
        // First check for specific client-product pricing
        const { data: clientProductPricing } = await supabase
          .from("mo-client_pricing")
          .select("custom_price")
          .eq("client_id", clientId)
          .eq("product_id", productId)
          .single();
          
        if (clientProductPricing) {
          finalPrice = clientProductPricing.custom_price;
        } else {
          // Check for client-category pricing
          const { data: clientCategoryPricing } = await supabase
            .from("mo-client_category_pricing")
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
      
      form.setValue(`items.${index}.product_name`, product.name);
      form.setValue(`items.${index}.unit_price`, finalPrice);
      const quantity = form.getValues(`items.${index}.quantity`);
      form.setValue(`items.${index}.total_price`, quantity * finalPrice);
    }
  };

  const onSubmit = async (data: EditInvoiceFormData) => {
    if (!invoice) return;
    
    try {
      setLoading(true);

      // Calculate totals based on tax inclusion in ORIGINAL currency
      const itemsSubtotal = data.items.reduce((sum, item) => sum + item.total_price, 0);
      let subtotal_original = itemsSubtotal;
      let tax_amount_original = 0;
      let total_amount_original = itemsSubtotal;
      
      if (data.tax_included) {
        tax_amount_original = itemsSubtotal * (data.tax_rate / 100) / (1 + data.tax_rate / 100);
        subtotal_original = itemsSubtotal - tax_amount_original;
        total_amount_original = itemsSubtotal;
      } else {
        tax_amount_original = itemsSubtotal * (data.tax_rate / 100);
        total_amount_original = itemsSubtotal + tax_amount_original;
      }

      // Convert to CNY for accounting
      const rate = data.currency === 'USD' ? (data.fx_to_cny || 1) : 1;
      const subtotal_cny = subtotal_original * rate;
      const tax_amount_cny = tax_amount_original * rate;
      const total_amount_cny = total_amount_original * rate;

      // Update invoice
      const updateData: any = {
        invoice_number: data.invoice_number,
        client_id: data.client_id,
        po_number: data.po_number || null,
        // Accounting totals in CNY
        subtotal: subtotal_cny,
        tax_amount: tax_amount_cny,
        tax_rate: data.tax_rate,
        tax_included: data.tax_included,
        total_amount: total_amount_cny,
        due_date: data.due_date || null,
        payment_status: data.payment_status,
        notes: data.notes || null,
        // New fields
        currency: data.currency,
        fx_to_cny: data.fx_to_cny,
        language: data.language,
        subtotal_original,
        tax_amount_original,
        total_amount_original,
      };

      // Only update created_at if user is admin and provided a value
      if (isAdmin && data.created_at) {
        updateData.created_at = data.created_at;
      }

      const { error: invoiceError } = await supabase
        .from("mo-invoices")
        .update(updateData)
        .eq("id", invoice.id);

      if (invoiceError) throw invoiceError;

      // Delete existing invoice items
      const { error: deleteError } = await supabase
        .from("mo-invoice_items")
        .delete()
        .eq("invoice_id", invoice.id);

      if (deleteError) throw deleteError;

      // Create new invoice items
      const items = data.items.map(item => ({
        invoice_id: invoice.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      }));

      const { error: itemsError } = await supabase
        .from("mo-invoice_items")
        .insert(items);

      if (itemsError) throw itemsError;

      toast({
        title: "Success",
        description: "Invoice updated successfully",
      });

      onInvoiceUpdated();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update invoice",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvoice = async () => {
    if (!invoice || !onInvoiceDeleted) return;
    
    if (window.confirm(`Are you sure you want to delete invoice ${invoice.invoice_number}? This action cannot be undone.`)) {
      try {
        setLoading(true);
        onInvoiceDeleted(invoice.id, invoice.invoice_number);
        onOpenChange(false);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete invoice",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // Watch form values for calculations
  const watchedItems = form.watch("items");
  const watchedTaxRate = form.watch("tax_rate");
  const watchedTaxIncluded = form.watch("tax_included");
  const watchedCurrency = form.watch("currency");
  const watchedFx = form.watch("fx_to_cny");

  // Calculate totals (original currency)
  const itemsSubtotal = watchedItems?.reduce((sum, item) => sum + (item.total_price || 0), 0) || 0;
  let subtotal = itemsSubtotal;
  let taxAmount = 0;
  let total = itemsSubtotal;

  if (watchedTaxIncluded) {
    taxAmount = itemsSubtotal * (watchedTaxRate / 100) / (1 + watchedTaxRate / 100);
    subtotal = itemsSubtotal - taxAmount;
    total = itemsSubtotal;
  } else {
    taxAmount = itemsSubtotal * (watchedTaxRate / 100);
    total = itemsSubtotal + taxAmount;
  }

  // Converted CNY totals for accounting
  const rate = watchedCurrency === 'USD' ? (watchedFx || 1) : 1;
  const subtotalCny = subtotal * rate;
  const taxAmountCny = taxAmount * rate;
  const totalCny = total * rate;

  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Invoice {invoice.invoice_number}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Client and Invoice Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="invoice_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Number</FormLabel>
                    <FormControl>
                      <Input placeholder="INV-2024-000001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="client_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="created_at"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Created Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field}
                          disabled={!isAdmin}
                          className={!isAdmin ? "bg-muted" : ""}
                        />
                      </FormControl>
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

                <FormField
                  control={form.control}
                  name="payment_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-background border shadow-md z-50">
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Tax Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end p-4 border rounded-lg bg-muted/20">
              <FormField
                control={form.control}
                name="tax_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">Tax Rate (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
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
                  </FormItem>
                )}
              />
            </div>

            {/* Localization & Currency */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end p-4 border rounded-lg bg-muted/20">
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">Language</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-background border shadow-md z-50">
                        <SelectItem value="zh">Chinese</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">Currency</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val);
                        if (val === 'CNY') {
                          form.setValue('fx_to_cny', 1);
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-background border shadow-md z-50">
                        <SelectItem value="CNY">CNY (¥)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fx_to_cny"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">Exchange Rate → CNY</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.0001"
                        placeholder={watchedCurrency === 'USD' ? "e.g. 7.20" : "1.00"}
                        disabled={watchedCurrency === 'CNY'}
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Invoice Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Invoice Items</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ product_id: "", product_name: "", quantity: 1, unit_price: 0, total_price: 0 })}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>

              <div className="hidden md:grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                <div className="col-span-4">Product</div>
                <div className="col-span-2">Quantity</div>
                <div className="col-span-2">Unit Price</div>
                <div className="col-span-2">Total</div>
                <div className="col-span-2"></div>
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
                            value={field.value} 
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleProductChange(index, value);
                            }}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-background border shadow-md z-50">
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name}
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
                              onChange={(e) => {
                                const quantity = parseInt(e.target.value) || 0;
                                field.onChange(quantity);
                                const unitPrice = form.getValues(`items.${index}.unit_price`);
                                form.setValue(`items.${index}.total_price`, quantity * unitPrice);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <FormField
                      control={form.control}
                      name={`items.${index}.unit_price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="md:sr-only">Unit Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              className="text-right"
                              {...field}
                              onChange={(e) => {
                                const unitPrice = parseFloat(e.target.value) || 0;
                                field.onChange(unitPrice);
                                const quantity = form.getValues(`items.${index}.quantity`);
                                form.setValue(`items.${index}.total_price`, quantity * unitPrice);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <FormField
                      control={form.control}
                      name={`items.${index}.total_price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="md:sr-only">Total</FormLabel>
                          <div className="text-right">
                            <div className="text-lg font-semibold">
                              {watchedCurrency === 'USD'
                                ? formatCurrency(field.value || 0, 'USD')
                                : formatCurrency(field.value || 0, 'CNY')}
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2 flex justify-end">
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t pt-6 space-y-3">
              <div className="max-w-sm ml-auto space-y-3">
                <div className="flex justify-between text-base">
                  <span>Subtotal ({watchedCurrency}):</span>
                  <span className="font-medium">
                    {formatCurrency(subtotal, watchedCurrency)}
                  </span>
                </div>
                <div className="flex justify-between text-base">
                  <span>Tax ({watchedTaxRate}%{watchedTaxIncluded ? ' included' : ''}) ({watchedCurrency}):</span>
                  <span className="font-medium">
                    {formatCurrency(taxAmount, watchedCurrency)}
                  </span>
                </div>
                <div className="flex justify-between text-xl font-bold border-t pt-3">
                  <span>Total ({watchedCurrency}):</span>
                  <span>{formatCurrency(total, watchedCurrency)}</span>
                </div>
              </div>

              {watchedCurrency === 'USD' && (
                <div className="max-w-sm ml-auto space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Converted Subtotal (CNY):</span>
                    <span className="font-medium text-foreground">¥{subtotalCny.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Converted Tax (CNY):</span>
                    <span className="font-medium text-foreground">¥{taxAmountCny.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Converted Total (CNY):</span>
                    <span className="text-foreground">¥{totalCny.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional notes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-between items-center">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteInvoice}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Invoice
              </Button>
              
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update Invoice"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
