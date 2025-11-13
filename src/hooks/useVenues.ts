import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

export type Venue = Tables<"mo-venues">;

export const useVenues = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("mo-venues")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVenues(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch venues",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createVenue = async (venueData: Omit<Venue, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("mo-venues")
        .insert(venueData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Venue created successfully",
      });

      await fetchVenues();
      return data;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create venue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateVenue = async (id: string, venueData: Partial<Venue>) => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("mo-venues")
        .update(venueData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Venue updated successfully",
      });

      await fetchVenues();
      return data;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update venue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleVenueStatus = async (id: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from("mo-venues")
        .update({ active })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Venue ${active ? 'activated' : 'deactivated'} successfully`,
      });

      await fetchVenues();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update venue status",
        variant: "destructive",
      });
    }
  };

  const deleteVenue = async (id: string) => {
    try {
      const { error } = await supabase
        .from("mo-venues")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Venue deleted successfully",
      });

      await fetchVenues();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete venue",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  return {
    venues,
    loading,
    createVenue,
    updateVenue,
    toggleVenueStatus,
    deleteVenue,
    refetch: fetchVenues,
  };
};