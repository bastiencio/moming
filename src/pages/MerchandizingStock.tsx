import React, { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMerchandising, type MerchItem } from "@/hooks/useMerchandising";

const MerchandizingStock: React.FC = () => {
  const { items, loading, updateItem, refetch } = useMerchandising();
  const [search, setSearch] = useState("");
  const [adjustAmounts, setAdjustAmounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const title = "Merchandizing Stock Management";
    document.title = title;

    const descText = "Adjust and track stock levels for merchandise items.";
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
    return items.filter((i) => [i.name, i.code, i.category ?? ""].some((v) => v.toLowerCase().includes(q)));
  }, [items, search]);

  const getAdjust = (id: string) => adjustAmounts[id] ?? 1;

  const setAdjust = (id: string, value: number) => {
    setAdjustAmounts((prev) => ({ ...prev, [id]: value }));
  };

  const handleAdjust = async (item: MerchItem, delta: number) => {
    const newStock = Math.max(0, (item.stock ?? 0) + delta);
    await updateItem(item.id, { stock: newStock });
    await refetch();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading merch stock...</div>
      </div>
    );
  }

  return (
    <>
      <header className="px-6 pt-6">
        <h1 className="text-2xl font-semibold tracking-tight">Merchandizing Stock</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Adjust stock quantities for merchandise items.
        </p>
      </header>

      <main>
        <section className="p-6">
          <Card className="p-4">
            <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
              <div className="flex-1">
                <Label htmlFor="search" className="sr-only">Search merch</Label>
                <Input
                  id="search"
                  placeholder="Search by name, code, or category"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead className="text-right">Current Stock</TableHead>
                    <TableHead className="text-right">Adjust</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.code}</TableCell>
                      <TableCell className="text-right">{item.stock}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAdjust(item, -Math.abs(getAdjust(item.id)))}
                          >
                            -
                          </Button>
                          <Input
                            type="number"
                            className="w-24 text-right"
                            min={1}
                            value={getAdjust(item.id)}
                            onChange={(e) => setAdjust(item.id, Math.max(1, Number(e.target.value)))}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAdjust(item, Math.abs(getAdjust(item.id)))}
                          >
                            +
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                {filtered.length === 0 && (
                  <TableCaption>No merch items found.</TableCaption>
                )}
              </Table>
            </div>
          </Card>
        </section>
      </main>
    </>
  );
};

export default MerchandizingStock;
