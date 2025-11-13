import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Calendar as CalendarIcon, MapPin, DollarSign, TrendingUp, Users, BarChart3, Pencil, Trash2 } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { AddEventDialog } from "@/components/events/AddEventDialog";
import { EditEventDialog } from "@/components/events/EditEventDialog";
import { EventSalesDialog } from "@/components/events/EventSalesDialog";

const Events = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [salesOpen, setSalesOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { events, loading, createEvent, updateEvent, deleteEvent, addSale } = useEvents();

  const filtered = useMemo(() => {
    return (events || []).filter((e) =>
      (e.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.location || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [events, searchTerm]);

  const selected = events.find((e) => e.id === selectedId) || null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "planned":
        return <Badge variant="secondary" className="bg-warning/20 text-warning">Planned</Badge>;
      case "active":
        return <Badge variant="default" className="bg-success text-success-foreground">Active</Badge>;
      case "completed":
        return <Badge variant="default">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const totalEvents = events.length;
  const completedEvents = events.filter((e) => e.status === "completed").length;
  const totalRevenue = events.reduce((sum, e) => sum + Number(e.actual_revenue || 0), 0);
  const totalProfit = events.reduce((sum, e) => {
    const cost = Number(e.actual_cost || 0);
    return sum + (Number(e.actual_revenue || 0) - cost);
  }, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-foreground mb-2">Event Management</h1>
          <p className="text-muted-foreground">Track sales, performance metrics, and post-event analysis</p>
        </div>
        <AddEventDialog onEventCreated={createEvent} />
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-kombucha">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-xl font-medium text-foreground">{totalEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-kombucha">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-xl font-medium text-success">{completedEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-kombucha">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-warning/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-xl font-medium text-foreground">${totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-kombucha">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Profit</p>
                <p className="text-xl font-medium text-foreground">${totalProfit.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="shadow-kombucha">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Search events by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card className="shadow-kombucha">
        <CardHeader>
          <CardTitle>Event Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center text-muted-foreground py-8">Loading events...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Target Revenue</TableHead>
                  <TableHead>Actual Revenue</TableHead>
                  <TableHead>ROI</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((e) => {
                  const budget = Number(e.budget || 0);
                  const target = Number(e.target_revenue || 0);
                  const actual = Number(e.actual_revenue || 0);
                  const cost = Number(e.actual_cost || 0);
                  const roi = cost > 0 ? `${(((actual - cost) / cost) * 100).toFixed(1)}%` : "N/A";

                  return (
                    <TableRow key={e.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{e.name}</p>
                          {e.description && <p className="text-sm text-muted-foreground">{e.description}</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{e.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{e.start_date}</p>
                          {e.start_date !== e.end_date && (
                            <p className="text-muted-foreground">to {e.end_date}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(e.status)}</TableCell>
                      <TableCell>
                        <span className="font-medium text-foreground">${budget.toFixed(2)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-foreground">${target.toFixed(2)}</span>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${
                          actual >= target ? "text-success" : actual > 0 ? "text-warning" : "text-muted-foreground"
                        }`}>
                          ${actual.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${
                          roi !== "N/A" && parseFloat(roi) > 100
                            ? "text-success"
                            : roi !== "N/A" && parseFloat(roi) > 0
                            ? "text-warning"
                            : roi === "N/A"
                            ? "text-muted-foreground"
                            : "text-destructive"
                        }`}>
                          {roi}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedId(e.id);
                              setSalesOpen(true);
                            }}
                          >
                            <BarChart3 className="w-4 h-4 mr-1" />
                            Sales
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedId(e.id);
                              setEditOpen(true);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              if (confirm("Delete this event? This will remove its sales too.")) {
                                await deleteEvent(e.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground">
                      No events found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <EditEventDialog
        event={selected}
        open={editOpen}
        onOpenChange={setEditOpen}
        onEventUpdated={updateEvent}
      />
      <EventSalesDialog
        event={selected}
        open={salesOpen}
        onOpenChange={setSalesOpen}
        onAddSale={addSale}
      />
    </div>
  );
};

export default Events;
