import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Warehouse, 
  Users, 
  FileText, 
  TrendingUp,
  AlertCircle,
  DollarSign,
  Calendar,
  Loader2
} from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useClients } from "@/hooks/useClients";
import { useInvoices } from "@/hooks/useInvoices";
import { useEvents } from "@/hooks/useEvents";
import { useInventory } from "@/hooks/useInventory";
import { AddProductDialog } from "@/components/products/AddProductDialog";
import { AddClientDialog } from "@/components/clients/AddClientDialog";
import { AddInvoiceDialog } from "@/components/invoices/AddInvoiceDialog";
import { AddEventDialog } from "@/components/events/AddEventDialog";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddInvoice, setShowAddInvoice] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  
  const { products, loading: productsLoading } = useProducts();
  const { clients, loading: clientsLoading } = useClients();
  const { invoices, loading: invoicesLoading } = useInvoices();
  const { events, loading: eventsLoading } = useEvents();
  const inventory = useInventory();
  const [avgMonthlyUnits, setAvgMonthlyUnits] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Check if all data is loaded
  useEffect(() => {
    if (!productsLoading && !clientsLoading && !invoicesLoading && !eventsLoading && !inventory.loading) {
      setLoading(false);
    }
  }, [productsLoading, clientsLoading, invoicesLoading, eventsLoading, inventory.loading]);

  useEffect(() => {
    const fetchAvg = async () => {
      if (!inventory.items.length) return;
      const productIds = inventory.items.map((it) => it.product?.id).filter(Boolean) as string[];
      if (!productIds.length) return;

      const now = new Date();
      const past = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1)); // last 6 months
      const from = `${past.getUTCFullYear()}-${String(past.getUTCMonth() + 1).padStart(2, "0")}-01`;
      const to = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;

      const { data, error } = await supabase
        .from("sales_monthly")
        .select("product_id, units, period_month")
        .in("product_id", productIds)
        .gte("period_month", from)
        .lte("period_month", to);

      if (error) {
        return;
      }

      const sums: Record<string, number> = {};
      productIds.forEach((id) => (sums[id] = 0));
      (data || []).forEach((row: any) => {
        if (row.product_id) {
          sums[row.product_id] = (sums[row.product_id] || 0) + Number(row.units ?? 0);
        }
      });

      const months = 6;
      const avgs: Record<string, number> = {};
      Object.keys(sums).forEach((id) => {
        avgs[id] = sums[id] / months;
      });
      setAvgMonthlyUnits(avgs);
    };

    fetchAvg();
  }, [inventory.items]);

  // Calculate real stats
  const stats = useMemo(() => {
    console.log("Dashboard data status:", {
      products: { count: products.length, loading: productsLoading },
      clients: { count: clients.length, loading: clientsLoading },
      invoices: { count: invoices.length, loading: invoicesLoading },
      inventory: { count: inventory.items.length, loading: inventory.loading }
    });

    // Show loading state if data is still loading
    if (loading) {
      return [
        {
          title: "Total Products",
          value: "Loading...",
          change: "Active products",
          icon: Package,
          color: "text-primary"
        },
        {
          title: "Stock Value",
          value: "Loading...",
          change: "Total inventory value",
          icon: Warehouse,
          color: "text-success"
        },
        {
          title: "Active Clients",
          value: "Loading...",
          change: "Registered clients",
          icon: Users,
          color: "text-accent-foreground"
        },
        {
          title: "Monthly Revenue",
          value: "Loading...",
          change: "Last 30 days",
          icon: DollarSign,
          color: "text-success"
        }
      ];
    }

    try {
      const totalProducts = products.length;
      const activeClients = clients.filter(c => c.active).length;
      
      // Calculate stock value using inventory data
      const stockValue = inventory.items.reduce((total, item) => {
        const currentStock = item.current_stock || 0;
        const costPrice = item.product?.cost_price || 0;
        return total + (currentStock * costPrice);
      }, 0);

      // Calculate monthly revenue from recent invoices (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const monthlyRevenue = invoices
        .filter(invoice => {
          try {
            const invoiceDate = new Date(invoice.created_at);
            return !isNaN(invoiceDate.getTime()) && invoiceDate >= thirtyDaysAgo;
          } catch (e) {
            return false;
          }
        })
        .reduce((total, invoice) => {
          const amount = invoice.total_amount || 0;
          return total + amount;
        }, 0);

      console.log("Calculated dashboard stats:", {
        totalProducts,
        activeClients,
        stockValue,
        monthlyRevenue
      });

      return [
        {
          title: "Total Products",
          value: totalProducts.toString(),
          change: "Active products",
          icon: Package,
          color: "text-primary"
        },
        {
          title: "Stock Value",
          value: stockValue > 0 ? `¥${Math.round(stockValue).toLocaleString().replace(/,/g, "'")}` : "¥0",
          change: "Total inventory value",
          icon: Warehouse,
          color: "text-success"
        },
        {
          title: "Active Clients",
          value: activeClients.toString(),
          change: "Registered clients",
          icon: Users,
          color: "text-accent-foreground"
        },
        {
          title: "Monthly Revenue",
          value: monthlyRevenue > 0 ? `¥${Math.round(monthlyRevenue).toLocaleString().replace(/,/g, "'")}` : "¥0",
          change: "Last 30 days",
          icon: DollarSign,
          color: "text-success"
        }
      ];
    } catch (error) {
      // Return error state
      return [
        {
          title: "Total Products",
          value: "Error",
          change: "Failed to load",
          icon: Package,
          color: "text-primary"
        },
        {
          title: "Stock Value",
          value: "Error",
          change: "Failed to load",
          icon: Warehouse,
          color: "text-success"
        },
        {
          title: "Active Clients",
          value: "Error",
          change: "Failed to load",
          icon: Users,
          color: "text-accent-foreground"
        },
        {
          title: "Monthly Revenue",
          value: "Error",
          change: "Failed to load",
          icon: DollarSign,
          color: "text-success"
        }
      ];
    }
  }, [products, clients, invoices, inventory.items, loading]);

  // Get items with ETA to out of stock
  const etaItems = useMemo(() => {
    return inventory.items
      .map(item => {
        const pid = item.product?.id || '';
        const avg = avgMonthlyUnits[pid] || 0;
        let eta = 0;
        if (avg > 0) {
          const monthsLeft = Number(item.current_stock ?? 0) / avg;
          eta = Math.max(0, Math.round(monthsLeft * 10) / 10);
        }
        return {
          name: item.product?.name || 'Unknown Product',
          sku: item.product?.sku || 'N/A',
          stock: item.current_stock,
          eta: eta,
          hasData: avg > 0
        };
      })
      .filter(item => item.hasData) // Only show items with sales data
      .sort((a, b) => a.eta - b.eta) // Sort by ETA ascending (most urgent first)
      .slice(0, 5);
  }, [inventory.items, avgMonthlyUnits]);

  // Get recent invoices (last 5)
  const recentInvoices = useMemo(() => {
    return invoices
      .slice(0, 5)
      .map(invoice => ({
        id: invoice.invoice_number,
        client: invoice.client?.name || 'Unknown Client',
        amount: `¥${Math.round(invoice.total_amount).toLocaleString().replace(/,/g, "'")}`,
        status: invoice.payment_status
      }));
  }, [invoices]);

  // Get upcoming events
  const upcomingEvents = useMemo(() => {
    const today = new Date();
    return events
      .filter(event => new Date(event.start_date) >= today)
      .slice(0, 3)
      .map(event => ({
        name: event.name,
        date: new Date(event.start_date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        }),
        location: event.location || 'TBA'
      }));
  }, [events]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-medium text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your kombucha business overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="shadow-kombucha transition-kombucha hover:shadow-kombucha-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-medium text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ETA to Out of Stock */}
        <Card className="shadow-kombucha">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-warning" />
              ETA to Out of Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : etaItems.length > 0 ? etaItems.map((item) => (
                <div key={item.sku} className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.sku}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      item.eta < 1 ? 'text-destructive' : 
                      item.eta < 3 ? 'text-warning' : 
                      'text-success'
                    }`}>
                      {item.eta.toFixed(1)} mo
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.stock} units
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-4 text-muted-foreground">
                  No sales data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card className="shadow-kombucha">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Recent Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : recentInvoices.length > 0 ? recentInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{invoice.id}</p>
                    <p className="text-sm text-muted-foreground">{invoice.client}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-foreground">{invoice.amount}</div>
                    <Badge 
                      variant={
                        invoice.status === "paid" ? "default" : 
                        invoice.status === "pending" ? "secondary" : 
                        "destructive"
                      }
                      className="text-xs"
                    >
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              )) : (
                <div className="text-center py-4 text-muted-foreground">
                  No recent invoices
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="shadow-kombucha">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent-foreground" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : upcomingEvents.length > 0 ? upcomingEvents.map((event) => (
                <div key={event.name} className="flex items-center justify-between p-3 bg-accent/20 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{event.name}</p>
                    <p className="text-sm text-muted-foreground">{event.location}</p>
                  </div>
                  <div className="text-sm font-medium text-accent-foreground">
                    {event.date}
                  </div>
                </div>
              )) : (
                <div className="text-center py-4 text-muted-foreground">
                  No upcoming events
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-kombucha">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col gap-2"
                onClick={() => setShowAddProduct(true)}
                disabled={loading}
              >
                <Package className="w-5 h-5" />
                <span className="text-sm">Add Product</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col gap-2"
                onClick={() => setShowAddClient(true)}
                disabled={loading}
              >
                <Users className="w-5 h-5" />
                <span className="text-sm">New Client</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col gap-2"
                onClick={() => setShowAddInvoice(true)}
                disabled={loading}
              >
                <FileText className="w-5 h-5" />
                <span className="text-sm">Create Invoice</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col gap-2"
                onClick={() => setShowAddEvent(true)}
                disabled={loading}
              >
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm">Add Event</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add dialogs */}
      {showAddProduct && (
        <AddProductDialog 
          onProductAdded={async () => setShowAddProduct(false)}
          trigger={null}
        />
      )}
      {showAddClient && (
        <AddClientDialog 
          onClientCreated={async () => setShowAddClient(false)}
        />
      )}
      {showAddInvoice && (
        <AddInvoiceDialog 
          onInvoiceCreated={async () => setShowAddInvoice(false)}
        />
      )}
      {showAddEvent && (
        <AddEventDialog 
          onEventCreated={async () => setShowAddEvent(false)}
          trigger={null}
        />
      )}
    </div>
  );
};

export default Dashboard;