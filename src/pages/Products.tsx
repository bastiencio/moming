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
import { Plus, Search, Edit, Eye } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import type { ProductWithInventory } from "@/hooks/useProducts";
import { AddProductDialog } from "@/components/products/AddProductDialog";
import { EditProductDialog } from "@/components/products/EditProductDialog";

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductWithInventory | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  // Helper function to display product type
  const getProductTypeDisplay = (category: string) => {
    switch (category) {
      case 'small_bottle':
        return 'Small Bottle (230ml)';
      case 'large_bottle':
        return 'Large Bottle (750ml)';
      case 'keg':
        return 'Keg (20L)';
      default:
        return category;
    }
  };
  
  const { products, loading, createProduct, updateProduct } = useProducts();

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditProduct = (product: ProductWithInventory) => {
    setSelectedProduct(product);
    setEditDialogOpen(true);
  };


  const ProductDetailsDialog = ({ product }: { product: ProductWithInventory }) => (
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{product.name}</DialogTitle>
      </DialogHeader>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">SKU</label>
            <p className="text-foreground">{product.sku}</p>
          </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Product Type</label>
              <p className="text-foreground">{getProductTypeDisplay(product.category)}</p>
            </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Quantity per Box</label>
            <p className="text-foreground">{product.quantity_per_box || 1} units</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Base Price</label>
            <p className="text-foreground">¥{product.base_price.toFixed(2)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Cost Price</label>
            <p className="text-foreground">¥{product.cost_price.toFixed(2)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Current Stock</label>
            <p className="text-foreground">{product.currentStock} units</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Margin</label>
            <p className="text-foreground">
              {((product.base_price - product.cost_price) / product.base_price * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        {product.description && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Description</label>
            <p className="text-foreground mt-1">{product.description}</p>
          </div>
        )}

        {product.ingredients && product.ingredients.length > 0 && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Ingredients</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {product.ingredients.map((ingredient, index) => (
                <Badge key={index} variant="secondary">
                  {typeof ingredient === 'string' ? ingredient : `${ingredient.quantity} ${ingredient.unit} ${ingredient.name}`}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {product.recipe && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Recipe</label>
            <div className="mt-2 space-y-2">
              {product.recipe.instructions && (
                <p className="text-foreground">{product.recipe.instructions}</p>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {product.recipe.fermentation_time && (
                  <div>
                    <span className="text-muted-foreground">Fermentation: </span>
                    <span className="text-foreground">{product.recipe.fermentation_time}</span>
                  </div>
                )}
                {product.recipe.temperature && (
                  <div>
                    <span className="text-muted-foreground">Temperature: </span>
                    <span className="text-foreground">{product.recipe.temperature}</span>
                  </div>
                )}
                {product.recipe.ph_level && (
                  <div>
                    <span className="text-muted-foreground">pH Level: </span>
                    <span className="text-foreground">{product.recipe.ph_level}</span>
                  </div>
                )}
                {product.recipe.batch_size && (
                  <div>
                    <span className="text-muted-foreground">Batch Size: </span>
                    <span className="text-foreground">{product.recipe.batch_size}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {product.nutritional_specs && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Nutritional Information</label>
            <div className="grid grid-cols-3 gap-4 mt-2">
              {product.nutritional_specs.calories && (
                <div className="text-center p-3 bg-secondary rounded-lg">
                  <p className="text-lg font-medium text-foreground">{product.nutritional_specs.calories}</p>
                  <p className="text-sm text-muted-foreground">Calories</p>
                </div>
              )}
              {product.nutritional_specs.sugar && (
                <div className="text-center p-3 bg-secondary rounded-lg">
                  <p className="text-lg font-medium text-foreground">{product.nutritional_specs.sugar}</p>
                  <p className="text-sm text-muted-foreground">Sugar</p>
                </div>
              )}
              {product.nutritional_specs.probiotics && (
                <div className="text-center p-3 bg-secondary rounded-lg">
                  <p className="text-lg font-medium text-foreground">{product.nutritional_specs.probiotics}</p>
                  <p className="text-sm text-muted-foreground">Probiotics</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DialogContent>
  );

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center">
          <div className="text-muted-foreground">Loading products...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-foreground mb-2">Products</h1>
          <p className="text-muted-foreground">Manage your kombucha SKUs, recipes, and specifications</p>
        </div>
        <AddProductDialog onProductAdded={async (product) => { await createProduct(product); }} />
      </div>

      {/* Search and Filters */}
      <Card className="shadow-kombucha">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Search products by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="shadow-kombucha">
        <CardHeader>
          <CardTitle>Product Catalog</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Product Type</TableHead>
                <TableHead>Qty/Box</TableHead>
                <TableHead>Base Price</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Margin</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const margin = ((product.base_price - product.cost_price) / product.base_price * 100).toFixed(1);
                return (
                  <TableRow key={product.id}>
                    <TableCell 
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handleEditProduct(product)}
                    >
                      <div className="space-y-1">
                        <div className="font-medium">{product.name}</div>
                        {product.name_chinese && (
                          <div className="text-sm text-muted-foreground">{product.name_chinese}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                    <TableCell>{getProductTypeDisplay(product.category)}</TableCell>
                    <TableCell className="text-center">{product.quantity_per_box || 1}</TableCell>
                    <TableCell>¥{product.base_price.toFixed(2)}</TableCell>
                    <TableCell>¥{product.cost_price.toFixed(2)}</TableCell>
                    <TableCell>{margin}%</TableCell>
                    <TableCell>
                      <Badge variant={product.active ? "default" : "secondary"}>
                        {product.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <ProductDetailsDialog product={product} />
                        </Dialog>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      <EditProductDialog
        product={selectedProduct}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onProductUpdated={async (product) => { await updateProduct(product); }}
        onProductDeleted={() => setSelectedProduct(null)}
      />
    </div>
  );
};

export default Products;