import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import type { Client, UpdateClientData } from "@/hooks/useClients";
import { supabase } from "@/integrations/supabase/client";

const clientSchema = z.object({
  name: z.string().min(1, "Client name is required"),
  company_name: z.string().optional(),
  contact_person: z.string().optional(),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  small_bottle_price: z.number().min(0, "Price must be positive"),
  large_bottle_price: z.number().min(0, "Price must be positive"),
  keg_price: z.number().min(0, "Price must be positive"),
  active: z.boolean().default(true),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface EditClientDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientUpdated: (clientData: UpdateClientData) => Promise<void>;
}

export const EditClientDialog = ({ client, open, onOpenChange, onClientUpdated }: EditClientDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [categoryPricing, setCategoryPricing] = useState({
    small_bottle: 4.50,
    large_bottle: 12.00,
    keg: 85.00,
  });

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      company_name: "",
      contact_person: "",
      email: "",
      phone: "",
      address: "",
      small_bottle_price: 12,
      large_bottle_price: 55,
      keg_price: 220,
      active: true,
    },
  });

  // Fetch category pricing for client
  const fetchCategoryPricing = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from("client_category_pricing")
        .select("*")
        .eq("client_id", clientId);

      if (error) throw error;

      const pricing = {
        small_bottle: 4.50,
        large_bottle: 12.00,
        keg: 85.00,
      };

      data?.forEach((item) => {
        if (item.product_category in pricing) {
          pricing[item.product_category as keyof typeof pricing] = item.custom_price;
        }
      });

      setCategoryPricing(pricing);
      form.setValue('small_bottle_price', pricing.small_bottle);
      form.setValue('large_bottle_price', pricing.large_bottle);
      form.setValue('keg_price', pricing.keg);
    } catch (error) {
    }
  };

  // Update form when client changes
  useEffect(() => {
    if (client) {
      form.reset({
        name: client.name,
        company_name: client.company_name || "",
        contact_person: client.contact_person || "",
        email: client.email,
        phone: client.phone || "",
        address: client.address || "",
        small_bottle_price: categoryPricing.small_bottle,
        large_bottle_price: categoryPricing.large_bottle,
        keg_price: categoryPricing.keg,
        active: client.active,
      });
      fetchCategoryPricing(client.id);
    }
  }, [client, form]);

  const onSubmit = async (data: ClientFormData) => {
    if (!client) return;

    try {
      setLoading(true);

      const clientData: UpdateClientData = {
        id: client.id,
        name: data.name,
        company_name: data.company_name,
        contact_person: data.contact_person,
        email: data.email,
        phone: data.phone,
        address: data.address,
        active: data.active,
        categoryPricing: {
          small_bottle: data.small_bottle_price,
          large_bottle: data.large_bottle_price,
          keg: data.keg_price,
        },
      };

      await onClientUpdated(clientData);
      onOpenChange(false);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Edit Client: {client.name}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Green Market Co." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="company_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., ABC Trading Co." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="contact_person"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., John Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="orders@greenmarket.com" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Complete business address..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Category Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Product Category Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="small_bottle_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Small Bottle (230ml) Price (¥)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="4.50"
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
                    name="large_bottle_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Large Bottle (750ml) Price (¥)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="12.00"
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
                    name="keg_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Keg (20L) Price (¥)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="85.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  Set specific prices for each product category for this client
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Client Status</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div>
                        <FormLabel>Active Client</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Enable this client for orders and invoicing
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Client"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};