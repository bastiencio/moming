import React from "react";
import { SalesCategory, SALES_CATEGORY_LABELS, Region, ProductOption } from "@/hooks/useSalesAnalytics";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultipleSelect, TTag } from "@/components/ui/multiple-select";
type Props = {
  from: string;
  to: string;
  onPeriodChange: (from: string, to: string) => void;
  categories: SalesCategory[];
  onToggleCategory: (cat: SalesCategory) => void;
  onSetAllCategories: (checked: boolean) => void;
  regions: Region[];
  selectedRegionIds: string[];
  onToggleRegion: (id: string) => void;
  onClearRegions: () => void;
  products: ProductOption[];
  selectedProductIds: string[];
  onToggleProduct: (id: string) => void;
  onClearProducts: () => void;
};
export const SalesFilters: React.FC<Props> = ({
  from,
  to,
  onPeriodChange,
  categories,
  onToggleCategory,
  onSetAllCategories,
  regions,
  selectedRegionIds,
  onToggleRegion,
  onClearRegions,
  products,
  selectedProductIds,
  onToggleProduct,
  onClearProducts
}) => {
  // Combine categories and regions into one tag list
  const allTags: TTag[] = [
  // Categories
  ...Object.entries(SALES_CATEGORY_LABELS).map(([key, name]) => ({
    key,
    name
  })),
  // Regions as "CWS Distributor - Region Name"
  ...regions.map(region => ({
    key: `region_${region.id}`,
    name: `CWS Distributor - ${region.name}${region.code ? ` (${region.code})` : ''}`
  }))];
  const selectedTags: TTag[] = [
  // Selected categories
  ...Object.entries(SALES_CATEGORY_LABELS).filter(([key]) => categories.includes(key as SalesCategory)).map(([key, name]) => ({
    key,
    name
  })),
  // Selected regions
  ...regions.filter(region => selectedRegionIds.includes(region.id)).map(region => ({
    key: `region_${region.id}`,
    name: `CWS Distributor - ${region.name}${region.code ? ` (${region.code})` : ''}`
  }))];
  const handleTagChange = (selectedTags: TTag[]) => {
    // Handle category changes
    const allCategories = Object.keys(SALES_CATEGORY_LABELS) as SalesCategory[];
    allCategories.forEach(cat => {
      const isCurrentlySelected = categories.includes(cat);
      const shouldBeSelected = selectedTags.some(tag => tag.key === cat);
      if (isCurrentlySelected && !shouldBeSelected) {
        onToggleCategory(cat);
      } else if (!isCurrentlySelected && shouldBeSelected) {
        onToggleCategory(cat);
      }
    });

    // Handle region changes
    regions.forEach(region => {
      const regionKey = `region_${region.id}`;
      const isCurrentlySelected = selectedRegionIds.includes(region.id);
      const shouldBeSelected = selectedTags.some(tag => tag.key === regionKey);
      if (isCurrentlySelected && !shouldBeSelected) {
        onToggleRegion(region.id);
      } else if (!isCurrentlySelected && shouldBeSelected) {
        onToggleRegion(region.id);
      }
    });
  };

  // Build SKU tags (flavor-only display)
  const flavorName = (raw: string) => {
    let n = raw.replace(/^MoMing\s+/i, "").replace(/^Moming\s+/i, "").replace(/^Cuvée\s+/i, "");
    n = n.replace(/\s*Kombucha.*$/i, "").trim();
    return n;
  };
  const skuTags: TTag[] = products.map(p => ({
    key: `product_${p.id}`,
    name: `${flavorName(p.name)}`
  }));
  const selectedSkuTags: TTag[] = products.filter(p => selectedProductIds.includes(p.id)).map(p => ({
    key: `product_${p.id}`,
    name: `${flavorName(p.name)}`
  }));
  const handleSkuChange = (nextSelected: TTag[]) => {
    products.forEach(p => {
      const key = `product_${p.id}`;
      const isSelected = selectedProductIds.includes(p.id);
      const shouldBeSelected = nextSelected.some(t => t.key === key);
      if (isSelected && !shouldBeSelected) onToggleProduct(p.id);else if (!isSelected && shouldBeSelected) onToggleProduct(p.id);
    });
  };
  return <Card className="p-4 md:p-6 space-y-6 bg-card">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-foreground">Period</Label>
          <Select defaultValue="last-12-months" onValueChange={(value) => {
            const now = new Date();
            let fromDate: string, toDate: string;
            
            if (value.startsWith('year-')) {
              const year = parseInt(value.replace('year-', ''));
              fromDate = `${year}-01-01`;
              toDate = `${year}-12-01`;
            } else if (value === 'last-3-months') {
              const past = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 2, 1));
              fromDate = `${past.getUTCFullYear()}-${String(past.getUTCMonth() + 1).padStart(2, "0")}-01`;
              toDate = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
            } else if (value === 'last-6-months') {
              const past = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));
              fromDate = `${past.getUTCFullYear()}-${String(past.getUTCMonth() + 1).padStart(2, "0")}-01`;
              toDate = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
            } else if (value === 'last-12-months') {
              const past = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));
              fromDate = `${past.getUTCFullYear()}-${String(past.getUTCMonth() + 1).padStart(2, "0")}-01`;
              toDate = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
            }
            
            if (fromDate && toDate) {
              onPeriodChange(fromDate, toDate);
            }
          }}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent className="bg-background border shadow-md z-50">
              <SelectItem value="last-3-months">Last 3 months</SelectItem>
              <SelectItem value="last-6-months">Last 6 months</SelectItem>
              <SelectItem value="last-12-months">Last 12 months</SelectItem>
              <SelectItem value="year-2025">2025</SelectItem>
              <SelectItem value="year-2024">2024</SelectItem>
              <SelectItem value="year-2023">2023</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="w-full space-y-2">
        <strong>Sales Channels</strong>
        <MultipleSelect tags={allTags} onChange={handleTagChange} defaultValue={selectedTags} />
      </div>

      <div className="w-full space-y-2">
        <strong>SKU</strong>
        <MultipleSelect
          tags={skuTags}
          onChange={handleSkuChange}
          defaultValue={selectedSkuTags.length ? selectedSkuTags : skuTags}
        />
      </div>
    </Card>;
};
export default SalesFilters;