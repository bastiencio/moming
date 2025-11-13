import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Client {
  id: string;
  name: string;
  company_name?: string;
  contact_person?: string;
  email: string;
  phone?: string;
  address?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateClientData {
  name: string;
  company_name?: string;
  contact_person?: string;
  email: string;
  phone?: string;
  address?: string;
  active?: boolean;
  categoryPricing: {
    small_bottle: number;
    large_bottle: number;
    keg: number;
  };
}

export interface UpdateClientData {
  id: string;
  name: string;
  company_name?: string;
  contact_person?: string;
  email: string;
  phone?: string;
  address?: string;
  active: boolean;
  categoryPricing: {
    small_bottle: number;
    large_bottle: number;
    keg: number;
  };
}

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("mo-clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      setClients(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch clients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createClient = async (clientData: CreateClientData) => {
    try {
      setLoading(true);

      // Create client
      const { data: client, error: clientError } = await supabase
        .from("mo-clients")
        .insert({
          name: clientData.name,
          company_name: clientData.company_name,
          contact_person: clientData.contact_person,
          email: clientData.email,
          phone: clientData.phone,
          address: clientData.address,
          active: clientData.active ?? true,
        })
        .select()
        .single();

      if (clientError) throw clientError;

      // Create category pricing for each product category
      const pricingData = [
        {
          client_id: client.id,
          product_category: 'small_bottle' as const,
          custom_price: clientData.categoryPricing.small_bottle,
        },
        {
          client_id: client.id,
          product_category: 'large_bottle' as const,
          custom_price: clientData.categoryPricing.large_bottle,
        },
        {
          client_id: client.id,
          product_category: 'keg' as const,
          custom_price: clientData.categoryPricing.keg,
        },
      ];

      const { error: pricingError } = await supabase
        .from("mo-client_category_pricing")
        .insert(pricingData);

      if (pricingError) throw pricingError;

      toast({
        title: "Success",
        description: "Client created successfully",
      });

      await fetchClients();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create client",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateClient = async (clientData: UpdateClientData) => {
    try {
      setLoading(true);

      // Update client
      const { error: clientError } = await supabase
        .from("mo-clients")
        .update({
          name: clientData.name,
          company_name: clientData.company_name,
          contact_person: clientData.contact_person,
          email: clientData.email,
          phone: clientData.phone,
          address: clientData.address,
          active: clientData.active,
        })
        .eq("id", clientData.id);

      if (clientError) throw clientError;

      // Update category pricing
      const pricingUpdates = [
        {
          client_id: clientData.id,
          product_category: 'small_bottle' as const,
          custom_price: clientData.categoryPricing.small_bottle,
        },
        {
          client_id: clientData.id,
          product_category: 'large_bottle' as const,
          custom_price: clientData.categoryPricing.large_bottle,
        },
        {
          client_id: clientData.id,
          product_category: 'keg' as const,
          custom_price: clientData.categoryPricing.keg,
        },
      ];

      // Delete existing pricing and insert new ones
      const { error: deleteError } = await supabase
        .from("mo-client_category_pricing")
        .delete()
        .eq("client_id", clientData.id);

      if (deleteError) throw deleteError;

      const { error: insertError } = await supabase
        .from("mo-client_category_pricing")
        .insert(pricingUpdates);

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Client updated successfully",
      });

      await fetchClients();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update client",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleClientStatus = async (clientId: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from("mo-clients")
        .update({ active })
        .eq("id", clientId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Client ${active ? 'activated' : 'deactivated'} successfully`,
      });

      await fetchClients();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update client status",
        variant: "destructive",
      });
    }
  };

  const deleteClient = async (clientId: string) => {
    try {
      // Delete pricing data first
      const { error: pricingError } = await supabase
        .from("mo-client_category_pricing")
        .delete()
        .eq("client_id", clientId);

      if (pricingError) throw pricingError;

      // Delete client
      const { error: clientError } = await supabase
        .from("mo-clients")
        .delete()
        .eq("id", clientId);

      if (clientError) throw clientError;

      toast({
        title: "Success",
        description: "Client deleted successfully",
      });

      await fetchClients();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete client",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return {
    clients,
    loading,
    createClient,
    updateClient,
    toggleClientStatus,
    deleteClient,
    refetch: fetchClients,
  };
};