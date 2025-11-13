import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Product, CreateProductData, UpdateProductData, InventoryItem } from '@/types/product';

export interface ProductWithInventory extends Product {
  inventory?: InventoryItem;
  currentStock?: number;
}

export { UpdateProductData };

export const useProducts = () => {
  const [products, setProducts] = useState<ProductWithInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch products with their inventory data
      const { data: productsData, error: productsError } = await supabase
        .from('mo-products')
        .select(`
          *,
          inventory:"mo-inventory" (
            id,
            current_stock,
            min_stock_level,
            max_stock_level,
            stock_status,
            last_restocked_at,
            created_at,
            updated_at
          )
        `)
        .order('created_at', { ascending: false });

      if (productsError) {
        throw productsError;
      }

      // Transform the data to include currentStock for easier access
      const transformedProducts: ProductWithInventory[] = (productsData || []).map(product => ({
        ...product,
        // Parse JSON fields safely
        recipe: typeof product.recipe === 'string' ? JSON.parse(product.recipe) : product.recipe,
        ingredients: typeof product.ingredients === 'string' ? JSON.parse(product.ingredients) : product.ingredients,
        nutritional_specs: typeof product.nutritional_specs === 'string' ? JSON.parse(product.nutritional_specs) : product.nutritional_specs,
        inventory: product.inventory?.[0] || null,
        currentStock: product.inventory?.[0]?.current_stock || 0
      }));

      setProducts(transformedProducts);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error fetching products",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: CreateProductData) => {
    try {
      setError(null);

      // Insert the product - convert objects to JSON for database storage
      const productForDB = {
        ...productData,
        recipe: productData.recipe ? JSON.stringify(productData.recipe) : null,
        ingredients: productData.ingredients ? JSON.stringify(productData.ingredients) : null,
        nutritional_specs: productData.nutritional_specs ? JSON.stringify(productData.nutritional_specs) : null,
      };

      const { data: newProduct, error: productError } = await supabase
        .from('mo-products')
        .insert([productForDB])
        .select()
        .single();

      if (productError) {
        throw productError;
      }

      // Create initial inventory record
      const { error: inventoryError } = await supabase
        .from('mo-inventory')
        .insert([{
          product_id: newProduct.id,
          current_stock: 0,
          min_stock_level: 10,
          max_stock_level: 100
        }]);

      if (inventoryError) {
        throw inventoryError;
      }

      toast({
        title: "Product created successfully",
        description: `${productData.name} has been added to your catalog.`
      });

      // Refresh the products list
      await fetchProducts();
      
      return newProduct;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error creating product",
        description: err.message,
        variant: "destructive"
      });
      throw err;
    }
  };

  const updateProduct = async (productData: UpdateProductData) => {
    try {
      setError(null);

      // Convert objects to JSON for database storage, excluding the id
      const { id, ...updateData } = productData;
      const productForDB = {
        ...updateData,
        recipe: updateData.recipe ? JSON.stringify(updateData.recipe) : undefined,
        ingredients: updateData.ingredients ? JSON.stringify(updateData.ingredients) : undefined,
        nutritional_specs: updateData.nutritional_specs ? JSON.stringify(updateData.nutritional_specs) : undefined,
      };

      const { data: updatedProduct, error: updateError } = await supabase
        .from('mo-products')
        .update(productForDB)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Product updated successfully",
        description: `${updatedProduct.name} has been updated.`
      });

      // Refresh the products list
      await fetchProducts();
      
      return updatedProduct;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error updating product",
        description: err.message,
        variant: "destructive"
      });
      throw err;
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('mo-products')
        .delete()
        .eq('id', productId);

      if (deleteError) {
        throw deleteError;
      }

      toast({
        title: "Product deleted successfully",
        description: "The product has been removed from your catalog."
      });

      // Refresh the products list
      await fetchProducts();
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error deleting product",
        description: err.message,
        variant: "destructive"
      });
      throw err;
    }
  };

  const toggleProductStatus = async (productId: string, active: boolean) => {
    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('mo-products')
        .update({ active })
        .eq('id', productId);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: `Product ${active ? 'activated' : 'deactivated'}`,
        description: `The product status has been updated.`
      });

      // Refresh the products list
      await fetchProducts();
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error updating product status",
        description: err.message,
        variant: "destructive"
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    refetch: fetchProducts
  };
};