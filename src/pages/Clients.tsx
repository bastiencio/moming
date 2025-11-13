import { useState, useEffect } from "react";
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
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Eye, Edit, Trash2, MoreHorizontal, Users, Building, DollarSign, ToggleLeft, ToggleRight, Mail, Phone, MapPin } from "lucide-react";
import { useClients } from "@/hooks/useClients";
import type { Client } from "@/hooks/useClients";
import { AddClientDialog } from "@/components/clients/AddClientDialog";
import { EditClientDialog } from "@/components/clients/EditClientDialog";
import { supabase } from "@/integrations/supabase/client";

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  
  const { clients, loading, createClient, updateClient, toggleClientStatus, deleteClient } = useClients();

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setEditDialogOpen(true);
  };

  const handleViewDetails = (client: Client) => {
    setSelectedClient(client);
    setDetailsDialogOpen(true);
  };

  const handleToggleStatus = async (clientId: string, currentStatus: boolean) => {
    await toggleClientStatus(clientId, !currentStatus);
  };

  const handleDeleteClient = async (clientId: string, clientName: string) => {
    if (window.confirm(`Are you sure you want to delete "${clientName}"? This action cannot be undone.`)) {
      await deleteClient(clientId);
    }
  };

  // Calculate stats
  const activeClients = clients.filter(client => client.active);

  const ClientDetailsDialog = ({ client }: { client: Client | null }) => {
    const [clientPricing, setClientPricing] = useState({
      small_bottle: 12.00,
      large_bottle: 55.00,
      keg: 220.00,
    });

    useEffect(() => {
      const fetchClientPricing = async () => {
        if (!client) return;

        try {
          const { data, error } = await supabase
            .from("client_category_pricing")
            .select("product_category, custom_price")
            .eq("client_id", client.id);

          if (error) throw error;

          const pricing = {
            small_bottle: 12.00,
            large_bottle: 55.00,
            keg: 220.00,
          };

          data?.forEach((item) => {
            if (item.product_category in pricing) {
              pricing[item.product_category as keyof typeof pricing] = item.custom_price;
            }
          });

          setClientPricing(pricing);
        } catch (error) {
        }
      };

      fetchClientPricing();
    }, [client]);

    if (!client) return null;

    return (
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {client.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Client Name</label>
              <p className="text-foreground font-medium">{client.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Company Name</label>
              <p className="text-foreground font-medium">{client.company_name || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Contact Person</label>
              <p className="text-foreground">{client.contact_person || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <p className="text-foreground">
                <Badge variant={client.active ? "default" : "secondary"}>
                  {client.active ? "Active" : "Inactive"}
                </Badge>
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">{client.email}</span>
            </div>
            {client.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{client.phone}</span>
              </div>
            )}
            {client.address && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <span className="text-foreground">{client.address}</span>
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <label className="text-sm font-medium text-muted-foreground">Product Category Pricing</label>
            <div className="mt-2 p-3 bg-muted rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium">Small Bottle (230ml)</p>
                  <p className="text-muted-foreground">¥{clientPricing.small_bottle.toFixed(2)}</p>
                </div>
                <div>
                  <p className="font-medium">Large Bottle (750ml)</p>
                  <p className="text-muted-foreground">¥{clientPricing.large_bottle.toFixed(2)}</p>
                </div>
                <div>
                  <p className="font-medium">Keg (20L)</p>
                  <p className="text-muted-foreground">¥{clientPricing.keg.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Created</label>
              <p className="text-foreground">{new Date(client.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
              <p className="text-foreground">{new Date(client.updated_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    );
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center">
          <div className="text-muted-foreground">Loading clients...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-foreground mb-2">Clients</h1>
          <p className="text-muted-foreground">Manage customer relationships and category-based pricing</p>
        </div>
        <AddClientDialog onClientCreated={createClient} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-primary" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Clients</p>
                <p className="text-xl font-semibold text-foreground">{clients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building className="w-4 h-4 text-success" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-xl font-semibold text-foreground">{activeClients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-warning" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Custom Pricing</p>
                <p className="text-xl font-semibold text-foreground">{clients.length}</p>
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
              placeholder="Search clients by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card className="shadow-kombucha">
        <CardHeader>
          <CardTitle>Client Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell className="text-sm">{client.company_name || 'N/A'}</TableCell>
                  <TableCell className="text-sm">{client.contact_person || 'N/A'}</TableCell>
                  
                  <TableCell className="text-sm">{client.email}</TableCell>
                  <TableCell>
                    <Badge variant={client.active ? "default" : "secondary"}>
                      {client.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewDetails(client)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditClient(client)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(client.id, client.active)}
                      >
                        {client.active ? (
                          <ToggleRight className="w-4 h-4 text-success" />
                        ) : (
                          <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                        )}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(client)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditClient(client)}>
                            Edit Client
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClient(client.id, client.name)}
                            className="text-destructive"
                          >
                            Delete Client
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredClients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No clients found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Client Dialog */}
      <EditClientDialog
        client={selectedClient}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onClientUpdated={updateClient}
      />

      {/* Client Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <ClientDetailsDialog client={selectedClient} />
      </Dialog>
    </div>
  );
};

export default Clients;