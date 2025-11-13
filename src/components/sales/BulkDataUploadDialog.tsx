import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useSales, type SalesCategory } from '@/hooks/useSales';

interface BulkDataUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PRODUCT_MAPPING = {
  'MoMing Lychee Jasmine Kombucha': 'cbae9fb0-4f58-4c66-8ff2-400710e369b7',
  'MoMing Pineapple Lavender Black Tea Kombucha': '949eb8a1-730d-4f04-9c8b-f6e9a70baafb',
  'MoMing Pomelo Mint Kombucha': '2e6b4f77-2b75-4d61-af39-36b084222ad8',
  'MoMing Turmeric & Lemongrass Kombucha': '92f56f97-87a4-4bf9-9b9c-da1db4606693',
};

const CWS_CHINA_CLIENT_ID = '14a64eed-cf23-4d0c-81db-b4dcdbfcc576';

export const BulkDataUploadDialog = ({ open, onOpenChange }: BulkDataUploadDialogProps) => {
  const [csvData, setCsvData] = useState('');
  const [year, setYear] = useState('2023');
  const [category, setCategory] = useState<SalesCategory>('cws_distributor');
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { createSale } = useSales();

  const handleUpload = async () => {
    if (!csvData.trim()) {
      toast({
        title: "Error",
        description: "Please paste the sales data",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const lines = csvData.trim().split('\n');
      const salesRecords = [];

      for (const line of lines) {
        const parts = line.split(',').map(part => part.trim());
        if (parts.length < 13) continue;

        const productName = parts[0];
        const productId = PRODUCT_MAPPING[productName as keyof typeof PRODUCT_MAPPING];
        
        if (!productId) continue;

        const monthlyData = parts.slice(1, 13);
        
        for (let month = 0; month < 12; month++) {
          const units = parseInt(monthlyData[month]) || 0;
          if (units === 0) continue;

          const periodMonth = `${year}-${String(month + 1).padStart(2, '0')}-01`;
          
          salesRecords.push({
            period_month: periodMonth,
            category,
            client_id: CWS_CHINA_CLIENT_ID,
            product_id: productId,
            revenue: units * 23, // Assuming 23 CNY per unit for small bottles
            cost: units * 12, // Assuming 12 CNY cost per unit
            units,
            currency: 'CNY',
            fx_to_cny: 1,
          });
        }
      }

      // Upload all records
      for (const record of salesRecords) {
        await createSale(record);
      }

      toast({
        title: "Success",
        description: `Uploaded ${salesRecords.length} sales records`,
      });

      onOpenChange(false);
      setCsvData('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload sales data",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Upload CWS China Sales Data</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="year">Year</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="category">Sales Category</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as SalesCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cws_distributor">CWS China</SelectItem>
                  <SelectItem value="hong_kong_cws">Hong Kong CWS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="csvData">Sales Data (CSV Format)</Label>
            <Textarea
              id="csvData"
              placeholder="Paste your sales data here (Product Name, Jan, Feb, Mar, ...)"
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              rows={10}
              className="font-mono text-sm"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Format: Product Name, Month1, Month2, Month3, ... Month12
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload Data'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkDataUploadDialog;