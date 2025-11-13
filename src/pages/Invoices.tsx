import { useState } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { Search, Eye, Edit, Trash2, Download, MoreHorizontal, DollarSign, Calendar, Users, EyeOff } from "lucide-react";
import { useInvoices } from "@/hooks/useInvoices";
import type { Invoice } from "@/hooks/useInvoices";
import { AddInvoiceDialog } from "@/components/invoices/AddInvoiceDialog";
import { EditInvoiceDialog } from "@/components/invoices/EditInvoiceDialog";
import { generateInvoicePDF, generateInvoiceHTML, generateInvoicePNG } from "@/utils/pdfGenerator";
import DOMPurify from 'dompurify';

const Invoices = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [hidePaidInvoices, setHidePaidInvoices] = useState(false);
  
  const { invoices, loading, createInvoice, updateInvoice, updateInvoiceStatus, deleteInvoice, refetch } = useInvoices();

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const shouldShowPaid = !hidePaidInvoices || invoice.payment_status !== 'paid';
    
    return matchesSearch && shouldShowPaid;
  });

  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDetailsDialogOpen(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setEditDialogOpen(true);
  };

  const handleExportPNG = async (invoice: Invoice) => {
    try {
      await generateInvoicePNG(invoice);
    } catch (error) {
    }
  };

  const handleStatusChange = async (invoiceId: string, status: string) => {
    await updateInvoiceStatus(invoiceId, status);
  };

  const handleDeleteInvoice = async (invoiceId: string, invoiceNumber: string) => {
    if (window.confirm(`Are you sure you want to delete invoice ${invoiceNumber}? This action cannot be undone.`)) {
      await deleteInvoice(invoiceId);
    }
  };

  // Calculate stats
  const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.total_amount, 0);
  const paidInvoices = invoices.filter(invoice => invoice.payment_status === 'paid');
  const pendingInvoices = invoices.filter(invoice => invoice.payment_status === 'pending');
  const overdueInvoices = invoices.filter(invoice => {
    if (invoice.payment_status === 'paid' || !invoice.due_date) return false;
    return new Date(invoice.due_date) < new Date();
  });

  const InvoiceDetailsDialog = ({ invoice }: { invoice: Invoice | null }) => {
    if (!invoice) return null;

    return (
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Invoice {invoice.invoice_number}</span>
            <Button
              onClick={() => handleExportPNG(invoice)}
              size="sm"
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Export PNG
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div 
          className="space-y-6"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(generateInvoiceHTML(invoice)) }}
        />
      </DialogContent>
    );
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center">
          <div className="text-muted-foreground">Loading invoices...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-foreground mb-2">Invoices</h1>
          <p className="text-muted-foreground">Manage billing and track payments</p>
        </div>
        <div className="flex items-center gap-3">
          <Toggle
            pressed={hidePaidInvoices}
            onPressedChange={setHidePaidInvoices}
            variant="outline"
            size="sm"
            aria-label="Hide paid invoices"
          >
            <EyeOff className="w-4 h-4 mr-2" />
            Hide Paid
          </Toggle>
          <AddInvoiceDialog onInvoiceCreated={createInvoice} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-success" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-xl font-semibold text-foreground">¥{totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-primary" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Paid Invoices</p>
                <p className="text-xl font-semibold text-foreground">{paidInvoices.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-warning" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-xl font-semibold text-foreground">{pendingInvoices.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-destructive" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-xl font-semibold text-foreground">{overdueInvoices.length}</p>
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
              placeholder="Search invoices by number or client name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card className="shadow-kombucha">
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => {
                const isOverdue = invoice.payment_status !== 'paid' && invoice.due_date && new Date(invoice.due_date) < new Date();
                return (
                  <TableRow 
                    key={invoice.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleEditInvoice(invoice)}
                  >
                    <TableCell className="font-mono text-sm">{invoice.invoice_number}</TableCell>
                    <TableCell className="font-medium">{invoice.client?.name || 'N/A'}</TableCell>
                    <TableCell>{new Date(invoice.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className={isOverdue ? 'text-destructive font-medium' : ''}>
                      {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="font-medium">¥{invoice.total_amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Select
                        value={invoice.payment_status}
                        onValueChange={(value) => {
                          handleStatusChange(invoice.id, value);
                        }}
                      >
                        <SelectTrigger 
                          className="w-24 h-7 text-xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(invoice);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditInvoice(invoice);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExportPNG(invoice);
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredInvoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No invoices found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invoice Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <InvoiceDetailsDialog invoice={selectedInvoice} />
      </Dialog>

      {/* Edit Invoice Dialog */}
      <EditInvoiceDialog
        invoice={selectedInvoice}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onInvoiceUpdated={refetch}
        onInvoiceDeleted={handleDeleteInvoice}
      />
    </div>
  );
};

export default Invoices;