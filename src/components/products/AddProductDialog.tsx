import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Package } from "lucide-react";
import type { CreateProductData, ProductIngredient } from "@/types/product";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  name_chinese: z.string().optional(),
  sku: z.string().min(1, "SKU is required").regex(/^[A-Z0-9-]+$/, "SKU must contain only uppercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  category: z.enum(['small_bottle', 'large_bottle', 'keg']),
  quantity_per_box: z.number().min(1, "Quantity per box must be at least 1"),
  base_price: z.number().min(0, "Price must be positive"),
  cost_price: z.number().min(0, "Cost must be positive"),
  active: z.boolean().default(true),
  
  // Recipe fields
  fermentation_time: z.string().optional(),
  temperature: z.string().optional(),
  ph_level: z.string().optional(),
  instructions: z.string().optional(),
  batch_size: z.string().optional(),
  yield: z.string().optional(),
  
  // Ingredients
  ingredients: z.array(z.object({
    name: z.string().min(1, "Ingredient name is required"),
    quantity: z.string().min(1, "Quantity is required"),
    unit: z.string().min(1, "Unit is required"),
    notes: z.string().optional(),
  })).default([]),
  
  // Nutritional specs
  calories: z.number().optional(),
  protein: z.string().optional(),
  carbohydrates: z.string().optional(),
  sugar: z.string().optional(),
  fiber: z.string().optional(),
  fat: z.string().optional(),
  sodium: z.string().optional(),
  probiotics: z.string().optional(),
  alcohol_content: z.string().optional(),
  serving_size: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface AddProductDialogProps {
  onProductAdded: (product: CreateProductData) => Promise<void>;
  trigger?: React.ReactNode;
}

export const AddProductDialog = ({ onProductAdded, trigger }: AddProductDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      name_chinese: "",
      sku: "",
      description: "",
      category: "small_bottle",
      quantity_per_box: 12,
      base_price: 0,
      cost_price: 0,
      active: true,
      ingredients: [{ name: "", quantity: "", unit: "", notes: "" }],
      calories: 0,
      serving_size: "16 fl oz",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "ingredients",
  });

  const onSubmit = async (data: ProductFormData) => {
    try {
      setLoading(true);

      // Transform the form data to match our CreateProductData interface
      const productData: CreateProductData = {
        name: data.name,
        name_chinese: data.name_chinese,
        sku: data.sku,
        description: data.description,
        category: data.category,
        quantity_per_box: data.quantity_per_box,
        base_price: data.base_price,
        cost_price: data.cost_price,
        active: data.active,
        recipe: {
          fermentation_time: data.fermentation_time,
          temperature: data.temperature,
          ph_level: data.ph_level,
          instructions: data.instructions,
          batch_size: data.batch_size,
          yield: data.yield,
        },
        ingredients: data.ingredients.filter(ing => ing.name && ing.quantity && ing.unit) as ProductIngredient[],
        nutritional_specs: {
          calories: data.calories,
          protein: data.protein,
          carbohydrates: data.carbohydrates,
          sugar: data.sugar,
          fiber: data.fiber,
          fat: data.fat,
          sodium: data.sodium,
          probiotics: data.probiotics,
          alcohol_content: data.alcohol_content,
          serving_size: data.serving_size,
        },
      };

      await onProductAdded(productData);
      setOpen(false);
      form.reset();
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-primary text-primary-foreground hover:bg-primary-dark">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Add New Product
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="recipe">Recipe</TabsTrigger>
                <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Product Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Ginger Turmeric Kombucha" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="name_chinese"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Name in Chinese</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 姜黄康普茶" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="sku"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SKU *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., KOM-GIN-001" 
                              {...field}
                              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your kombucha flavor, brewing process, or unique characteristics..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Type *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-background">
                                  <SelectValue placeholder="Select product type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-background border shadow-lg z-50">
                                <SelectItem value="small_bottle">Small Bottle (230ml)</SelectItem>
                                <SelectItem value="large_bottle">Large Bottle (750ml)</SelectItem>
                                <SelectItem value="keg">Keg (20L)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="base_price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Base Price ($) *</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01" 
                                placeholder="0.00"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="cost_price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cost Price ($) *</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01" 
                                placeholder="0.00"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="quantity_per_box"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity per Box *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1"
                              placeholder="12"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="active"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div>
                            <FormLabel>Active Product</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Enable this product for sales and inventory tracking
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="recipe" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Production Recipe</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fermentation_time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fermentation Time</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 7-10 days" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="temperature"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Temperature</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 75-85°F" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="ph_level"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>pH Level</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 2.5-3.5" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="batch_size"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Batch Size</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 5 gallons" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="yield"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Yield</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 40 bottles" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="instructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brewing Instructions</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Step-by-step brewing instructions..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ingredients" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Ingredients List</CardTitle>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ name: "", quantity: "", unit: "", notes: "" })}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Ingredient
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {fields.map((field, index) => (
                      <div key={field.id} className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-4">
                          <FormField
                            control={form.control}
                            name={`ingredients.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Ingredient</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Organic Green Tea" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="col-span-2">
                          <FormField
                            control={form.control}
                            name={`ingredients.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Quantity</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., 2" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="col-span-2">
                          <FormField
                            control={form.control}
                            name={`ingredients.${index}.unit`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Unit</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., cups, oz, tsp" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="col-span-3">
                          <FormField
                            control={form.control}
                            name={`ingredients.${index}.notes`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Notes</FormLabel>
                                <FormControl>
                                  <Input placeholder="Optional notes" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="col-span-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                            disabled={fields.length === 1}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="nutrition" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Nutritional Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="serving_size"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Serving Size</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 16 fl oz" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="calories"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Calories</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="e.g., 30"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="sugar"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sugar</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 6g" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="protein"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Protein</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 0g" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="carbohydrates"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Carbohydrates</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 7g" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="fiber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fiber</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 0g" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="fat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fat</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 0g" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="sodium"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sodium</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 10mg" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="probiotics"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Probiotics</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 1 billion CFU" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="alcohol_content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Alcohol Content</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., <0.5% ABV" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Product"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};