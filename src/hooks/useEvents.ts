import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type EventStatus = "planned" | "active" | "completed" | "cancelled";

export interface EventItem {
  id: string;
  name: string;
  description?: string | null;
  location?: string | null;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  status: EventStatus;
  budget?: number | null;
  actual_cost?: number | null;
  target_revenue?: number | null;
  actual_revenue: number; // default 0
  created_at: string;
  updated_at: string;
}

export interface CreateEventData {
  name: string;
  description?: string;
  location?: string;
  start_date: string;
  end_date: string;
  status?: EventStatus;
  budget?: number | null;
  actual_cost?: number | null;
  target_revenue?: number | null;
}

export interface UpdateEventData extends CreateEventData {
  id: string;
}

export interface EventSaleInput {
  event_id: string;
  product_id: string;
  quantity_sold: number;
  unit_price: number;
}

export const useEvents = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("mo-events")
        .select("*")
        .order("start_date", { ascending: false });
      if (error) throw error;
      
      setEvents((data || []) as unknown as EventItem[]);
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to fetch events", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (payload: CreateEventData) => {
    try {
      const { data, error } = await supabase
        .from("mo-events")
        .insert({
          name: payload.name,
          description: payload.description || null,
          location: payload.location || null,
          start_date: payload.start_date,
          end_date: payload.end_date,
          status: payload.status || "planned",
          budget: payload.budget ?? null,
          actual_cost: payload.actual_cost ?? null,
          target_revenue: payload.target_revenue ?? null,
          actual_revenue: 0,
        })
        .select()
        .single();
      if (error) throw error;
      toast({ title: "Event planned", description: `${payload.name} created successfully` });
      await fetchEvents();
      return data as EventItem;
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      throw err;
    }
  };

  const updateEvent = async (payload: UpdateEventData) => {
    try {
      const { id, ...rest } = payload;
      const { error } = await supabase
        .from("mo-events")
        .update({
          name: rest.name,
          description: rest.description || null,
          location: rest.location || null,
          start_date: rest.start_date,
          end_date: rest.end_date,
          status: rest.status || "planned",
          budget: rest.budget ?? null,
          actual_cost: rest.actual_cost ?? null,
          target_revenue: rest.target_revenue ?? null,
        })
        .eq("id", id);
      if (error) throw error;
      toast({ title: "Event updated", description: `${rest.name} has been updated` });
      await fetchEvents();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      throw err;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      // Remove related sales first
      const { error: salesError } = await supabase.from("mo-event_sales").delete().eq("event_id", id);
      if (salesError) throw salesError;
      const { error } = await supabase.from("mo-events").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Event deleted", description: `Event has been removed` });
      await fetchEvents();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      throw err;
    }
  };

  const addSale = async ({ event_id, product_id, quantity_sold, unit_price }: EventSaleInput) => {
    try {
      const total_revenue = quantity_sold * unit_price;
      const { error } = await supabase.from("mo-event_sales").insert({
        event_id,
        product_id,
        quantity_sold,
        unit_price,
        total_revenue,
      });
      if (error) throw error;

      // Recalculate and persist actual_revenue on the event
      const { data: agg, error: aggErr } = await supabase
        .from("mo-event_sales")
        .select("total_revenue")
        .eq("event_id", event_id);
      if (aggErr) throw aggErr;
      const sum = (agg || []).reduce((s, r: any) => s + Number(r.total_revenue || 0), 0);
      const { error: upErr } = await supabase
        .from("mo-events")
        .update({ actual_revenue: sum })
        .eq("id", event_id);
      if (upErr) throw upErr;

      toast({ title: "Sale recorded", description: `Added ${quantity_sold} units` });
      await fetchEvents();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      throw err;
    }
  };

  useEffect(() => {
    fetchEvents();

    const channel = supabase
      .channel("events-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mo-events" },
        () => fetchEvents()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // SEO: update title/description for the Events page consumers using this hook
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Events Management | Kombucha";
    const meta = document.querySelector('meta[name="description"]');
    const prevDesc = meta?.getAttribute("content") || "";
    meta?.setAttribute(
      "content",
      "Manage events, track sales, budgets, and performance metrics for your kombucha brand."
    );
    return () => {
      document.title = prevTitle;
      meta?.setAttribute("content", prevDesc);
    };
  }, []);

  return {
    events,
    loading,
    refetch: fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    addSale,
  };
};
