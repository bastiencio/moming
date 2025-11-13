import React, { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useMerchandising, type MerchItem } from "@/hooks/useMerchandising";
import { ImageUpload } from "@/components/ui/image-upload";

const Merchandizing: React.FC = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const { items, loading, addItem, updateItem, deleteItem, toggleActive } = useMerchandising();

  // Add Dialog state
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    code: "",
    category: "",
    stock: 0,
    active: true,
    picture: "",
    supplier_taobao_link: "",
    supplier_wechat_id: "",
    supplier_phone: "",
    supplier_email: "",
    moq: 0,
    cost_per_piece: 0,
    production_time: "",
    production_details_file: "",
  });

  // Edit Dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MerchItem | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    code: "",
    category: "",
    stock: 0,
    active: true,
    picture: "",
    supplier_taobao_link: "",
    supplier_wechat_id: "",
    supplier_phone: "",
    supplier_email: "",
    moq: 0,
    cost_per_piece: 0,
    production_time: "",
    production_details_file: "",
  });

  useEffect(() => {
    // SEO basics for SPA
    const title = "Merchandizing Management | Brand Merch & Goodies";
    document.title = title;

    const descText = "Manage brand merch and goodies: list, track stock, and status.";
    let desc = document.querySelector('meta[name="description"]');
    if (!desc) {
      desc = document.createElement("meta");
      desc.setAttribute("name", "description");
      document.head.appendChild(desc);
    }
    desc.setAttribute("content", descText);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", window.location.href);
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter((i) =>
      [i.name, i.code, i.category ?? ""].some((v) => v.toLowerCase().includes(q))
    );
  }, [items, search]);

  const resetForm = () =>
    setForm({ 
      name: "", 
      code: "", 
      category: "", 
      stock: 0, 
      active: true,
      picture: "",
      supplier_taobao_link: "",
      supplier_wechat_id: "",
      supplier_phone: "",
      supplier_email: "",
      moq: 0,
      cost_per_piece: 0,
      production_time: "",
      production_details_file: "",
    });

  const resetEditForm = () =>
    setEditForm({ 
      name: "", 
      code: "", 
      category: "", 
      stock: 0, 
      active: true,
      picture: "",
      supplier_taobao_link: "",
      supplier_wechat_id: "",
      supplier_phone: "",
      supplier_email: "",
      moq: 0,
      cost_per_piece: 0,
      production_time: "",
      production_details_file: "",
    });

  const onAdd = async () => {
    if (!form.name || !form.code) {
      toast({
        variant: "destructive",
        title: "Missing required fields",
        description: "Please enter name and code.",
      });
      return;
    }
    
    try {
      const newItemData = {
        name: form.name.trim(),
        code: form.code.trim(),
        category: form.category.trim() || undefined,
        stock: Number(form.stock) || 0,
        active: !!form.active,
        picture: form.picture.trim() || undefined,
        supplier_taobao_link: form.supplier_taobao_link.trim() || undefined,
        supplier_wechat_id: form.supplier_wechat_id.trim() || undefined,
        supplier_phone: form.supplier_phone.trim() || undefined,
        supplier_email: form.supplier_email.trim() || undefined,
        moq: Number(form.moq) || undefined,
        cost_per_piece: Number(form.cost_per_piece) || undefined,
        production_time: form.production_time.trim() || undefined,
        production_details_file: form.production_details_file.trim() || undefined,
      };
      
      await addItem(newItemData);
      setOpen(false);
      resetForm();
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const openEdit = (item: MerchItem) => {
    setEditingItem(item);
    setEditForm({
      name: item.name,
      code: item.code,
      category: item.category || "",
      stock: item.stock,
      active: item.active,
      picture: item.picture || "",
      supplier_taobao_link: item.supplier_taobao_link || "",
      supplier_wechat_id: item.supplier_wechat_id || "",
      supplier_phone: item.supplier_phone || "",
      supplier_email: item.supplier_email || "",
      moq: item.moq || 0,
      cost_per_piece: item.cost_per_piece || 0,
      production_time: item.production_time || "",
      production_details_file: item.production_details_file || "",
    });
    setEditOpen(true);
  };

  const onEdit = async () => {
    if (!editForm.name || !editForm.code || !editingItem) {
      toast({
        variant: "destructive",
        title: "Missing required fields",
        description: "Please enter name and code.",
      });
      return;
    }
    
    try {
      const updateData = {
        name: editForm.name.trim(),
        code: editForm.code.trim(),
        category: editForm.category.trim() || undefined,
        stock: Number(editForm.stock) || 0,
        active: !!editForm.active,
        picture: editForm.picture.trim() || undefined,
        supplier_taobao_link: editForm.supplier_taobao_link.trim() || undefined,
        supplier_wechat_id: editForm.supplier_wechat_id.trim() || undefined,
        supplier_phone: editForm.supplier_phone.trim() || undefined,
        supplier_email: editForm.supplier_email.trim() || undefined,
        moq: Number(editForm.moq) || undefined,
        cost_per_piece: Number(editForm.cost_per_piece) || undefined,
        production_time: editForm.production_time.trim() || undefined,
        production_details_file: editForm.production_details_file.trim() || undefined,
      };
      
      await updateItem(editingItem.id, updateData);
      setEditOpen(false);
      setEditingItem(null);
      resetEditForm();
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    await toggleActive(id, currentActive);
  };

  const handleDelete = async (id: string) => {
    await deleteItem(id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading merchandising items...</div>
      </div>
    );
  }

  return (
    <>
      <header className="px-6 pt-6">
        <h1 className="text-2xl font-semibold tracking-tight">Merchandizing Products</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Create and manage merchandise products. Stock is managed on the Merchandizing Stock page.
        </p>
      </header>

      <main>
        <section className="p-6">
          <Card className="p-4">
            <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
              <div className="flex-1">
                <Label htmlFor="search" className="sr-only">
                  Search merch
                </Label>
                <Input
                  id="search"
                  placeholder="Search by name, code, or category"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button>Add Item</Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add Merch Item</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          value={form.name}
                          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                          placeholder="e.g., Tote Bag"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="code">Code *</Label>
                        <Input
                          id="code"
                          value={form.code}
                          onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                          placeholder="e.g., MER-001"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          value={form.category}
                          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                          placeholder="e.g., Apparel, Accessories"
                        />
                      </div>
                    </div>


                    <ImageUpload
                      value={form.picture}
                      onValueChange={(url) => setForm((f) => ({ ...f, picture: url || "" }))}
                      label="Picture"
                    />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Supplier Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="supplierTaobaoLink">Taobao Link</Label>
                          <Input
                            id="supplierTaobaoLink"
                            value={form.supplier_taobao_link}
                            onChange={(e) => setForm((f) => ({ ...f, supplier_taobao_link: e.target.value }))}
                            placeholder="https://taobao.com/..."
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="supplierWechatId">WeChat ID</Label>
                          <Input
                            id="supplierWechatId"
                            value={form.supplier_wechat_id}
                            onChange={(e) => setForm((f) => ({ ...f, supplier_wechat_id: e.target.value }))}
                            placeholder="WeChat ID"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="supplierPhone">Phone Number</Label>
                          <Input
                            id="supplierPhone"
                            value={form.supplier_phone}
                            onChange={(e) => setForm((f) => ({ ...f, supplier_phone: e.target.value }))}
                            placeholder="+86 xxx xxxx xxxx"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="supplierEmail">Email</Label>
                          <Input
                            id="supplierEmail"
                            type="email"
                            value={form.supplier_email}
                            onChange={(e) => setForm((f) => ({ ...f, supplier_email: e.target.value }))}
                            placeholder="supplier@example.com"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Production Details</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="moq">MOQ</Label>
                          <Input
                            id="moq"
                            type="number"
                            min={0}
                            value={form.moq}
                            onChange={(e) => setForm((f) => ({ ...f, moq: Number(e.target.value) }))}
                            placeholder="Minimum order quantity"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="costPerPiece">Cost per Piece</Label>
                          <Input
                            id="costPerPiece"
                            type="number"
                            min={0}
                            step="0.01"
                            value={form.cost_per_piece}
                            onChange={(e) => setForm((f) => ({ ...f, cost_per_piece: Number(e.target.value) }))}
                            placeholder="0.00"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="productionTime">Production Time</Label>
                          <Input
                            id="productionTime"
                            value={form.production_time}
                            onChange={(e) => setForm((f) => ({ ...f, production_time: e.target.value }))}
                            placeholder="e.g., 15-20 days"
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="productionDetailsFile">Production Details File URL</Label>
                        <Input
                          id="productionDetailsFile"
                          value={form.production_details_file}
                          onChange={(e) => setForm((f) => ({ ...f, production_details_file: e.target.value }))}
                          placeholder="https://example.com/production-spec.pdf"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={onAdd}>Save Item</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Edit Dialog */}
              <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Merch Item</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="edit-name">Name *</Label>
                        <Input
                          id="edit-name"
                          value={editForm.name}
                          onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                          placeholder="e.g., Tote Bag"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-code">Code *</Label>
                        <Input
                          id="edit-code"
                          value={editForm.code}
                          onChange={(e) => setEditForm((f) => ({ ...f, code: e.target.value }))}
                          placeholder="e.g., MER-001"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="edit-category">Category</Label>
                        <Input
                          id="edit-category"
                          value={editForm.category}
                          onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                          placeholder="e.g., Apparel, Accessories"
                        />
                      </div>
                    </div>


                    <ImageUpload
                      value={editForm.picture}
                      onValueChange={(url) => setEditForm((f) => ({ ...f, picture: url || "" }))}
                      label="Picture"
                    />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Supplier Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="edit-supplierTaobaoLink">Taobao Link</Label>
                          <Input
                            id="edit-supplierTaobaoLink"
                            value={editForm.supplier_taobao_link}
                            onChange={(e) => setEditForm((f) => ({ ...f, supplier_taobao_link: e.target.value }))}
                            placeholder="https://taobao.com/..."
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="edit-supplierWechatId">WeChat ID</Label>
                          <Input
                            id="edit-supplierWechatId"
                            value={editForm.supplier_wechat_id}
                            onChange={(e) => setEditForm((f) => ({ ...f, supplier_wechat_id: e.target.value }))}
                            placeholder="WeChat ID"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="edit-supplierPhone">Phone Number</Label>
                          <Input
                            id="edit-supplierPhone"
                            value={editForm.supplier_phone}
                            onChange={(e) => setEditForm((f) => ({ ...f, supplier_phone: e.target.value }))}
                            placeholder="+86 xxx xxxx xxxx"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="edit-supplierEmail">Email</Label>
                          <Input
                            id="edit-supplierEmail"
                            type="email"
                            value={editForm.supplier_email}
                            onChange={(e) => setEditForm((f) => ({ ...f, supplier_email: e.target.value }))}
                            placeholder="supplier@example.com"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Production Details</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="edit-moq">MOQ</Label>
                          <Input
                            id="edit-moq"
                            type="number"
                            min={0}
                            value={editForm.moq}
                            onChange={(e) => setEditForm((f) => ({ ...f, moq: Number(e.target.value) }))}
                            placeholder="Minimum order quantity"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="edit-costPerPiece">Cost per Piece</Label>
                          <Input
                            id="edit-costPerPiece"
                            type="number"
                            min={0}
                            step="0.01"
                            value={editForm.cost_per_piece}
                            onChange={(e) => setEditForm((f) => ({ ...f, cost_per_piece: Number(e.target.value) }))}
                            placeholder="0.00"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="edit-productionTime">Production Time</Label>
                          <Input
                            id="edit-productionTime"
                            value={editForm.production_time}
                            onChange={(e) => setEditForm((f) => ({ ...f, production_time: e.target.value }))}
                            placeholder="e.g., 15-20 days"
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-productionDetailsFile">Production Details File URL</Label>
                        <Input
                          id="edit-productionDetailsFile"
                          value={editForm.production_details_file}
                          onChange={(e) => setEditForm((f) => ({ ...f, production_details_file: e.target.value }))}
                          placeholder="https://example.com/production-spec.pdf"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEditOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={onEdit}>Save Changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="mt-4 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.code}</TableCell>
                      <TableCell>{item.category ?? "-"}</TableCell>
                      <TableCell>
                        {item.active ? (
                          <Badge>Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(item)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleToggleActive(item.id, item.active)}>
                          {item.active ? "Disable" : "Enable"}
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                {filtered.length === 0 && (
                  <TableCaption>No merch items yet. Add your first item.</TableCaption>
                )}
              </Table>
            </div>
          </Card>
        </section>
      </main>
    </>
  );
};

export default Merchandizing;