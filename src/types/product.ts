export interface Product {
  id: string;
  name: string;
  name_chinese?: string;
  sku: string;
  description?: string;
  category: 'small_bottle' | 'large_bottle' | 'keg';
  quantity_per_box: number;
  recipe?: ProductRecipe;
  ingredients?: ProductIngredient[];
  nutritional_specs?: NutritionalSpecs;
  base_price: number;
  cost_price: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductRecipe {
  fermentation_time?: string;
  temperature?: string;
  ph_level?: string;
  instructions?: string;
  batch_size?: string;
  yield?: string;
  [key: string]: any; // Allow additional properties for JSON compatibility
}

export interface ProductIngredient {
  name: string;
  quantity: string;
  unit: string;
  notes?: string;
  [key: string]: any; // Allow additional properties for JSON compatibility
}

export interface NutritionalSpecs {
  calories?: number;
  protein?: string;
  carbohydrates?: string;
  sugar?: string;
  fiber?: string;
  fat?: string;
  sodium?: string;
  probiotics?: string;
  alcohol_content?: string;
  serving_size?: string;
  [key: string]: any; // Allow additional properties for JSON compatibility
}

export interface CreateProductData {
  name: string;
  name_chinese?: string;
  sku: string;
  description?: string;
  category: 'small_bottle' | 'large_bottle' | 'keg';
  quantity_per_box: number;
  recipe?: ProductRecipe;
  ingredients?: ProductIngredient[];
  nutritional_specs?: NutritionalSpecs;
  base_price: number;
  cost_price: number;
  active?: boolean;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}

export interface InventoryItem {
  id: string;
  product_id: string;
  current_stock: number;
  min_stock_level: number;
  max_stock_level: number;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  last_restocked_at?: string;
  created_at: string;
  updated_at: string;
}